import { fnGetBinarySearch } from "utils";
import { KeyframeDatum, ClasifiedKeyframes } from "types/curveEditor";

interface CursorGap {
  cursorGapX: number;
  cursorGapY: number;
}

interface SelectedKeyframes extends KeyframeDatum {
  lineIndex: number;
  trackName: string;
}

interface KeyframeRegistration {
  registerKeyframe: (cursorGap: CursorGap) => SelectedKeyframes; // 키프레임 선택
  isRegisterKeyframe: (cursorGap: CursorGap) => void;
}

interface CurveLineRegistration {
  isRegisteredCurveLine: (clasifiedKeyframes: ClasifiedKeyframes[]) => void; // 키프레임 선택에 의해 커브라인도 선택 됨
  registerCurveLine: (cursorGap: CursorGap) => void; // 커브라인 선택
}

class Observer {
  private static keyframeList: KeyframeRegistration[] = [];
  private static curveLineList: CurveLineRegistration[] = [];

  // 옵저버 리스트 초기화
  static clearObservers() {
    this.keyframeList.length = 0;
    this.curveLineList.length = 0;
  }

  // 리스트에 클릭 된 키프레임 추가
  static addKeyframeObserver(target: KeyframeRegistration) {
    this.keyframeList.push(target);
  }

  // 리스트에 클릭 된 커브 라인 추가
  static addCurveLineObserver(target: CurveLineRegistration) {
    this.curveLineList.push(target);
  }

  // keyframe 호출 시, curve line도 같이 호출
  static notifyToKeyframeFromCurveLine(
    cursorGap: CursorGap,
    dragType: "dragging" | "dragend"
  ) {
    const selectedKeyframes = this.keyframeList.map(({ registerKeyframe }) =>
      registerKeyframe(cursorGap)
    );
    const clasifiedKeyframes: ClasifiedKeyframes[] = [];
    for (let index = 0; index < selectedKeyframes.length; index += 1) {
      const keyframeData = selectedKeyframes[index];
      const { lineIndex } = keyframeData;
      const binaryIndex = fnGetBinarySearch({
        collection: clasifiedKeyframes,
        index: lineIndex,
        key: "lineIndex",
      });
      if (binaryIndex === -1) {
        clasifiedKeyframes.push({
          lineIndex: lineIndex,
          keyframeDatum: [keyframeData],
        });
      } else {
        clasifiedKeyframes[binaryIndex].keyframeDatum.push(keyframeData);
      }
    }
    if (!clasifiedKeyframes.length) return;
    if (dragType === "dragging") {
      this.curveLineList.forEach((observer) =>
        observer.isRegisteredCurveLine(clasifiedKeyframes)
      );
    } else if (dragType === "dragend") {
      return clasifiedKeyframes;
    }
  }

  // curve line 호출 시, keyframe도 같이 호출
  static notifySelectedCurveLines(
    cursorGap: CursorGap,
    dragType: "dragging" | "dragend"
  ) {
    this.curveLineList.forEach(({ registerCurveLine }) =>
      registerCurveLine(cursorGap)
    );
    this.keyframeList.forEach(({ isRegisterKeyframe }) =>
      isRegisterKeyframe(cursorGap)
    );
  }
}

export default Observer;
