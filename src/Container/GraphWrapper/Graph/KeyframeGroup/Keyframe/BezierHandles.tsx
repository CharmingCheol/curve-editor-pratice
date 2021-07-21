import React, { Fragment, FunctionComponent, useMemo } from "react";
import { KeyframeValues } from "types/curveEditor";
import Scale from "Container/scale";

interface Props {
  data: KeyframeValues;
}

const BezierHandles: FunctionComponent<Props> = (props) => {
  const { data } = props;

  const handlePosition = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const circleX = scaleX(data.keyframe.x);
    const circleY = scaleY(data.keyframe.y);
    const leftX = scaleX(data.handles.left.x);
    const leftY = scaleY(data.handles.left.y);
    const rightX = scaleX(data.handles.right.x);
    const rightY = scaleY(data.handles.right.y);
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
  }, [data]);

  return (
    <Fragment>
      <g>
        <path fill="none" stroke="white" d={handlePosition.leftLine} />
        <circle r={1} cx={handlePosition.leftX} cy={handlePosition.leftY} />
      </g>
      <g>
        <path fill="none" stroke="white" d={handlePosition.rightLine} />
        <circle r={1} cx={handlePosition.rightX} cy={handlePosition.rightY} />
      </g>
    </Fragment>
  );
};

export default BezierHandles;
