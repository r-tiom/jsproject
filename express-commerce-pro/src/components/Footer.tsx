import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

interface FooterProps {
  onCategorySelect?: (category: string) => void;
  onViewChange: (view: 'catalog' | 'cart' | 'checkout' | 'orders' | 'profile' | 'admin') => void;
}

export default function Footer({ onCategorySelect, onViewChange }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
      
      {/* Visual core values bar */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="p-2 rounded-lg bg-gray-800 text-indigo-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Быстрая доставка</h4>
              <p className="text-xs text-gray-400 mt-0.5">Бесплатно при заказах от 150$ по всей стране.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="p-2 rounded-lg bg-gray-800 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Безопасность</h4>
              <p className="text-xs text-gray-400 mt-0.5">Шифрованные платежи и защита ваших личных данных.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="p-2 rounded-lg bg-gray-800 text-indigo-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Простой возврат</h4>
              <p className="text-xs text-gray-400 mt-0.5">Гарантия возврата средств в течение 14 дней без вопросов.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="p-2 rounded-lg bg-gray-800 text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Служба поддержки</h4>
              <p className="text-xs text-gray-400 mt-0.5">Круглосуточный саппорт менеджеров в чате магазина.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer navigation columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xl font-bold text-white tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <span>AuraShop</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Дизайнерский интернет-магазин с первоклассным ассортиментом качественной электроники, одежды, книг и аксессуаров для ценителей эстетичных решений.
            </p>
          </div>

          {/* Catalog Col */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider mb-4">Категории</h3>
            <ul className="space-y-2 text-xs">
              {['Electronics', 'Clothing', 'Home & Living', 'Books'].map((cat) => {
                const displayMap: Record<string, string> = {
                  'Electronics': 'Электроника',
                  'Clothing': 'Одежда',
                  'Home & Living': 'Для Дома & Стиль',
                  'Books': 'Книги'
                };
                return (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        if (onCategorySelect) onCategorySelect(cat);
                        onViewChange('catalog');
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      {displayMap[cat] || cat}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Links Col */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider mb-4">Ваш Кабинет</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onViewChange('profile')} className="text-gray-400 hover:text-white transition">
                  Профиль Пользователя
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('orders')} className="text-gray-400 hover:text-white transition">
                  История моих заказов
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('cart')} className="text-gray-400 hover:text-white transition">
                  Ваша Корзина
                </button>
              </li>
            </ul>
          </div>

          {/* Secure Col */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider mb-4">Способы оплаты</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Мы принимаем банковские карты Visa/Mastercard, Apple Pay, Google Pay, а также наличными при получении.
            </p>
            <div className="flex items-center space-x-2">
              <span className="bg-gray-800 text-gray-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Visa</span>
              <span className="bg-gray-800 text-gray-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">MC</span>
              <span className="bg-gray-800 text-gray-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">MIR</span>
              <span className="bg-gray-800 text-gray-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">CASH</span>
            </div>
          </div>

        </div>
        
        {/* Bottom Credits */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} AuraShop LLC. Все права защищены.
          </div>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Сделано с любовью и заботой об итеративной архитектуре</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          </div>
        </div>

      </div>
    </footer>
  );
}
