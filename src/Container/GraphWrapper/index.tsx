import React, { Fragment, FunctionComponent } from "react";
import { useSelector } from "reducers";
import Graph from "./Graph";

interface Props {}

const GraphWrapper: FunctionComponent<Props> = () => {
  const curveEditorData = useSelector(
    (state) => state.curveEditor.curveEditorData
  );

  return (
    <g id="graph-wrapper">
      {curveEditorData?.map((track, lineIndex) => {
        const { name, x, y, z } = track;
        return (
          <Fragment key={`${name}_${lineIndex}`}>
            {[x, y, z].map((values, xyzIndex) => (
              <Graph
                key={`${name}_${lineIndex * 3 + xyzIndex}_${xyzIndex}`}
                name={name}
                lineIndex={lineIndex * 3 + xyzIndex}
                xyzIndex={xyzIndex}
                values={values}
              />
            ))}
          </Fragment>
        );
      })}
    </g>
  );
};

export default GraphWrapper;
