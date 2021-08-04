import { ToolBarAction } from "actions/toolBar";

export interface ToolBarState {
  breakHandle: boolean;
  nonWeightHandle: boolean;
  unifyHandle: boolean;
  weightHandle: boolean;
}

const defaultState: ToolBarState = {
  breakHandle: false,
  nonWeightHandle: false,
  unifyHandle: false,
  weightHandle: false,
};

export const toolBar = (state = defaultState, action: ToolBarAction) => {
  switch (action.type) {
    case "toolbar/SET_TOOL_BAR_BUTTONS": {
      return Object.assign({}, state, { ...action.payload });
    }
    default: {
      return state;
    }
  }
};
