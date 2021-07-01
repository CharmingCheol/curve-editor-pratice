import { ClickedTarget } from "types/curveEditor";
import { CurveEditorAction } from "actions/curveEditor";
import Observer from "Container/observer";

interface CurveEditorState {
  clickedTarget: ClickedTarget | null;
}

const defaultState: CurveEditorState = {
  clickedTarget: null,
};

export const curveEditor = (
  state = defaultState,
  action: CurveEditorAction
) => {
  switch (action.type) {
    case "curveEditor/CHANGE_CLICKED_TARGET": {
      Observer.clearObservers();
      return Object.assign({}, state, {
        clickedTarget: action.payload.clickedTarget,
      });
    }
    default: {
      return state;
    }
  }
};
