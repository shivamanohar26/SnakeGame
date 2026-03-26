import React from 'react';
import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-8 scanlines relative">
      <div className="noise"></div>
      
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 z-10 tear">
        
        {/* Left Side: Game */}
        <div className="flex-1 w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-[500px]">
            <SnakeGame />
          </div>
        </div>

        {/* Right Side: Hardware HUD & Music */}
        <div className="w-full max-w-[380px] flex flex-col gap-8 flex-shrink-0">
          <div className="hidden lg:block border-l-4 border-[#0ff] pl-4">
            <h1 className="text-4xl font-mono text-white glitch mb-2" data-text="SYS.SNAKE">
              SYS.SNAKE
            </h1>
            <p className="text-[#f0f] font-sans text-2xl tracking-[0.2em]">
              ERR_CODE: 0x00FF
            </p>
            <p className="text-[#0ff] font-sans text-xl tracking-widest mt-2 animate-pulse">
              &gt; UPLINK_ESTABLISHED
            </p>
          </div>
          
          <MusicPlayer />

          {/* Decorative Hardware Elements */}
          <div className="border-4 border-[#f0f] p-4 bg-black font-sans text-2xl text-[#0ff] flex flex-col gap-2 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[#f0f] opacity-10 pointer-events-none animate-pulse"></div>
            <div className="flex justify-between border-b-2 border-[#0ff] pb-1">
              <span>MEM_ALLOC</span>
              <span className="text-[#f0f]">OVERFLOW</span>
            </div>
            <div className="flex justify-between border-b-2 border-[#0ff] pb-1">
              <span>RENDER_TRGT</span>
              <span>RAW_BUFFER</span>
            </div>
            <div className="flex justify-between">
              <span>CYCLES</span>
              <span className="animate-pulse">ERR_INF</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
