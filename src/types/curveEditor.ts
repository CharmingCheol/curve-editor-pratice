export type XYZ = "x" | "y" | "z";

export interface ClickedTarget {
  type: "curveLine" | "keyframe";
  trackName: string;
  xyz: XYZ;
  ctrl?: boolean;
  alt?: boolean;
  coordinates?: { x: number; y: number };
}
