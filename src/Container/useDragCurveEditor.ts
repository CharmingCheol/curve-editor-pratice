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
  filterFn?: (event: MouseEvent) => boolean;
  onDragging: (dragProps: DragProps) => void;
  onDragEnd: (dragProps: DragProps) => void;
  ref: RefObject<Element>;
  throttleTime?: number;
  isClampX?: boolean;
}

const useDragCurveEditor = (props: Props) => {
  const {
    filterFn,
    onDragging,
    onDragEnd,
    ref,
    throttleTime = 50,
    isClampX = true,
  } = props;
  const isDragging = useRef(false);

  // 현재 커서 계산 - 직전 커서 위치 계산
  const getCursorGapXY = (event: any) => {
    if (isClampX) {
      const scaleX = Scale.getScaleX();
      const originX = scaleX.invert(event.subject.x);
      const currentX = scaleX.invert(event.x);
      const roundOriginX = scaleX(Math.round(originX));
      const roundCurrentX = scaleX(Math.round(currentX));
      return {
        x: roundOriginX - roundCurrentX,
        y: event.y - event.subject.y,
      };
    }
    return {
      x: event.x - event.subject.x,
      y: event.y - event.subject.y,
    };
  };

  // 드래그 이벤트 시작
  const handleDragStart = useCallback((event: any) => {
    getCursorGapXY(event);
  }, []);

  // 드래그 이벤트 진행
  const handleDragging = useCallback((event: any) => {
    if (!isDragging.current) isDragging.current = true; // drag가 시작되면 dragged를 fasle -> true로 변경
    const cursorGap = getCursorGapXY(event);
    onDragging({ cursorGap, event });
  }, []);

  // 드래그 이벤트 종료
  const handleDragEnd = useCallback((event: any) => {
    if (!isDragging.current) return; // dragged가 false라면(drag를 하지 않았다면) return을 시켜서 함수 종료
    const cursorGap = getCursorGapXY(event);
    onDragEnd({ cursorGap, event });
    isDragging.current = false;
  }, []);

  // 드래그 이벤트 세팅
  useEffect(() => {
    const dragBehavior = d3
      .drag()
      .filter((event: MouseEvent) => {
        if (filterFn) filterFn(event);
        return true;
      })
      .on("start", handleDragStart)
      .on(
        "drag",
        _.throttle((event) => handleDragging(event), throttleTime)
      )
      .on("end", handleDragEnd);
    d3.select(ref.current).call(dragBehavior as any);
  }, []);
};

export default useDragCurveEditor;
