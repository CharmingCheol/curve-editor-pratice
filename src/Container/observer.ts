import { fnGetBinarySearch } from "utils";
import { KeyframeDatum, ClasifiedKeyframes } from "types/curveEditor";

interface CursorGap {
  cursorGapX: number;
  cursorGapY: number;
}

interface ClickedKeyframes extends KeyframeDatum {
  lineIndex: number;
  trackName: string;
}

interface ObserverParams {
  keyframeNotify?: (content: CursorGap) => ClickedKeyframes;
  curveLineNotify?: (content: ClasifiedKeyframes[]) => void;
}

class Observer {
  private static keyframeList: any[] = [];
  private static curveLineList: any[] = [];

  // 옵저버 리스트 초기화
  static clearObservers() {
    Observer.keyframeList.length = 0;
    Observer.curveLineList.length = 0;
  }

  // 리스트에 클릭 된 키프레임 추가
  static addKeyframeObserver(target: ObserverParams) {
    Observer.keyframeList.push(target);
  }

  // 리스트에 클릭 된 커브 라인 추가
  static addCurveLineObserver(target: ObserverParams) {
    Observer.curveLineList.push(target);
  }

  // 옵저버 호출
  static notifyObservers(content: CursorGap, dragType: "dragging" | "dragend") {
    const clickedKeyframes = Observer.keyframeList.map<ClickedKeyframes>(
      (observer) => observer.keyframeNotify(content)
    );
    const clasifiedKeyframes: ClasifiedKeyframes[] = [];
    for (let index = 0; index < clickedKeyframes.length; index += 1) {
      const keyframeData = clickedKeyframes[index];
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
      Observer.curveLineList.forEach((observer) =>
        observer.curveLineNotify(clasifiedKeyframes)
      );
    } else if (dragType === "dragend") {
      return clasifiedKeyframes;
    }
  }
}

export default Observer;
