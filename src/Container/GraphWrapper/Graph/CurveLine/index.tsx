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
  boneIndex: number;
  boneName: string;
  changeGraphTranslate: (cursor: Coordinates) => void;
  color: string;
  graphRef: RefObject<SVGGElement>;
  values: KeyframeValue[];
  xyzIndex: number;
}

const CurveLine: FunctionComponent<Props> = (props) => {
  const {
    boneIndex,
    boneName,
    changeGraphTranslate,
    color,
    graphRef,
    values,
    xyzIndex,
  } = props;
  const dispatch = useDispatch();
  const isAlreadySelectedCurve = useRef(false);
  const curveData = useRef<KeyframeValue[]>();

  const [changeCurveData, setChangeCurveData] = useState(0);
  const [selectedCurve, setSelectedCurve] = useState(false);
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);
  const xyzType = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";

  // curve line 클릭
  const handleClickCurveLine = useCallback(
    (event: React.MouseEvent) => {
      const clickedTarget: ClickedTarget = {
        targetType: "curveLine",
        boneName,
        xyzType,
        ctrl: event.ctrlKey || event.metaKey,
        alt: event.altKey,
      };
      const action = curveEditor.changeClickedTarget({ clickedTarget });
      dispatch(action);
    },
    [boneName, dispatch, xyzType]
  );

  // 커브라인 옵저버 호출
  const registerCurveLineObserver = useCallback(() => {
    Observer.registerCurveLine({
      call: ({ x, y }) => {
        changeGraphTranslate({ x, y });
        return boneIndex;
      },
      called: (clasifiedKeyframes) => {
        const binaryIndex = fnGetBinarySearch({
          collection: clasifiedKeyframes,
          index: boneIndex,
          key: "boneIndex",
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
              curveData.current[targetIndex].keyframe = {
                x: x,
                y: y,
                keyframeIndex: keyframeIndex,
              };
              curveData.current[targetIndex].handles = {
                left: { x: x - 0.3, y: y },
                right: { x: x + 0.3, y: y },
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
                const prevKeyframeX =
                  curveData.current[targetIndex - 1]?.keyframe.x;
                const nextKeyframeX =
                  curveData.current[targetIndex + 1]?.keyframe.x;
                const isContained = prevKeyframeX <= x && x <= nextKeyframeX;
                if (!prevKeyframeX || !nextKeyframeX || isContained) {
                  curveData.current[targetIndex].handles[handleType] = {
                    x,
                    y,
                  };
                }
              }
            }
          }
          setChangeCurveData((prev) => prev + 1);
        }
      },
    });
  }, [boneIndex]);

  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      Observer.notifyCurveLines({ cursorGap, dragType: "dragging" });
    },
    onDragEnd: ({ cursorGap }) => {
      const originXY = { x: 0, y: 0 };
      const boneIndexes = Observer.notifyCurveLines({
        cursorGap: originXY,
        dragType: "dragend",
      });
      if (boneIndexes) {
        const { x, y } = values[0].keyframe;
        const scaleX = Scale.getScaleX();
        const scaleY = Scale.getScaleY();
        const invertX = scaleX.invert;
        const invertY = scaleY.invert;

        const circleX = scaleX(x) | 0;
        const circleY = scaleY(y);
        const changedX = Math.round(invertX(circleX + cursorGap.x)) - x;
        const changedY = invertY(circleY + cursorGap.y) - y;

        const params = { changedX, changedY, boneIndexes };
        dispatch(curveEditor.updateCurveEditorByCurveLine(params));
      }
    },
    ref: graphRef,
  });

  // 커브라인 clicked state 변경
  useEffect(() => {
    if (!clickedTarget || !curveData.current) return;
    const isClickedMe =
      clickedTarget.targetType === "curveLine" &&
      clickedTarget.boneName === boneName &&
      clickedTarget.xyzType === xyzType;
    const isClickedKeyframe =
      clickedTarget.targetType === "keyframe" &&
      clickedTarget.boneName === boneName &&
      clickedTarget.xyzType === xyzType;
    if (clickedTarget.ctrl) {
      if (isClickedMe || isClickedKeyframe || isAlreadySelectedCurve.current) {
        isAlreadySelectedCurve.current = true;
        registerCurveLineObserver();
        setSelectedCurve(true);
      }
    } else if (isClickedMe || isClickedKeyframe) {
      isAlreadySelectedCurve.current = true;
      registerCurveLineObserver();
      setSelectedCurve(true);
    } else if (clickedTarget.alt && clickedTarget.coordinates) {
      const times = curveData.current.map(({ keyframe }) => keyframe.x);
      const binaryIndex = fnGetBinarySearch({
        collection: times,
        index: clickedTarget.coordinates.x,
      });
      if (binaryIndex !== -1) {
        isAlreadySelectedCurve.current = true;
        registerCurveLineObserver();
        setSelectedCurve(true);
      }
    } else {
      isAlreadySelectedCurve.current = false;
      setSelectedCurve(false);
    }
  }, [boneIndex, boneName, clickedTarget, registerCurveLineObserver, xyzType]);

  useEffect(() => {
    curveData.current = _.cloneDeep(values);
    setChangeCurveData((prev) => prev + 1);
    setSelectedCurve(false);
  }, [values]);

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
      className={cx("curve", { selected: selectedCurve })}
      fill="none"
      stroke={color}
      d={pathShapes}
      onClick={handleClickCurveLine}
    />
  );
};

export default memo(CurveLine);
