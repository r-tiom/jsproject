import { useState } from 'react';
import { ShoppingBag, Search, User as UserIcon, LogOut, LayoutDashboard, History, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onSearchChange: (search: string) => void;
  searchValue: string;
  onViewChange: (view: 'catalog' | 'cart' | 'checkout' | 'orders' | 'profile' | 'admin') => void;
  currentView: string;
  onOpenAuth: (view: 'login' | 'register') => void;
}

export default function Navbar({ 
  onSearchChange, 
  searchValue, 
  onViewChange, 
  currentView,
  onOpenAuth 
}: NavbarProps) {
  const { user, logout } = useAuth();
  const { cartItemsCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div 
          onClick={() => onViewChange('catalog')} 
          className="flex cursor-pointer items-center space-x-2 text-xl font-bold text-gray-900 tracking-tight"
          id="nav-logo"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-gray-900 to-indigo-950 bg-clip-text text-transparent">
            AuraShop
          </span>
        </div>

        {/* Search Bar - only visible on catalog and lists */}
        <div className="flex flex-1 max-w-md mx-6">
          {(currentView === 'catalog' || currentView === 'admin') && (
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                id="search-input"
                type="text"
                placeholder="Поиск товаров..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-sm text-gray-900 rounded-full border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          )}
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Catalog link */}
          <button
            id="nav-catalog-btn"
            onClick={() => onViewChange('catalog')}
            className={`text-sm font-medium transition ${
              currentView === 'catalog' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Каталог
          </button>

          {/* Cart Trigger */}
          <button
            id="nav-cart-btn"
            onClick={() => onViewChange('cart')}
            className="group relative flex items-center p-1.5 text-gray-600 hover:text-indigo-600 transition"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {cartItemsCount}
              </span>
            )}
            <span className="ml-1.5 hidden text-sm font-medium text-gray-700 group-hover:text-indigo-600 sm:block">
              Корзина
            </span>
          </button>

          {/* User Section */}
          {user ? (
            <div className="relative">
              <button
                id="nav-user-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1.5 text-gray-700 hover:text-indigo-600 focus:outline-none py-1 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-gray-100/60 ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-xs text-gray-400 font-semibold border-b border-gray-50 mb-1.5">
                    {user.email}
                  </div>
                  
                  {/* Common client actions */}
                  <button
                    onClick={() => {
                      onViewChange('profile');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <UserCheck className="mr-2 h-4 w-4 text-gray-400" />
                    Мой Профиль
                  </button>

                  <button
                    onClick={() => {
                      onViewChange('orders');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <History className="mr-2 h-4 w-4 text-gray-400" />
                    История Заказов
                  </button>

                  {/* Admin section toggle */}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onViewChange('admin');
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
                      Панель Управления
                    </button>
                  )}

                  <hr className="my-1 border-gray-100" />

                  <button
                    onClick={() => {
                      logout();
                      onViewChange('catalog');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-500" />
                    Выйти из аккаунта
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                id="login-btn"
                onClick={() => onOpenAuth('login')}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent transition"
              >
                Войти
              </button>
              <button
                id="register-btn"
                onClick={() => onOpenAuth('register')}
                className="hidden rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm shadow-indigo-150 sm:block transition"
              >
                Регистрация
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
