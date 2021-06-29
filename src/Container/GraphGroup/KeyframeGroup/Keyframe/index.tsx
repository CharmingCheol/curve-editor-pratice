import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  FunctionComponent,
} from "react";
import * as d3 from "d3";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import _ from "lodash";
import * as curveEditor from "actions/curveEditor";
import { ClickedTarget, XYZ } from "types/curveEditor";
import { fnGetBinarySearch } from "utils";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

interface KeyframeDatum {
  keyframeIndex: number;
  timeIndex: number;
  y: number;
}

interface SelectedKeyframes {
  lineIndex: number;
  datum: KeyframeDatum[];
}

interface Props {
  data: number[];
  trackName: string;
  xyz: XYZ;
  keyframeIndex: number;
  lineIndex: number;
}

const Keyframe: FunctionComponent<Props> = (props) => {
  const { data, keyframeIndex, lineIndex, trackName, xyz } = props;
  const circleRef = useRef<SVGCircleElement>(null);
  const [mouseIn, setMouseIn] = useState(false);
  const [clicked, setClicked] = useState(false);
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);
  const dispatch = useDispatch();

  // 키프레임 클릭
  const handleClickKeyframe = useCallback(
    (event: React.MouseEvent) => {
      const clickedTarget: ClickedTarget = {
        type: "keyframe",
        trackName,
        xyz,
        ctrl: event.ctrlKey || event.metaKey,
        alt: event.altKey,
        coordinates: { x: data[0], y: data[1] },
      };
      circleRef.current?.setAttribute("data-clicked", "clicked");
      dispatch(
        curveEditor.changeClickedTarget({
          clickedTarget,
        })
      );
      setClicked(true);
    },
    [data, dispatch, trackName, xyz]
  );

  // 키프레임 cursor in/out
  const handleCursorInOut = useCallback(() => {
    setMouseIn((prev) => !prev);
  }, []);

  // 최초 키프레임 위치 지정
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 42 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);
    d3.select(circleRef.current)
      .attr("cx", x(data[0]) | 0)
      .attr("cy", y(data[1]));
  }, [data]);

  // 키프레임 드래그 앤 드랍
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 42 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);
    const svg = document.querySelector("svg") as SVGSVGElement;

    let prevCursorX = 0;
    let prevCursorY = 0;

    const setTimeIndex = (circleX: number) => {
      return Math.round(x.invert(circleX));
    };

    const setCursorX = (cursorX: number) => {
      const timeIndex = setTimeIndex(cursorX);
      return x(timeIndex) | 0;
    };

    const handleDragStart = (event: any) => {
      prevCursorX = setCursorX(event.x);
      prevCursorY = event.y;
    };

    const handleDragging = (event: any) => {
      const cursorX = setCursorX(event.x);
      const cursorY = event.y;
      const differX = prevCursorX - cursorX;
      const differY = prevCursorY - cursorY;
      const clickedKeyframesData: SelectedKeyframes[] = [];

      const circleSelector = "circle[data-clicked=clicked]";
      const circles = svg.querySelectorAll(circleSelector);
      circles.forEach((circle) => {
        const circleX = parseInt(circle.getAttribute("cx") as string, 10);
        const circleY = parseFloat(circle.getAttribute("cy") as string);
        const lineIndex = circle.getAttribute("data-lineindex") as string;
        const keyframeIndex = circle.getAttribute("data-keyframeindex");

        const binaryIndex = fnGetBinarySearch({
          collection: clickedKeyframesData,
          index: lineIndex,
          key: "lineIndex",
        });
        const datum = {
          keyframeIndex: parseInt(keyframeIndex as string, 10),
          timeIndex: setTimeIndex(circleX),
          y: y.invert(circleY),
        };
        if (binaryIndex === -1) {
          clickedKeyframesData.push({
            lineIndex: parseInt(lineIndex, 10),
            datum: [datum],
          });
        } else {
          clickedKeyframesData[binaryIndex].datum.push(datum);
        }
        circle.setAttribute("cx", `${circleX - differX}`);
        circle.setAttribute("cy", `${circleY - differY}`);
      });

      const curveLineSelector = "path[data-clicked=clicked]";
      const curveLines = svg.querySelectorAll(curveLineSelector);
      curveLines.forEach((element) => {
        if (!clickedKeyframesData.length) return;
        const curveLine = d3.select(element);
        const lineGenerator = d3
          .line()
          .curve(d3.curveMonotoneX)
          .x((d) => x(d[0]))
          .y((d) => y(d[1]));
        const curveLinedatum = curveLine.datum() as number[][];
        const lineIndex = element.getAttribute("data-lineindex") as string;
        const binaryIndex = fnGetBinarySearch({
          collection: clickedKeyframesData,
          index: lineIndex,
          key: "lineIndex",
        });
        clickedKeyframesData[binaryIndex].datum.forEach((data) => {
          curveLinedatum[data.keyframeIndex] = [data.timeIndex, data.y];
        });
        curveLine.datum(curveLinedatum).attr("d", lineGenerator as any);
      });

      prevCursorX = cursorX;
      prevCursorY = cursorY;
    };

    const handleDragEnd = (event: any) => {};

    const dragBehavior = d3
      .drag()
      .on("start", handleDragStart)
      .on(
        "drag",
        _.throttle((event) => handleDragging(event), 50)
      )
      .on("end", handleDragEnd);
    d3.select(circleRef.current).call(dragBehavior as any);
  }, []);

  // 다른 curve line이나 keyframe 클릭 시, 선택 유지 및 해제 적용
  useEffect(() => {
    if (!clickedTarget) return;
    if (clickedTarget.ctrl) return;
    if (clickedTarget.alt && clickedTarget.coordinates?.x === data[0]) {
      circleRef.current?.setAttribute("data-clicked", "clicked");
      return setClicked(true);
    }
    if (
      clickedTarget.trackName !== trackName ||
      clickedTarget.xyz !== xyz ||
      clickedTarget.coordinates?.x !== data[0] ||
      clickedTarget.coordinates?.y !== data[1]
    ) {
      circleRef.current?.removeAttribute("data-clicked");
      return setClicked(false);
    }
  }, [clickedTarget, data, trackName, xyz]);

  return (
    <circle
      ref={circleRef}
      className={cx({ "mouse-in": mouseIn, clicked })}
      r={2}
      onClick={handleClickKeyframe}
      onMouseEnter={handleCursorInOut}
      onMouseOut={handleCursorInOut}
      data-lineindex={lineIndex}
      data-keyframeindex={keyframeIndex}
    />
  );
};

export default memo(Keyframe);
