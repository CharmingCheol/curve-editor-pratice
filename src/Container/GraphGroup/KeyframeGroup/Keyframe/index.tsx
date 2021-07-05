import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  FunctionComponent,
} from "react";
import * as d3 from "d3";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import _ from "lodash";
import * as curveEditor from "actions/curveEditor";
import { ClickedTarget, XYZ } from "types/curveEditor";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import Scale from "Container/scale";
import Observer from "Container/observer";

const cx = classNames.bind(styles);

interface Props {
  data: number[];
  trackName: string;
  xyz: XYZ;
  keyframeIndex: number;
  lineIndex: number;
}

const Keyframe: FunctionComponent<Props> = (props) => {
  const { data, keyframeIndex, lineIndex, trackName, xyz } = props;
  const circleRef = useRef<SVGCircleElement>(null);
  const isAlreadyClicked = useRef(false);
  const circlePosition = useRef({ timeIndex: data[0], y: data[1] });

  const [renderingCount, setRenderingCount] = useState(0);
  const [mouseIn, setMouseIn] = useState(false);
  const [clicked, setClicked] = useState(false);

  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);
  const dispatch = useDispatch();

  // 키프레임 클릭
  const handleClickKeyframe = useCallback(
    (event: React.MouseEvent) => {
      console.log("click");
      event.preventDefault();
      const { timeIndex, y } = circlePosition.current;
      const clickedTarget: ClickedTarget = {
        type: "keyframe",
        trackName,
        xyz,
        ctrl: event.ctrlKey || event.metaKey,
        alt: event.altKey,
        coordinates: { x: timeIndex, y: y },
      };
      dispatch(
        curveEditor.changeClickedTarget({
          clickedTarget,
        })
      );
    },
    [dispatch, trackName, xyz]
  );

  // 키프레임 cursor in/out
  const handleCursorInOut = useCallback(() => {
    setMouseIn((prev) => !prev);
  }, []);

  const dragged = useRef(false);
  // 키프레임 드래그 이벤트
  useEffect(() => {
    const x = Scale.xScale;
    let prevCursorX = 0;
    let prevCursorY = 0;
    // let dragged = false;

    // 현재 cursorXY를 prevCursorXY에 저장
    const setPrevCursor = (x: number, y: number) => {
      prevCursorX = x;
      prevCursorY = y;
    };

    // cursorX 기준으로 현재 time index 계산
    const getTimeIndex = (circleX: number) => {
      return Math.round(x.invert(circleX));
    };

    // 현재 커서의 xy 계산
    const getCursorXY = (event: any) => {
      const timeIndex = getTimeIndex(event.x);
      const cursorX = x(timeIndex) | 0;
      const cursorY = event.y;
      return [cursorX, cursorY];
    };

    // 드래그 이벤트 시작
    const handleDragStart = (event: any) => {
      const [cursorX, cursorY] = getCursorXY(event);
      setPrevCursor(cursorX, cursorY);
    };

    // 드래그 이벤트 진행
    const handleDragging = (event: any) => {
      if (!dragged.current) dragged.current = true; // drag가 시작되면 dragged를 fasle -> true로 변경
      const [cursorX, cursorY] = getCursorXY(event);
      const cursorGapX = prevCursorX - cursorX; // 직전 커서 x좌표 - 현재 커서 x좌표
      const cursorGapY = prevCursorY - cursorY; // 직전 커서 y좌표 - 현재 커서 y좌표
      Observer.notifyObservers({ cursorGapX, cursorGapY });
      setPrevCursor(cursorX, cursorY);
    };

    const handleDragEnd = (event: any) => {
      if (!dragged.current) return; // dragged가 false라면(drag를 하지 않았다면) return을 시켜서 함수 종료
      dragged.current = false;
    };

    // 드래그 이벤트 세팅
    const dragBehavior = d3
      .drag()
      .on("start", handleDragStart)
      .on(
        "drag",
        _.throttle((event) => handleDragging(event), 50)
      )
      .on("end", handleDragEnd);
    d3.select(circleRef.current).call(dragBehavior as any);
  }, []);

  // 키프레임 옵저버 호출
  const callKeyframeObserver = useCallback(() => {
    Observer.addKeyframeObserver({
      keyframeNotify: ({ cursorGapX, cursorGapY }) => {
        const circle = d3.select(circleRef.current);
        const circleX = parseInt(circle.attr("cx"), 10);
        const circleY = parseFloat(circle.attr("cy"));

        const invertXscale = Scale.xScale.invert;
        const invertYscale = Scale.yScale.invert;
        const timeIndex = Math.round(invertXscale(circleX - cursorGapX));
        const y = invertYscale(circleY - cursorGapY);

        circlePosition.current.timeIndex = timeIndex;
        circlePosition.current.y = y;
        setRenderingCount((prev) => prev + 1);
        return { timeIndex, y, lineIndex, keyframeIndex };
      },
    });
  }, [keyframeIndex, lineIndex]);

  // 다른 curve line이나 keyframe 클릭 시, 선택 유지 및 해제 적용
  useEffect(() => {
    if (!clickedTarget) return;
    const { timeIndex, y } = circlePosition.current;
    const isClickedMe =
      clickedTarget.trackName === trackName &&
      clickedTarget.xyz === xyz &&
      clickedTarget.coordinates?.x === timeIndex &&
      clickedTarget.coordinates?.y === y;
    const isAltClick =
      clickedTarget.alt && clickedTarget.coordinates?.x === timeIndex;
    if (clickedTarget.ctrl) {
      if (isClickedMe || isAlreadyClicked.current) {
        isAlreadyClicked.current = true;
        callKeyframeObserver();
        setClicked(true);
      }
    } else if (isClickedMe || isAltClick) {
      isAlreadyClicked.current = true;
      callKeyframeObserver();
      setClicked(true);
    } else {
      isAlreadyClicked.current = false;
      setClicked(false);
    }
  }, [
    callKeyframeObserver,
    clickedTarget,
    keyframeIndex,
    lineIndex,
    trackName,
    xyz,
  ]);

  // const handleDragStart = useCallback(() => {
  //   console.log("start");
  // }, []);

  // const handleDrag = useCallback(() => {
  //   console.log("drag");
  // }, []);

  // const handleDragEnd = useCallback(() => {
  //   console.log("end");
  // }, []);

  const Circle = useMemo(() => {
    const { timeIndex, y } = circlePosition.current;
    const circleX = Scale.xScale(timeIndex) | 0;
    const circleY = Scale.yScale(y);
    return (
      <circle
        ref={circleRef}
        r={2}
        cx={circleX}
        cy={circleY}
        className={cx({ clicked })}
        onClick={handleClickKeyframe}
        onMouseEnter={handleCursorInOut}
        onMouseOut={handleCursorInOut}
        // onDragStart={handleDragStart}
        // onDrag={handleDrag}
        // onDragEnd={handleDragEnd}
      />
    );
  }, [
    clicked,
    handleClickKeyframe,
    handleCursorInOut,
    // handleDrag,
    // handleDragEnd,
    // handleDragStart,
    renderingCount,
  ]);

  return Circle;
};

export default memo(Keyframe);
