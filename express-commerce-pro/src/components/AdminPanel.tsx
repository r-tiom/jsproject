import { useState, useEffect, FormEvent } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Coins, TrendingUp, Plus, Edit3, Trash2, Eye, Truck, Check, RefreshCw } from 'lucide-react';
import { Product, Order, DashboardStats, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { token } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders'>('stats');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Edit Product Form Models
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Electronics');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodError, setProdError] = useState<string | null>(null);

  // Selected order details viewer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const authHeaders = { 'Authorization': `Bearer ${token}` };

      // 1. Stats
      const resStats = await fetch('/api/admin/stats', { headers: authHeaders });
      if (resStats.ok) {
        const statsData = await resStats.json();
        setStats(statsData);
      }

      // 2. Products
      const resProds = await fetch('/api/products');
      if (resProds.ok) {
        const prodsData = await resProds.json();
        setProductsList(prodsData);
      }

      // 3. Orders
      const resOrders = await fetch('/api/orders', { headers: authHeaders });
      if (resOrders.ok) {
        const ordersData = await resOrders.json();
        setOrdersList(ordersData);
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProductCreate = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('Electronics');
    setProdPrice('');
    setProdStock('');
    setProdImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80'); // nice default red sneakers if empty
    setProdDesc('');
    setProdError(null);
    setShowProductModal(true);
  };

  const handleOpenProductEdit = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.price.toString());
    setProdStock(prod.countInStock.toString());
    setProdImage(prod.image);
    setProdDesc(prod.description);
    setProdError(null);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProdError(null);

    if (!prodName.trim() || !prodPrice || !prodStock || !prodImage.trim() || !prodDesc.trim()) {
      setProdError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const payload = {
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      countInStock: Number(prodStock),
      image: prodImage,
      description: prodDesc
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        setProdError(data.message || 'Ошибка обработки формы товара');
        return;
      }

      // Refresh database records
      await fetchAdminData();
      setShowProductModal(false);
    } catch (err) {
      setProdError('Ошибка сетевого соединения с интерфейсом магазина');
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!window.confirm('Вы действительно желаете удалить этот товар?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleOrderAction = async (orderId: string, updates: { status?: OrderStatus; isPaid?: boolean; isDelivered?: boolean }) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        // Update local viewer and list
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updated);
        }
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Order status update error:', err);
    }
  };

  const russianStatus = (status: string) => {
    switch (status) {
      case 'Pending': return 'В обработке';
      case 'Shipped': return 'Отправлен';
      case 'Delivered': return 'Доставлен';
      case 'Cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Header and Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5 mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
            <LayoutDashboard className="h-5.5 w-5.5 text-indigo-600" />
            <span>Панель Администратора</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Система управления магазином AuraShop</p>
        </div>

        {/* Dashboard Tabs Controllers */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl space-x-1.5 mt-4 md:mt-0">
          <button
            id="tab-admin-stats"
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeTab === 'stats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            Статистика
          </button>
          <button
            id="tab-admin-products"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeTab === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            Товары ({productsList.length})
          </button>
          <button
            id="tab-admin-orders"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            Заказы ({ordersList.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-gray-500">Подключение к БД AuraShop...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: STATISTICS DASHBOARD */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-8 animate-slide-in">
              {/* Core Indicators Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-gray-150 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Выручка (Оплачено)</span>
                    <span className="text-xl font-extrabold text-gray-900">${stats.totalSales.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-5 bg-white border border-gray-150 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Общее число заказов</span>
                    <span className="text-xl font-extrabold text-gray-900">{stats.totalOrders} шт.</span>
                  </div>
                </div>

                <div className="p-5 bg-white border border-gray-150 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Активный каталог</span>
                    <span className="text-xl font-extrabold text-gray-900">{stats.totalProducts} поз.</span>
                  </div>
                </div>

                <div className="p-5 bg-white border border-gray-150 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Пользователи в БД</span>
                    <span className="text-xl font-extrabold text-gray-900">{stats.totalUsers} чел.</span>
                  </div>
                </div>
              </div>

              {/* Graphical analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* SVG Column Bars widget */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-150 p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center space-x-1.5">
                      <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
                      <span>Динамика продаж по месяцам</span>
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center">
                      +10.4% в этом месяце
                    </span>
                  </div>

                  {/* Pure SVG graphical component */}
                  <div className="h-56 w-full flex items-end justify-around pt-6 px-4">
                    {stats.monthlySales.map((item, index) => {
                      // Normalize heights (max height is 140px)
                      const maxSales = Math.max(...stats.monthlySales.map(m => m.sales), 100);
                      const barHeight = (item.sales / maxSales) * 140;
                      return (
                        <div key={index} className="flex flex-col items-center flex-1 max-w-[60px] group relative h-full justify-end">
                          
                          {/* Tooltip on Hover */}
                          <div className="absolute top-0 bg-gray-900 text-white font-mono text-[9px] px-2 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0 duration-200">
                            ${item.sales.toFixed(1)}
                          </div>

                          {/* Decorative Column Bar */}
                          <div 
                            style={{ height: `${Math.max(barHeight, 5)}px` }}
                            className="w-8 bg-gradient-to-t from-indigo-650 to-indigo-500 hover:from-indigo-600 hover:to-indigo-400 rounded-t-md shadow-xs shadow-indigo-100 group-hover:scale-x-105 transition-all duration-300" 
                          />
                          
                          {/* Label under bar */}
                          <span className="text-[10px] font-bold text-gray-500 mt-2 font-mono">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Categories Breakdown */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-150 p-6 space-y-5">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest pb-3 border-b border-gray-100">
                    Рейтинг категорий (выручка)
                  </h4>
                  
                  <div className="space-y-4">
                    {Object.keys(stats.salesByCategory).map((cat, idx) => {
                      const totalC = (Object.values(stats.salesByCategory) as number[]).reduce((a, b) => a + b, 0) || 1;
                      const ratio = ((stats.salesByCategory[cat] || 0) / totalC) * 100;
                      
                      const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
                      const curC = colors[idx % colors.length];

                      return (
                        <div key={cat} className="space-y-1.5 text-xs text-left">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-700">{cat}</span>
                            <span className="text-gray-900">${stats.salesByCategory[cat].toFixed(1)} ({ratio.toFixed(0)}%)</span>
                          </div>
                          
                          {/* Progress Line */}
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${ratio}%` }} 
                              className={`h-full rounded-full ${curC}`} 
                            />
                          </div>
                        </div>
                      );
                    })}
                    {Object.keys(stats.salesByCategory).length === 0 && (
                      <p className="text-xs text-gray-400">Пока нет завершенных оплаченных продаж для вычисления категорий.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Mini Table with recent 5 orders */}
              <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden text-left">
                <div className="p-5 border-b border-gray-100 font-bold text-xs uppercase tracking-widest text-gray-800">
                  Последние 5 заказов магазина
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-550 border-b border-gray-100 font-bold">
                      <tr>
                        <th className="p-3 text-left">Заказ</th>
                        <th className="p-3 text-left">Клиент</th>
                        <th className="p-3 text-left">Дата</th>
                        <th className="p-3 text-left">Сумма</th>
                        <th className="p-3 text-left">Статус</th>
                        <th className="p-3 text-left">Оплата</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.recentOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-mono text-indigo-600 font-bold">{order.id}</td>
                          <td className="p-3">
                            <p className="font-semibold text-gray-900">{order.userName}</p>
                            <p className="text-[10px] text-gray-400">{order.userEmail}</p>
                          </td>
                          <td className="p-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                          <td className="p-3 font-bold text-gray-900">${order.totalPrice.toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${getStatusBg(order.status)}`}>
                              {russianStatus(order.status)}
                            </span>
                          </td>
                          <td className="p-3 text-xs">
                            {order.isPaid ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Да</span>
                            ) : (
                              <span className="text-red-700 font-bold bg-red-50 px-1.5 py-0.5 rounded">Нет</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-slide-in text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pl-3 border-l-4 border-l-indigo-600">
                  Весь ассортимент верифицированных товаров
                </h3>
                
                <button
                  id="admin-add-product-btn"
                  onClick={handleOpenProductCreate}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-indigo-150 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Добавить товар</span>
                </button>
              </div>

              {/* Product list Table */}
              <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                      <tr>
                        <th className="p-3.5 text-left">Фото</th>
                        <th className="p-3.5 text-left">Название товара</th>
                        <th className="p-3.5 text-left">Категория</th>
                        <th className="p-3.5 text-left">Цена</th>
                        <th className="p-3.5 text-left">Наличие</th>
                        <th className="p-3.5 text-center">Оценки</th>
                        <th className="p-3.5 text-center">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {productsList.map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50/50">
                          <td className="p-3">
                            <img 
                              src={prod.image} 
                              alt={prod.name} 
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 object-cover rounded-lg bg-gray-50 border border-gray-100 shrink-0"
                            />
                          </td>
                          <td className="p-3 min-w-[180px]">
                            <p className="font-bold text-gray-900">{prod.name}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">{prod.description}</p>
                          </td>
                          <td className="p-3 text-gray-550 font-medium">{prod.category}</td>
                          <td className="p-3 font-semibold text-gray-900">${prod.price.toFixed(2)}</td>
                          <td className="p-3">
                            {prod.countInStock === 0 ? (
                              <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded font-semibold text-[10px]">Отсутствует</span>
                            ) : prod.countInStock <= 5 ? (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold text-[10px]">Мало ({prod.countInStock} шт.)</span>
                            ) : (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">{prod.countInStock} шт.</span>
                            )}
                          </td>
                          <td className="p-3 text-center text-gray-500 font-bold font-mono">
                            ★ {prod.rating?.toFixed(1) || '5.0'}
                          </td>
                          <td className="p-3 font-medium text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                id={`edit-prod-${prod.id}`}
                                onClick={() => handleOpenProductEdit(prod)}
                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition"
                                title="Редактировать товар"
                              >
                                <Edit3 className="h-4.5 w-4.5" />
                              </button>
                              <button
                                id={`del-prod-${prod.id}`}
                                onClick={() => handleProductDelete(prod.id)}
                                className="p-1.5 text-gray-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition"
                                title="Удалить товар"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER WORKFLOW CONTROL */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-slide-in grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
              
              {/* Order list column left */}
              <div className="lg:col-span-6 bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-gray-100 font-bold text-xs uppercase tracking-widest text-gray-800">
                  Все зафиксированные заказы клиентов
                </div>
                
                <ul className="divide-y divide-gray-100">
                  {ordersList.map((ord) => (
                    <li
                      key={ord.id}
                      id={`order-row-admin-${ord.id}`}
                      onClick={() => setSelectedOrder(ord)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition ${
                        selectedOrder?.id === ord.id ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-gray-950">{ord.id}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase tracking-widest ${getStatusBg(ord.status)}`}>
                            {russianStatus(ord.status)}
                          </span>
                        </div>
                        <p className="font-bold text-gray-800 text-xs">{ord.userName}</p>
                        <p className="text-[10px] text-gray-400">Сумма: <span className="font-semibold text-gray-800">${ord.totalPrice.toFixed(2)}</span></p>
                      </div>

                      <div className="text-right text-[10px] text-gray-400 font-mono flex items-center space-x-1">
                        <span>Детали</span>
                        <Eye className="h-3.5 w-3.5" />
                      </div>
                    </li>
                  ))}
                  {ordersList.length === 0 && (
                    <li className="p-10 text-center text-xs text-gray-400">История заказов пуста.</li>
                  )}
                </ul>
              </div>

              {/* Order details control center right */}
              <div className="lg:col-span-6">
                {selectedOrder ? (
                  <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-6 animate-slide-in">
                    
                    {/* ID and info */}
                    <div className="border-b border-gray-100 pb-4 space-y-1.5">
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Контроль логистического процесса</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-indigo-650">{selectedOrder.id}</span>
                        <div className="flex items-center space-x-1">
                          {selectedOrder.isPaid ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">Оплачен</span>
                          ) : (
                            <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded text-xs">Не оплачен</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Покупатель: <span className="font-semibold text-gray-800">{selectedOrder.userName} ({selectedOrder.userEmail})</span>
                      </p>
                    </div>

                    {/* Quick controls status selector */}
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                        <Truck className="h-4.5 w-4.5 text-indigo-500" />
                        <span>Изменить статус доставки по БД:</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                        <button
                          id="btn-status-pending"
                          onClick={() => handleOrderAction(selectedOrder.id, { status: 'Pending' })}
                          className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                            selectedOrder.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-100'
                          }`}
                        >
                          В обработку
                        </button>
                        <button
                          id="btn-status-shipped"
                          onClick={() => handleOrderAction(selectedOrder.id, { status: 'Shipped' })}
                          className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                            selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-100'
                          }`}
                        >
                          Отгрузить
                        </button>
                        <button
                          id="btn-status-delivered"
                          onClick={() => handleOrderAction(selectedOrder.id, { isDelivered: true, status: 'Delivered' })}
                          className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                            selectedOrder.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-100'
                          }`}
                        >
                          Доставить
                        </button>
                        <button
                          id="btn-status-cancelled"
                          onClick={() => handleOrderAction(selectedOrder.id, { status: 'Cancelled' })}
                          className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                            selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-100'
                          }`}
                        >
                          Отменить
                        </button>
                      </div>

                      {/* Payment force control */}
                      {!selectedOrder.isPaid && (
                        <div className="pt-2 border-t border-gray-150 flex items-center justify-between text-xs">
                          <span className="text-gray-400 font-bold">Оплата наличными получена?</span>
                          <button
                            id="btn-status-pay-confirm"
                            onClick={() => handleOrderAction(selectedOrder.id, { isPaid: true })}
                            className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Подтвердить оплату</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Shipping contacts */}
                    <div className="text-xs space-y-2 p-3 bg-gray-50/40 rounded-xl border border-gray-100">
                      <p className="font-bold text-gray-700">Полный адрес получателя:</p>
                      <p className="text-gray-500">{selectedOrder.shippingAddress}, {selectedOrder.shippingCity}, {selectedOrder.shippingPostalCode}</p>
                      <p className="text-gray-400">Контакты: <span className="font-semibold text-gray-800">{selectedOrder.shippingPhone}</span></p>
                    </div>

                    {/* Table items inside order */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-gray-700">Перечень заказанных позиций:</h5>
                      <ul className="divide-y divide-gray-50 border border-gray-100 rounded-xl max-h-[160px] overflow-y-auto p-2">
                        {selectedOrder.orderItems.map((item) => (
                          <li key={item.id} className="py-2.5 flex items-center justify-between text-xs px-2">
                            <span className="font-semibold text-gray-800">{item.product?.name} ({item.quantity} шт.)</span>
                            <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sub totals */}
                    <div className="text-xs border-t border-gray-100 pt-4 flex justify-between items-center font-black">
                      <span className="text-indigo-600">Сумма заказа с налогом:</span>
                      <span className="text-gray-900 text-sm">${selectedOrder.totalPrice.toFixed(2)}</span>
                    </div>

                  </div>
                ) : (
                  <div className="bg-gray-50/40 rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400 space-y-2.5">
                    <History className="h-10 w-10 text-gray-300 mx-auto" />
                    <h4 className="font-semibold text-sm text-gray-650">Заказ не выбран</h4>
                    <p className="text-xs max-w-xs mx-auto">
                      Пожалуйста, выберите любой заказ из реестра слева, чтобы открыть панель контроля за его логистикой и оплатой.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT PRODUCT LIGHTBOX MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-100">
              <span className="font-bold text-gray-950 flex items-center space-x-1.5">
                <Package className="h-5 w-5 text-indigo-500" />
                <span>{editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}</span>
              </span>
              <button 
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-800 p-1 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              
              {prodError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs">
                  <span>{prodError}</span>
                </div>
              )}

              {/* Title Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Название товара *</label>
                <input
                  id="prod-form-name"
                  type="text"
                  required
                  placeholder="Вангуард Смарт-часы"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 text-sm text-gray-900 border border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl transition"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Категория *</label>
                <select
                  id="prod-form-cat"
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 text-sm text-gray-900 border border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl transition cursor-pointer"
                >
                  <option value="Electronics">Electronics (Электроника)</option>
                  <option value="Clothing">Clothing (Одежда)</option>
                  <option value="Home & Living">Home & Living (Для дома)</option>
                  <option value="Books">Books (Книги)</option>
                </select>
              </div>

              {/* Price and Stock double layout */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Цена в USD *</label>
                  <input
                    id="prod-form-price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="119.50"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 text-sm text-gray-900 border border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Остаток на складе *</label>
                  <input
                    id="prod-form-stock"
                    type="number"
                    min="0"
                    required
                    placeholder="15"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 text-sm text-gray-900 border border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl transition"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Ссылка на изображение товара *</label>
                <input
                  id="prod-form-image"
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 text-xs text-gray-950 font-mono border border-gray-200 focus:border-indigo-500 focus:outline-none rounded-lg transition"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Полное детализированное описание товара *</label>
                <textarea
                  id="prod-form-desc"
                  rows={3}
                  required
                  placeholder="Опишите технические свойства товара..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 text-sm text-gray-900 border border-gray-200 focus:border-indigo-500 focus:outline-none rounded-xl transition resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl transition"
                >
                  Отмена
                </button>
                <button
                  id="prod-form-submit"
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold rounded-xl shadow-md shadow-indigo-150 transition cursor-pointer"
                >
                  {editingProduct ? 'Сохранить изменения' : 'Добавить в каталог'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
