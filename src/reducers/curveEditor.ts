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
      return produce(state, (draft) => {
        // x, y, z중에 해당되는 value 가져오기
        const getAmongXYZ = (lineIndex: number, xyzIndex: number) => {
          const xyz = draft.curveEditorData[lineIndex];
          switch (xyzIndex) {
            case 0:
              return xyz.x;
            case 1:
              return xyz.y;
            case 2:
              return xyz.z;
          }
        };
        // 동일한 time에 키프레임이 있을 경우 제거
        const sliceKeyframe = (
          lineIndex: number,
          timeIndex: number,
          keyframeIndex: number,
          xyzChar: "x" | "y" | "z"
        ) => {
          const xyz = draft.curveEditorData[lineIndex][xyzChar];
          const existedIndex = xyz.findIndex((value, index) => {
            if (
              index !== keyframeIndex &&
              value[0] === timeIndex &&
              value[1] !== 0
            )
              return index;
          });
          if (existedIndex !== keyframeIndex) xyz[existedIndex] = [0, 0];
        };
        action.payload.keyframes.forEach((keyframe) => {
          const { keyframeDatum } = keyframe;
          const lineIndex = (keyframe.lineIndex / 3) | 0;
          const xyzIndex = keyframe.lineIndex % 3;
          const values = getAmongXYZ(lineIndex, xyzIndex);
          const xyzChar = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";
          if (values) {
            keyframeDatum.forEach(({ keyframeIndex, timeIndex, y }) => {
              values[keyframeIndex] = [timeIndex, y];
              sliceKeyframe(lineIndex, timeIndex, keyframeIndex, xyzChar);
            });
            values.sort((a, b) => a[0] - b[0]);
            const filterdValues = values.filter(
              (value) => value[0] !== 0 || value[1] !== 0
            );
            draft.curveEditorData[lineIndex][xyzChar] = filterdValues;
          }
        });
        draft.clickedTarget = null;
      });
    }
    default: {
      return state;
    }
  }
};
