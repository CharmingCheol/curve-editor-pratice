import React, { useCallback, useRef, useState, FunctionComponent } from "react";
import { KeyframeValue, Coordinates } from "types/curveEditor";
import CurveLine from "./CurveLine";
import KeyframeGroup from "./KeyframeGroup";

interface Props {
  boneName: string;
  boneIndex: number;
  values: KeyframeValue[];
  xyzIndex: number;
}

const Graph: FunctionComponent<Props> = (props) => {
  const { boneName, boneIndex, values, xyzIndex } = props;
  const color = xyzIndex === 0 ? "red" : xyzIndex === 1 ? "green" : "blue";
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
        boneIndex={boneIndex}
        boneName={boneName}
        changeGraphTranslate={changeGraphTranslate}
        color={color}
        graphRef={graphRef}
        values={values}
        xyzIndex={xyzIndex}
      />
      <KeyframeGroup
        boneIndex={boneIndex}
        boneName={boneName}
        values={values}
        xyzIndex={xyzIndex}
      />
    </g>
  );
};

export default Graph;
