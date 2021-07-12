import { useCallback, useEffect, useRef, RefObject } from "react";
import * as d3 from "d3";
import _ from "lodash";
import Scale from "Container/scale";

interface CursorXY {
  x: number;
  y: number;
}

interface DragProps {
  currentCursor: CursorXY;
  prevCursor: CursorXY;
}

interface Props {
  onDragStart?: (dragProps: DragProps) => void;
  onDragging: (dragProps: DragProps) => void;
  onDragEnd: (dragProps: DragProps) => void;
  ref: RefObject<Element>;
  throttleTime?: number;
}

const useDragCurveEditor = (props: Props) => {
  const { ref, onDragStart, onDragging, onDragEnd, throttleTime = 50 } = props;
  const prevCursor = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // 현재 커서의 xy 계산
  const getCursorXY = useCallback((x: number, y: number) => {
    const xScale = Scale.xScale;
    const time = xScale.invert(x);
    const timeIndex = Math.round(time);
    return { x: xScale(timeIndex) | 0, y };
  }, []);

  // 드래그 이벤트 시작
  const handleDragStart = useCallback((event: any) => {
    const currentCursor = getCursorXY(event.x, event.y);
    if (onDragStart) {
      onDragStart({ prevCursor: prevCursor.current, currentCursor });
    }
    prevCursor.current = currentCursor;
  }, []);

  // 드래그 이벤트 진행
  const handleDragging = useCallback((event: any) => {
    if (!isDragging.current) isDragging.current = true; // drag가 시작되면 dragged를 fasle -> true로 변경
    const currentCursor = getCursorXY(event.x, event.y);
    onDragging({ prevCursor: prevCursor.current, currentCursor });
    prevCursor.current = currentCursor;
  }, []);

  // 드래그 이벤트 종료
  const handleDragEnd = useCallback((event: any) => {
    if (!isDragging.current) return; // dragged가 false라면(drag를 하지 않았다면) return을 시켜서 함수 종료
    const currentCursor = getCursorXY(event.x, event.y);
    onDragEnd({ prevCursor: prevCursor.current, currentCursor });
    isDragging.current = false;
  }, []);

  // 드래그 이벤트 세팅
  useEffect(() => {
    const dragBehavior = d3
      .drag()
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
