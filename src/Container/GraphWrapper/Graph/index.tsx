import React, { useCallback, useRef, useState, FunctionComponent } from "react";
import { KeyframeValue, Coordinates } from "types/curveEditor";
import CurveLine from "./CurveLine";
import KeyframeGroup from "./KeyframeGroup";

interface Props {
  axisIndex: number;
  axisValue: KeyframeValue[];
}

const Graph: FunctionComponent<Props> = (props) => {
  const { axisIndex, axisValue } = props;
  const color =
    axisIndex % 3 === 0 ? "red" : axisIndex % 3 === 1 ? "green" : "blue";
  const graphRef = useRef<SVGGElement>(null);
  const [graphTranslate, setGraphTranslate] = useState({ x: 0, y: 0 });

  const changeGraphTranslate = useCallback(({ x, y }: Coordinates) => {
    setGraphTranslate({ x, y });
  }, []);

  return (
    <g
      ref={graphRef}
      transform={`translate(${graphTranslate.x}, ${graphTranslate.y})`}
    >
      <CurveLine
        axisIndex={axisIndex}
        changeGraphTranslate={changeGraphTranslate}
        color={color}
        graphRef={graphRef}
        axisValue={axisValue}
      />
      <KeyframeGroup axisIndex={axisIndex} axisValue={axisValue} />
    </g>
  );
};

export default Graph;
