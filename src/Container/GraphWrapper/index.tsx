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
      const keyframes = Observer.getKeyframeObserver().map(
        ({ call, ...others }) => ({ ...others })
      );
      let breakHandleCount = 0;
      let lockHandleCount = 0;
      for (let index = 0; index < keyframes.length; index += 1) {
        if (keyframes[index].breakHandle) breakHandleCount += 1;
        if (keyframes[index].lockHandle) lockHandleCount += 1;
      }
      const toolBarState: Partial<ToolBarState> = {
        breakHandle: breakHandleCount === keyframes.length ? true : false,
        unifyHandle: breakHandleCount === 0 ? true : false,
        lockHandle: lockHandleCount === keyframes.length ? true : false,
        freeHandle: lockHandleCount === 0 ? true : false,
      };
      const args = { selectedKeyframes: keyframes, ...toolBarState };
      dispatch(curveEditor.changeSelectedKeyframes(args));
    });
    return () => clearTimeout(timeoutId.current);
  }, [clickedTarget, dispatch]);

  return (
    <Fragment>
      {curveEditorData?.map((transform, transformIndex) => {
        const { transformName, x, y, z } = transform;
        return (
          <Fragment key={`${transformName}_${transformIndex}`}>
            {[x, y, z].map((axisValue, axisIndex) => (
              <Graph
                key={`${transformIndex * 3 + axisIndex}_${axisIndex}`}
                axisIndex={transformIndex * 3 + axisIndex}
                axisValue={axisValue}
              />
            ))}
          </Fragment>
        );
      })}
    </Fragment>
  );
};

export default GraphWrapper;
