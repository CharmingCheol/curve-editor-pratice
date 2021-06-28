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
import * as curveEditor from "actions/curveEditor";
import { ClickedTarget, XYZ } from "types/curveEditor";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

interface Props {
  data: number[];
  trackName: string;
  xyz: XYZ;
  testCallback: ([x, y]: [number, number]) => void;
}

const Keyframe: FunctionComponent<Props> = (props) => {
  const { data, trackName, xyz, testCallback } = props;

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

  // 키프레임 위치 조정
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);
    d3.select(circleRef.current).attr("cx", x(data[0])).attr("cy", y(data[1]));
  }, [testCallback, data]);

  // 키프레임 드래그 앤 드랍
  useEffect(() => {
    const width = window.innerWidth;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);

    let prevCursorX = 0;
    let prevCursorY = 0;

    const setCursorX = (cursorX: number) => {
      const invertCursorX = Math.round(x.invert(cursorX));
      return x(invertCursorX) | 0;
    };

    const start = (event: any) => {
      prevCursorX = setCursorX(event.x);
      prevCursorY = event.y;
    };

    const drag = (event: any) => {
      const cursorX = setCursorX(event.x);
      const cursorY = event.y;
      const differX = prevCursorX - cursorX;
      const differY = prevCursorY - cursorY;

      const selector = "circle[data-clicked=clicked]";
      const clickedCircles = document.querySelectorAll(selector);
      clickedCircles.forEach((circle) => {
        const circleX = parseInt(circle.getAttribute("cx") as string, 10);
        const circleY = parseFloat(circle.getAttribute("cy") as string);
        circle.setAttribute("cx", `${circleX - differX}`);
        circle.setAttribute("cy", `${circleY - differY}`);
      });

      prevCursorX = cursorX;
      prevCursorY = cursorY;
    };

    const end = (event: any) => {
      console.log("end", event);
    };

    const dragBehavior = d3
      .drag()
      .on("start", start)
      .on("drag", drag)
      .on("end", end);
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
    />
  );
};

export default memo(Keyframe);
