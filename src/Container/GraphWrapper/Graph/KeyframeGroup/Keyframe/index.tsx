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
import * as curveEditor from "actions/curveEditor";
import { ClickedTarget, XYZ } from "types/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

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
  const circlePosition = useRef({ timeIndex: data[0], y: data[1] });
  const circleRef = useRef<SVGCircleElement>(null);
  const isAlreadyClicked = useRef(false);

  const [renderingCount, setRenderingCount] = useState(0);
  const [clicked, setClicked] = useState(false);

  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);
  const dispatch = useDispatch();

  // 키프레임 클릭
  const handleClickKeyframe = useCallback(
    (event: React.MouseEvent) => {
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

  // 키프레임 드래그 이벤트
  useDragCurveEditor({
    onDragging: ({ prevCursor, currentCursor }) => {
      const cursorGapX = prevCursor.x - currentCursor.x; // 직전 커서 x좌표 - 현재 커서 x좌표
      const cursorGapY = prevCursor.y - currentCursor.y; // 직전 커서 y좌표 - 현재 커서 y좌표
      Observer.notifyToKeyframeFromCurveLine(
        { cursorGapX, cursorGapY },
        "dragging"
      );
    },
    onDragEnd: ({ prevCursor, currentCursor }) => {
      const cursorGapX = prevCursor.x - currentCursor.x; // 직전 커서 x좌표 - 현재 커서 x좌표
      const cursorGapY = prevCursor.y - currentCursor.y; // 직전 커서 y좌표 - 현재 커서 y좌표
      const keyframes = Observer.notifyToKeyframeFromCurveLine(
        { cursorGapX, cursorGapY },
        "dragend"
      );
      if (keyframes) dispatch(curveEditor.updateCurveEditorData({ keyframes }));
      Observer.clearObservers(); // 옵저버가 감지하고 있는 리스트 초기화
    },
    ref: circleRef,
  });

  const [graphGroupXY, setGraphGroupXY] = useState({ x: 0, y: 0 });
  // 옵저버에 선택 된 키프레임 추가
  const callKeyframeObserver = useCallback(() => {
    Observer.addKeyframeObserver({
      registerKeyframe: ({ cursorGapX, cursorGapY }) => {
        const circle = d3.select(circleRef.current);
        const circleX = parseInt(circle.attr("cx"), 10);
        const circleY = parseFloat(circle.attr("cy"));

        const invertXscale = Scale.xScale.invert;
        const invertYscale = Scale.yScale.invert;
        const timeIndex = Math.round(invertXscale(circleX - cursorGapX));
        const y = invertYscale(circleY - cursorGapY);

        circlePosition.current = { timeIndex, y };
        setRenderingCount((prev) => prev + 1);
        return { timeIndex, y, lineIndex, keyframeIndex, trackName };
      },
      isRegisterKeyframe: ({ cursorGapX, cursorGapY }) => {
        const stateAction = (prevState: any) => ({
          x: prevState.x - cursorGapX,
          y: prevState.y - cursorGapY,
        });
        setGraphGroupXY((prevState) => stateAction(prevState));
      },
    });
  }, [keyframeIndex, lineIndex, trackName]);

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
    const isClickedCurveLine =
      clickedTarget.type === "curveLine" &&
      clickedTarget.trackName === trackName &&
      clickedTarget.xyz === xyz;
    if (clickedTarget.ctrl) {
      if (isClickedMe || isAlreadyClicked.current || isClickedCurveLine) {
        isAlreadyClicked.current = true;
        callKeyframeObserver();
        setClicked(true);
      }
    } else if (isClickedMe || isAltClick || isClickedCurveLine) {
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

  const circleXY = useMemo(() => {
    const { timeIndex, y } = circlePosition.current;
    const circleX = Scale.xScale(timeIndex) | 0;
    const circleY = Scale.yScale(y);
    return { x: circleX, y: circleY };
  }, [renderingCount]);

  return (
    <circle
      transform={`translate(${graphGroupXY.x}, ${graphGroupXY.y})`}
      ref={circleRef}
      r={2}
      cx={circleXY.x}
      cy={circleXY.y}
      className={cx({ clicked })}
      onClick={handleClickKeyframe}
    />
  );
};

export default memo(Keyframe);
