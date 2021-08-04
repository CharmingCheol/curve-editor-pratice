import { ToolBarState } from "reducers/toolBar";

export type ToolBarAction = ReturnType<typeof setToolBarButtons>;

// 툴바 버튼 세팅
export const SET_TOOL_BAR_BUTTONS = "toolbar/SET_TOOL_BAR_BUTTONS" as const;

export const setToolBarButtons = (params: Partial<ToolBarState>) => ({
  type: SET_TOOL_BAR_BUTTONS,
  payload: {
    ...params,
  },
});
