import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { GestureType } from '../types';

export const detectGesture = (landmarks: NormalizedLandmark[]): GestureType => {
  if (!landmarks || landmarks.length === 0) return 'NONE';

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];

  // Helper to calculate distance
  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
  };

  // 1. PINCH (Thumb and Index very close)
  if (dist(thumbTip, indexTip) < 0.05) {
    return 'PINCH';
  }

  // 2. FIST (All fingers curled towards wrist/palm)
  // Check if tips are closer to wrist than their respective PIP joints (knuckles roughly)
  const isCurled = (tipIdx: number, pipIdx: number) => {
    return dist(landmarks[tipIdx], wrist) < dist(landmarks[pipIdx], wrist);
  };
  
  const indexCurled = isCurled(8, 6);
  const middleCurled = isCurled(12, 10);
  const ringCurled = isCurled(16, 14);
  const pinkyCurled = isCurled(20, 18);

  if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
    return 'FIST';
  }

  // 3. OPEN PALM (Fingers extended)
  // Check if tips are far from wrist
  if (!indexCurled && !middleCurled && !ringCurled && !pinkyCurled) {
    return 'OPEN_PALM';
  }

  return 'NONE';
};