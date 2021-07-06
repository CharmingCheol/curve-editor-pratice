import produce from "immer";
import { ClickedTarget, CurveEditorData } from "types/curveEditor";
import { CurveEditorAction } from "actions/curveEditor";
import Observer from "Container/observer";
import helper from "./helper";

interface CurveEditorState {
  clickedTarget: ClickedTarget | null;
  curveEditorData: CurveEditorData[];
}

const defaultState: CurveEditorState = {
  clickedTarget: null,
  curveEditorData: helper(),
};

export const curveEditor = (
  state = defaultState,
  action: CurveEditorAction
) => {
  switch (action.type) {
    case "curveEditor/CHANGE_CLICKED_TARGET": {
      Observer.clearObservers(); // 옵저버가 감지하고 있는 리스트 초기화
      return Object.assign({}, state, {
        clickedTarget: action.payload.clickedTarget,
      });
    }
    case "curveEditor/UPDATE_CURVE_EDITOR_DATA": {
      const nextState = produce(state, (draft) => {
        // x, y, z중에 해당되는 value 가져오기
        const getAmongXYZ = (lineIndex: number, xyzIndex: number) => {
          switch (xyzIndex) {
            case 0:
              return draft.curveEditorData[lineIndex].x;
            case 1:
              return draft.curveEditorData[lineIndex].y;
            case 2:
              return draft.curveEditorData[lineIndex].z;
          }
        };
        // 동일한 time에 키프레임이 있을 경우 제거
        const sliceValues = (
          lineIndex: number,
          keyframeIndex: number,
          value: [number, number][],
          xyzChar: "x" | "y" | "z"
        ) => {
          if (
            value[keyframeIndex - 1] &&
            value[keyframeIndex][0] === value[keyframeIndex - 1][0]
          ) {
            draft.curveEditorData[lineIndex][xyzChar] = [
              ...value.slice(0, keyframeIndex - 1),
              ...value.slice(keyframeIndex, value.length),
            ];
          } else if (
            value[keyframeIndex + 1] &&
            value[keyframeIndex][0] === value[keyframeIndex + 1][0]
          ) {
            draft.curveEditorData[lineIndex][xyzChar] = [
              ...value.slice(0, keyframeIndex + 1),
              ...value.slice(keyframeIndex + 2, value.length),
            ];
          }
        };
        action.payload.keyframes.forEach((keyframe) => {
          const { keyframeDatum } = keyframe;
          const lineIndex = (keyframe.lineIndex / 3) | 0;
          const xyzIndex = keyframe.lineIndex % 3;
          const values = getAmongXYZ(lineIndex, xyzIndex);
          const xyzChar = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";
          if (values) {
            keyframeDatum.forEach((keyframe) => {
              values[keyframe.keyframeIndex] = [keyframe.timeIndex, keyframe.y];
              sliceValues(lineIndex, keyframe.keyframeIndex, values, xyzChar);
              values.sort((a, b) => a[0] - b[0]);
            });
          }
        });
      });
      return nextState;
    }
    default: {
      return state;
    }
  }
};
