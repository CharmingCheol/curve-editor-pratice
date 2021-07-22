import React, {
  Fragment,
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { KeyframeValues } from "types/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import Scale from "Container/scale";

interface Props {
  data: KeyframeValues;
}

const BezierHandles: FunctionComponent<Props> = (props) => {
  const { data } = props;
  const leftLineRef = useRef<SVGPathElement>(null);
  const leftCircleRef = useRef<SVGCircleElement>(null);
  const rightLineRef = useRef<SVGPathElement>(null);
  const rightCircleRef = useRef<SVGCircleElement>(null);

  const [leftCircleXY, setLeftCircleXY] = useState(data.handles.left);
  const [rightCircleXY, setRightCircleXY] = useState(data.handles.right);

  // 좌측 handle circle 이벤트
  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      const scaleX = Scale.getScaleX();
      const scaleY = Scale.getScaleY();
      const invertScaleX = scaleX.invert;
      const invertScaleY = scaleY.invert;
      const leftX = invertScaleX(scaleX(data.handles.left.x) + cursorGap.x);
      const leftY = invertScaleY(scaleY(data.handles.left.y) + cursorGap.y);
      setLeftCircleXY({ ...{ x: leftX, y: leftY } });
    },
    onDragEnd: () => {
      console.log("left circle drag end");
    },
    ref: leftCircleRef,
    isClampX: false,
  });

  // 우측 handle circle 이벤트
  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      const scaleX = Scale.getScaleX();
      const scaleY = Scale.getScaleY();
      const invertScaleX = scaleX.invert;
      const invertScaleY = scaleY.invert;
      const rightX = invertScaleX(scaleX(data.handles.right.x) + cursorGap.x);
      const rightY = invertScaleY(scaleY(data.handles.right.y) + cursorGap.y);
      setRightCircleXY({ ...{ x: rightX, y: rightY } });
    },
    onDragEnd: () => {
      console.log("right circle drag end");
    },
    ref: rightCircleRef,
    isClampX: false,
  });

  // 좌우측 handle line 드래그 시, 아무런 반응 없도록 처리
  useEffect(() => {
    const dragBehavior = d3.drag().on("start", null);
    d3.select(leftLineRef.current).call(dragBehavior as any);
    d3.select(rightLineRef.current).call(dragBehavior as any);
  }, []);

  const handlePosition = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const circleX = scaleX(data.keyframe.x);
    const circleY = scaleY(data.keyframe.y);
    const leftX = scaleX(leftCircleXY.x);
    const leftY = scaleY(leftCircleXY.y);
    const rightX = scaleX(rightCircleXY.x);
    const rightY = scaleY(rightCircleXY.y);
    return {
      circleX,
      circleY,
      leftX,
      leftY,
      rightX,
      rightY,
      leftLine: `M${leftX},${leftY} L${circleX},${circleY}`,
      rightLine: `M${rightX},${rightY} L${circleX},${circleY}`,
    };
  }, [data, leftCircleXY, rightCircleXY]);

  return (
    <Fragment>
      <path
        ref={leftLineRef}
        d={handlePosition.leftLine}
        fill="none"
        stroke="white"
      />
      <circle
        ref={leftCircleRef}
        r={1}
        cx={handlePosition.leftX}
        cy={handlePosition.leftY}
      />
      <path
        ref={rightLineRef}
        d={handlePosition.rightLine}
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

export default BezierHandles;
