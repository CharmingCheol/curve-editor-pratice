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
import * as d3 from "d3";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import * as curveEditor from "actions/curveEditor";
import {
  ClasifiedKeyframes,
  ClickedTarget,
  GraphValues,
  PointXY,
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
  values: GraphValues[];
  xyzIndex: number;
  graphRef: RefObject<SVGGElement>;
  changeGraphTranslate: (cursor: PointXY) => void;
}

type PathData = [number, number, number]; // [timeIndex, y, keyframeIndex]

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
  const pathData = useRef<PathData[]>([]);

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
          myKeyframes.forEach((keyframe) => {
            const keyframeIndex = pathData.current.findIndex(
              (line) => line[2] === keyframe.keyframeIndex // line[2] = keyframeIndex
            );
            pathData.current[keyframeIndex] = [
              keyframe.timeIndex,
              keyframe.value,
              keyframe.keyframeIndex,
            ];
          });
          pathData.current.sort((a: PathData, b: PathData) => a[0] - b[0]); // time index순으로 정렬
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
        const [timeIndex, value] = values[0];
        const scaleX = Scale.getScaleX();
        const scaleY = Scale.getScaleY();
        const invertX = scaleX.invert;
        const invertY = scaleY.invert;

        const circleX = scaleX(timeIndex) | 0;
        const circleY = scaleY(value);
        const changedX = Math.round(invertX(circleX + cursorGap.x)) - timeIndex;
        const changedY = invertY(circleY + cursorGap.y) - value;

        const params = { changedX, changedY, lineIndices };
        dispatch(curveEditor.updateCurveEditorByCurveLine(params));
        Observer.clearObservers(); // 옵저버가 감지하고 있는 리스트 초기화
      }
    },
    ref: graphRef,
  });

  // 커브라인 clicked state 변경
  useEffect(() => {
    if (!clickedTarget) return;
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
      const times = pathData.current.map((data) => data[0]);
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
    pathData.current = values.map((data, index) => [data[0], data[1], index]);
    setChangePathData((prev) => prev + 1);
    setSelected(false);
  }, [values]);

  const pathShapes = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const lineGenerator = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((xy) => scaleX(xy[0]))
      .y((xy) => scaleY(xy[1]));
    const graphValues: GraphValues[] = pathData.current.map((data) => [
      data[0],
      data[1],
    ]);
    return lineGenerator(graphValues) as string;
  }, [changePathData]);

  return (
    <path
      className={cx({ selected })}
      fill="none"
      stroke={color}
      d={pathShapes}
      onClick={handleClickCurveLine}
    />
  );
};

export default memo(CurveLine);
