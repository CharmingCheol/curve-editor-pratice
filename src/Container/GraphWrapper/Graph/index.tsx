import React, { useCallback, useRef, useState, FunctionComponent } from "react";
import { KeyframeValue, Coordinates } from "types/curveEditor";
import CurveLine from "./CurveLine";
import KeyframeGroup from "./KeyframeGroup";

interface Props {
  axisIndex: number;
  boneName: string;
  boneIndex: number;
  values: KeyframeValue[];
}

const Graph: FunctionComponent<Props> = (props) => {
  const { axisIndex, boneName, boneIndex, values } = props;
  const color = axisIndex === 0 ? "red" : axisIndex === 1 ? "green" : "blue";
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
        boneIndex={boneIndex}
        boneName={boneName}
        changeGraphTranslate={changeGraphTranslate}
        color={color}
        graphRef={graphRef}
        values={values}
      />
      <KeyframeGroup
        axisIndex={axisIndex}
        boneIndex={boneIndex}
        boneName={boneName}
        values={values}
      />
    </g>
  );
};

export default Graph;
