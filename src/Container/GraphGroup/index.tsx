import React, {
  useState,
  useCallback,
  useMemo,
  FunctionComponent,
  useRef,
} from "react";
import CurveLine from "./CurveLine";
import KeyframeGroup from "./KeyframeGroup";

interface Props {
  name: string;
  lineIndex: number;
  xyzIndex: number;
  values: [number, number][];
}

interface CursorXY {
  x: number;
  y: number;
}

const GraphGroup: FunctionComponent<Props> = (props) => {
  const { name, lineIndex, xyzIndex, values } = props;
  const [graphGroupXY, setGraphGroupXY] = useState({ x: 0, y: 0 });
  // const graphRef = useRef<SVGGElement>(null);
  // const prevCursor = useRef({ x: 0, y: 0 });
  // const [renderingCount, setRenderingCount] = useState(0);

  // const changeGraphGroupXY = useCallback(({ x, y }: CursorXY) => {
  //   // const stateAction = (prev: CursorXY) => ({
  //   //   x: prev.x - x,
  //   //   y: prev.y - y,
  //   // });
  //   // setGraphGroupXY((prev) => stateAction(prev));

  //   // const graph = graphRef.current as SVGGElement;
  //   const translateX = prevCursor.current.x - x;
  //   const translateY = prevCursor.current.y - y;
  //   // const translate3d = `translate3d(${translateX}px, ${translateY}px, 0px)`;
  //   // graph.style.cssText = `transform:${translate3d}`;
  //   prevCursor.current = { x: translateX, y: translateY };
  //   setRenderingCount((prev) => prev + 1);

  //   // console.log(x, y, translateX, translateY, translate3d);
  // }, []);

  const changeGraphGroupXY = useCallback(({ x, y }: CursorXY) => {
    const stateAction = (prev: CursorXY) => ({
      x: prev.x - x,
      y: prev.y - y,
    });
    setGraphGroupXY((prev) => stateAction(prev));
    // console.log(x, y);
    // const graphGroup = document.getElementById(
    //   `graph-group-${name}-${lineIndex}-${xyzIndex}`
    // );
    // if (graphGroup) {
    //   const translateX = prevCursor.current.x - x;
    //   const translateY = prevCursor.current.y - y;
    //   const translate3d = `translate3d(${translateX}px, ${translateY}px, 0px)`;
    //   graphGroup.style.cssText = `transform:${translate3d}`;
    //   prevCursor.current = { x: translateX, y: translateY };
    // }
  }, []);
  const color = xyzIndex === 0 ? "red" : xyzIndex === 1 ? "green" : "blue";
  // console.log("graphGroupXY", name, lineIndex, xyzIndex, graphGroupXY);

  return (
    <g
      // id={`graph-group-${name}-${lineIndex}-${xyzIndex}`}
      // ref={graphRef}
      transform={`translate(${graphGroupXY.x} ${graphGroupXY.y})`}
    >
      <CurveLine
        datum={values}
        color={color}
        trackName={name}
        xyzIndex={xyzIndex}
        lineIndex={lineIndex}
        changeGraphGroupXY={changeGraphGroupXY}
      />
      <KeyframeGroup
        datum={values}
        trackName={name}
        xyzIndex={xyzIndex}
        lineIndex={lineIndex}
      />
    </g>
  );
};

export default GraphGroup;
