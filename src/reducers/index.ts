import { combineReducers } from "redux";
import {
  TypedUseSelectorHook,
  useSelector as useReduxSelector,
} from "react-redux";
import { curveEditor } from "./curveEditor";

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  curveEditor,
});

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
