import React from 'react';
import { useStore } from '../store';
import { AppMode } from '../types';
import { Upload, Hand, Box, Expand, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { COLORS, CONSTANTS } from '../constants';

const UI: React.FC = () => {
  const { mode, gesture, addPhotos, isCameraReady } = useStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      const newPhotos = files.map(file => {
        const url = URL.createObjectURL(file);
        
        // Random positions
        const h = Math.random() * CONSTANTS.TREE_HEIGHT;
        const y = h - CONSTANTS.TREE_HEIGHT / 2;
        const r = (1 - h / CONSTANTS.TREE_HEIGHT) * CONSTANTS.TREE_RADIUS + 0.5; 
        const theta = Math.random() * Math.PI * 2;
        
        const sr = CONSTANTS.SCATTER_RADIUS * Math.cbrt(Math.random());
        const sTheta = Math.random() * Math.PI * 2;
        const sPhi = Math.acos(2 * Math.random() - 1);

        return {
          id: uuidv4(),
          url,
          aspectRatio: 1, // Simplified, ideal would be to load image to get aspect
          treePos: [r * Math.cos(theta), y, r * Math.sin(theta)] as [number, number, number],
          scatterPos: [sr * Math.sin(sPhi) * Math.cos(sTheta), sr * Math.sin(sPhi) * Math.sin(sTheta), sr * Math.cos(sPhi)] as [number, number, number],
        };
      });
      addPhotos(newPhotos);
    }
  };

  const getGestureIcon = () => {
    switch (gesture) {
      case 'FIST': return <Box className="w-8 h-8 text-gold" />;
      case 'OPEN_PALM': return <Expand className="w-8 h-8 text-gold" />;
      case 'PINCH': return <Search className="w-8 h-8 text-gold" />;
      default: return <Hand className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 drop-shadow-lg tracking-wider">
            NOEL MEMORIES
          </h1>
          <p className="text-yellow-100/60 font-light text-sm mt-1">
            Gesture Controlled Experience
          </p>
        </div>
        
        <label className="cursor-pointer group">
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-500/30 hover:bg-yellow-900/40 transition-all">
            <Upload className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="text-yellow-100 text-sm">Add Memories</span>
          </div>
        </label>
      </div>

      {/* Instructions / Status */}
      <div className="flex flex-col gap-4 items-center justify-center">
        {!isCameraReady && (
           <div className="bg-red-900/80 text-white px-6 py-3 rounded-lg backdrop-blur animate-pulse">
             Please allow camera access for gesture control
           </div>
        )}
        
        <div className="flex gap-8 items-center bg-black/30 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
           <div className={`flex flex-col items-center gap-2 transition-opacity ${mode === AppMode.TREE ? 'opacity-100' : 'opacity-40'}`}>
              <Box className="w-6 h-6 text-yellow-400" />
              <span className="text-xs uppercase tracking-widest">Fist: Tree</span>
           </div>
           <div className="w-px h-8 bg-white/20"></div>
           <div className={`flex flex-col items-center gap-2 transition-opacity ${mode === AppMode.SCATTER ? 'opacity-100' : 'opacity-40'}`}>
              <Expand className="w-6 h-6 text-yellow-400" />
              <span className="text-xs uppercase tracking-widest">Palm: Scatter</span>
           </div>
           <div className="w-px h-8 bg-white/20"></div>
           <div className={`flex flex-col items-center gap-2 transition-opacity ${mode === AppMode.FOCUS ? 'opacity-100' : 'opacity-40'}`}>
              <Search className="w-6 h-6 text-yellow-400" />
              <span className="text-xs uppercase tracking-widest">Pinch: Focus</span>
           </div>
        </div>
      </div>

      {/* Gesture Indicator */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/50 p-3 rounded-full backdrop-blur border border-yellow-500/20">
        <div className="p-2 bg-white/10 rounded-full">
           {getGestureIcon()}
        </div>
        <div>
           <p className="text-xs text-gray-400 uppercase">Detected Gesture</p>
           <p className="text-sm font-bold text-yellow-400">{gesture}</p>
        </div>
      </div>
    </div>
  );
};

export default UI;