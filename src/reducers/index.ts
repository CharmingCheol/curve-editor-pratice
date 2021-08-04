import { combineReducers } from "redux";
import {
  TypedUseSelectorHook,
  useSelector as useReduxSelector,
} from "react-redux";
import { curveEditor } from "./curveEditor";
import { toolBar } from "./toolBar";

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  curveEditor,
  toolBar,
});

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
