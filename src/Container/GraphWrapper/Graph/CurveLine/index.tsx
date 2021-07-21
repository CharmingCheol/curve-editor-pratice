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
import {
  ClasifiedKeyframes,
  ClickedTarget,
  Coordinates,
  KeyframeValues,
} from "types/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import { fnGetBinarySearch } from "utils";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import Scale from "Container/scale";
import Observer from "Container/observer";

const cx = classNames.bind(styles);

interface Props {
  color: string;
  lineIndex: number;
  trackName: string;
  values: KeyframeValues[];
  xyzIndex: number;
  graphRef: RefObject<SVGGElement>;
  changeGraphTranslate: (cursor: Coordinates) => void;
}

const CurveLine: FunctionComponent<Props> = (props) => {
  const {
    color,
    values,
    trackName,
    xyzIndex,
    lineIndex,
    graphRef,
    changeGraphTranslate,
  } = props;
  const dispatch = useDispatch();
  const isAlreadySelected = useRef(false);
  const pathData = useRef<KeyframeValues[]>();

  const [changePathData, setChangePathData] = useState(0);
  const [selected, setSelected] = useState(false);
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);
  const xyzType = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";

  // curve line 클릭
  const handleClickCurveLine = useCallback(
    (event: React.MouseEvent) => {
      const clickedTarget: ClickedTarget = {
        targetType: "curveLine",
        trackName,
        xyzType,
        ctrl: event.ctrlKey || event.metaKey,
        alt: event.altKey,
      };
      dispatch(
        curveEditor.changeClickedTarget({
          clickedTarget,
        })
      );
    },
    [dispatch, trackName, xyzType]
  );

  // 커브라인 옵저버 호출
  const registerCurveLineObserver = useCallback(() => {
    Observer.registerCurveLine({
      active: ({ x, y }) => {
        changeGraphTranslate({ x, y });
        return lineIndex;
      },
      passive: (clasifiedKeyframes: ClasifiedKeyframes[]) => {
        const binaryIndex = fnGetBinarySearch({
          collection: clasifiedKeyframes,
          index: lineIndex,
          key: "lineIndex",
        });
        if (binaryIndex !== -1) {
          const myKeyframes = clasifiedKeyframes[binaryIndex].keyframeData;
          myKeyframes.forEach(({ x, y, keyframeIndex }) => {
            if (pathData.current) {
              const targetIndex = pathData.current.findIndex(
                ({ keyframe }) => keyframe.keyframeIndex === keyframeIndex
              );
              pathData.current[targetIndex].keyframe = {
                x: x,
                y: y,
                keyframeIndex: keyframeIndex,
              };
              pathData.current[targetIndex].handles = {
                left: { x: x - 0.3, y: y },
                right: { x: x + 0.3, y: y },
              };
            }
          });
          pathData.current?.sort((a, b) => a.keyframe.x - b.keyframe.x);
          setChangePathData((prev) => prev + 1);
        }
      },
    });
  }, [lineIndex]);

  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      Observer.notifyCurveLines(cursorGap, "dragging");
    },
    onDragEnd: ({ cursorGap }) => {
      const lineIndices = Observer.notifyCurveLines({ x: 0, y: 0 }, "dragend");
      if (lineIndices) {
        const { x, y } = values[0].keyframe;
        const scaleX = Scale.getScaleX();
        const scaleY = Scale.getScaleY();
        const invertX = scaleX.invert;
        const invertY = scaleY.invert;

        const circleX = scaleX(x) | 0;
        const circleY = scaleY(y);
        const changedX = Math.round(invertX(circleX + cursorGap.x)) - x;
        const changedY = invertY(circleY + cursorGap.y) - y;

        const params = { changedX, changedY, lineIndices };
        dispatch(curveEditor.updateCurveEditorByCurveLine(params));
        Observer.clearObservers(); // 옵저버가 감지하고 있는 리스트 초기화
      }
    },
    ref: graphRef,
  });

  // 커브라인 clicked state 변경
  useEffect(() => {
    if (!clickedTarget || !pathData.current) return;
    const isClickedMe =
      clickedTarget.targetType === "curveLine" &&
      clickedTarget.trackName === trackName &&
      clickedTarget.xyzType === xyzType;
    const isClickedKeyframe =
      clickedTarget.targetType === "keyframe" &&
      clickedTarget.trackName === trackName &&
      clickedTarget.xyzType === xyzType;
    if (clickedTarget.ctrl) {
      if (isClickedMe || isClickedKeyframe || isAlreadySelected.current) {
        isAlreadySelected.current = true;
        registerCurveLineObserver();
        setSelected(true);
      }
    } else if (isClickedMe || isClickedKeyframe) {
      isAlreadySelected.current = true;
      registerCurveLineObserver();
      setSelected(true);
    } else if (clickedTarget.alt && clickedTarget.coordinates) {
      const times = pathData.current.map(({ keyframe }) => keyframe.x);
      const binaryIndex = fnGetBinarySearch({
        collection: times,
        index: clickedTarget.coordinates.x,
      });
      if (binaryIndex !== -1) {
        isAlreadySelected.current = true;
        registerCurveLineObserver();
        setSelected(true);
      }
    } else {
      isAlreadySelected.current = false;
      setSelected(false);
    }
  }, [registerCurveLineObserver, clickedTarget, lineIndex, trackName, xyzType]);

  useEffect(() => {
    pathData.current = _.cloneDeep(values);
    setChangePathData((prev) => prev + 1);
    setSelected(false);
  }, [values]);

  const pathShapes = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    if (pathData.current) {
      const startKeyframe = pathData.current[0].keyframe;
      let path = `M${scaleX(startKeyframe.x)},${scaleY(startKeyframe.y)}`;
      for (let index = 0; index < pathData.current.length - 1; index += 1) {
        const { x: x1, y: y1 } = pathData.current[index].handles.right;
        const { x: x2, y: y2 } = pathData.current[index + 1].handles.left;
        const { x: endX, y: endY } = pathData.current[index + 1].keyframe;
        const bezier1 = `${scaleX(x1)},${scaleY(y1)}`;
        const bezier2 = `${scaleX(x2)},${scaleY(y2)}`;
        const endPoint = `${scaleX(endX)},${scaleY(endY)}`;
        path += `C${bezier1},${bezier2},${endPoint}`;
      }
      return path;
    }
  }, [changePathData]);

  return (
    <path
      className={cx("curve", { selected })}
      fill="none"
      stroke={color}
      d={pathShapes}
      onClick={handleClickCurveLine}
    />
  );
};

export default memo(CurveLine);
