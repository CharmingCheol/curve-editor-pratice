export type XYZ = "x" | "y" | "z";

export interface ClickedTarget {
  type: "curveLine" | "keyframe";
  trackName: string;
  xyz: XYZ;
  ctrl?: boolean;
  alt?: boolean;
  coordinates?: { x: number; y: number };
}

export interface CurveEditorData {
  interpolation: string;
  isIncluded: boolean;
  name: string;
  x: [number, number][];
  y: [number, number][];
  z: [number, number][];
}

export interface KeyframeDatum {
  keyframeIndex: number;
  timeIndex: number;
  y: number;
  trackName: string;
}

export interface ClasifiedKeyframes {
  lineIndex: number;
  keyframeDatum: KeyframeDatum[];
}
