import { ClickedTarget, ClasifiedKeyframes } from "types/curveEditor";

export type CurveEditorAction =
  | ReturnType<typeof changeClickedTarget>
  | ReturnType<typeof updateCurveEditorData>;

// curve line, keyframe 클릭 시 clickedTarget 데이터 변경
interface ChangeClickedTarget {
  clickedTarget: ClickedTarget;
}

export const CHANGE_CLICKED_TARGET =
  "curveEditor/CHANGE_CLICKED_TARGET" as const;

export const changeClickedTarget = (params: ChangeClickedTarget) => ({
  type: CHANGE_CLICKED_TARGET,
  payload: {
    ...params,
  },
});

// curve editor 업데이트
interface UpdateCurveEditorData {
  keyframes: ClasifiedKeyframes[];
}

export const UPDATE_CURVE_EDITOR_DATA =
  "curveEditor/UPDATE_CURVE_EDITOR_DATA" as const;

export const updateCurveEditorData = (params: UpdateCurveEditorData) => ({
  type: UPDATE_CURVE_EDITOR_DATA,
  payload: {
    ...params,
  },
});
