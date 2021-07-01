import { fnGetBinarySearch } from "utils";

interface CursorGap {
  cursorGapX: number;
  cursorGapY: number;
}

interface KeyframeDatum {
  keyframeIndex: number;
  timeIndex: number;
  y: number;
}

interface ClickedKeyframes extends KeyframeDatum {
  lineIndex: number;
}

interface ClasifiedKeyframes {
  lineIndex: number;
  datum: KeyframeDatum[];
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
  static notifyObservers(content: CursorGap) {
    const clickedKeyframes = Observer.keyframeList.map<ClickedKeyframes>(
      (observer) => observer.keyframeNotify(content)
    );
    const clasifiedKeyframes: ClasifiedKeyframes[] = [];
    for (let index = 0; index < clickedKeyframes.length; index += 1) {
      const keyframeData = clickedKeyframes[index];
      const { timeIndex, lineIndex, keyframeIndex, y } = keyframeData;
      const datum: KeyframeDatum = {
        keyframeIndex,
        timeIndex,
        y,
      };
      const binaryIndex = fnGetBinarySearch({
        collection: clasifiedKeyframes,
        index: lineIndex,
        key: "lineIndex",
      });
      if (binaryIndex === -1) {
        clasifiedKeyframes.push({
          lineIndex: lineIndex,
          datum: [datum],
        });
      } else {
        clasifiedKeyframes[binaryIndex].datum.push(datum);
      }
    }
    if (clasifiedKeyframes.length) {
      Observer.curveLineList.forEach((observer) =>
        observer.curveLineNotify(clasifiedKeyframes)
      );
    }
  }
}

export default Observer;
