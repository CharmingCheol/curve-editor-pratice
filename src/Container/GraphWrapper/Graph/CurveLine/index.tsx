import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  FunctionComponent,
  RefObject,
} from "react";
import _ from "lodash";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import * as curveEditor from "actions/curveEditor";
import { ClickedTarget, Coordinates, KeyframeValue } from "types/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import { fnGetBinarySearch } from "utils";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import Scale from "Container/scale";
import Observer from "Container/observer";

const cx = classNames.bind(styles);

interface Props {
  axisIndex: number;
  changeGraphTranslate: (cursor: Coordinates) => void;
  color: string;
  graphRef: RefObject<SVGGElement>;
  axisValue: KeyframeValue[];
}

const CurveLine: FunctionComponent<Props> = (props) => {
  const { axisIndex, changeGraphTranslate, color, graphRef, axisValue } = props;
  const dispatch = useDispatch();
  const isAlreadySelected = useRef(false);
  const curveData = useRef<KeyframeValue[]>();

  const [changeCurveData, setChangeCurveData] = useState(0);
  const [selectedCurve, setSelectedCurve] = useState(false);
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);
  const axisType = axisIndex % 3 === 0 ? "x" : axisIndex % 3 === 1 ? "y" : "z";

  // curve line 클릭
  const handleClickCurveLine = useCallback(
    (event: React.MouseEvent) => {
      const clickedTarget: ClickedTarget = {
        alt: event.altKey,
        axisIndex: axisIndex,
        axisType: axisType,
        ctrl: event.ctrlKey || event.metaKey,
        targetType: "curveLine",
      };
      const action = curveEditor.changeClickedTarget({ clickedTarget });
      dispatch(action);
    },
    [axisIndex, dispatch, axisType]
  );

  // 커브라인 옵저버 호출
  const registerCurveLineObserver = useCallback(() => {
    Observer.registerCurveLine({
      call: ({ x, y }) => {
        changeGraphTranslate({ x, y });
        return axisIndex;
      },
      called: (clasifiedKeyframes) => {
        const binaryIndex = fnGetBinarySearch({
          collection: clasifiedKeyframes,
          index: axisIndex,
          key: "axisIndex",
        });
        if (binaryIndex !== -1 && curveData.current) {
          const markerType = clasifiedKeyframes[binaryIndex].markerType;
          if (markerType === "keyframe") {
            const keyframes = clasifiedKeyframes[binaryIndex].markerData;
            for (let index = 0; index < keyframes.length; index += 1) {
              const { x, y, keyframeIndex } = keyframes[index];
              const targetIndex = curveData.current.findIndex(
                ({ keyframe }) => keyframe.keyframeIndex === keyframeIndex
              );
              const keyframeValue = curveData.current[targetIndex];
              const { x: keyframeX, y: keyframeY } = keyframeValue.keyframe;
              const { x: leftHandleX, y: leftHandleY } =
                keyframeValue.handles.left;
              const { x: rightHandleX, y: rightHandleY } =
                keyframeValue.handles.right;
              keyframeValue.keyframe = {
                x: x,
                y: y,
                keyframeIndex: keyframeIndex,
              };
              keyframeValue.handles.left = {
                x: leftHandleX - (keyframeX - x),
                y: leftHandleY - (keyframeY - y),
              };
              keyframeValue.handles.right = {
                x: rightHandleX - (keyframeX - x),
                y: rightHandleY - (keyframeY - y),
              };
            }
            curveData.current?.sort((a, b) => a.keyframe.x - b.keyframe.x);
          } else if (markerType === "handle") {
            const bezierHandles = clasifiedKeyframes[binaryIndex].markerData;
            for (let index = 0; index < bezierHandles.length; index += 1) {
              const { x, y, keyframeIndex, handleType } = bezierHandles[index];
              const targetIndex = curveData.current.findIndex(
                ({ keyframe }) => keyframe.keyframeIndex === keyframeIndex
              );
              if (handleType) {
                const currentKeyframeX =
                  curveData.current[targetIndex].keyframe.x;
                const prevKeyframeX =
                  curveData.current[targetIndex - 1]?.keyframe.x;
                const nextKeyframeX =
                  curveData.current[targetIndex + 1]?.keyframe.x;
                curveData.current[targetIndex].handles[handleType].y = y;
                // 첫번째 키프레임의 handle을 드래그 한 경우
                if (prevKeyframeX === undefined) {
                  if (currentKeyframeX - 1 <= x && x <= nextKeyframeX) {
                    curveData.current[targetIndex].handles[handleType].x = x;
                  }
                }
                // 마지막 키프레임의 handle을 드래그 한 경우
                else if (nextKeyframeX === undefined) {
                  if (prevKeyframeX <= x && x <= currentKeyframeX + 1) {
                    curveData.current[targetIndex].handles[handleType].x = x;
                  }
                } else {
                  if (prevKeyframeX <= x && x <= currentKeyframeX) {
                    curveData.current[targetIndex].handles[handleType].x = x;
                  }
                }
              }
            }
          }
          setChangeCurveData((prev) => prev + 1);
        }
      },
    });
  }, [axisIndex]);

  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      Observer.notifyCurveLines({ cursorGap, dragType: "dragging" });
    },
    onDragEnd: ({ cursorGap }) => {
      const originXY = { x: 0, y: 0 };
      const axisIndexes = Observer.notifyCurveLines({
        cursorGap: originXY,
        dragType: "dragend",
      });
      if (axisIndexes) {
        const { x, y } = axisValue[0].keyframe;
        const scaleX = Scale.getScaleX();
        const scaleY = Scale.getScaleY();
        const invertX = scaleX.invert;
        const invertY = scaleY.invert;

        const circleX = scaleX(x) | 0;
        const circleY = scaleY(y);
        const changedX = Math.round(invertX(circleX + cursorGap.x)) - x;
        const changedY = invertY(circleY + cursorGap.y) - y;

        const params = { changedX, changedY, axisIndexes };
        dispatch(curveEditor.updateCurveEditorByCurveLine(params));
      }
    },
    ref: graphRef,
  });

  // 커브라인 clicked state 변경
  useEffect(() => {
    if (!clickedTarget || !curveData.current) return;
    const setSelectedEffect = () => {
      isAlreadySelected.current = true;
      registerCurveLineObserver();
      setSelectedCurve(true);
    };
    const isClickedMe =
      clickedTarget.targetType === "curveLine" &&
      clickedTarget.axisIndex === axisIndex;
    const isClickedKeyframe =
      clickedTarget.targetType === "keyframe" &&
      clickedTarget.axisIndex === axisIndex;
    const selectedCondition = isClickedMe || isClickedKeyframe;
    if (clickedTarget.ctrl) {
      if (selectedCondition || isAlreadySelected.current) setSelectedEffect();
    } else if (selectedCondition) {
      setSelectedEffect();
    } else if (clickedTarget.alt && clickedTarget.coordinates) {
      const times = curveData.current.map(({ keyframe }) => keyframe.x);
      const binaryIndex = fnGetBinarySearch({
        collection: times,
        index: clickedTarget.coordinates.x,
      });
      if (binaryIndex !== -1) setSelectedEffect();
    } else {
      isAlreadySelected.current = false;
      setSelectedCurve(false);
    }
  }, [axisIndex, clickedTarget, registerCurveLineObserver, axisType]);

  useEffect(() => {
    curveData.current = _.cloneDeep(axisValue);
    setChangeCurveData((prev) => prev + 1);
  }, [axisValue]);

  const pathShapes = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    if (curveData.current) {
      const firstKeyframe = curveData.current[0].keyframe;
      let path = `M${scaleX(firstKeyframe.x)},${scaleY(firstKeyframe.y)}`;
      for (let index = 0; index < curveData.current.length - 1; index += 1) {
        const { x: x1, y: y1 } = curveData.current[index].handles.right;
        const { x: x2, y: y2 } = curveData.current[index + 1].handles.left;
        const { x: endX, y: endY } = curveData.current[index + 1].keyframe;
        const bezier1 = `${scaleX(x1)},${scaleY(y1)}`;
        const bezier2 = `${scaleX(x2)},${scaleY(y2)}`;
        const endPoint = `${scaleX(endX)},${scaleY(endY)}`;
        path += `C${bezier1},${bezier2},${endPoint}`;
      }
      return path;
    }
  }, [changeCurveData]);

  return (
    <path
      className={cx("curve", axisType, { selected: selectedCurve })}
      fill="none"
      d={pathShapes}
      onClick={handleClickCurveLine}
    />
  );
};

export default memo(CurveLine);
