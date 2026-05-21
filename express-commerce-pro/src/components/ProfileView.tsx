import { useState, useEffect, FormEvent } from 'react';
import { UserCheck, MapPin, Phone, Lock, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileView() {
  const { user, updateProfile, error, clearError, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAddress(user.address || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setLocalError(null);
    clearError();

    if (password) {
      if (password.length < 6) {
        setLocalError('Пароль должен содержать не менее 6 символов');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Пароли не совпадают');
        return;
      }
    }

    const updates: { name?: string; address?: string; phone?: string; password?: string } = {
      name,
      address,
      phone
    };
    if (password) {
      updates.password = password;
    }

    const completed = await updateProfile(updates);
    if (completed) {
      setSuccessMsg('Профиль успешно обновлен!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3500);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-gray-400">
        Пожалуйста, войдите в систему для просмотра личного кабинета.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-5 mb-8">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
          <UserIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900 leading-none">Личный Личный Кабинет</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Редактируйте свои контактные данные здесь</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-150 p-6 space-y-5 shadow-sm shadow-gray-50/50">
        
        {/* feedback alerts */}
        {(error || localError) && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-center col-span-2">
            <span>{localError || error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-xs flex items-center space-x-1.5 font-semibold">
            <Sparkles className="h-4 w-4 text-emerald-600 animate-spin" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email read-only */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">Адрес электронной почты (Не подлежит замене)</label>
          <input 
            type="email" 
            disabled 
            value={user.email} 
            className="w-full px-4 py-2 bg-gray-100 text-gray-500 text-sm font-semibold rounded-xl border border-gray-200 cursor-not-allowed font-mono"
          />
        </div>

        {/* Name input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Ваше ФИО / Название организации</label>
          <input 
            id="profile-name"
            type="text" 
            required 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Dual grid for contact coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-655 flex items-center space-x-1">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              <span>Номер телефона:</span>
            </label>
            <input 
              id="profile-phone"
              type="tel" 
              placeholder="+7 (911) 000-0000"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="w-full px-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-655 flex items-center space-x-1">
              <UserCheck className="h-3.5 w-3.5 text-gray-400" />
              <span>Должность/Статус:</span>
            </label>
            <input 
              type="text" 
              disabled 
              value={user.role === 'admin' ? 'Администратор AuraShop' : 'Покупатель'} 
              className="w-full px-4 py-2 bg-gray-100 text-gray-550 text-sm font-semibold rounded-xl border border-gray-200 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Shipping address info */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-655 flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>Адрес доставки по умолчанию:</span>
          </label>
          <textarea 
            id="profile-address"
            rows={2}
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="г. Санкт-Петербург, Невский проспект, дом 10, кв. 14"
            className="w-full px-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition resize-none"
          />
        </div>

        {/* Password update segment collapsible warning */}
        <div className="pt-4 border-t border-gray-150 space-y-4">
          <div className="text-xs text-gray-400 font-semibold flex items-center space-x-1.5">
            <Lock className="h-4 w-4 text-indigo-500" />
            <span>Безопасность: Смена пароля (Оставьте пустым, если не хотите менять)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Новый пароль</label>
              <input 
                id="profile-password"
                type="password" 
                placeholder="Новый пароль"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Повторите новый пароль</label>
              <input 
                id="profile-confirm-password"
                type="password" 
                placeholder="Повтор пароля"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full px-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            id="profile-submit"
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-150 active:scale-[0.98] transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? 'Секунду...' : 'Сохранить изменения'}
          </button>
        </div>

      </form>

    </div>
  );
}
