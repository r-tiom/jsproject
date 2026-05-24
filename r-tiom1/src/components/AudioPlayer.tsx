import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Headphones, Disc, Flame, ShoppingCart } from 'lucide-react';
import { ResolvedImage } from './ResolvedImage';

export const AudioPlayer: React.FC<{ onOpenLicense: (beat: any) => void }> = ({ onOpenLicense }) => {
  const {
    currentBeat,
    isPlaying,
    volume,
    duration,
    currentTime,
    beats,
    selectBeat,
    togglePlay,
    setVolumeState,
    setAudioCurrentTime,
    audioRef
  } = useApp();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  // Format time (seconds -> MM:SS)
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `0${minutes}:${returnedSeconds}`;
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setAudioCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolumeState(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolumeState(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolumeState(0);
      setIsMuted(true);
    }
  };

  const handleNext = () => {
    if (!currentBeat || beats.length === 0) return;
    const currentIndex = beats.findIndex(b => b.id === currentBeat.id);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= beats.length) {
      nextIndex = 0; // wrap around
    }
    selectBeat(beats[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentBeat || beats.length === 0) return;
    const currentIndex = beats.findIndex(b => b.id === currentBeat.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = beats.length - 1; // wrap to end
    }
    selectBeat(beats[prevIndex]);
  };

  if (!currentBeat) return null;

  return (
    <div
      id="persistent-audio-player"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none shadow-2xl"
    >
      {/* LEFT SIDE: Beat Thumbnail & Info */}
      <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
        <div className="relative shrink-0 group">
          <ResolvedImage
            src={currentBeat.coverUrl}
            alt={currentBeat.title}
            className={`w-12 h-12 rounded-lg object-cover border border-zinc-800 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}
          />
          <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Disc size={16} className={`${isPlaying ? 'animate-spin' : ''} text-amber-500`} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 block leading-none">
            {currentBeat.genre}
          </span>
          <h4 className="font-display font-black text-sm text-white truncate uppercase tracking-wide mt-0.5">
            {currentBeat.title}
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1 font-mono">
            <span>{currentBeat.bpm} BPM</span>
            <span>•</span>
            <span>{currentBeat.key}</span>
          </div>
        </div>
      </div>

      {/* CENTER: Audio controls & progress bar */}
      <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={handlePrevious}
            className="text-zinc-500 hover:text-white transition cursor-pointer"
            title="Предыдущий бит"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3.5 rounded-full bg-white hover:bg-amber-400 text-zinc-950 hover:shadow-lg hover:shadow-amber-500/15 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Пауза' : 'Слушать'}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="text-zinc-500 hover:text-white transition cursor-pointer"
            title="Следующий бит"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3 w-full text-xs text-zinc-500 font-mono">
          <span className="w-10 text-right shrink-0">{formatTime(currentTime)}</span>
          
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleScrubChange}
            className="flex-1 accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:bg-zinc-700 transition"
          />

          <span className="w-10 text-left shrink-0">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT SIDE: Sound volume & CTA buy */}
      <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-1/4">
        {/* Equalizer Visual Animation */}
        {isPlaying && (
          <div className="hidden lg:flex items-end gap-0.5 h-6 w-12 pt-1 mr-4">
            <span className="w-[3px] bg-amber-500/80 rounded-full animate-pulse h-1/2" style={{ animationDelay: '0.1s' }} />
            <span className="w-[3px] bg-amber-505 rounded-full animate-pulse h-4/5" style={{ animationDelay: '0.3s' }} />
            <span className="w-[3px] bg-amber-500/80 rounded-full animate-pulse h-1/3" style={{ animationDelay: '0.5s' }} />
            <span className="w-[3px] bg-yellow-400 rounded-full animate-pulse h-full" style={{ animationDelay: '0.2s' }} />
            <span className="w-[3px] bg-amber-500/80 rounded-full animate-pulse h-2/3" style={{ animationDelay: '0.4s' }} />
            <span className="w-[3px] bg-amber-505 rounded-full animate-pulse h-2/5" style={{ animationDelay: '0.6s' }} />
          </div>
        )}

        {/* Volume controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleMute}
            className="text-zinc-500 hover:text-white transition cursor-pointer"
            title={isMuted ? "Включить звук" : "Выключить звук"}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 md:w-20 accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer transition"
          />
        </div>

        {/* Buy directly from player button */}
        {!currentBeat.isSoldExclusive && (
          <button
            onClick={() => onOpenLicense(currentBeat)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
          >
            <ShoppingCart size={12} />
            <span>${currentBeat.prices.mp3} +</span>
          </button>
        )}
      </div>
    </div>
  );
};
