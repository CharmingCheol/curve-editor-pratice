import produce from "immer";
import {
  ClickedTarget,
  CurveEditorData,
  KeyframeValue,
} from "types/curveEditor";
import { CurveEditorAction } from "actions/curveEditor";
import Observer from "Container/observer";
import helper from "./helper";

export interface ToolBarState {
  breakHandle: boolean;
  unifyHandle: boolean;
  freeHandle: boolean;
  lockHandle: boolean;
}
export interface CurveEditorState extends ToolBarState {
  clickedTarget: ClickedTarget | null;
  curveEditorData: CurveEditorData[];
  selectedKeyframes: { boneIndex: number; keyframeIndex: number }[] | null;
}

const defaultState: CurveEditorState = {
  clickedTarget: null,
  curveEditorData: helper(),
  selectedKeyframes: null,
  /* tool bar */
  breakHandle: false,
  unifyHandle: false,
  freeHandle: false,
  lockHandle: false,
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
    case "curveEditor/CHANGE_SELECTED_KEYFRAMES": {
      const { selectedKeyframes, ...others } = action.payload;
      return Object.assign({}, state, {
        selectedKeyframes,
        ...others,
      });
    }
    case "curveEditor/CLICK_TOOL_BAR_BUTTON": {
      Observer.clearBezierHandleObserver();
      return produce(state, (draft) => {
        const { breakHandle, unifyHandle, lockHandle, freeHandle } =
          action.payload;
        const selectedKeyframes = draft.selectedKeyframes;
        selectedKeyframes?.forEach((keyframe) => {
          const boneIndex = (keyframe.boneIndex / 3) | 0;
          const xyzIndex = keyframe.boneIndex % 3;
          const xyzChar = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";
          const selectedKeyframe =
            draft.curveEditorData[boneIndex][xyzChar][keyframe.keyframeIndex];
          if (breakHandle !== undefined)
            selectedKeyframe.breakHandle = breakHandle;
          if (lockHandle !== undefined)
            selectedKeyframe.lockHandle = lockHandle;
        });
        if (breakHandle !== undefined) draft.breakHandle = breakHandle;
        if (unifyHandle !== undefined) draft.unifyHandle = unifyHandle;
        if (lockHandle !== undefined) draft.lockHandle = lockHandle;
        if (freeHandle !== undefined) draft.freeHandle = freeHandle;
      });
    }
    case "curveEditor/UPDATE_CURVE_EDITOR_BY_KEYFRAME": {
      Observer.clearObservers(); // 옵저버가 감지하고 있는 리스트 초기화
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
        const setKeyframeDelete = (
          lineIndex: number,
          timeIndex: number,
          keyframeIndex: number,
          xyzChar: "x" | "y" | "z"
        ) => {
          const xyz = draft.curveEditorData[lineIndex][xyzChar];
          for (let index = 0; index < xyz.length; index += 1) {
            const target = xyz[index].keyframe;
            if (
              index !== keyframeIndex && // 자신의 키프레임이 아니고
              target.x === timeIndex && // timeIndex는 같으면서
              target.y !== 0 // y값이 0이 아닌 경우
            ) {
              xyz[index].keyframe = { x: 0, y: 0, keyframeIndex: 0 };
              break;
            }
          }
        };
        // 키프레임 데이터 업데이트
        action.payload.keyframes.forEach((keyframe) => {
          const { markerData } = keyframe;
          const boneIndex = (keyframe.boneIndex / 3) | 0;
          const xyzIndex = keyframe.boneIndex % 3;
          const values = getAmongXYZ(boneIndex, xyzIndex);
          const xyzChar = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";
          if (values) {
            markerData.forEach(({ keyframeIndex, x, y }) => {
              const leftHandleY = values[keyframeIndex].handles.left.y;
              const rightHandleY = values[keyframeIndex].handles.right.y;
              const keyframeY = values[keyframeIndex].keyframe.y;
              values[keyframeIndex].keyframe = { keyframeIndex, x, y };
              values[keyframeIndex].handles.left = {
                x: x - 0.3,
                y: leftHandleY - (keyframeY - y),
              };
              values[keyframeIndex].handles.right = {
                x: x + 0.3,
                y: rightHandleY - (keyframeY - y),
              };
              setKeyframeDelete(boneIndex, x, keyframeIndex, xyzChar);
            });
            values.sort((a, b) => a.keyframe.x - b.keyframe.x);
            const filterdValues = values.filter(
              ({ keyframe }) => keyframe.x !== 0 || keyframe.y !== 0
            );
            for (let index = 0; index < filterdValues.length; index += 1) {
              filterdValues[index].keyframe.keyframeIndex = index;
            }
            draft.curveEditorData[boneIndex][xyzChar] = filterdValues;
          }
        });
        draft.clickedTarget = null;
      });
    }
    case "curveEditor/UPDATE_CURVE_EDITOR_BY_CURVE_LINE": {
      Observer.clearObservers(); // 옵저버가 감지하고 있는 리스트 초기화
      return produce(state, (draft) => {
        const { changedX, changedY, boneIndexes } = action.payload;
        boneIndexes.forEach((boneIndex) => {
          const quotient = (boneIndex / 3) | 0;
          const remaider = boneIndex % 3;
          const xyzChar = remaider === 0 ? "x" : remaider === 1 ? "y" : "z";
          const lineData = draft.curveEditorData[quotient][xyzChar];
          const updatedLineData = lineData.map<KeyframeValue>((value) => {
            const {
              keyframe,
              handles: { left, right },
              breakHandle,
              lockHandle,
            } = value;
            return {
              keyframe: {
                keyframeIndex: keyframe.keyframeIndex,
                x: keyframe.x + changedX,
                y: keyframe.y + changedY,
              },
              handles: {
                left: { x: left.x + changedX, y: left.y + changedY },
                right: { x: right.x + changedX, y: right.y + changedY },
              },
              breakHandle,
              lockHandle,
            };
          });
          draft.curveEditorData[quotient][xyzChar] = updatedLineData;
        });
        draft.clickedTarget = null;
      });
    }
    case "curveEditor/UPDATE_CURVE_EDITOR_BY_BEZIER_HANDLE": {
      Observer.clearObservers(); // 옵저버가 감지하고 있는 리스트 초기화
      return produce(state, (draft) => {
        const bezierHandles = action.payload.bezierHandles;
        bezierHandles.forEach((bezierHandle) => {
          const boneIndex = (bezierHandle.boneIndex / 3) | 0;
          const xyzIndex = bezierHandle.boneIndex % 3;
          const xyzChar = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";
          bezierHandle.markerData.forEach((value) => {
            const { x, y, keyframeIndex, handleType } = value;
            const handles =
              draft.curveEditorData[boneIndex][xyzChar][keyframeIndex].handles;
            if (handleType) handles[handleType] = { x, y };
          });
        });
        draft.clickedTarget = null;
      });
    }
    default: {
      return state;
    }
  }
};
