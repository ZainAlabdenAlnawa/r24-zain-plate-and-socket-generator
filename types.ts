
export interface Plate {
  id: string;
  width: number; // in cm
  height: number; // in cm
}

export enum Direction {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

export interface SocketGroup {
  id: string;
  plateId: string;
  count: number; // 1-5
  direction: Direction;
  x: number; // distance from left edge of plate, in cm
  y: number; // distance from bottom edge of plate, in cm
}

export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
