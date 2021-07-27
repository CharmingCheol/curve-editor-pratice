import React, { Fragment, FunctionComponent } from "react";
import { useSelector } from "reducers";
import Graph from "./Graph";

const GraphWrapper: FunctionComponent<{}> = () => {
  const curveEditorData = useSelector(
    (state) => state.curveEditor.curveEditorData
  );

  return (
    <Fragment>
      {curveEditorData?.map((graph, boneIndex) => {
        const { boneName, x, y, z } = graph;
        return (
          <Fragment key={`${boneName}_${boneIndex}`}>
            {[x, y, z].map((values, xyzIndex) => (
              <Graph
                key={`${boneName}_${boneIndex * 3 + xyzIndex}_${xyzIndex}`}
                boneName={boneName}
                boneIndex={boneIndex * 3 + xyzIndex}
                values={values}
                xyzIndex={xyzIndex}
              />
            ))}
          </Fragment>
        );
      })}
    </Fragment>
  );
};

export default GraphWrapper;
