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
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

interface Props {
  color: string;
  datum: number[][];
  trackName: string;
  xyzIndex: number;
}

const CurveLine: FunctionComponent<Props> = (props) => {
  const { color, datum, trackName, xyzIndex } = props;
  const dispatch = useDispatch();
  const [mouseIn, setMouseIn] = useState(false);
  const [clicked, setClicked] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
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

  // curve line 마우스 이벤트 적용
  const handleMouseEvent = useCallback(() => {
    setMouseIn((prev) => !prev);
  }, []);

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
      setClicked(true);
    },
    [dispatch, trackName, xyz]
  );

  // d3로 path에다가 curve line 그리기
  useEffect(() => {
    if (!pathRef.current) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);
    const curveLine = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((d) => x(d[0]))
      .y((d) => y(d[1]));
    d3.select(pathRef.current)
      .datum(datum)
      .attr("d", curveLine as any);
  }, [datum]);

  // 다른 curve line이나 keyframe 클릭 시, 선택 유지 및 해제 적용
  useEffect(() => {
    if (!clickedTarget) return;
    if (
      clickedTarget.ctrl &&
      clickedTarget.type === "keyframe" &&
      clickedTarget.trackName === trackName &&
      clickedTarget.xyz === xyz
    ) {
      return setClicked(true);
    }
    if (clickedTarget.ctrl) return;
    if (clickedTarget.trackName === trackName && clickedTarget.xyz === xyz) {
      return setClicked(true);
    }
    if (clickedTarget.trackName !== trackName || clickedTarget.xyz !== xyz) {
      return setClicked(false);
    }
  }, [clickedTarget, trackName, xyz]);

  return (
    <path
      className={cx({ "mouse-in": mouseIn, clicked })}
      fill="none"
      stroke={color}
      ref={pathRef}
      onClick={handleClickCurveLine}
      onMouseEnter={handleMouseEvent}
      onMouseOut={handleMouseEvent}
    />
  );
};

export default memo(CurveLine);
