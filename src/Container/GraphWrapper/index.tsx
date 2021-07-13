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
      {curveEditorData?.map((graph, lineIndex) => {
        const { trackName, x, y, z } = graph;
        return (
          <Fragment key={`${trackName}_${lineIndex}`}>
            {[x, y, z].map((values, xyzIndex) => (
              <Graph
                key={`${trackName}_${lineIndex * 3 + xyzIndex}_${xyzIndex}`}
                trackName={trackName}
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
