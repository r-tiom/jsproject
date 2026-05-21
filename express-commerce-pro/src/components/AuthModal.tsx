import { useState, useEffect, FormEvent } from 'react';
import { X, Mail, Lock, User as UserIcon, MapPin, Phone, AlertCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register, error, clearError, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  
  // Form coordinates
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [valError, setValError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    clearError();
    setValError(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValError(null);
    clearError();

    // Validation
    if (!email.trim() || !password) {
      setValError('Пожалуйста, заполните email и пароль');
      return;
    }

    if (activeTab === 'register') {
      if (!name.trim()) {
        setValError('Пожалуйста, укажите ваше ФИО');
        return;
      }
      if (password.length < 6) {
        setValError('Пароль должен состоять минимум из 6 символов');
        return;
      }
      
      const success = await register(name, email, password, address, phone);
      if (success) onClose();
    } else {
      const success = await login(email, password);
      if (success) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      
      {/* Container */}
      <div 
        id="auth-modal-container"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
      >
        
        {/* Header containing Close control */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-2 font-bold text-gray-900">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            <span>{activeTab === 'login' ? 'Вход в систему' : 'Новый аккаунт'}</span>
          </div>
          <button 
            id="auth-close-btn"
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controllers */}
        <div className="flex border-b border-gray-100">
          <button
            id="tab-login-btn"
            onClick={() => {
              setActiveTab('login');
              setValError(null);
              clearError();
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-all ${
              activeTab === 'login' 
                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white' 
                : 'text-gray-500 hover:text-gray-700 bg-gray-50/50'
            }`}
          >
            Войти на AuraShop
          </button>
          <button
            id="tab-register-btn"
            onClick={() => {
              setActiveTab('register');
              setValError(null);
              clearError();
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-all ${
              activeTab === 'register' 
                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white' 
                : 'text-gray-500 hover:text-gray-700 bg-gray-50/50'
            }`}
          >
            Создать Профиль
          </button>
        </div>

        {/* Form panel body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Server or Local Error Alert Banner */}
          {(error || valError) && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100 animate-pulse">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{valError || error}</span>
            </div>
          )}

          {activeTab === 'register' && (
            <>
              {/* Full Name input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Ваше Имя / ФИО</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <UserIcon className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="Александр Смирнов"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition animate-slide-in"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Контактный номер телефона (необязательно)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="auth-phone"
                    type="tel"
                    placeholder="+7 (999) 111-2233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Адрес доставки (необязательно)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <MapPin className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="auth-address"
                    type="text"
                    placeholder="г. Москва, ул. Арбат, 10, кв. 5"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email input (universal) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Электронная почта (Email)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Password (universal) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Пароль</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                id="auth-password"
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-150 active:scale-[0.98] transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Подождите...</span>
                </div>
              ) : activeTab === 'login' ? (
                'Войти'
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </div>

          {/* Helpful Tips Bottom */}
          <div className="text-center pt-2 text-xs text-gray-400">
            {activeTab === 'login' ? (
              <p>
                Впервые на AuraShop?{' '}
                <button
                  id="switch-to-register"
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Создайте профиль за минуту
                </button>
              </p>
            ) : (
              <p>
                Уже зарегистрированы?{' '}
                <button
                  id="switch-to-login"
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Авторизоваться в кабинете
                </button>
              </p>
            )}
            <div className="mt-3 text-[10px] text-gray-400 bg-gray-55 p-2 rounded-lg border border-gray-100">
              <span className="font-semibold text-gray-550">Демо доступы:</span><br />
              Клиент: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono">user@example.com / user123</code><br />
              Админ: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono">admin@example.com / admin123</code>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
