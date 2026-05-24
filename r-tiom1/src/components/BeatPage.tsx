import React, { useState, useEffect } from 'react';
import { Beat, LicenseType } from '../types';
import { useApp } from '../context/AppContext';
import { LICENSE_INFO } from '../data';
import {
  ArrowLeft,
  Play,
  Pause,
  ShoppingCart,
  Check,
  Disc,
  Headphones,
  Calendar,
  Volume2,
  CalendarDays,
  Tag,
  MessageSquare,
  Send,
  User as UserIcon,
  Flame,
  Info,
  Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeatPageProps {
  beat: Beat;
  onBack: () => void;
  onOpenLicense: (beat: Beat) => void;
}

interface BeatComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export const BeatPage: React.FC<BeatPageProps> = ({ beat, onBack, onOpenLicense }) => {
  const {
    currentBeat,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolumeState,
    setAudioCurrentTime,
    selectBeat,
    addToCart,
    cart,
    user
  } = useApp();

  const [comments, setComments] = useState<BeatComment[]>([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('mp3');
  const [notification, setNotification] = useState<string | null>(null);

  // Sync state with global audio
  const isActiveTrack = currentBeat?.id === beat.id;
  const isPlayingActive = isActiveTrack && isPlaying;

  // Load comments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`r_tiom_comments_${beat.id}`);
    if (saved) {
      setComments(JSON.parse(saved));
    } else {
      // Default initial mock comments for social vibe
      const defaults: BeatComment[] = [
        {
          id: '1',
          author: 'Рэпер Малой',
          content: 'Этот басс просто разрывает тачку! Беру вавку прямо сейчас 🔥',
          timestamp: new Date(Date.now() - 36 * 3600000).toLocaleString('ru-RU')
        },
        {
          id: '2',
          author: 'Artem R-Tiom',
          content: 'Спасибо! Мультитрек (Stems) полностью сведен и готов к вашему тексту. По любым вопросам пишите на почту.',
          timestamp: new Date(Date.now() - 24 * 3600000).toLocaleString('ru-RU')
        },
        {
          id: '3',
          author: 'Lil Sound',
          content: 'Коллаген на вокале ляжет идеально на этот дрилл вайб. Отличная работа!',
          timestamp: new Date(Date.now() - 4 * 3600000).toLocaleString('ru-RU')
        }
      ];
      setComments(defaults);
      localStorage.setItem(`r_tiom_comments_${beat.id}`, JSON.stringify(defaults));
    }
  }, [beat.id]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const authorName = user?.name || newCommentAuthor.trim() || 'Гость-артист';
    const newComment: BeatComment = {
      id: 'comment_' + Date.now().toString(),
      author: authorName,
      content: newCommentText.trim(),
      timestamp: new Date().toLocaleString('ru-RU')
    };

    const updated = [...comments, newComment];
    setComments(updated);
    localStorage.setItem(`r_tiom_comments_${beat.id}`, JSON.stringify(updated));
    setNewCommentText('');
    if (!user) {
      setNewCommentAuthor('');
    }
  };

  const handlePlayToggle = () => {
    selectBeat(beat);
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isActiveTrack) {
      setAudioCurrentTime(Number(e.target.value));
    } else {
      // selecting first
      selectBeat(beat);
    }
  };

  const handleAddToCartClick = () => {
    addToCart(beat, selectedLicense);
    showNotice(`Добавлено в корзину: ${beat.title} (${selectedLicense.toUpperCase()})`);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Convert typical youtube links to embeddable if standard link was pasted
  const getEmbedUrl = (url?: string) => {
    if (!url) return 'https://www.youtube.com/embed/S_7iX6O_69o';
    if (url.includes('embed/')) return url;
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed${parsed.pathname}`;
      }
      const searchParams = new URLSearchParams(parsed.search);
      const v = searchParams.get('v');
      if (v) {
        return `https://www.youtube.com/embed/${v}`;
      }
    } catch (e) {
      // fallback
    }
    return url;
  };

  const selectedLicenseDetails = LICENSE_INFO.find(l => l.type === selectedLicense);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 animate-fade-in relative">
      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 bg-zinc-900 border border-amber-500/30 text-white rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-zinc-950">
              <Check size={11} className="stroke-[3]" />
            </div>
            <span className="text-xs font-bold font-sans uppercase tracking-wide">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACK NAVIGATION */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900/40 hover:bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold tracking-wide uppercase flex items-center gap-2 transition cursor-pointer select-none"
        >
          <ArrowLeft size={14} /> Назад в каталог
        </button>

        <span className="text-xs font-mono text-zinc-500">
          ID: {beat.id.toUpperCase()}
        </span>
      </div>

      {/* TOP TITLE HEADER BANNER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className="text-[10px] font-sans font-black tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full uppercase">
              {beat.genre}
            </span>
            <span className="text-[10px] font-sans font-black tracking-widest bg-zinc-900 text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full uppercase flex items-center gap-1">
              <Disc size={11} className="animate-spin-slow" /> {beat.key}
            </span>
            <span className="text-[10px] font-sans font-black tracking-widest bg-zinc-900 text-yellow-500 border border-zinc-800 px-3 py-1 rounded-full uppercase">
              {beat.bpm} BPM
            </span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
            {beat.title}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Спродюсировано <strong className="text-amber-500">Artem R-Tiom Production</strong> • Авторские права защищены
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-zinc-500 select-none text-xs font-mono">
          <div className="flex items-center gap-1 bg-zinc-900/30 border border-zinc-900 px-3 py-1.5 rounded-lg">
            <Headphones size={13} className="text-zinc-600" />
            <span>Прослушиваний: <strong className="text-zinc-300">{beat.plays}</strong></span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-900/30 border border-zinc-900 px-3 py-1.5 rounded-lg">
            <CalendarDays size={13} className="text-zinc-600" />
            <span>Создан: <strong className="text-zinc-300">{new Date(beat.createdAt).toLocaleDateString('ru-RU')}</strong></span>
          </div>
        </div>
      </div>

      {/* PRIMARY MEDIA BLOCK GRID: VIDEO + CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* LEFT COLUMN: CINEMATIC VIDEO & INTEGRATED SCROLLER (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CINEMA STYLED VIDEO IFRAME */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950 shadow-2xl group">
            {/* Top red header badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-red-600/15 border border-red-500/20 rounded-full text-red-500 text-[10px] font-bold uppercase tracking-widest">
              <Youtube size={12} className="fill-red-500" /> Видео презентация
            </div>

            <iframe
              src={getEmbedUrl(beat.videoUrl)}
              title={`${beat.title} Video Player`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* DEDICATED SYNCED WAVE PLAYER CONTROL BAR ("добавь плеер") */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-850/60 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              
              {/* Play Pause Trigger with Mini Cover */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <button
                  onClick={handlePlayToggle}
                  className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 transform active:scale-95 transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  {isPlayingActive ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
                </button>

                <div className="overflow-hidden">
                  <span className="block text-xs text-zinc-500 uppercase tracking-widest font-bold">Текущий демо-плеер</span>
                  <span className="block text-sm font-bold text-white truncate uppercase mt-0.5">{beat.title}</span>
                </div>
              </div>

              {/* Time Scrubber Slider Bar */}
              <div className="flex-1 w-full space-y-1">
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span>{isActiveTrack ? formatTime(currentTime) : "0:00"}</span>
                  
                  {/* Slider Progress styling */}
                  <input
                    type="range"
                    min={0}
                    max={isActiveTrack ? duration || 100 : 100}
                    value={isActiveTrack ? currentTime : 0}
                    onChange={handleProgressChange}
                    className="w-full accent-amber-500 bg-zinc-950 rounded-lg cursor-pointer h-1.5 appearance-none"
                  />
                  <span>{isActiveTrack ? formatTime(duration) : "0:00"}</span>
                </div>
                <div className="hidden sm:block text-[9px] text-zinc-500 font-mono text-center">
                  * Плеер синхронизирован с глобальным медиа-процессором R-TIOM
                </div>
              </div>

              {/* Volume Slider overlay */}
              <div className="hidden sm:flex items-center gap-2 w-28 text-zinc-400">
                <Volume2 size={15} className="shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolumeState(parseFloat(e.target.value))}
                  className="w-full accent-zinc-300 bg-zinc-950 rounded-lg h-1"
                />
              </div>

            </div>
          </div>

          {/* SOCIAL COMMENTS COMPONENT */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <MessageSquare className="text-amber-500" size={18} />
              ОБСУЖДЕНИЕ И ОТЗЫВЫ АРТИСТОВ ({comments.length})
            </h3>

            {/* Comment adding form */}
            <form onSubmit={handlePostComment} className="mb-6 space-y-3">
              {!user && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                    Ваш творческий псевдоним
                  </label>
                  <input
                    type="text"
                    required
                    value={newCommentAuthor}
                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                    placeholder="e.g. Mc Artem, Lil Track"
                    className="w-full sm:w-1/2 px-3 py-2 bg-zinc-900 border border-zinc-805 text-xs text-zinc-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={user ? `${user.name}, напишите ваш отзыв о бите...` : 'Текст вашего сообщения...'}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  <Send size={12} /> <span className="hidden sm:inline">Отправить</span>
                </button>
              </div>
            </form>

            {/* Interactive list of comments */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-500 shrink-0 font-bold text-xs">
                    {comment.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xs text-white uppercase tracking-wide">
                        {comment.author}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-xs mt-1.5 leading-relaxed font-sans">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: PRICING ACTIONS & SPECS (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PURCHASE CARD */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full pointer-events-none" />
            
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold block mb-1">
              ЛИЦЕНЗИРОВАНИЕ
            </span>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-wider mb-5">
              ВЫБОР КУПЮРЫ ЛИЦЕНЗИИ
            </h2>

            {/* License options menu selector */}
            <div className="space-y-3 mb-6">
              {(['mp3', 'wav', 'trackout', 'exclusive'] as LicenseType[]).map((type) => {
                const optCost = beat.prices[type];
                const optMeta = LICENSE_INFO.find(info => info.type === type);
                const isSel = selectedLicense === type;

                // Sold exclusive shield
                const isSoldType = type === 'exclusive' && beat.isSoldExclusive;

                return (
                  <button
                    key={type}
                    onClick={() => !isSoldType && setSelectedLicense(type)}
                    disabled={isSoldType}
                    className={`w-full text-left p-3 rounded-xl border transition flex justify-between items-center ${
                      isSoldType
                        ? 'border-zinc-850 opacity-40 cursor-not-allowed bg-zinc-950/20'
                        : isSel
                        ? 'border-amber-500 bg-amber-500/5 font-bold text-white'
                        : 'border-zinc-800/70 hover:border-zinc-700 bg-zinc-950/30 text-zinc-300'
                    }`}
                  >
                    <div>
                      <span className="block text-xs uppercase font-black tracking-wide">
                        {type.toUpperCase()} Лицензия
                      </span>
                      <span className="block text-[9px] text-zinc-500 font-mono mt-0.5">
                        {optMeta?.fileFormat || 'Отдельные дорожки'}
                      </span>
                    </div>

                    <div className="text-right">
                      {isSoldType ? (
                        <span className="text-[9px] font-bold text-red-500 uppercase font-mono">
                          SOLD OUT
                        </span>
                      ) : (
                        <span className="font-display text-base font-black text-amber-500">
                          {optCost} $
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Price Description Details block */}
            {selectedLicenseDetails && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 mb-6">
                <span className="text-xs font-bold text-zinc-300 block mb-1 flex items-center gap-1 uppercase">
                  <Info size={12} className="text-amber-500" />
                  Условия {selectedLicense.toUpperCase()}:
                </span>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  {selectedLicenseDetails.description}
                </p>
                <div className="mt-2 text-[10px] text-zinc-500 font-mono pt-1.5 border-t border-zinc-900">
                  Формат доставки: <strong>{selectedLicenseDetails.fileFormat}</strong>
                </div>
              </div>
            )}

            {/* Checkout / Cart Trigger Button */}
            {beat.isSoldExclusive ? (
              <div className="w-full text-center py-4 bg-zinc-950 text-red-500 border border-zinc-850 rounded-xl text-xs font-bold font-mono tracking-widest uppercase uppercase">
                🔴 БИТ ПОЛНОСТЬЮ ПРОДАН
              </div>
            ) : (
              <button
                onClick={handleAddToCartClick}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-display font-black tracking-widest uppercase flex items-center justify-center gap-2 transform active:scale-95 transition cursor-pointer shadow-xl shadow-amber-500/10"
              >
                <ShoppingCart size={15} /> Добавить в корзину
              </button>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => onOpenLicense(beat)}
                className="text-[10px] text-zinc-500 hover:text-white hover:underline uppercase font-mono tracking-wider cursor-pointer"
              >
                Посмотреть подробный текст договора →
              </button>
            </div>

          </div>

          {/* ARTEM SPECS & BIO */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
            <h3 className="font-display font-black text-xs text-zinc-300 uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center gap-1.5">
              <Flame size={12} className="text-amber-500" />
              СПЕЦИФИКА КАТАЛОГА R-TIOM
            </h3>

            <ul className="space-y-2.5 text-[11px] text-zinc-400 leading-relaxed font-sans">
              <li className="flex gap-2 items-start text-zinc-300">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Все биты экспортируются в <strong className="text-white">Professional WAV 24-Bit / 44.1 kHz</strong></span>
              </li>
              <li className="flex gap-2 items-start">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Демо-версии содержат аудиоводный знак. При покупке вы моментально получаете оригинальный чистый файл без тегов.</span>
              </li>
              <li className="flex gap-2 items-start text-zinc-300">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Мультитреки содержат отдельные дорожки с басом, ударными и инструментами для удобного сведения.</span>
              </li>
              <li className="flex gap-2 items-start">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>При перепродаже эксклюзивных прав бит мгновенно скрывается с витрины.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
