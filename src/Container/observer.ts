import { fnGetBinarySearch } from "utils";
import {
  Coordinates,
  ClassifiedMarker,
  HandleType,
  KeyframeCoordinates,
} from "types/curveEditor";

interface SelectedKeyframe extends KeyframeCoordinates {
  axisIndex: number;
}

interface SelectedBezierHandle extends SelectedKeyframe {
  handleType: HandleType;
}

interface NotifyParams {
  cursorGap: Coordinates;
  dragType: "dragging" | "dragend";
}

interface BezierHandleParams extends NotifyParams {
  handleType: HandleType;
}

interface RegisterKeyframe {
  call: (params: Coordinates) => SelectedKeyframe; // 키프레임 선택
  axisIndex: number;
  keyframeIndex: number;
  breakHandle: boolean;
  lockHandle: boolean;
}

interface RegisterCurveLine {
  call: (params: Coordinates) => number; // 커브라인 선택
  called: (params: ClassifiedMarker[]) => void; // 키프레임 선택에 의해 커브라인도 선택 됨
}

interface RegisterBezierHandle {
  call: (params: BezierHandleParams) => SelectedBezierHandle[];
}

class Observer {
  private static keyframes: RegisterKeyframe[] = [];
  private static curveLines: RegisterCurveLine[] = [];
  private static bezierHandles: RegisterBezierHandle[] = [];

  // 선택 된 keyframe 등록
  static registerKeyframe(target: RegisterKeyframe) {
    this.keyframes.push(target);
  }

  // 선택 된 curve 등록
  static registerCurveLine(target: RegisterCurveLine) {
    this.curveLines.push(target);
  }

  // 선택 된 bezier handle 등록
  static registerBezierHandle(target: RegisterBezierHandle) {
    this.bezierHandles.push(target);
  }

  static getKeyframeObserver() {
    return this.keyframes;
  }

  static getCurveLineObserver() {
    return this.curveLines;
  }

  static getBezierHandleObserver() {
    return this.bezierHandles;
  }

  static clearKeyframeObserver() {
    this.keyframes.length = 0;
  }

  static clearCurveLineObserver() {
    this.curveLines.length = 0;
  }

  static clearBezierHandleObserver() {
    this.bezierHandles.length = 0;
  }

  // 옵저버 리스트 초기화
  static clearObservers() {
    this.clearKeyframeObserver();
    this.clearCurveLineObserver();
    this.clearBezierHandleObserver();
  }

  // keyframe 호출 시, curve line도 같이 호출
  static notifyKeyframes(params: NotifyParams) {
    const { cursorGap, dragType } = params;
    const selectedKeyframes = this.keyframes.map(({ call }) => call(cursorGap));
    const clasifiedKeyframes: ClassifiedMarker[] = [];
    for (let index = 0; index < selectedKeyframes.length; index += 1) {
      const { axisIndex, ...others } = selectedKeyframes[index];
      const binaryIndex = fnGetBinarySearch({
        collection: clasifiedKeyframes,
        index: axisIndex,
        key: "axisIndex",
      });
      if (binaryIndex === -1) {
        clasifiedKeyframes.push({
          axisIndex: axisIndex,
          markerData: [others],
          markerType: "keyframe",
        });
      } else {
        clasifiedKeyframes[binaryIndex].markerData.push(others);
      }
    }
    if (clasifiedKeyframes.length) {
      if (dragType === "dragging") {
        this.curveLines.forEach(({ called }) => called(clasifiedKeyframes));
      } else if (dragType === "dragend") {
        return clasifiedKeyframes;
      }
    }
  }

  // curve line 호출 시, keyframe도 같이 호출
  static notifyCurveLines(params: NotifyParams) {
    const { cursorGap, dragType } = params;
    if (dragType === "dragging") {
      this.curveLines.forEach(({ call }) => call(cursorGap));
    } else if (dragType === "dragend") {
      return this.curveLines.map(({ call }) => call(cursorGap));
    }
  }

  // bezier handle 호출
  static notifyBezierHandles(params: BezierHandleParams) {
    const { dragType } = params;
    const draggedBezierHandles = this.bezierHandles
      .map((bezierHandle) => bezierHandle.call(params))
      .flat();
    const clasifiedBezierHandles: ClassifiedMarker[] = [];
    for (let index = 0; index < draggedBezierHandles.length; index += 1) {
      const { axisIndex, ...others } = draggedBezierHandles[index];
      const binaryIndex = fnGetBinarySearch({
        collection: clasifiedBezierHandles,
        index: axisIndex,
        key: "axisIndex",
      });
      if (binaryIndex === -1) {
        clasifiedBezierHandles.push({
          axisIndex: axisIndex,
          markerData: [others],
          markerType: "handle",
        });
      } else {
        clasifiedBezierHandles[binaryIndex].markerData.push(others);
      }
    }
    if (clasifiedBezierHandles.length) {
      if (dragType === "dragging") {
        this.curveLines.forEach(({ called }) => called(clasifiedBezierHandles));
      } else if (dragType === "dragend") {
        return clasifiedBezierHandles;
      }
    }
  }
}

export default Observer;
