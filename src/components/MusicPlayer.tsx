import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Terminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'DATA_CORRUPTION.WAV', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: '06:12' },
  { id: 2, title: 'MEMORY_LEAK.WAV', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: '07:05' },
  { id: 3, title: 'KERNEL_PANIC.WAV', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: '05:44' },
];

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  return (
    <div className="w-full max-w-[380px] bg-black border-4 border-[#0ff] p-6 font-sans relative">
      {/* Glitch artifacts */}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#f0f] z-[-1]"></div>
      <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#0ff] z-[-1]"></div>
      
      <div className="flex justify-between items-center mb-6 border-b-2 border-[#f0f] pb-2">
        <div className="flex items-center gap-2">
          <Terminal className={`w-6 h-6 ${isPlaying ? 'text-[#f0f] animate-pulse' : 'text-[#0ff]'}`} />
          <span className="text-xl tracking-[0.2em] text-[#0ff]">AUDIO_SYS</span>
        </div>
        <div className={`text-lg tracking-widest px-2 py-1 ${isPlaying ? 'bg-[#f0f] text-black' : 'border border-[#0ff] text-[#0ff]'}`}>
          {isPlaying ? 'ACTIVE' : 'STDBY'}
        </div>
      </div>

      <div className="bg-black border-2 border-[#0ff] p-4 mb-6 relative group tear">
        <h3 className="text-[#fff] text-2xl mb-2 truncate glitch" data-text={TRACKS[currentTrack].title}>{TRACKS[currentTrack].title}</h3>
        <div className="flex justify-between items-end">
          <p className="text-[#f0f] text-lg tracking-widest">AI_SEQ_ERR</p>
          <p className="text-[#0ff] text-xl">{TRACKS[currentTrack].duration}</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-4 bg-black border border-[#f0f] mt-4 overflow-hidden relative">
          <div 
            className="h-full bg-[#0ff] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
          {/* Static overlay on progress */}
          <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2r9//38bIxsDA5wAEGAAOcgDAZ1P5fIAAAAASUVORK5CYII=')] opacity-50 mix-blend-overlay"></div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={TRACKS[currentTrack].url}
        onEnded={nextTrack}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="flex items-center justify-between px-2">
        <button onClick={prevTrack} className="text-[#0ff] hover:bg-[#0ff] hover:text-black p-2 border-2 border-transparent hover:border-[#0ff] transition-none cursor-pointer">
          <SkipBack className="w-8 h-8" />
        </button>
        
        <button
          onClick={togglePlay}
          className={`w-16 h-16 flex items-center justify-center border-4 transition-none cursor-pointer ${
            isPlaying 
              ? 'bg-[#f0f] border-[#f0f] text-black' 
              : 'bg-black border-[#0ff] text-[#0ff] hover:bg-[#0ff] hover:text-black'
          }`}
        >
          {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>

        <button onClick={nextTrack} className="text-[#0ff] hover:bg-[#0ff] hover:text-black p-2 border-2 border-transparent hover:border-[#0ff] transition-none cursor-pointer">
          <SkipForward className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
