import React, {
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
import Test from "Container/test";

const cx = classNames.bind(styles);

interface Props {
  data: number[];
  trackName: string;
  xyz: XYZ;
}

const Keyframe: FunctionComponent<Props> = ({ data, trackName, xyz }) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const [mouseIn, setMouseIn] = useState(false);
  const [clicked, setClicked] = useState(false);
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);
  const dispatch = useDispatch();

  // 키프레임 클릭
  const handleClickKeyframe = useCallback(
    (event: React.MouseEvent) => {
      const a = Test.xScale;
      const b = Test.yScale;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const margin = { top: 40, right: 40, bottom: 40, left: 40 };
      const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
      const y = d3
        .scaleLinear()
        .domain([-4.5, 4.5])
        .range([height, margin.top]);
      if (a && b) {
        console.log(
          data,
          a(data[0]),
          b(data[1]),
          x(data[0]),
          y(data[1]),
          event.clientX - 40,
          event.clientY - 40
        );
      }
      const clickedTarget: ClickedTarget = {
        type: "keyframe",
        trackName,
        xyz,
        ctrl: event.ctrlKey || event.metaKey,
        alt: event.altKey,
        coordinates: { x: data[0], y: data[1] },
      };
      dispatch(
        curveEditor.changeClickedTarget({
          clickedTarget,
        })
      );
      setClicked(true);
    },
    [data, dispatch, trackName, xyz]
  );

  // curve line 마우스 이벤트 적용
  const handleMouseEvent = useCallback(() => {
    setMouseIn((prev) => !prev);
  }, []);

  // 키프레임 위치 조정
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);

    // const dd = new Test();
    // const a = dd.xScale;
    // console.log(a);
    const a = Test.xScale;
    const b = Test.yScale;
    d3.select(circleRef.current).attr("cx", x(data[0])).attr("cy", y(data[1]));
  }, [data]);

  // 다른 curve line이나 keyframe 클릭 시, 선택 유지 및 해제 적용
  useEffect(() => {
    if (!clickedTarget) return;
    if (clickedTarget.ctrl) return;
    if (clickedTarget.alt && clickedTarget.coordinates?.x === data[0]) {
      return setClicked(true);
    }
    if (
      clickedTarget.trackName !== trackName ||
      clickedTarget.xyz !== xyz ||
      clickedTarget.coordinates?.x !== data[0] ||
      clickedTarget.coordinates?.y !== data[1]
    ) {
      return setClicked(false);
    }
  }, [clickedTarget, data, trackName, xyz]);

  const handleMouseMove = useCallback((event) => {
    console.log("mouseMove", event);
  }, []);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(() => {
    if (!clicked) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [clicked, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const circle = circleRef.current;
    if (circle) {
      circle.addEventListener("mousedown", handleMouseDown);
      return () => {
        circle.removeEventListener("mousedown", handleMouseDown);
      };
    }
  }, [handleMouseDown]);

  return (
    <circle
      ref={circleRef}
      className={cx({ "mouse-in": mouseIn, clicked })}
      r={2}
      onClick={handleClickKeyframe}
      onMouseEnter={handleMouseEvent}
      onMouseOut={handleMouseEvent}
    />
  );
};

export default Keyframe;
