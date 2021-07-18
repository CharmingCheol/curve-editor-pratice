import { fnGetBinarySearch } from "utils";
import { PointXY, KeyframeData, ClasifiedKeyframes } from "types/curveEditor";

interface SelectedKeyframes extends KeyframeData {
  lineIndex: number;
  trackName: string;
}

interface RegisterKeyframe {
  active: (cursorGap: PointXY) => SelectedKeyframes; // 키프레임 선택
  // passive: (cursorGap: PointXY) => void;
}

interface RegisterCurveLine {
  active: (cursorGap: PointXY) => number; // 커브라인 선택
  passive: (clasifiedKeyframes: ClasifiedKeyframes[]) => void; // 키프레임 선택에 의해 커브라인도 선택 됨
}

class Observer {
  private static keyframes: RegisterKeyframe[] = [];
  private static curveLines: RegisterCurveLine[] = [];

  // 옵저버 리스트 초기화
  static clearObservers() {
    this.keyframes.length = 0;
    this.curveLines.length = 0;
  }

  // 리스트에 클릭 된 키프레임 추가
  static registerKeyframe(target: RegisterKeyframe) {
    this.keyframes.push(target);
  }

  // 리스트에 클릭 된 커브 라인 추가
  static registerCurveLine(target: RegisterCurveLine) {
    this.curveLines.push(target);
  }

  // keyframe 호출 시, curve line도 같이 호출
  static notifyKeyframes(params: {
    cursorGap: PointXY;
    dragType: "dragging" | "dragend";
  }) {
    const { cursorGap, dragType } = params;
    const selectedKeyframes = this.keyframes.map(({ active }) =>
      active(cursorGap)
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
          keyframeData: [keyframeData],
        });
      } else {
        clasifiedKeyframes[binaryIndex].keyframeData.push(keyframeData);
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
    cursorGap: PointXY,
    dragType: "dragging" | "dragend"
  ) {
    if (dragType === "dragging") {
      this.curveLines.forEach(({ active }) => active(cursorGap));
    } else if (dragType === "dragend") {
      return this.curveLines.map(({ active }) => active(cursorGap));
    }
  }
}

export default Observer;
