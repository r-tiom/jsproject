import { useState, useEffect, FormEvent } from 'react';
import { ShoppingBag, ArrowLeft, Trash2, MapPin, CreditCard, ChevronRight, CheckCircle2, ShoppingCart, UserCheck, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

interface CheckoutViewProps {
  onViewChange: (view: 'catalog' | 'cart' | 'checkout' | 'orders' | 'profile' | 'admin') => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export default function CheckoutView({ onViewChange, onOpenAuth }: CheckoutViewProps) {
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, clearCart, itemsPrice, shippingPrice, taxPrice, totalPrice } = useCart();

  // Progress steps
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'COD'>('Card');
  
  // Card states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // General server/UI errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill user details if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      if (user.address) {
        // Simple parser
        const parts = user.address.split(',');
        setAddress(parts[0]?.trim() || '');
        setCity(parts[1]?.trim() || '');
      }
    }
  }, [user]);

  // Adjust view depending on step selection
  const handleProceedToShipping = () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setStep('shipping');
  };

  const handleProceedToPayment = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !city.trim() || !postalCode.trim() || !phone.trim()) {
      setErrorMsg('Пожалуйста, заполните все поля доставки');
      return;
    }
    setErrorMsg(null);
    setStep('payment');
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (paymentMethod === 'Card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        setErrorMsg('Пожалуйста, введите данные вашей банковской карты');
        setLoading(false);
        return;
      }
      if (cardNumber.replace(/\s+/g, '').length < 16) {
        setErrorMsg('Некорректный номер карты (требуется 16 цифр)');
        setLoading(false);
        return;
      }
    }

    try {
      const storedToken = localStorage.getItem('store_auth_token');
      const orderData = {
        orderItems: cartItems,
        shippingAddress: address,
        shippingCity: city,
        shippingPostalCode: postalCode,
        shippingPhone: phone,
        paymentMethod,
        paymentDetails: paymentMethod === 'Card' ? {
          cardBrand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
          last4: cardNumber.trim().slice(-4)
        } : undefined,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Ошибка оформления заказа');
        setLoading(false);
        return;
      }

      // Success
      setConfirmedOrder(data);
      clearCart();
      setStep('success');
    } catch (err) {
      setErrorMsg('Сетевая ошибка при размещении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success' && confirmedOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 fill-emerald-50 animate-bounce" />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Заказ успешно оформлен!
        </h2>
        
        <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
          Благодарим вас за покупку в AuraShop. Номер заказа <code className="bg-gray-100 font-mono text-xs text-indigo-700 px-1.5 py-0.5 rounded font-bold">{confirmedOrder.id}</code>. Наш менеджер свяжется с вами по номеру <span className="font-semibold text-gray-900">{confirmedOrder.shippingPhone}</span> для уточнения времени доставки.
        </p>

        <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-5 text-left text-xs divide-y divide-gray-100 max-w-md mx-auto">
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Способ оплаты:</span>
            <span className="font-semibold text-gray-800">
              {confirmedOrder.paymentMethod === 'Card' ? 'Картой на сайте (Оплачено)' : 'Наличными при получении'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Адрес доставки:</span>
            <span className="font-semibold text-gray-800 text-right">
              {confirmedOrder.shippingAddress}, {confirmedOrder.shippingCity}
            </span>
          </div>
          <div className="flex justify-between py-2 font-bold text-sm">
            <span className="text-indigo-600">Сумма заказа:</span>
            <span className="text-gray-900">${confirmedOrder.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            id="success-orders-btn"
            onClick={() => onViewChange('orders')}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 transition"
          >
            Мои Заказы
          </button>
          <button
            id="success-home-btn"
            onClick={() => onViewChange('catalog')}
            className="w-full sm:w-auto px-6 py-2 text-gray-700 font-semibold text-sm hover:bg-gray-100 border border-gray-200 rounded-xl transition"
          >
            Продолжить покупки
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && step !== 'success') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="flex justify-center text-gray-300">
          <ShoppingCart className="h-16 w-16" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Ваша корзина пуста</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Кажется, вы еще не добавили ни одного товара в корзину. Отправьтесь в каталог за прекрасными покупками!
        </p>
        <button
          id="cart-empty-go-back"
          onClick={() => onViewChange('catalog')}
          className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-150 transition cursor-pointer"
        >
          Перейти в Каталог AuraShop
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Checkout header */}
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-5 mb-8">
        <button 
          onClick={() => {
            if (step === 'payment') setStep('shipping');
            else if (step === 'shipping') setStep('cart');
            else onViewChange('catalog');
          }}
          className="p-1 text-gray-400 hover:text-gray-900 rounded bg-gray-50 border border-gray-150 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-gray-900 leading-tight">Оформление Заказа</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {step === 'cart' ? 'Шаг 1: Просмотр корзины' : step === 'shipping' ? 'Шаг 2: Адрес доставки' : 'Шаг 3: Сведения об оплате'}
          </p>
        </div>
      </div>

      {/* Main Split Body Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Dynamic action section depending on step */}
        <div className="lg:col-span-8 space-y-6">
          
          {step === 'cart' && (
            <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
              <div className="p-6 border-b border-gray-100 font-bold text-gray-900 border-l-4 border-l-indigo-500">
                Товары в вашей корзине ({cartItems.length})
              </div>
              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <li key={item.product.id} className="p-5 flex items-center space-x-4">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-xs text-indigo-600 font-semibold">${item.product.price.toFixed(2)} шт.</p>
                      
                      {/* Counter on Mobile */}
                      <div className="flex items-center space-x-2 mt-2 sm:hidden">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs font-extrabold text-gray-650"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs font-extrabold text-gray-650"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Counter widget on screens */}
                    <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-150 transition"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-black text-gray-900 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-150 transition"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition inline-block mt-0.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="p-6 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  id="cart-continue-shopping"
                  onClick={() => onViewChange('catalog')}
                  className="w-full sm:w-auto text-xs font-semibold text-gray-500 hover:text-gray-900 transition underline pl-2"
                >
                  Вернуться в каталог
                </button>
                <button
                  id="checkout-proceed-btn"
                  onClick={handleProceedToShipping}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-150 active:scale-[0.98] transition cursor-pointer"
                >
                  <span>{user ? 'Оформить заказ' : 'Войти для оформления'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'shipping' && (
            <form onSubmit={handleProceedToPayment} className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4">
              <div className="font-bold text-gray-900 border-l-4 border-l-indigo-500 pl-3 mb-6">
                Адрес и Контакты Доставки
              </div>
              
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-center space-x-2 animate-pulse">
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Ваше имя / Контактное лицо</label>
                  <input 
                    id="chk-name"
                    type="text"
                    required
                    placeholder="Иван Смирнов"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Контактный телефон</label>
                  <input 
                    id="chk-phone"
                    type="tel"
                    required
                    placeholder="+7 (999) 111-2233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Улица, дом, квартира</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input 
                    id="chk-address"
                    type="text"
                    required
                    placeholder="Ломоносовский проспект, дом 25, корпус 1, кв 45"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Город / Населенный пункт</label>
                  <input 
                    id="chk-city"
                    type="text"
                    required
                    placeholder="г. Москва"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Почтовый индекс</label>
                  <input 
                    id="chk-postal"
                    type="text"
                    required
                    placeholder="119192"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  id="shipping-submit-btn"
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] shadow-md shadow-indigo-150 transition cursor-pointer"
                >
                  <span>Перейти к оплате</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl border border-gray-150 p-6 space-y-6">
              <div className="font-bold text-gray-900 border-l-4 border-l-indigo-500 pl-3">
                Способ оплаты
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs animate-pulse">
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Toggle Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition ${
                    paymentMethod === 'Card'
                      ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h4 className="text-xs font-bold">Оплата картой</h4>
                    <p className="text-[10px] text-gray-400">Прямо сейчас, безопасно, в один клик</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setPaymentMethod('COD');
                    setErrorMsg(null);
                  }}
                  className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition ${
                    paymentMethod === 'COD'
                      ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h4 className="text-xs font-bold">Наличными при получении</h4>
                    <p className="text-[10px] text-gray-400">Оплата курьеру после осмотра товаров</p>
                  </div>
                </div>
              </div>

              {paymentMethod === 'Card' && (
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4 animate-slide-in">
                  <div className="text-xs font-bold text-gray-700 flex items-center space-x-1.5 mb-2">
                    <CreditCard className="h-4.5 w-4.5 text-indigo-600" />
                    <span>Банковские реквизиты карт эмитентов РФ/Мир</span>
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500">Номер банковской карты</label>
                    <input 
                      id="card-number"
                      type="text"
                      maxLength={19}
                      placeholder="4276 0000 1111 2222"
                      value={cardNumber}
                      onChange={(e) => {
                        // formats 4-digit steps
                        const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                        const matches = value.match(/\d{4,16}/g);
                        const match = (matches && matches[0]) || '';
                        const parts = [];
                        for (let i = 0, len = match.length; i < len; i += 4) {
                          parts.push(match.substring(i, i + 4));
                        }
                        if (parts.length > 0) {
                          setCardNumber(parts.join(' '));
                        } else {
                          setCardNumber(value);
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-white text-sm text-gray-900 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none transition font-mono"
                    />
                  </div>

                  {/* Exp and CVV grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-500">Срок (ММ/ГГ)</label>
                      <input 
                        id="card-expiry"
                        type="text"
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length >= 2) {
                            val = val.substring(0, 2) + '/' + val.substring(2, 4);
                          }
                          setCardExpiry(val);
                        }}
                        className="w-full px-3 py-1.5 bg-white text-sm text-gray-900 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none transition font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-500">CVV/CVC код</label>
                      <input 
                        id="card-cvv"
                        type="password"
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-1.5 bg-white text-sm text-gray-900 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  {/* Card holder */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500">Имя и Фамилия держателя (Латиница)</label>
                    <input 
                      id="card-name"
                      type="text"
                      placeholder="IVAN SMIRNOV"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 bg-white text-sm text-gray-900 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none transition font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Confirm Delivery Note */}
              <div className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/30 text-xs text-indigo-950 flex items-start space-x-2.5">
                <UserCheck className="h-5 w-5 shrink-0 text-indigo-600" />
                <div>
                  <h4 className="font-bold">Данные доставки:</h4>
                  <p className="mt-0.5 mt-1">{name}, {phone}</p>
                  <p>{address}, {city}, {postalCode}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition underline pl-1"
                >
                  Вернуться на шаг доставки
                </button>
                <button
                  id="payment-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-indigo-600 text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] shadow-md shadow-indigo-150 transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Формируем заказ...</span>
                    </div>
                  ) : (
                    <>
                      <span>Подтвердить покупку на ${totalPrice.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Right Side: Shared billing totals report panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-150 p-6 space-y-6">
          <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">Итоговый расчет</h3>
          
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Стоимость товаров ({cartItems.reduce((acc, c) => acc + c.quantity, 0)} шт.):</span>
              <span className="font-bold text-gray-900">${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Доставка курьером:</span>
              <span className="font-bold text-gray-900">
                {shippingPrice === 0 ? (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Бесплатно</span>
                ) : (
                  `$${shippingPrice.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Налоги (НДС 13%):</span>
              <span className="font-bold text-gray-900">${taxPrice.toFixed(2)}</span>
            </div>
            
            {shippingPrice > 0 && (
              <p className="text-[10px] text-gray-400 font-semibold bg-gray-50 p-2 rounded border border-gray-100 leading-normal">
                💡 Добавьте товаров еще на <span className="text-indigo-600 font-bold">${(150 - itemsPrice).toFixed(2)}</span>, чтобы получить бесплатную курьерскую доставку!
              </p>
            )}

            <div className="border-t border-gray-100 pt-3.5 flex justify-between font-black text-gray-900 text-sm">
              <span className="text-indigo-600">К оплате:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3 text-[10px] text-gray-400">
            <p className="flex items-center space-x-1.5 justify-center sm:justify-start">
              <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
              <span>Безопасное HTTPS/SSL шифрование данных</span>
            </p>
            <p className="flex items-center space-x-1.5 justify-center sm:justify-start">
              <MapPin className="h-3.5 w-3.5 text-indigo-500" />
              <span>Быстрое верифицирование транспортной накладной</span>
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
