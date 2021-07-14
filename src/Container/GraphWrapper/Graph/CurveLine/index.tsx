import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  FunctionComponent,
} from "react";
import * as d3 from "d3";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import * as curveEditor from "actions/curveEditor";
import {
  ClasifiedKeyframes,
  ClickedTarget,
  GraphValues,
} from "types/curveEditor";
import { fnGetBinarySearch } from "utils";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import Scale from "Container/scale";
import Observer from "Container/observer";
import useDragCurveEditor from "Container/useDragCurveEditor";

const cx = classNames.bind(styles);

interface Props {
  color: string;
  lineIndex: number;
  trackName: string;
  values: GraphValues[];
  xyzIndex: number;
}

type PathData = [number, number, number]; // [timeIndex, y, keyframeIndex]

const CurveLine: FunctionComponent<Props> = (props) => {
  const { color, values, trackName, xyzIndex, lineIndex } = props;
  const dispatch = useDispatch();
  const pathRef = useRef<SVGPathElement>(null);
  const pathData = useRef<PathData[]>([]);
  const isAlreadySelected = useRef(false);

  const [renderingCount, setRenderingCount] = useState(0);
  const [selected, setSelected] = useState(false);
  const [pathTransform, setPathTransform] = useState({ x: 0, y: 0 });

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
  const callCurveLineObserver = useCallback(() => {
    Observer.registerCurveLine({
      active: ({ x, y }) => {
        setPathTransform((prevState) => ({
          x: prevState.x - x,
          y: prevState.y - y,
        }));
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
              (line) => line[2] === keyframe.keyframeIndex // line[2] : keyframeIndex
            );
            pathData.current[keyframeIndex] = [
              keyframe.timeIndex,
              keyframe.value,
              keyframe.keyframeIndex,
            ];
          });
          pathData.current.sort((a: PathData, b: PathData) => a[0] - b[0]); // time index순으로 정렬
          setRenderingCount((prev) => prev + 1);
        }
      },
    });
  }, [lineIndex]);

  useDragCurveEditor({
    onDragging: ({ prevCursor, currentCursor }) => {
      const cursorGapX = prevCursor.x - currentCursor.x; // 직전 커서 x좌표 - 현재 커서 x좌표
      const cursorGapY = prevCursor.y - currentCursor.y; // 직전 커서 y좌표 - 현재 커서 y좌표
      Observer.notifyCurveLines({ x: cursorGapX, y: cursorGapY }, "dragging");
    },
    onDragEnd: ({ prevCursor, currentCursor, event }) => {
      const cursorGapX = prevCursor.x - currentCursor.x; // 직전 커서 x좌표 - 현재 커서 x좌표
      const cursorGapY = prevCursor.y - currentCursor.y; // 직전 커서 y좌표 - 현재 커서 y좌표
      const lineIndices = Observer.notifyCurveLines(
        { x: cursorGapX, y: cursorGapY },
        "dragend"
      );
      if (lineIndices) {
        const invertX = Scale.getScaleX().invert;
        const invertY = Scale.getScaleY().invert;

        const { x: originX, y: originY } = event.subject;
        const { x: lastX, y: lastY } = event;
        const changedX = Math.round(invertX(originX) - invertX(lastX));
        const changedY = invertY(originY) - invertY(lastY);
        const params = { changedX, changedY, lineIndices };

        dispatch(curveEditor.updateCurveEditorByCurveLine(params));
        Observer.clearObservers(); // 옵저버가 감지하고 있는 리스트 초기화
      }
    },
    ref: pathRef,
    throttleTime: 75,
  });

  // 커브라인 clicked state 변경
  useEffect(() => {
    if (!clickedTarget) {
      isAlreadySelected.current = false;
      setPathTransform({ x: 0, y: 0 });
      setSelected(false);
      return;
    }
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
        callCurveLineObserver();
        setSelected(true);
      }
    } else if (isClickedMe || isClickedKeyframe) {
      isAlreadySelected.current = true;
      callCurveLineObserver();
      setSelected(true);
    } else if (clickedTarget.alt && clickedTarget.coordinates) {
      const times = pathData.current.map((data) => data[0]);
      const binaryIndex = fnGetBinarySearch({
        collection: times,
        index: clickedTarget.coordinates.x,
      });
      if (binaryIndex !== -1) {
        isAlreadySelected.current = true;
        callCurveLineObserver();
        setSelected(true);
      }
    } else {
      isAlreadySelected.current = false;
      setSelected(false);
    }
  }, [callCurveLineObserver, clickedTarget, lineIndex, trackName, xyzType]);

  // values가 변경 될 경우 pathData 업데이트
  useEffect(() => {
    pathData.current = values.map((data, index) => [data[0], data[1], index]);
    setRenderingCount((prev) => prev + 1);
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
  }, [renderingCount]);

  return (
    <path
      transform={`translate(${pathTransform.x}, ${pathTransform.y})`}
      className={cx({ selected })}
      fill="none"
      stroke={color}
      d={pathShapes}
      ref={pathRef}
      onClick={handleClickCurveLine}
    />
  );
};

export default memo(CurveLine);
