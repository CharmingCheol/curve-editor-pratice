export interface Coordinates {
  x: number;
  y: number;
}

export interface KeyframeCoordinates extends Coordinates {
  keyframeIndex: number;
}

export type HandleType = "left" | "right";

export interface MarkerData extends Coordinates {
  handleType?: HandleType;
  keyframeIndex: number;
}

export interface KeyframeValue {
  handles: { left: Coordinates; right: Coordinates };
  keyframe: KeyframeCoordinates;
  breakHandle: boolean;
  lockHandle: boolean;
}

export interface CurveEditorData {
  interpolation: string;
  isIncluded: boolean;
  transformName: string;
  x: KeyframeValue[];
  y: KeyframeValue[];
  z: KeyframeValue[];
}

export interface ClassifiedMarker {
  axisIndex: number;
  markerData: MarkerData[];
  markerType: "handle" | "keyframe";
}

export interface ClickedTarget {
  alt?: boolean;
  axisType: "x" | "y" | "z";
  axisIndex: number;
  coordinates?: Coordinates;
  ctrl?: boolean;
  targetType: "curveLine" | "keyframe";
}
