import { fnGetBinarySearch } from "utils";
import {
  Coordinates,
  ClasifiedKeyframes,
  KeyframeCoordinates,
} from "types/curveEditor";

interface SelectedKeyframes extends KeyframeCoordinates {
  lineIndex: number;
}

interface RegisterKeyframe {
  active: (cursorGap: Coordinates) => SelectedKeyframes; // 키프레임 선택
}

interface RegisterCurveLine {
  active: (cursorGap: Coordinates) => number; // 커브라인 선택
  passive: (clasifiedKeyframes: ClasifiedKeyframes[]) => void; // 키프레임 선택에 의해 커브라인도 선택 됨
}

interface RegisterBezierHandle {
  left: (cursorGap: Coordinates) => void;
  right: (cursorGap: Coordinates) => void;
}

class Observer {
  private static keyframes: RegisterKeyframe[] = [];
  private static curveLines: RegisterCurveLine[] = [];
  private static bezierHandles: RegisterBezierHandle[] = [];

  // 옵저버 리스트 초기화
  static clearObservers() {
    this.keyframes.length = 0;
    this.curveLines.length = 0;
    this.bezierHandles.length = 0;
  }

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

  // keyframe 호출 시, curve line도 같이 호출
  static notifyKeyframes(params: {
    cursorGap: Coordinates;
    dragType: "dragging" | "dragend";
  }) {
    const { cursorGap, dragType } = params;
    const selectedKeyframes = this.keyframes.map(({ active }) =>
      active(cursorGap)
    );
    const clasifiedKeyframes: ClasifiedKeyframes[] = [];
    for (let index = 0; index < selectedKeyframes.length; index += 1) {
      const keyframeData = selectedKeyframes[index];
      const { lineIndex, ...others } = keyframeData;
      const binaryIndex = fnGetBinarySearch({
        collection: clasifiedKeyframes,
        index: lineIndex,
        key: "lineIndex",
      });
      if (binaryIndex === -1) {
        clasifiedKeyframes.push({
          lineIndex: lineIndex,
          keyframeData: [others],
        });
      } else {
        clasifiedKeyframes[binaryIndex].keyframeData.push(others);
      }
    }
    if (clasifiedKeyframes.length) {
      if (dragType === "dragging") {
        this.curveLines.forEach(({ passive }) => passive(clasifiedKeyframes));
      } else if (dragType === "dragend") {
        return clasifiedKeyframes;
      }
    }
  }

  // curve line 호출 시, keyframe도 같이 호출
  static notifyCurveLines(
    cursorGap: Coordinates,
    dragType: "dragging" | "dragend"
  ) {
    if (dragType === "dragging") {
      this.curveLines.forEach(({ active }) => active(cursorGap));
    } else if (dragType === "dragend") {
      return this.curveLines.map(({ active }) => active(cursorGap));
    }
  }

  // bezier handle 호출
  static notifyBezierHandles(
    cursorGap: Coordinates,
    handleType: "left" | "right"
  ) {
    this.bezierHandles.forEach((bezierHandle) => {
      switch (handleType) {
        case "left":
          bezierHandle.left(cursorGap);
          break;
        case "right":
          bezierHandle.right(cursorGap);
          break;
      }
    });
  }
}

export default Observer;
