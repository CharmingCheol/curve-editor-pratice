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
import { ClickedTarget, XYZ } from "types/curveEditor";
import { fnGetBinarySearch } from "utils";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import Scale from "Container/scale";
import Observer from "Container/observer";

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
}

type LineData = [number, number, number]; // [timeIndex, y, keyframeIndex]

const CurveLine: FunctionComponent<Props> = (props) => {
  const { color, datum, trackName, xyzIndex, lineIndex } = props;
  const pathRef = useRef<SVGPathElement>(null);
  const isAlreadyClicked = useRef(false);
  const lineData = useRef<LineData[]>([]);

  const [renderingCount, setRenderingCount] = useState(0);
  const [clicked, setClicked] = useState(false);

  const dispatch = useDispatch();
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);

  const xyz = useMemo<XYZ>(() => {
    if (xyzIndex === 0) {
      return "x";
    } else if (xyzIndex === 1) {
      return "y";
    } else {
      return "z";
    }
  }, [xyzIndex]);

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

  // 커브라인 옵저버 호출
  const callCurveLineObserver = useCallback(() => {
    Observer.addCurveLineObserver({
      curveLineNotify: (clasifiedKeyframes: ClasifiedKeyframes[]) => {
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
  }, [lineIndex]);

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
      if (isClickedKeyframe || isAlreadyClicked.current) {
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

  // datum 변경 싱 lineData 업데이트
  useEffect(() => {
    lineData.current = datum.map((data, index) => [data[0], data[1], index]);
    setRenderingCount((prev) => prev + 1);
  }, [datum]);

  const Path = useMemo(() => {
    const lineGenerator = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((d) => Scale.xScale(d[0]))
      .y((d) => Scale.yScale(d[1]));
    const pathShapes: [number, number][] = lineData.current.map((data) => [
      data[0],
      data[1],
    ]);
    // const regExp = /(\.\d{4})\d+/g;
    // const pathShapes = lineGenerator(filteredLineData)?.replace(regExp, "$1");
    return (
      <path
        className={cx({ clicked })}
        fill="none"
        stroke={color}
        d={lineGenerator(pathShapes) as string}
        ref={pathRef}
        onClick={handleClickCurveLine}
      />
    );
  }, [clicked, color, handleClickCurveLine, renderingCount]);

  return Path;
};

export default memo(CurveLine);
