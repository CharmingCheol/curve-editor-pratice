import React, {
  useEffect,
  useMemo,
  useRef,
  Fragment,
  FunctionComponent,
} from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import * as d3 from "d3";
import * as curveEditorAction from "actions/curveEditor";
import { Coordinates, KeyframeCoordinates } from "types/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";

interface Props {
  keyframeXY: KeyframeCoordinates;
  rightXY: Coordinates;
}

const Right: FunctionComponent<Props> = (props) => {
  const { keyframeXY, rightXY } = props;
  const dispatch = useDispatch();
  const rightLineRef = useRef<SVGPathElement>(null);
  const rightCircleRef = useRef<SVGCircleElement>(null);
  const breakHandle = useSelector((state) => state.curveEditor.breakHandle);

  // 좌측 handle line 드래그 시, 아무런 반응 없도록 처리
  useEffect(() => {
    const dragBehavior = d3.drag().on("start", null);
    d3.select(rightLineRef.current).call(dragBehavior as any);
  }, []);

  // 우측 handle circle 이벤트
  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragging",
        handleType: "right",
        breakHandle,
      });
    },
    onDragEnd: ({ cursorGap }) => {
      const bezierHandles = Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragend",
        handleType: "right",
        breakHandle,
      });
      if (bezierHandles) {
        dispatch(
          curveEditorAction.updateCurveEditorByBezierHandle({ bezierHandles })
        );
      }
    },
    ref: rightCircleRef,
    isClampX: false, // 커서 위치에 따라 handle의 x좌표를 조절
    throttleTime: 100,
  });

  const handlePosition = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const keyframeX = scaleX(keyframeXY.x);
    const keyframeY = scaleY(keyframeXY.y);
    const rightX = scaleX(rightXY.x);
    const rightY = scaleY(rightXY.y);
    return {
      keyframeX,
      keyframeY,
      rightX,
      rightY,
      line: `M${rightX},${rightY} L${keyframeX},${keyframeY}`,
    };
  }, [keyframeXY, rightXY]);

  return (
    <Fragment>
      <path
        ref={rightLineRef}
        d={handlePosition.line}
        fill="none"
        stroke="white"
      />
      <circle
        ref={rightCircleRef}
        r={1}
        cx={handlePosition.rightX}
        cy={handlePosition.rightY}
      />
    </Fragment>
  );
};

export default Right;
