import React, { Fragment, FunctionComponent } from "react";
import { useSelector } from "reducers";
import Graph from "./Graph";

interface Props {}

const GraphWrapper: FunctionComponent<Props> = () => {
  const curveEditorData = useSelector(
    (state) => state.curveEditor.curveEditorData
  );

  return (
    <Fragment>
      {curveEditorData?.map((graph, boneIndex) => {
        const { trackName, x, y, z } = graph;
        return (
          <Fragment key={`${trackName}_${boneIndex}`}>
            {[x, y, z].map((values, xyzIndex) => (
              <Graph
                key={`${trackName}_${boneIndex * 3 + xyzIndex}_${xyzIndex}`}
                trackName={trackName}
                lineIndex={boneIndex * 3 + xyzIndex}
                xyzIndex={xyzIndex}
                values={values}
              />
            ))}
          </Fragment>
        );
      })}
    </Fragment>
  );
};

export default GraphWrapper;
