import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beat, LicenseType } from '../types';
import { LICENSE_INFO } from '../data';
import { X, Check, Disc, Music, Layers, Award, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResolvedImage } from './ResolvedImage';

interface LicenseModalProps {
  isOpen: boolean;
  beat: Beat | null;
  onClose: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, beat, onClose }) => {
  const { addToCart, cart } = useApp();

  if (!isOpen || !beat) return null;

  const getLicenseIcon = (type: LicenseType) => {
    switch (type) {
      case 'mp3':
        return <Music className="text-zinc-400" size={20} />;
      case 'wav':
        return <Disc className="text-amber-400" size={20} />;
      case 'trackout':
        return <Layers className="text-amber-500" size={20} />;
      case 'exclusive':
        return <Award className="text-yellow-400" size={20} />;
    }
  };

  const handleAddToCart = (type: LicenseType) => {
    addToCart(beat, type);
    onClose();
  };

  return (
    <AnimatePresence>
      <div id="license-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          id="license-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-2xl"
        >
          {/* Top banner */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />

          {/* Close button */}
          <button
            id="license-modal-close"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>

          <div className="p-8">
            <div className="flex gap-4 items-center mb-6 border-b border-zinc-850 pb-5">
              <ResolvedImage
                src={beat.coverUrl}
                alt={beat.title}
                className="w-16 h-16 rounded-lg object-cover border border-zinc-800"
              />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">{beat.genre}</span>
                <h3 className="font-display text-2xl font-black text-white leading-none mt-0.5">
                  {beat.title.toUpperCase()}
                </h3>
                <div className="flex gap-3 text-xs text-zinc-400 mt-1 font-mono">
                  <span>BPM: {beat.bpm}</span>
                  <span>Тональность: {beat.key}</span>
                </div>
              </div>
            </div>

            <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400 mb-4 font-display">
              ВЫБЕРИТЕ ТИП ЛИЦЕНЗИИ
            </h4>

            {/* List of License Options */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {LICENSE_INFO.map((option) => {
                const price = beat.prices[option.type];
                const isExclusive = option.type === 'exclusive';
                const isSold = isExclusive && beat.isSoldExclusive;
                const itemIdInCart = `${beat.id}-${option.type}`;
                const isInCartAlready = cart.some(item => item.id === itemIdInCart);

                return (
                  <div
                    key={option.type}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isSold
                        ? 'border-zinc-805 bg-zinc-950/40 opacity-50'
                        : isInCartAlready
                        ? 'border-amber-500 bg-amber-500/5'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex gap-3.5 items-start">
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                        {getLicenseIcon(option.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-white text-base leading-tight">
                            {option.name}
                          </span>
                          {isInCartAlready && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-medium border border-amber-500/30">
                              В КОРЗИНЕ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 mr-4 max-w-md">
                          {option.description}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-mono mt-2 uppercase tracking-wide">
                          <span>ФОРМАТ: {option.fileFormat}</span>
                          <span>•</span>
                          <span>ЛИМИТ: {option.terms}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-zinc-850">
                      <div className="mb-0 md:mb-2">
                        {isSold ? (
                          <span className="font-mono bg-red-950/40 text-red-400 border border-red-900/30 text-xs px-3 py-1 font-extrabold tracking-widest rounded-lg">
                            ПРОДАНО
                          </span>
                        ) : (
                          <span className="font-display font-black text-xl text-yellow-400">
                            {price} $
                          </span>
                        )}
                      </div>

                      {!isSold && (
                        <button
                          type="button"
                          disabled={isSold}
                          onClick={() => handleAddToCart(option.type)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
                            isInCartAlready
                              ? 'bg-zinc-850 text-zinc-400 cursor-not-allowed border border-zinc-700/50'
                              : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 hover:shadow-lg hover:shadow-amber-500/10'
                          }`}
                        >
                          <ShoppingCart size={14} />
                          {isInCartAlready ? 'ДОБАВЛЕНО' : 'В КОРЗИНУ'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 text-center text-xs text-zinc-500 leading-normal">
              Все покупки включают автоматическую отправку оригинальных файлов на ваш Email. <br />
              По кастомным запросам или дисконтам пишите: <span className="text-amber-500/80 font-mono">r-tiom@rtiom.com</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
