import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, Info } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useApp();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'buyer'>('buyer');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (isLoginView) {
      const result = login(email, password);
      if (result.success) {
        onClose();
      } else {
        setErrorMsg(result.error || 'Ошибка входа');
      }
    } else {
      if (!name) {
        setErrorMsg('Пожалуйста, введите ваше имя');
        return;
      }
      const result = register(email, password, name, role);
      if (result.success) {
        setSuccessMsg('Регистрация успешна! Вы вошли в систему.');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(result.error || 'Ошибка регистрации');
      }
    }
  };

  const handleDemoLogin = (type: 'admin' | 'buyer') => {
    setErrorMsg('');
    setSuccessMsg('');
    if (type === 'admin') {
      setEmail('admin@rtiom.com');
      setPassword('admin123');
    } else {
      setEmail('buyer@rtiom.com');
      setPassword('buyer123');
    }
  };

  return (
    <AnimatePresence>
      <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          id="auth-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 text-white"
        >
          {/* Top Banner Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          {/* Close button */}
          <button
            id="auth-modal-close"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>

          <div className="p-8">
            <div className="mb-6 text-center">
              <h2 id="auth-modal-title" className="font-display text-2xl font-bold tracking-tight text-white mb-1">
                {isLoginView ? 'ВХОД В СИСТЕМУ' : 'РЕГИСТРАЦИЯ'}
              </h2>
              <p className="text-sm text-zinc-400">
                {isLoginView ? 'Войдите на r-tiom production' : 'Создайте аккаунт для покупки битов'}
              </p>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-start gap-2 animate-pulse-slow">
                <Info size={14} className="mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginView && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Ваше имя / Псевдоним
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <UserIcon size={16} />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Lil Producer"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Электронная почта
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artist@ RTIOM .com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Пароль
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm transition"
                  />
                </div>
              </div>

              {!isLoginView && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Кто вы?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`py-2 rounded-xl border text-xs font-medium transition ${
                        role === 'buyer'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      Исполнитель / Покупатель
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 rounded-xl border text-xs font-medium transition ${
                        role === 'admin'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      Битмейкер (Админ)
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/10"
              >
                {isLoginView ? (
                  <>
                    <LogIn size={16} /> Войти
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Зарегистрироваться
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Panel */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80">
              <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest text-center mb-3">
                Быстрый демо-вход:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/40 text-left text-xs transition"
                >
                  <span className="block text-amber-400 font-bold font-mono">Битмейкер (Admin)</span>
                  <span className="text-[10px] text-zinc-500">admin@rtiom.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('buyer')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/40 text-left text-xs transition"
                >
                  <span className="block text-zinc-300 font-semibold text-zinc-400">Покупатель (Demo)</span>
                  <span className="text-[10px] text-zinc-500">buyer@rtiom.com</span>
                </button>
              </div>
              <span className="block text-[10px] text-zinc-500 text-center mt-2">
                * Пароль для демо-аккаунтов: <code className="text-zinc-400">admin123</code> и <code className="text-zinc-400">buyer123</code>
              </span>
            </div>

            <div className="mt-5 text-center text-xs">
              <span className="text-zinc-500">
                {isLoginView ? 'Еще нет аккаунта? ' : 'Уже есть аккаунт? '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-amber-400 hover:underline font-medium"
              >
                {isLoginView ? 'Создать аккаунт' : 'Войти в профиль'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
