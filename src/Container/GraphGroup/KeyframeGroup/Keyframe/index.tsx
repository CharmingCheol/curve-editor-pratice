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
      console.log("click");
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

  // const handleMouseDown = useCallback((event) => {
  //   event.preventDefault();
  //   console.log("mouseDown");
  // }, []);

  // const handleMouseUp = useCallback((event) => {
  //   event.preventDefault();
  //   console.log("mouseUp");
  // }, []);

  return (
    <circle
      ref={circleRef}
      className={cx({ "mouse-in": mouseIn, clicked })}
      r={2}
      // onMouseDown={handleMouseDown}
      // onMouseMove={handleMouseUp}
      onClick={handleClickKeyframe}
      onMouseEnter={handleMouseEvent}
      onMouseOut={handleMouseEvent}
    />
  );
};

export default Keyframe;
