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
import { ClickedTarget } from "types/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

interface Props {
  data: number[];
  trackName: string;
  xyzType: "x" | "y" | "z";
  keyframeIndex: number;
  lineIndex: number;
}

const Keyframe: FunctionComponent<Props> = (props) => {
  const { data, keyframeIndex, lineIndex, trackName, xyzType } = props;
  const dispatch = useDispatch();
  const circlePoint = useRef({ timeIndex: data[0], value: data[1] });
  const circleRef = useRef<SVGCircleElement>(null);
  const isAlreadySelected = useRef(false);

  const [circleTransform, setCircleTransform] = useState({ x: 0, y: 0 });
  const [renderingCount, setRenderingCount] = useState(0);
  const [clicked, setSelected] = useState(false);
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);

  // 키프레임 클릭
  const handleClickKeyframe = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const { timeIndex, value } = circlePoint.current;
      const clickedTarget: ClickedTarget = {
        targetType: "keyframe",
        trackName,
        xyzType,
        ctrl: event.ctrlKey || event.metaKey,
        alt: event.altKey,
        coordinates: { x: timeIndex, y: value },
      };
      dispatch(
        curveEditor.changeClickedTarget({
          clickedTarget,
        })
      );
    },
    [dispatch, trackName, xyzType]
  );

  // 키프레임 드래그 이벤트
  useDragCurveEditor({
    onDragging: ({ prevCursor, currentCursor }) => {
      const cursorGapX = prevCursor.x - currentCursor.x; // 직전 커서 x좌표 - 현재 커서 x좌표
      const cursorGapY = prevCursor.y - currentCursor.y; // 직전 커서 y좌표 - 현재 커서 y좌표
      Observer.notifyKeyframes({
        cursorGap: { x: cursorGapX, y: cursorGapY },
        dragType: "dragging",
      });
    },
    onDragEnd: ({ prevCursor, currentCursor }) => {
      const cursorGapX = prevCursor.x - currentCursor.x; // 직전 커서 x좌표 - 현재 커서 x좌표
      const cursorGapY = prevCursor.y - currentCursor.y; // 직전 커서 y좌표 - 현재 커서 y좌표
      const keyframes = Observer.notifyKeyframes({
        cursorGap: { x: cursorGapX, y: cursorGapY },
        dragType: "dragend",
      });
      if (keyframes) {
        dispatch(curveEditor.updateCurveEditorByKeyframe({ keyframes }));
      }
      Observer.clearObservers(); // 옵저버가 감지하고 있는 리스트 초기화
    },
    ref: circleRef,
  });

  // 옵저버에 선택 된 키프레임 추가
  const callKeyframeObserver = useCallback(() => {
    Observer.registerKeyframe({
      active: ({ x, y }) => {
        const circle = d3.select(circleRef.current);
        const circleX = parseInt(circle.attr("cx"), 10);
        const circleY = parseFloat(circle.attr("cy"));

        const invertScaleX = Scale.getScaleX().invert;
        const invertScaleY = Scale.getScaleY().invert;
        const timeIndex = Math.round(invertScaleX(circleX - x));
        const value = invertScaleY(circleY - y);

        circlePoint.current = { timeIndex, value };
        setRenderingCount((prev) => prev + 1);
        return { timeIndex, value, lineIndex, keyframeIndex, trackName };
      },
      passive: ({ x, y }) => {
        const stateAction = (prevState: any) => ({
          x: prevState.x - x,
          y: prevState.y - y,
        });
        setCircleTransform((prevState) => stateAction(prevState));
      },
    });
  }, [keyframeIndex, lineIndex, trackName]);

  // 다른 curve line이나 keyframe 클릭 시, 선택 유지 및 해제 적용
  useEffect(() => {
    if (!clickedTarget) return;
    const { timeIndex, value } = circlePoint.current;
    const isClickedMe =
      clickedTarget.trackName === trackName &&
      clickedTarget.xyzType === xyzType &&
      clickedTarget.coordinates?.x === timeIndex &&
      clickedTarget.coordinates?.y === value;
    const isAltClick =
      clickedTarget.alt && clickedTarget.coordinates?.x === timeIndex;
    const isClickedCurveLine =
      clickedTarget.targetType === "curveLine" &&
      clickedTarget.trackName === trackName &&
      clickedTarget.xyzType === xyzType;
    if (clickedTarget.ctrl) {
      if (isClickedMe || isAlreadySelected.current || isClickedCurveLine) {
        isAlreadySelected.current = true;
        callKeyframeObserver();
        setSelected(true);
      }
    } else if (isClickedMe || isAltClick || isClickedCurveLine) {
      isAlreadySelected.current = true;
      callKeyframeObserver();
      setSelected(true);
    } else {
      isAlreadySelected.current = false;
      setSelected(false);
    }
  }, [
    callKeyframeObserver,
    clickedTarget,
    keyframeIndex,
    lineIndex,
    trackName,
    xyzType,
  ]);

  const circleXY = useMemo(() => {
    const { timeIndex, value } = circlePoint.current;
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const circleX = scaleX(timeIndex) | 0;
    const circleY = scaleY(value);
    return { x: circleX, y: circleY };
  }, [renderingCount]);

  return (
    <circle
      transform={`translate(${circleTransform.x}, ${circleTransform.y})`}
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
