import React, { useCallback, Fragment } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import { ToolBarState } from "reducers/curveEditor";
import * as curveEditor from "actions/curveEditor";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

type ButtonType = "breakHandle" | "lockHandle" | "unifyHandle" | "freeHandle";

const ToolBar = () => {
  const dispatch = useDispatch();
  const breakHandle = useSelector((state) => state.curveEditor.breakHandle);
  const lockHandle = useSelector((state) => state.curveEditor.lockHandle);
  const unifyHandle = useSelector((state) => state.curveEditor.unifyHandle);
  const freeHandle = useSelector((state) => state.curveEditor.freeHandle);

  const handleClickToolBarButton = useCallback(
    (params: { key: ButtonType; value: boolean }) => () => {
      const { key, value } = params;
      switch (key) {
        case "breakHandle": {
          const params: Partial<ToolBarState> = {
            breakHandle: value === false ? true : value === true ? true : false,
            unifyHandle: false,
          };
          dispatch(curveEditor.clickToolBarButton(params));
          break;
        }
        case "unifyHandle": {
          const params: Partial<ToolBarState> = {
            unifyHandle: value === false ? true : value === true ? true : false,
            breakHandle: false,
          };
          dispatch(curveEditor.clickToolBarButton(params));
          break;
        }
        case "freeHandle": {
          const params: Partial<ToolBarState> = {
            freeHandle: value === false ? true : value === true ? true : false,
            lockHandle: false,
          };
          dispatch(curveEditor.clickToolBarButton(params));
          break;
        }
        case "lockHandle": {
          const params: Partial<ToolBarState> = {
            lockHandle: value === false ? true : value === true ? true : false,
            freeHandle: false,
          };
          dispatch(curveEditor.clickToolBarButton(params));
          break;
        }
      }
    },
    [dispatch]
  );

  return (
    <Fragment>
      <button
        className={cx({ active: breakHandle })}
        onClick={handleClickToolBarButton({
          key: "breakHandle",
          value: breakHandle,
        })}
      >
        Break
      </button>
      <button
        className={cx({ active: unifyHandle })}
        onClick={handleClickToolBarButton({
          key: "unifyHandle",
          value: unifyHandle,
        })}
      >
        Unifiy
      </button>
      <button
        className={cx({ active: lockHandle })}
        onClick={handleClickToolBarButton({
          key: "lockHandle",
          value: lockHandle,
        })}
      >
        Lock
      </button>
      <button
        className={cx({ active: freeHandle })}
        onClick={handleClickToolBarButton({
          key: "freeHandle",
          value: freeHandle,
        })}
      >
        Free
      </button>
    </Fragment>
  );
};

export default ToolBar;
