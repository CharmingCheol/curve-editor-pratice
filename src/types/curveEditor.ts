export interface ClickedTarget {
  alt?: boolean;
  coordinates?: PointXY;
  ctrl?: boolean;
  targetType: "curveLine" | "keyframe";
  trackName: string;
  xyzType: "x" | "y" | "z";
}

export interface CurveEditorData {
  interpolation: string;
  isIncluded: boolean;
  trackName: string;
  x: GraphValues[];
  y: GraphValues[];
  z: GraphValues[];
}

export interface KeyframeData {
  keyframeIndex: number;
  timeIndex: number;
  trackName: string;
  value: number;
}

export interface ClasifiedKeyframes {
  lineIndex: number;
  keyframeData: KeyframeData[];
}

export interface PointXY {
  x: number;
  y: number;
}

export type GraphValues = [number, number]; // [timeIndex, value]
