import React, {
  Fragment,
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import * as d3 from "d3";
import * as curveEditorAction from "actions/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import Observer from "Container/observer";
import Scale from "Container/scale";
import { Coordinates, KeyframeCoordinates } from "types/curveEditor";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

interface Props {
  breakHandle: boolean;
  changeHandleSelected: (handleType: "left" | "right") => void;
  handleSelected: boolean;
  handleType: "left" | "right";
  handleXY: Coordinates;
  lockHandle: boolean;
  keyframeXY: KeyframeCoordinates;
}

const BezierHandleForm: FunctionComponent<Props> = (props) => {
  const {
    breakHandle,
    changeHandleSelected,
    handleSelected,
    handleType,
    handleXY,
    lockHandle,
    keyframeXY,
  } = props;
  const dispatch = useDispatch();
  const lineRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGRectElement>(null);
  const triangleRef = useRef<SVGPolygonElement>(null);

  // handle line 드래그 시, 아무런 반응 없도록 처리
  useEffect(() => {
    const dragBehavior = d3.drag().on("start", null);
    d3.select(lineRef.current).call(dragBehavior as any);
  }, [lineRef]);

  // handle circle 이벤트
  useDragCurveEditor({
    onDragStart: () => {
      changeHandleSelected(handleType);
    },
    onDragging: ({ cursorGap }) => {
      Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragging",
        handleType,
      });
    },
    onDragEnd: ({ cursorGap }) => {
      const bezierHandles = Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragend",
        handleType,
      });
      if (bezierHandles) {
        dispatch(
          curveEditorAction.updateCurveEditorByBezierHandle({ bezierHandles })
        );
      }
    },
    ref: lockHandle ? triangleRef : circleRef,
    isClampX: false, // 커서 위치에 따라 handle의 x좌표를 조절
    throttleTime: 100,
  });

  const handlePosition = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const keyframeX = scaleX(keyframeXY.x);
    const keyframeY = scaleY(keyframeXY.y);
    const handleX = scaleX(handleXY.x);
    const handleY = scaleY(handleXY.y);
    return {
      keyframeX,
      keyframeY,
      handleX,
      handleY,
      line: `M${handleX},${handleY} L${keyframeX},${keyframeY}`,
    };
  }, [handleXY, keyframeXY]);

  return (
    <Fragment>
      <path
        ref={lineRef}
        className={cx({ break: breakHandle, selected: handleSelected })}
        d={handlePosition.line}
      />
      {lockHandle ? (
        <polygon
          ref={triangleRef}
          className={cx("bezier-head", {
            selected: handleSelected,
            right: handleType === "right",
          })}
          points={`
        ${handlePosition.handleX} ${handlePosition.handleY},
        ${handlePosition.handleX + 2} ${handlePosition.handleY + 2},
        ${handlePosition.handleX} ${handlePosition.handleY + 4}
        `}
        />
      ) : (
        <rect
          ref={circleRef}
          className={cx("bezier-head", { selected: handleSelected })}
          width={2.5}
          height={2.5}
          x={handlePosition.handleX}
          y={handlePosition.handleY}
        />
      )}
    </Fragment>
  );
};

export default BezierHandleForm;
