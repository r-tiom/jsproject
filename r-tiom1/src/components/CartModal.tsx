import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Mail, CreditCard, ShoppingBag, FolderDown, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { ResolvedImage } from './ResolvedImage';
import { LicenseType } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { cart, removeFromCart, clearCart, user, checkout, purchasedTrackUrls } = useApp();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);
  const [lastPurchasedItems, setLastPurchasedItems] = useState<any[]>([]);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const getLicenseNameAbbr = (type: LicenseType) => {
    switch (type) {
      case 'mp3': return 'MP3 Лицензия';
      case 'wav': return 'WAV Лицензия';
      case 'trackout': return 'Потреково (Stems)';
      case 'exclusive': return 'Эксклюзивные права';
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (cart.length === 0) return;

    // Save cart contents temporarily to show in success screen
    setLastPurchasedItems([...cart]);

    // Perform purchase sync
    checkout();
    setPurchaseCompleted(true);
    setIsCheckingOut(false);
  };

  const handleFinishSuccess = () => {
    setPurchaseCompleted(false);
    setLastPurchasedItems([]);
    onClose();
  };

  return (
    <AnimatePresence>
      <div id="cart-modal-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-md">
        {/* Backdrop touch to close */}
        <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

        <motion.div
          id="cart-modal-container"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-900 text-white shadow-2xl flex flex-col z-10"
        >
          {/* Top Banner Accent */}
          <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />

          {/* Header */}
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-amber-500" size={20} />
              <h2 className="font-display font-black text-lg tracking-wider">КОРЗИНА ({cart.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar">
            {purchaseCompleted ? (
              /* --- STATE: PURCHASE COMPLETED --- */
              <div className="flex flex-col items-center justify-center text-center h-full animate-fade-in">
                <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mb-5">
                  <CheckCircle2 size={48} className="animate-bounce" />
                </div>
                <h3 className="font-display font-black text-2xl tracking-tight text-white uppercase mb-2">
                  БИТЫ УСПЕШНО КУПЛЕНЫ!
                </h3>
                <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
                  Оригинальные файлы без аудиотегов, контракты и трекаут-архивы отправлены на ваш Email <strong className="text-zinc-200">{user?.email}</strong>.
                </p>

                {/* Instant Download files panel */}
                <div className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-4 mb-6 text-left">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Доступные прямые загрузки:
                  </span>
                  <div className="space-y-2">
                    {lastPurchasedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
                        <div className="overflow-hidden">
                          <span className="block text-xs font-bold text-white truncate">{item.beat.title}</span>
                          <span className="block text-[9px] text-amber-500 uppercase tracking-widest">{item.licenseType} format</span>
                        </div>
                        <a
                          href={item.beat.audioUrl}
                          download={`${item.beat.title}_${item.licenseType}.mp3`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition"
                        >
                          <FolderDown size={12} />
                          Скачать
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleFinishSuccess}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold tracking-wider text-xs uppercase transition shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  Вернуться в магазин
                </button>
              </div>
            ) : cart.length === 0 ? (
              /* --- STATE: EMPTY CART --- */
              <div className="flex flex-col items-center justify-center text-center h-full text-zinc-500">
                <ShoppingBag size={48} className="text-zinc-700 stroke-[1.5] mb-4" />
                <span className="block text-zinc-300 font-display font-medium text-base mb-1">Ваша корзина пуста</span>
                <p className="text-xs text-zinc-500 max-w-[250px] leading-relaxed">
                  Выберите подходящую лицензию на понравившийся бит, чтобы добавить его сюда.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl border border-zinc-800 hover:border-zinc-750 transition cursor-pointer"
                >
                  Просмотреть биты
                </button>
              </div>
            ) : isCheckingOut ? (
              /* --- STATE: CHECKOUT --- */
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <button
                    onClick={() => setIsCheckingOut(false)}
                    className="text-xs text-amber-500 hover:underline"
                  >
                    ← Вернуться к перечню
                  </button>
                </div>

                <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-4">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Получатель договора:</span>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Mail size={14} className="text-amber-500" />
                    <span className="font-semibold text-zinc-200">{user?.email}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Ссылка на скачивание аудиодорожек без тегов и PDF-лицензия будут направлены на данный ящик.
                  </p>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-zinc-400 font-display mb-1">
                    ИМИТАЦИЯ ОПЛАТЫ КАРТОЙ (DEMO)
                  </h3>

                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1 font-semibold">
                      Номер Карты
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                        <CreditCard size={15} />
                      </span>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        maxLength={19}
                        placeholder="4400 0000 0000 0000"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:border-amber-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1 font-semibold">
                        Срок действия
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:border-amber-500 focus:outline-none text-center transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1 font-semibold">
                        CVC код
                      </label>
                      <input
                        type="password"
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="***"
                        maxLength={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:border-amber-500 focus:outline-none text-center transition"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900 space-y-2">
                    <div className="flex justify-between text-zinc-400 text-xs">
                      <span>Итого к оплате</span>
                      <span>{total} $</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-base">
                      <span>Сумма списания:</span>
                      <span className="text-yield text-yellow-400">{total} $</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                  >
                    Оплатить {total} $ <ArrowRight size={14} />
                  </button>

                  <div className="text-[10px] text-zinc-500 flex items-start gap-1 pb-4 leading-relaxed">
                    <HelpCircle size={12} className="shrink-0 text-amber-500/50 mt-0.5" />
                    <span>
                      Это защищенный симулятор платежной системы. Деньги не списываются. При вводе любых тестовых реквизитов вы мгновенно получите оригинальные файлы бита.
                    </span>
                  </div>
                </form>
              </div>
            ) : (
              /* --- STATE: CART LIST --- */
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-900/50 border border-zinc-900 hover:border-zinc-850 rounded-xl flex gap-3 items-center justify-between"
                  >
                    <div className="flex gap-2.5 items-center overflow-hidden">
                      <ResolvedImage
                        src={item.beat.coverUrl}
                        alt={item.beat.title}
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-800 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="block text-xs font-bold text-white uppercase truncate">
                          {item.beat.title}
                        </span>
                        <span className="block text-[10px] text-amber-400 font-mono mt-0.5 uppercase tracking-wider">
                          {getLicenseNameAbbr(item.licenseType)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-display font-bold text-yellow-400 text-sm">
                        {item.price} $
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-850 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Summary (Visible in Cart List view only) */}
          {!purchaseCompleted && !isCheckingOut && cart.length > 0 && (
            <div className="p-6 bg-zinc-950 border-t border-zinc-900 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 uppercase tracking-wide">ИТОГО К ОПЛАТЕ:</span>
                <span className="font-display font-black text-2xl text-yellow-400">{total} $</span>
              </div>

              {user ? (
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  Оформить заказ <ArrowRight size={14} />
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-amber-500 hover:text-amber-400 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    Авторизоваться <ArrowRight size={14} />
                  </button>
                  <span className="block text-[10px] text-zinc-500 text-center leading-normal">
                    * Для оформления заказа и мгновенной загрузки файлов неоходимо войти в аккаунт.
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
