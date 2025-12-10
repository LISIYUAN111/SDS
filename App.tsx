import React from 'react';
import Experience from './components/Experience';
import HandController from './components/HandController';
import UI from './components/UI';

function App() {
  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans">
      <Experience />
      <HandController />
      <UI />
    </div>
  );
}

export default App;