export interface Coordinates {
  x: number;
  y: number;
}

export interface KeyframeCoordinates extends Coordinates {
  keyframeIndex: number;
}

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
  boneName: string;
  interpolation: string;
  isIncluded: boolean;
  x: KeyframeValue[];
  y: KeyframeValue[];
  z: KeyframeValue[];
}

export interface ClassifiedMarker {
  boneIndex: number;
  markerData: MarkerData[];
  markerType: "handle" | "keyframe";
}

export interface ClickedTarget {
  alt?: boolean;
  boneName: string;
  coordinates?: Coordinates;
  ctrl?: boolean;
  targetType: "curveLine" | "keyframe";
  xyzType: "x" | "y" | "z";
}

export type HandleType = "left" | "right";
