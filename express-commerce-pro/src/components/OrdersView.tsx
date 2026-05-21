import { useState, useEffect } from 'react';
import { History, Calendar, Package, ArrowRight, CornerDownRight, Clock, ShieldAlert } from 'lucide-react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';

interface OrdersViewProps {
  onViewChange: (view: 'catalog' | 'cart' | 'checkout' | 'orders' | 'profile' | 'admin') => void;
}

export default function OrdersView({ onViewChange }: OrdersViewProps) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      setLoading(false);
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch('/api/orders/myorders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error loading my orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [token]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const statusLabelRu = (status: string) => {
    switch (status) {
      case 'Pending': return 'В обработке';
      case 'Shipped': return 'Отправлен';
      case 'Delivered': return 'Доставлен';
      case 'Cancelled': return 'Отменен';
      default: return status;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      <div className="flex items-center space-x-2.5 border-b border-gray-100 pb-5 mb-8">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900 leading-none">История Заказов</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Отслеживайте статус ваших покупок</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-gray-500">Загружаем список ваших заказов...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 space-y-4">
          <p className="text-sm text-gray-500 font-medium">Вы еще не оформляли заказов в нашем магазине.</p>
          <button
            onClick={() => onViewChange('catalog')}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-150 transition cursor-pointer"
          >
            К Покупкам!
          </button>
        </div>
      ) : (
        /* Split orders overview or details modal representation */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Order list area */}
          <div className="lg:col-span-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                id={`user-order-${order.id}`}
                onClick={() => setSelectedOrder(order)}
                className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 relative ${
                  selectedOrder?.id === order.id
                    ? 'border-indigo-500 bg-indigo-50/5/30 shadow-md shadow-indigo-50/20'
                    : 'border-gray-150 bg-white hover:bg-gray-50/40 hover:shadow-sm'
                }`}
              >
                
                {/* ID & Date */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs text-indigo-600 font-extrabold">{order.id}</span>
                    <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase space-x-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                    {statusLabelRu(order.status)}
                  </span>
                </div>

                {/* Items Summaries */}
                <div className="flex items-center space-x-2 overflow-hidden py-1">
                  {order.orderItems.slice(0, 3).map((item, i) => (
                    <img
                      key={item.id || i}
                      src={item.product?.image}
                      alt={item.product?.name}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 object-cover rounded-lg bg-gray-100 border border-gray-100 shrink-0"
                      title={item.product?.name}
                    />
                  ))}
                  {order.orderItems.length > 3 && (
                    <span className="h-9 w-9 rounded-lg bg-gray-100 border border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500 shrink-0">
                      +{order.orderItems.length - 3}
                    </span>
                  )}
                </div>

                {/* Totals panel */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <span className="text-xs text-gray-400">
                    Итого товаров: <span className="font-semibold text-gray-700">{order.orderItems.reduce((acc, c) => acc + c.quantity, 0)} шт.</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-black text-gray-900">${order.totalPrice.toFixed(2)}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Detailed Side Viewer Area */}
          <div className="lg:col-span-6">
            {selectedOrder ? (
              <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-6">
                
                {/* Mini details top */}
                <div className="space-y-1.5 pb-4 border-b border-gray-100">
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">Детали по заказу</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-black text-indigo-600">{selectedOrder.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusStyle(selectedOrder.status)}`}>
                      {statusLabelRu(selectedOrder.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Дата создания: {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>

                {/* Items detailed layout grid */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                    <Package className="h-4 w-4 text-indigo-500" />
                    <span>Позиции заказа:</span>
                  </span>
                  
                  <ul className="divide-y divide-gray-50 max-h-[220px] overflow-y-auto pr-1">
                    {selectedOrder.orderItems.map((item) => (
                      <li key={item.id} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img 
                            src={item.product?.image} 
                            alt={item.product?.name} 
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 object-cover rounded-lg bg-gray-50 border border-gray-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 truncate max-w-[180px] sm:max-w-xs">{item.product?.name}</h4>
                            <p className="text-[10px] text-gray-400">{item.quantity} шт. x ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Addresses and payment summaries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs text-left">
                  <div className="space-y-1.5 p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                    <h5 className="font-bold text-gray-700">Адрес доставки:</h5>
                    <p className="text-gray-500 leading-relaxed font-semibold">
                      {selectedOrder.shippingAddress}, {selectedOrder.shippingCity}
                    </p>
                    <p className="text-gray-400">Телефон: {selectedOrder.shippingPhone}</p>
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                    <h5 className="font-bold text-gray-700">Оплата и статус:</h5>
                    <p className="text-gray-500 font-semibold leading-relaxed">
                      Метод: {selectedOrder.paymentMethod === 'Card' ? 'Картой на сайте' : 'Курьеру при получении'}
                    </p>
                    <p className="flex items-center space-x-1 font-semibold">
                      <span>Статус:</span>
                      {selectedOrder.isPaid ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded">Оплачен</span>
                      ) : (
                        <span className="text-red-700 font-bold bg-red-50 px-1 py-0.2 rounded">Ожидает оплаты</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Billing Summary Invoices */}
                <div className="p-4 border-t border-gray-100 text-xs space-y-2.5">
                  <div className="flex justify-between text-gray-500">
                    <span>Сумма товаров:</span>
                    <span className="font-semibold text-gray-950">${selectedOrder.itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Доставка:</span>
                    <span className="font-semibold text-gray-950">
                      {selectedOrder.shippingPrice === 0 ? 'Бесплатно' : `$${selectedOrder.shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Налоги:</span>
                    <span className="font-semibold text-gray-950">${selectedOrder.taxPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-dashed border-gray-200 pt-2.5 flex justify-between font-black text-sm text-gray-900">
                    <span className="text-indigo-600">Всего к оплате:</span>
                    <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-gray-50/40 rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400 space-y-2.5">
                <Clock className="h-10 w-10 text-gray-300 mx-auto" />
                <h4 className="font-semibold text-sm text-gray-650">Заказ не выбран</h4>
                <p className="text-xs max-w-xs mx-auto">
                  Выберите любой заказ из списка слева, чтобы посмотреть его позиции, адрес доставки и финансовый расчет.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
