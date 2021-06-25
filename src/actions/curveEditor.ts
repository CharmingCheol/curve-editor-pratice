import { ClickedTarget } from "types/curveEditor";

export type CurveEditorAction = ReturnType<typeof changeClickedTarget>;

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
