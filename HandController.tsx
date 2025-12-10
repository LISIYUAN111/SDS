import React, { useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';
import { detectGesture } from '../utils/gestureRecognition';
import { AppMode } from '../types';

const HandController: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setGesture, setHandPosition, setCameraReady, setMode, mode, setFocusedPhotoId, photos } = useStore();
  const lastGestureRef = useRef<string>('NONE');
  const gestureDebounceRef = useRef<number>(0);

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current!.play();
              setCameraReady(true);
              predictWebcam();
            };
          }
        }
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
      }
    };

    const predictWebcam = () => {
      if (videoRef.current && handLandmarker) {
        let startTimeMs = performance.now();
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          
          // Detect Gesture
          const gesture = detectGesture(landmarks);
          
          // Debounce gesture changes to avoid flickering
          if (gesture !== lastGestureRef.current) {
            gestureDebounceRef.current++;
            if (gestureDebounceRef.current > 5) { // Confirmation frames
               lastGestureRef.current = gesture;
               setGesture(gesture);
               
               // State Machine Logic
               if (gesture === 'FIST' && mode !== AppMode.TREE) {
                 setMode(AppMode.TREE);
                 setFocusedPhotoId(null);
               } else if (gesture === 'OPEN_PALM' && mode === AppMode.TREE) {
                 setMode(AppMode.SCATTER);
               } else if (gesture === 'PINCH' && mode === AppMode.SCATTER && photos.length > 0) {
                 // Simple logic: Pinch selects the first photo if none focused, or cycle
                 // In a real app we'd raycast. Here we just trigger focus.
                 setMode(AppMode.FOCUS);
                 // Randomly select one for demo if null
                 setFocusedPhotoId(photos[Math.floor(Math.random() * photos.length)].id);
               }
               gestureDebounceRef.current = 0;
            }
          } else {
            gestureDebounceRef.current = 0;
          }

          // Track Hand Center (0-1 normalized)
          // 9 is the middle finger knuckle (MCP) - stable point
          const x = (landmarks[9].x - 0.5) * 2; // -1 to 1 (Note: Camera is mirrored typically)
          const y = -(landmarks[9].y - 0.5) * 2; // -1 to 1, inverted Y
          
          // Smoothing could be added here
          setHandPosition({ x: -x, y }); // Flip X for mirror effect
        } else {
            setGesture('NONE');
        }

        animationFrameId = requestAnimationFrame(predictWebcam);
      }
    };

    setupMediaPipe();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (handLandmarker) handLandmarker.close();
      cancelAnimationFrame(animationFrameId);
    };
  }, [setGesture, setHandPosition, setCameraReady, setMode, mode, photos, setFocusedPhotoId]);

  return (
    <video
      ref={videoRef}
      className="fixed bottom-4 right-4 w-48 h-36 object-cover rounded-xl border-2 border-gold/30 opacity-80 z-50 transform scale-x-[-1]"
      playsInline
      muted
    />
  );
};

export default HandController;