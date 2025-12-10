export enum AppMode {
  TREE = 'TREE',
  SCATTER = 'SCATTER',
  FOCUS = 'FOCUS',
}

export type GestureType = 'NONE' | 'FIST' | 'OPEN_PALM' | 'PINCH' | 'POINT';

export interface ParticleData {
  id: number;
  treePos: [number, number, number];
  scatterPos: [number, number, number];
  type: 'sphere' | 'cube' | 'cane';
  color: string;
  scale: number;
}

export interface PhotoData {
  id: string;
  url: string;
  aspectRatio: number;
  treePos: [number, number, number];
  scatterPos: [number, number, number];
}

export interface HandPosition {
  x: number; // -1 to 1
  y: number; // -1 to 1
  rotation: number;
  isGrabbing: boolean;
}