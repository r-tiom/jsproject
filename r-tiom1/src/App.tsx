import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BeatCard } from './components/BeatCard';
import { AudioPlayer } from './components/AudioPlayer';
import { AuthModal } from './components/AuthModal';
import { CartModal } from './components/CartModal';
import { LicenseModal } from './components/LicenseModal';
import { AdminPanel } from './components/AdminPanel';
import { BeatPage } from './components/BeatPage';
import { ResolvedImage } from './components/ResolvedImage';
import { Beat } from './types';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Globe,
  Disc,
  FolderDown,
  Unlock,
  Headphones,
  Music,
  CheckCircle,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function RealStoreApp() {
  const {
    beats,
    user,
    cart,
    logout,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    minBpm,
    maxBpm,
    setBpmFilter,
    purchasedTrackUrls,
    selectBeat,
    currentBeat,
    isPlaying
  } = useApp();

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedLicenseBeat, setSelectedLicenseBeat] = useState<Beat | null>(null);

  // Admin view toggle
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [selectedBeatForPage, setSelectedBeatForPage] = useState<Beat | null>(null);
  
  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false);
  const [tempoInputMin, setTempoInputMin] = useState(minBpm);
  const [tempoInputMax, setTempoInputMax] = useState(maxBpm);

  // Filter and Search Logic
  const filteredBeats = beats.filter((beat) => {
    const matchesSearch =
      beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'All' || beat.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesBpm = beat.bpm >= minBpm && beat.bpm <= maxBpm;

    return matchesSearch && matchesGenre && matchesBpm;
  });

  const featuredBeats = filteredBeats.filter(b => b.isFeatured && !b.isSoldExclusive);
  const regularBeats = filteredBeats.filter(b => !b.isFeatured || b.isSoldExclusive);

  const applyBpmFilter = () => {
    setBpmFilter(Number(tempoInputMin), Number(tempoInputMax));
  };

  const handleResetBpm = () => {
    setTempoInputMin(60);
    setTempoInputMax(180);
    setBpmFilter(60, 180);
  };

  const uniqueGenres = ['All', 'Trap', 'Drill', 'Hip Hop', 'R&B / Trap-Soul', 'Synthwave'];

  // Calculate matching items owned
  const purchasedBeatsList = beats.filter(b => user?.purchasedBeats?.includes(b.id));

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-32">
      {/* BACKGROUND GRAPHIC ACCENTS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-yellow-400/5 blur-[150px] rounded-full pointer-events-none" />

      {/* --- HEADER NAVBAR --- */}
      <nav id="store-navbar" className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div
            onClick={() => {
              setSelectedBeatForPage(null);
              setShowAdminDashboard(false);
            }}
            className="flex items-center gap-3 cursor-pointer select-none animate-fade-in"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center glow-amber shrink-0">
              <Disc className="text-zinc-950 animate-spin" style={{ animationDuration: '6s' }} size={22} />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-wider text-white select-none">
                R-TIOM <span className="text-amber-500">PRODUCTION</span>
              </span>
              <span className="block text-[8px] font-mono tracking-widest text-zinc-500 uppercase -mt-1">
                PREMIUM BEATS & FX
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center relative w-1/3">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, жанру, тегу..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Right menu links */}
          <div className="flex items-center gap-4">
            {/* Admin Switcher */}
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setShowAdminDashboard(!showAdminDashboard);
                  setSelectedBeatForPage(null);
                }}
                className={`hidden sm:flex px-3.5 py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition ${
                  showAdminDashboard
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {showAdminDashboard ? 'Каталог витрины' : 'Управление битами'}
              </button>
            )}

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-zinc-90 w bg-zinc-900/50 border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-zinc-950 font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-950 animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-zinc-850 pl-4">
                <div className="hidden lg:block text-right">
                  <span className="block text-xs font-bold text-white uppercase">{user.name}</span>
                  <span className="block text-[9px] text-zinc-500 font-mono -mt-0.5">
                    {user.role === 'admin' ? 'БИТМЕЙКЕР' : 'АРТИСТ'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium border border-zinc-800 transition cursor-pointer"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-zinc-950 text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <UserIcon size={14} /> ВОЙТИ
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SPLASH SECTION --- */}
      {!selectedBeatForPage && (!showAdminDashboard || user?.role !== 'admin') && (
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 animate-fade-in">
          <div className="relative rounded-3xl overflow-hidden glass-panel border border-zinc-900/80 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            
            {/* Animated Background Grids */}
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            
            <div className="relative max-w-xl text-center md:text-left z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                <Sparkles size={11} className="inline" /> СТОК КАТАЛОГ СВЕЖИХ ТРЕКОВ
              </div>
              
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white uppercase leading-tight mb-4">
                РЭП БИТЫ <br />
                <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
                  ОТ R-TIOM
                </span>
              </h1>
              
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                Оригинальные музыкальные инструменталы для вашего следующего хита. Мгновенная покупка лицензий с доставкой мультитреков и stems-файлов на почту.
              </p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {beats.length > 0 && (
                  <button
                    onClick={() => selectBeat(beats[0])}
                    className="px-6 py-3.5 rounded-xl bg-white hover:bg-amber-400 text-zinc-950 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 transform active:scale-95 transition cursor-pointer shadow-lg hover:shadow-amber-500/10"
                  >
                    <Play size={14} fill="currentColor" /> Слушать трейлер
                  </button>
                )}
                <a
                  href="#catalog-box"
                  className="px-6 py-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-display font-bold text-xs uppercase tracking-wider border border-zinc-850 transition flex items-center"
                >
                  Весь каталог
                </a>
              </div>
            </div>

            {/* Floating Vinyl Cover Preview representing Artem's production design */}
            <div className="relative w-72 h-72 md:w-80 md:h-80 select-none shrink-0 z-10 flex items-center justify-center">
              {/* Glowing circle backing */}
              <div className="absolute inset-4 rounded-full bg-amber-500/20 blur-2xl animate-pulse-slow" />
              
              {/* Spinning disc structure */}
              <div className={`absolute w-64 h-64 border-[14px] border-zinc-900 bg-zinc-950 rounded-full flex items-center justify-center p-8 shadow-2xl ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`}>
                <div className="w-full h-full rounded-full border border-zinc-800 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-black relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-950">
                    <ResolvedImage
                      src={currentBeat?.coverUrl || beats[0]?.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80"}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  {/* Center hole design */}
                  <div className="absolute w-6 h-6 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </header>
      )}

      {/* --- CORE CONTENT GRID CONTAINER --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10" id="catalog-box">
        
        {/* --- STATE: DISPLAY ADMIN VIEW IF TOGGLED --- */}
        {user?.role === 'admin' && showAdminDashboard ? (
          <div className="mb-10 animate-fade-in">
            <div className="flex justify-between items-center mb-5 border-b border-zinc-900 pb-3">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Раздел битмейкера</span>
              <button
                onClick={() => setShowAdminDashboard(false)}
                className="text-xs text-amber-500 hover:underline cursor-pointer"
              >
                Вернуться к витрине магазина →
              </button>
            </div>
            <AdminPanel />
          </div>
        ) : selectedBeatForPage ? (
          <div className="mb-10 animate-fade-in">
            <BeatPage
              beat={selectedBeatForPage}
              onBack={() => setSelectedBeatForPage(null)}
              onOpenLicense={(b) => setSelectedLicenseBeat(b)}
            />
          </div>
        ) : (
          /* --- STATE: NORMAL STOREFRONT CATALOG DISPLAY --- */
          <>
            
            {/* --- USER PURCHASED BEATS SECTION (SHOW ONLY FOR LOGGED IN USERS WHO HAVE COMPREHENSIVE CONTRACTS) --- */}
            {user && purchasedBeatsList.length > 0 && (
              <div className="mb-14 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 to-zinc-900 border border-emerald-900/30">
                <h2 className="font-display font-black text-lg tracking-wider text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="text-emerald-400 shrink-0" size={18} />
                  МОЯ МУЗЫКАЛЬНАЯ БИБЛИОТЕКА
                </h2>
                <p className="text-xs text-zinc-400 mb-5 leading-normal">
                  Вы авторизованы как <strong className="text-zinc-300">{user.name} ({user.email})</strong>. Ниже представлены биты, на которые у вас действуют активные права. Файлы без тегов готовы к записи.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {purchasedBeatsList.map((beat) => (
                    <div
                      key={beat.id}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-3"
                    >
                      <div className="flex gap-2.5 items-center overflow-hidden">
                        <ResolvedImage
                          src={beat.coverUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-800"
                        />
                        <div className="overflow-hidden">
                          <span className="block text-xs font-bold text-white truncate uppercase">{beat.title}</span>
                          <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">{beat.bpm} BPM • {beat.key}</span>
                        </div>
                      </div>

                      <a
                        href={purchasedTrackUrls[beat.id] || beat.audioUrl}
                        download={`${beat.title}_WAV_license.mp3`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 text-xs font-bold rounded-lg border border-emerald-500/20 transition flex items-center gap-1 shrink-0"
                      >
                        <FolderDown size={12} />
                        Скачать
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- FILTER CONTROL BOARD --- */}
            <div className="flex flex-col gap-5 bg-zinc-950 rounded-2xl border border-zinc-900 p-5 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                
                {/* Genre Tabs list */}
                <div className="flex flex-wrap gap-2">
                  {uniqueGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-4 py-2 text-xs font-bold tracking-wider rounded-xl uppercase transition cursor-pointer select-none ${
                        selectedGenre.toLowerCase() === genre.toLowerCase()
                          ? 'bg-amber-500 text-zinc-950 font-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
                      }`}
                    >
                      {genre === 'All' ? 'все жанры' : genre}
                    </button>
                  ))}
                </div>

                {/* Filters trigger & search panel */}
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  {/* Mobile Search input */}
                  <div className="flex md:hidden relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                      showFilters
                        ? 'border-amber-500/40 text-amber-400 bg-amber-500/5'
                        : 'border-zinc-805 text-zinc-400 hover:text-white bg-zinc-900/40'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span>Фильтры {showFilters ? '▲' : '▼'}</span>
                  </button>
                </div>
              </div>

              {/* Advanced Slider Content (BPM filtering) */}
              {showFilters && (
                <div id="filter-sliding-drawer" className="pt-4 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide font-semibold">Минимум BPM</label>
                    <input
                      type="number"
                      value={tempoInputMin}
                      onChange={(e) => setTempoInputMin(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide font-semibold">Максимум BPM</label>
                    <input
                      type="number"
                      value={tempoInputMax}
                      onChange={(e) => setTempoInputMax(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={applyBpmFilter}
                      className="flex-1 py-2 px-4 bg-amber-500 text-zinc-950 font-bold rounded-lg text-xs uppercase hover:bg-amber-400 transition cursor-pointer"
                    >
                      Применить
                    </button>
                    <button
                      onClick={handleResetBpm}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-805 text-zinc-400 rounded-lg text-xs font-semibold hover:text-white transition cursor-pointer"
                    >
                      Сброс
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* --- LISTING TITLE: RECOMENDED --- */}
            {featuredBeats.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6 border-l-4 border-amber-500 pl-3">
                  <Flame className="text-amber-500 fill-amber-500 animate-pulse" size={18} />
                  <h2 className="font-display font-black text-lg tracking-wider text-white uppercase">
                    РЕКОМЕНДОВАННЫЕ ХИТЫ (FEATURED)
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredBeats.map((beat) => (
                    <BeatCard
                      key={beat.id}
                      beat={beat}
                      onOpenLicense={(b) => setSelectedLicenseBeat(b)}
                      onSelectBeatPage={(b) => {
                        setSelectedBeatForPage(b);
                        document.getElementById('store-navbar')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* --- LISTING TITLE: ALL --- */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6 border-l-4 border-zinc-800 pl-3">
                <Music className="text-zinc-500" size={18} />
                <h2 className="font-display font-black text-lg tracking-wider text-white uppercase">
                  {searchQuery || selectedGenre !== 'All' ? 'РЕЗУЛЬТАТЫ ПОИСКА' : 'ВЕСЬ КАТАЛОГ СТУДИИ'}
                </h2>
              </div>

              {filteredBeats.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 border border-zinc-900 rounded-2xl bg-zinc-900/10">
                  Мы не смогли найти биты по вашему запросу. Попробуйте сбросить фильтры или изменить слова поиска.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularBeats.map((beat) => (
                    <BeatCard
                      key={beat.id}
                      beat={beat}
                      onOpenLicense={(b) => setSelectedLicenseBeat(b)}
                      onSelectBeatPage={(b) => {
                        setSelectedBeatForPage(b);
                        document.getElementById('store-navbar')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                  ))}
                  {featuredBeats.length === 0 && filteredBeats.map((beat) => {
                    // fallback if featured block was empty as well
                    if (featuredBeats.some(f => f.id === beat.id)) return null;
                    return (
                      <BeatCard
                        key={beat.id}
                        beat={beat}
                        onOpenLicense={(b) => setSelectedLicenseBeat(b)}
                        onSelectBeatPage={(b) => {
                          setSelectedBeatForPage(b);
                          document.getElementById('store-navbar')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

          </>
        )}
      </main>

      {/* --- SIDE MOUNTED MODALS --- */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <LicenseModal
        isOpen={selectedLicenseBeat !== null}
        beat={selectedLicenseBeat}
        onClose={() => setSelectedLicenseBeat(null)}
      />

      {/* --- PERSISTENT BOTTOM PLAYER --- */}
      <AudioPlayer onOpenLicense={(b) => setSelectedLicenseBeat(b)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RealStoreApp />
    </AppProvider>
  );
}
