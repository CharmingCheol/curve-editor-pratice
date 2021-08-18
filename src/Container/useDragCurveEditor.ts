import { useCallback, useEffect, useRef, RefObject } from "react";
import * as d3 from "d3";
import _ from "lodash";
import { Coordinates } from "types/curveEditor";
import Scale from "Container/scale";

interface DragProps {
  cursorGap: Coordinates;
  event: any;
}

interface Props {
  onDragStart?: () => void;
  onDragging: (dragProps: DragProps) => void;
  onDragEnd: (dragProps: DragProps) => void;
  ref: RefObject<Element>;
  throttleTime?: number;
  isClampX?: boolean;
}

const useDragCurveEditor = (props: Props) => {
  const {
    onDragStart,
    onDragging,
    onDragEnd,
    ref,
    throttleTime = 50,
    isClampX = true,
  } = props;
  const isDragging = useRef(false);

  // 현재 커서 계산 - 직전 커서 위치 계산
  const getCursorGapXY = useCallback(
    (event: any) => {
      if (isClampX) {
        const scaleX = Scale.getScaleX();
        const originX = scaleX.invert(event.subject.x);
        const currentX = scaleX.invert(event.x);
        const roundOriginX = scaleX(Math.round(originX));
        const roundCurrentX = scaleX(Math.round(currentX));
        return {
          x: roundCurrentX - roundOriginX,
          y: event.y - event.subject.y,
        };
      }
      return {
        x: event.x - event.subject.x,
        y: event.y - event.subject.y,
      };
    },
    [isClampX]
  );

  // 드래그 이벤트 시작
  const handleDragStart = useCallback(
    (event: any) => {
      getCursorGapXY(event);
      if (onDragStart) onDragStart();
    },
    [getCursorGapXY, onDragStart]
  );

  // 드래그 이벤트 진행
  const handleDragging = useCallback(
    (event: any) => {
      if (event.x !== event.subject.x || event.y !== event.subject.y) {
        const cursorGap = getCursorGapXY(event);
        onDragging({ cursorGap, event });
        isDragging.current = true; // drag가 시작되면 dragged를 fasle -> true로 변경
      }
    },
    [getCursorGapXY, onDragging]
  );

  // 드래그 이벤트 종료
  const handleDragEnd = useCallback(
    (event: any) => {
      if (!isDragging.current) return; // dragged가 false라면(drag를 하지 않았다면) return을 시켜서 함수 종료
      const cursorGap = getCursorGapXY(event);
      onDragEnd({ cursorGap, event });
      isDragging.current = false;
    },
    [getCursorGapXY, onDragEnd]
  );

  // 드래그 이벤트 세팅
  useEffect(() => {
    const dragged = (event: any) => handleDragging(event);
    const throttleedThing = _.throttle(dragged, throttleTime);
    const dragBehavior = d3
      .drag()
      .on("start", handleDragStart)
      .on("drag", throttleedThing)
      .on("end", (event) => {
        handleDragEnd(event);
        throttleedThing.cancel();
      });
    d3.select(ref.current).call(dragBehavior as any);
  }, [handleDragEnd, handleDragStart, handleDragging, ref, throttleTime]);
};

export default useDragCurveEditor;
