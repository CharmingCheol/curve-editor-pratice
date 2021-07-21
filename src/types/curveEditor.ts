export interface Coordinates {
  x: number;
  y: number;
}

export interface KeyframeCoordinates extends Coordinates {
  keyframeIndex: number;
}

export interface KeyframeValues {
  handles: { left: Coordinates; right: Coordinates };
  keyframe: KeyframeCoordinates;
}
export interface ClickedTarget {
  alt?: boolean;
  coordinates?: Coordinates;
  ctrl?: boolean;
  targetType: "curveLine" | "keyframe";
  trackName: string;
  xyzType: "x" | "y" | "z";
}

export interface CurveEditorData {
  interpolation: string;
  isIncluded: boolean;
  trackName: string;
  x: KeyframeValues[];
  y: KeyframeValues[];
  z: KeyframeValues[];
}

export interface ClasifiedKeyframes {
  keyframeData: KeyframeCoordinates[];
  lineIndex: number;
}
