import { ClickedTarget, ClasifiedKeyframes } from "types/curveEditor";

export type CurveEditorAction =
  | ReturnType<typeof changeClickedTarget>
  | ReturnType<typeof updateCurveEditorByCurveLine>
  | ReturnType<typeof updateCurveEditorByKeyframe>
  | ReturnType<typeof updateCurveEditorByBezierHandle>;

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

// keyframe에 의해 curve editor 데이터 업데이트
interface UpdateCurveEditorByKeyframe {
  keyframes: ClasifiedKeyframes[];
}

export const UPDATE_CURVE_EDITOR_BY_KEYFRAME =
  "curveEditor/UPDATE_CURVE_EDITOR_BY_KEYFRAME" as const;

export const updateCurveEditorByKeyframe = (
  params: UpdateCurveEditorByKeyframe
) => ({
  type: UPDATE_CURVE_EDITOR_BY_KEYFRAME,
  payload: {
    ...params,
  },
});

// curve line에 의해 curve editor 데이터 업데이트
interface UpdateCurveEditorByCurveLine {
  changedX: number;
  changedY: number;
  lineIndices: number[];
}

export const UPDATE_CURVE_EDITOR_BY_CURVE_LINE =
  "curveEditor/UPDATE_CURVE_EDITOR_BY_CURVE_LINE" as const;

export const updateCurveEditorByCurveLine = (
  params: UpdateCurveEditorByCurveLine
) => ({
  type: UPDATE_CURVE_EDITOR_BY_CURVE_LINE,
  payload: {
    ...params,
  },
});

// bezier handle 드래그 시, curve editor 데이터 업데이트
interface UpdateCurveEditorByBezierHandle {
  bezierHandles: ClasifiedKeyframes[];
}

export const UPDATE_CURVE_EDITOR_BY_BEZIER_HANDLE =
  "curveEditor/UPDATE_CURVE_EDITOR_BY_BEZIER_HANDLE" as const;

export const updateCurveEditorByBezierHandle = (
  params: UpdateCurveEditorByBezierHandle
) => ({
  type: UPDATE_CURVE_EDITOR_BY_BEZIER_HANDLE,
  payload: {
    ...params,
  },
});
