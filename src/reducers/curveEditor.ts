import produce from "immer";
import {
  ClickedTarget,
  CurveEditorData,
  KeyframeValue,
} from "types/curveEditor";
import { CurveEditorAction } from "actions/curveEditor";
import Observer from "Container/observer";
import helper from "./helper";

interface dd {
  axisIndex: number;
  breakHandle: boolean;
  keyframeIndex: number;
  lockHandle: boolean;
}

export interface ToolBarState {
  breakHandle: boolean;
  unifyHandle: boolean;
  freeHandle: boolean;
  lockHandle: boolean;
}
export interface CurveEditorState extends ToolBarState {
  clickedTarget: ClickedTarget | null;
  curveEditorData: CurveEditorData[];
  selectedKeyframes: dd[] | null;
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
      return Object.assign({}, state, action.payload);
    }
    case "curveEditor/CLICK_TOOL_BAR_BUTTON": {
      Observer.clearBezierHandleObserver();
      Observer.clearKeyframeObserver();
      return produce(state, (draft) => {
        const { breakHandle, unifyHandle, lockHandle, freeHandle } =
          action.payload;
        const selectedKeyframes = draft.selectedKeyframes;
        selectedKeyframes?.forEach((keyframe) => {
          const axisIndex = (keyframe.axisIndex / 3) | 0;
          const xyzIndex = keyframe.axisIndex % 3;
          const xyzChar = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";
          const selectedKeyframe =
            draft.curveEditorData[axisIndex][xyzChar][keyframe.keyframeIndex];
          if (breakHandle !== undefined) {
            selectedKeyframe.breakHandle = breakHandle;
            keyframe.breakHandle = breakHandle;
          }
          if (lockHandle !== undefined) {
            selectedKeyframe.lockHandle = lockHandle;
            keyframe.lockHandle = lockHandle;
          }
        });
        if (breakHandle !== undefined) draft.breakHandle = breakHandle;
        if (unifyHandle !== undefined) draft.unifyHandle = unifyHandle;
        if (lockHandle !== undefined) draft.lockHandle = lockHandle;
        if (freeHandle !== undefined) draft.freeHandle = freeHandle;
      });
    }
    case "curveEditor/UPDATE_CURVE_EDITOR_BY_KEYFRAME": {
      Observer.clearBezierHandleObserver();
      Observer.clearKeyframeObserver();
      return produce(state, (draft) => {
        // x, y, z중에 해당되는 value 가져오기
        const getAmongAxis = (transformIndex: number, xyzIndex: number) => {
          const xyz = draft.curveEditorData[transformIndex];
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
        const setEmptyKeyframe = (
          transformIndex: number,
          keyframeIndex: number,
          time: number,
          xyzChar: "x" | "y" | "z"
        ) => {
          const xyz = draft.curveEditorData[transformIndex][xyzChar];
          for (let index = 0; index < xyz.length; index += 1) {
            const target = xyz[index].keyframe;
            if (
              index !== keyframeIndex && // 자신의 keyframe index 아니고
              target.x === time && // time는 같으면서
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
          const transformIndex = (keyframe.axisIndex / 3) | 0;
          const xyzIndex = keyframe.axisIndex % 3;
          const values = getAmongAxis(transformIndex, xyzIndex);
          const xyzChar = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";
          if (values) {
            markerData.forEach(({ keyframeIndex, x, y }) => {
              const keyframeValue = values[keyframeIndex];
              const { x: keyframeX, y: keyframeY } = keyframeValue.keyframe;
              const { x: leftHandleX, y: leftHandleY } =
                keyframeValue.handles.left;
              const { x: rightHandleX, y: rightHandleY } =
                keyframeValue.handles.right;
              keyframeValue.keyframe = { keyframeIndex, x, y };
              keyframeValue.handles.left = {
                x: leftHandleX - (keyframeX - x),
                y: leftHandleY - (keyframeY - y),
              };
              keyframeValue.handles.right = {
                x: rightHandleX - (keyframeX - x),
                y: rightHandleY - (keyframeY - y),
              };
              setEmptyKeyframe(transformIndex, keyframeIndex, x, xyzChar);
            });
            values.sort((a, b) => a.keyframe.x - b.keyframe.x);
            const filterdValues = values.filter(
              ({ keyframe }) => keyframe.x !== 0 || keyframe.y !== 0
            );
            for (let index = 0; index < filterdValues.length; index += 1) {
              filterdValues[index].keyframe.keyframeIndex = index;
            }
            draft.curveEditorData[transformIndex][xyzChar] = filterdValues;
          }
        });
      });
    }
    case "curveEditor/UPDATE_CURVE_EDITOR_BY_CURVE_LINE": {
      Observer.clearBezierHandleObserver();
      Observer.clearKeyframeObserver();
      return produce(state, (draft) => {
        const { changedX, changedY, axisIndexes } = action.payload;
        axisIndexes.forEach((axisIndex) => {
          const quotient = (axisIndex / 3) | 0;
          const remaider = axisIndex % 3;
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
      });
    }
    case "curveEditor/UPDATE_CURVE_EDITOR_BY_BEZIER_HANDLE": {
      Observer.clearBezierHandleObserver();
      Observer.clearKeyframeObserver();
      return produce(state, (draft) => {
        const bezierHandles = action.payload.bezierHandles;
        bezierHandles.forEach((bezierHandle) => {
          const axisIndex = (bezierHandle.axisIndex / 3) | 0;
          const xyzIndex = bezierHandle.axisIndex % 3;
          const xyzChar = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";
          bezierHandle.markerData.forEach((value) => {
            const { x, y, keyframeIndex, handleType } = value;
            const handles =
              draft.curveEditorData[axisIndex][xyzChar][keyframeIndex].handles;
            if (handleType) handles[handleType] = { x, y };
          });
        });
      });
    }
    default: {
      return state;
    }
  }
};
