import React, { useCallback, useRef, useState, FunctionComponent } from "react";
import { KeyframeValues, Coordinates } from "types/curveEditor";
import CurveLine from "./CurveLine";
import KeyframeGroup from "./KeyframeGroup";

interface Props {
  trackName: string;
  lineIndex: number;
  values: KeyframeValues[];
  xyzIndex: number;
}

const Graph: FunctionComponent<Props> = (props) => {
  const { trackName, lineIndex, xyzIndex, values } = props;
  const color = xyzIndex === 0 ? "red" : xyzIndex === 1 ? "green" : "blue";
  const graphRef = useRef<SVGGElement>(null);
  const [graphTranslateXY, setGraphTranslateXY] = useState({ x: 0, y: 0 });

  const changeGraphTranslate = useCallback(({ x, y }: Coordinates) => {
    setGraphTranslateXY({ x, y });
  }, []);

  return (
    <g
      ref={graphRef}
      transform={`translate(${graphTranslateXY.x}, ${graphTranslateXY.y})`}
    >
      <CurveLine
        values={values}
        color={color}
        trackName={trackName}
        xyzIndex={xyzIndex}
        lineIndex={lineIndex}
        graphRef={graphRef}
        changeGraphTranslate={changeGraphTranslate}
      />
      <KeyframeGroup
        values={values}
        trackName={trackName}
        xyzIndex={xyzIndex}
        lineIndex={lineIndex}
      />
    </g>
  );
};

export default Graph;
