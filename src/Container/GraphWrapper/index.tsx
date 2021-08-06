import React, { Fragment, FunctionComponent, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import * as curveEditor from "actions/curveEditor";
import { ToolBarState } from "reducers/curveEditor";
import Observer from "Container/observer";
import Graph from "./Graph";

const GraphWrapper: FunctionComponent<{}> = () => {
  const dispatch = useDispatch();
  const curveEditorData = useSelector(
    (state) => state.curveEditor.curveEditorData
  );
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);
  const timeoutId = useRef(0);

  // tool bar state 세팅
  useEffect(() => {
    if (!clickedTarget) return;
    timeoutId.current = window.setTimeout(() => {
      const bezierHandles = Observer.getBezierHandleObserver();
      const keyframes = Observer.getKeyframeObserver().map(
        ({ call, ...others }) => ({ ...others })
      );
      let breakHandleCount = 0;
      let lockHandleCount = 0;
      for (let index = 0; index < bezierHandles.length; index += 1) {
        if (bezierHandles[index].breakHandle) breakHandleCount += 1;
        if (bezierHandles[index].lockHandle) lockHandleCount += 1;
      }
      const toolBarState: Partial<ToolBarState> = {
        breakHandle: breakHandleCount === bezierHandles.length ? true : false,
        unifyHandle: breakHandleCount === 0 ? true : false,
        lockHandle: lockHandleCount === bezierHandles.length ? true : false,
        freeHandle: lockHandleCount === 0 ? true : false,
      };
      const args = { selectedKeyframes: keyframes, ...toolBarState };
      dispatch(curveEditor.changeSelectedKeyframes(args));
    });
    return () => clearTimeout(timeoutId.current);
  }, [clickedTarget, dispatch]);

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
