import React from 'react';
import { Beat } from '../types';
import { useApp } from '../context/AppContext';
import { Play, Pause, Headphones, Calendar, Flame, ShoppingCart, Tag, Video } from 'lucide-react';
import { ResolvedImage } from './ResolvedImage';

interface BeatCardProps {
  beat: Beat;
  onOpenLicense: (beat: Beat) => void;
  onSelectBeatPage?: (beat: Beat) => void;
}

export const BeatCard: React.FC<BeatCardProps> = ({ beat, onOpenLicense, onSelectBeatPage }) => {
  const { currentBeat, isPlaying, selectBeat } = useApp();

  const isCurrent = currentBeat?.id === beat.id;
  const isPlayingThis = isCurrent && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBeat(beat);
  };

  const handleCardClick = () => {
    if (onSelectBeatPage) {
      onSelectBeatPage(beat);
    }
  };

  // Get starting price
  const startPrice = beat.prices.mp3;

  return (
    <div
      id={`beat-card-${beat.id}`}
      className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/30 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-square overflow-hidden bg-zinc-950 cursor-pointer"
      >
        <ResolvedImage
          src={beat.coverUrl}
          alt={beat.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Black Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Play Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="flex gap-3">
            <button
              onClick={handlePlayClick}
              className="p-4 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 transform scale-90 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg shadow-amber-500/40"
              title="Слушать демо"
            >
              {isPlayingThis ? <Pause size={20} fill="#09090b" /> : <Play size={20} fill="#09090b" className="ml-0.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="p-4 rounded-full bg-zinc-900 text-amber-500 hover:text-white border border-zinc-700 transform scale-90 hover:scale-105 transition-all duration-300 cursor-pointer"
              title="Смотреть видео и страницу"
            >
              <Video size={20} />
            </button>
          </div>
        </div>

        {/* Active Equalizer Overlay when Playing */}
        {isPlayingThis && (
          <div className="absolute bottom-3 left-3 flex gap-0.5 items-end h-4 w-6 z-10">
            <span className="w-1 bg-amber-500 animate-pulse rounded-full h-3" style={{ animationDelay: '0.1s' }} />
            <span className="w-1 bg-amber-500 animate-pulse rounded-full h-full" style={{ animationDelay: '0.3s' }} />
            <span className="w-1 bg-amber-500 animate-pulse rounded-full h-2" style={{ animationDelay: '0.5s' }} />
            <span className="w-1 bg-amber-500 animate-pulse rounded-full h-4" style={{ animationDelay: '0.2s' }} />
          </div>
        )}

        {/* Genre Sticker */}
        <div className="absolute top-3 left-3 z-10 flex gap-1 items-center">
          <span className="text-[10px] font-bold tracking-widest bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase">
            {beat.genre}
          </span>
          {beat.videoUrl && (
            <span className="text-[9px] font-bold tracking-widest bg-red-600/90 text-white px-2 py-1 rounded-full uppercase flex items-center gap-0.5 shadow-sm">
              <Video size={10} className="fill-white" /> ВИДЕО
            </span>
          )}
        </div>

        {/* BPM and Key Overlay Tags */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
          <span className="text-[10px] font-mono bg-black/60 backdrop-blur-md text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-800">
            {beat.bpm} BPM
          </span>
          <span className="text-[10px] font-mono bg-black/60 backdrop-blur-md text-amber-100 px-2.5 py-1 rounded-lg border border-zinc-500/20">
            {beat.key}
          </span>
        </div>

        {/* Static Play button for quick mobile trigger */}
        <button
          onClick={handlePlayClick}
          className="absolute bottom-3 left-3 p-2.5 rounded-full bg-zinc-950/80 backdrop-blur-md text-white border border-zinc-800 hover:bg-zinc-900 md:hidden flex z-10"
        >
          {isPlayingThis ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div onClick={handleCardClick} className="cursor-pointer">
          {/* Title & Plays count */}
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-display font-black text-lg text-white leading-tight uppercase group-hover:text-amber-400 transition-colors">
              {beat.title}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono mt-0.5 shrink-0">
              <Headphones size={11} />
              <span>{beat.plays}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {beat.tags && beat.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] text-zinc-400 bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <Tag size={8} className="text-zinc-500" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Sell / CTA Footer */}
        <div className="pt-4 border-t border-zinc-850/65 flex items-center justify-between">
          <div>
            <span className="block text-[9px] text-zinc-500 uppercase tracking-widest leading-none mb-1">
              Стоимость от
            </span>
            {beat.isSoldExclusive ? (
              <span className="text-xs font-mono font-bold text-red-500 tracking-wide uppercase">
                EXCLUSIVE SOLD
              </span>
            ) : (
              <span className="font-display font-black text-xl text-yellow-500">
                {startPrice} $
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenLicense(beat)}
            className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              beat.isSoldExclusive
                ? 'bg-zinc-950 text-zinc-500 border border-zinc-850 cursor-pointer hover:border-zinc-700 hover:text-zinc-300'
                : 'bg-zinc-800 text-zinc-200 border border-zinc-750 hover:bg-zinc-750 hover:text-white'
            }`}
          >
            <ShoppingCart size={13} />
            {beat.isSoldExclusive ? 'Договор / Купить' : 'КУПИТЬ'}
          </button>
        </div>
      </div>
    </div>
  );
};
