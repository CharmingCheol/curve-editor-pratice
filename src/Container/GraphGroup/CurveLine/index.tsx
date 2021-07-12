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
import { ClickedTarget } from "types/curveEditor";
import { fnGetBinarySearch } from "utils";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import Scale from "Container/scale";
import Observer from "Container/observer";
import useDragCurveEditor from "Container/useDragCurveEditor";

const cx = classNames.bind(styles);

interface KeyframeDatum {
  keyframeIndex: number;
  timeIndex: number;
  y: number;
}

interface ClasifiedKeyframes {
  lineIndex: number;
  keyframeDatum: KeyframeDatum[];
}

interface Props {
  color: string;
  datum: [number, number][];
  trackName: string;
  xyzIndex: number;
  lineIndex: number;
  changeGraphGroupXY: ({ x, y }: { x: number; y: number }) => void;
}

type LineData = [number, number, number]; // [timeIndex, y, keyframeIndex]

const CurveLine: FunctionComponent<Props> = (props) => {
  const { color, datum, trackName, xyzIndex, lineIndex, changeGraphGroupXY } =
    props;
  const dispatch = useDispatch();
  const pathRef = useRef<SVGPathElement>(null);
  const lineData = useRef<LineData[]>([]);
  const isAlreadyClicked = useRef(false);

  const [renderingCount, setRenderingCount] = useState(0);
  const [clicked, setClicked] = useState(false);

  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);
  const xyz = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";

  // curve line 클릭
  const handleClickCurveLine = useCallback(
    (event: React.MouseEvent) => {
      const clickedTarget: ClickedTarget = {
        type: "curveLine",
        trackName,
        xyz,
        ctrl: event.ctrlKey || event.metaKey,
        alt: event.altKey,
      };
      dispatch(
        curveEditor.changeClickedTarget({
          clickedTarget,
        })
      );
    },
    [dispatch, trackName, xyz]
  );

  const [graphGroupXY, setGraphGroupXY] = useState({ x: 0, y: 0 });
  // 커브라인 옵저버 호출
  const callCurveLineObserver = useCallback(() => {
    Observer.addCurveLineObserver({
      registerCurveLine: ({ cursorGapX, cursorGapY }) => {
        const stateAction = (prevState: any) => ({
          x: prevState.x - cursorGapX,
          y: prevState.y - cursorGapY,
        });
        setGraphGroupXY((prevState) => stateAction(prevState));
      },
      isRegisteredCurveLine: (clasifiedKeyframes: ClasifiedKeyframes[]) => {
        const binaryIndex = fnGetBinarySearch({
          collection: clasifiedKeyframes,
          index: lineIndex,
          key: "lineIndex",
        });
        if (binaryIndex !== -1) {
          clasifiedKeyframes[binaryIndex].keyframeDatum.forEach((data) => {
            const keyframeIndex = lineData.current.findIndex(
              (line) => line[2] === data.keyframeIndex // line[2] : keyframeIndex
            );
            lineData.current[keyframeIndex] = [
              data.timeIndex,
              data.y,
              data.keyframeIndex,
            ];
          });
          lineData.current.sort((a: LineData, b: LineData) => a[0] - b[0]); // time index순으로 정렬
          setRenderingCount((prev) => prev + 1);
        }
      },
    });
  }, [changeGraphGroupXY, lineIndex]);

  // 커브라인 clicked state 변경
  useEffect(() => {
    if (!clickedTarget) return;
    const isClickedMe =
      clickedTarget.type === "curveLine" &&
      clickedTarget.trackName === trackName &&
      clickedTarget.xyz === xyz;
    const isClickedKeyframe =
      clickedTarget.type === "keyframe" &&
      clickedTarget.trackName === trackName &&
      clickedTarget.xyz === xyz;
    if (clickedTarget.ctrl) {
      if (isClickedMe || isClickedKeyframe || isAlreadyClicked.current) {
        isAlreadyClicked.current = true;
        callCurveLineObserver();
        setClicked(true);
      }
    } else if (isClickedMe || isClickedKeyframe) {
      isAlreadyClicked.current = true;
      callCurveLineObserver();
      setClicked(true);
    } else if (clickedTarget.alt && clickedTarget.coordinates) {
      const times = lineData.current.map((data) => data[0]);
      const binaryIndex = fnGetBinarySearch({
        collection: times,
        index: clickedTarget.coordinates.x,
      });
      if (binaryIndex !== -1) {
        isAlreadyClicked.current = true;
        callCurveLineObserver();
        setClicked(true);
      }
    } else {
      isAlreadyClicked.current = false;
      setClicked(false);
    }
  }, [callCurveLineObserver, clickedTarget, lineIndex, trackName, xyz]);

  useDragCurveEditor({
    onDragging: ({ prevCursor, currentCursor }) => {
      const cursorGapX = prevCursor.x - currentCursor.x; // 직전 커서 x좌표 - 현재 커서 x좌표
      const cursorGapY = prevCursor.y - currentCursor.y; // 직전 커서 y좌표 - 현재 커서 y좌표
      Observer.notifySelectedCurveLines({ cursorGapX, cursorGapY }, "dragging");
    },
    onDragEnd: () => {},
    ref: pathRef,
    throttleTime: 75,
  });

  // datum 변경 시 lineData 업데이트
  useEffect(() => {
    lineData.current = datum.map((data, index) => [data[0], data[1], index]);
    setRenderingCount((prev) => prev + 1);
  }, [datum]);

  const pathShapes = useMemo(() => {
    const lineGenerator = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((xy) => Scale.xScale(xy[0]))
      .y((xy) => Scale.yScale(xy[1]));
    const pathData: [number, number][] = lineData.current.map((data) => [
      data[0],
      data[1],
    ]);
    return lineGenerator(pathData) as string;
  }, [renderingCount]);

  return (
    <path
      transform={`translate(${graphGroupXY.x}, ${graphGroupXY.y})`}
      className={cx({ clicked })}
      fill="none"
      stroke={color}
      d={pathShapes}
      ref={pathRef}
      onClick={handleClickCurveLine}
    />
  );
};

export default memo(CurveLine);
