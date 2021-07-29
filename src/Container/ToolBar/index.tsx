import React, {
  useCallback,
  useState,
  Fragment,
  FunctionComponent,
} from "react";
import { useDispatch } from "react-redux";
import * as curveEditor from "actions/curveEditor";

const ToolBar: FunctionComponent<{}> = () => {
  const dispatch = useDispatch();
  const [breakHandle, setBreakHandle] = useState(false);

  const handleClickBreakHandle = useCallback(() => {
    dispatch(curveEditor.clickBreakHandleButton());
    setBreakHandle((prev) => !prev);
  }, [dispatch]);

  return (
    <Fragment>
      <button onClick={handleClickBreakHandle}>
        {breakHandle ? "Unifiy" : "Break"}
      </button>
    </Fragment>
  );
};

export default ToolBar;
