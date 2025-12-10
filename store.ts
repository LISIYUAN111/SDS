import { create } from 'zustand';
import { AppMode, GestureType, PhotoData } from './types';

interface AppState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  
  gesture: GestureType;
  setGesture: (gesture: GestureType) => void;

  handPosition: { x: number; y: number };
  setHandPosition: (pos: { x: number; y: number }) => void;

  photos: PhotoData[];
  addPhotos: (newPhotos: PhotoData[]) => void;
  
  focusedPhotoId: string | null;
  setFocusedPhotoId: (id: string | null) => void;

  isCameraReady: boolean;
  setCameraReady: (ready: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  mode: AppMode.TREE,
  setMode: (mode) => set({ mode }),

  gesture: 'NONE',
  setGesture: (gesture) => set({ gesture }),

  handPosition: { x: 0, y: 0 },
  setHandPosition: (handPosition) => set({ handPosition }),

  photos: [],
  addPhotos: (newPhotos) => set((state) => ({ photos: [...state.photos, ...newPhotos] })),

  focusedPhotoId: null,
  setFocusedPhotoId: (id) => set({ focusedPhotoId: id }),

  isCameraReady: false,
  setCameraReady: (ready) => set({ isCameraReady: ready }),
}));