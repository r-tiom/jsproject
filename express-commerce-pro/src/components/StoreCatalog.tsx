import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Info, Check, CornerDownRight, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface StoreCatalogProps {
  category: string;
  onCategorySelect: (category: string) => void;
  search: string;
}

export default function StoreCatalog({ category, onCategorySelect, search }: StoreCatalogProps) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

  // Categories list
  const categories = ['Все', 'Electronics', 'Clothing', 'Home & Living', 'Books'];
  const categoryDisplayNames: Record<string, string> = {
    'Все': 'Все товары',
    'Electronics': 'Электроника',
    'Clothing': 'Одежда',
    'Home & Living': 'Для дома',
    'Books': 'Книги'
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category && category !== 'Все') {
          queryParams.append('category', category);
        }
        if (search) {
          queryParams.append('search', search);
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 150); // slight debounce for search

    return () => clearTimeout(timer);
  }, [category, search]);

  const handleOpenDetail = (prod: Product) => {
    setSelectedProduct(prod);
    setQuantity(1);
  };

  const handleAddToCart = (product: Product, count: number) => {
    addToCart(product, count);
    
    // Animate visual notification
    setAddedFeedback(product.id);
    setTimeout(() => {
      setAddedFeedback(null);
    }, 1800);

    if (selectedProduct) {
      // If adding from detail modal, close modal or show feedback inside
      setSelectedProduct(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Category Navigation Bar */}
      <div className="flex flex-wrap items-center justify-center space-x-2 border-b border-gray-100 pb-6 mb-8 gap-y-2">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`cat-tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => onCategorySelect(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-150'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            {categoryDisplayNames[cat] || cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-gray-500">Загрузка каталога AuraShop...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <span className="text-gray-400 font-medium">Товары не найдены. Попробуйте изменить параметры поиска или категории.</span>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => {
            const isOutOfStock = product.countInStock === 0;
            const isLowStock = product.countInStock > 0 && product.countInStock <= 5;
            
            return (
              <div 
                key={product.id} 
                id={`product-card-${product.id}`}
                className="group relative flex flex-col bg-white rounded-2xl border border-gray-150 overflow-hidden hover:shadow-lg hover:shadow-gray-100 transition duration-300"
              >
                
                {/* Image Wrap */}
                <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-500"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-black text-white text-[10px] tracking-widest uppercase font-bold px-3 py-1.5 rounded-lg border border-gray-700">
                        Распродано
                      </span>
                    </div>
                  )}
                  {isLowStock && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      Мало в наличии: {product.countInStock} шт.
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-gray-100">
                    {product.category}
                  </span>
                </div>

                {/* Info and action panel */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed h-8">
                      {product.description}
                    </p>
                    
                    {/* Stars row */}
                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating || 5) ? 'fill-amber-500' : 'text-gray-200'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          ({product.numReviews || 0})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    {/* Price */}
                    <span className="text-base font-black text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>

                    {/* Button set */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        id={`prod-info-btn-${product.id}`}
                        onClick={() => handleOpenDetail(product)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg border border-gray-100 hover:border-indigo-100 transition"
                        title="Подробнее"
                      >
                        <Info className="h-4.5 w-4.5" />
                      </button>

                      <button
                        id={`prod-add-btn-${product.id}`}
                        onClick={() => handleAddToCart(product, 1)}
                        disabled={isOutOfStock}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                          addedFeedback === product.id
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none'
                        }`}
                      >
                        {addedFeedback === product.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Добавлено!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>В корзину</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Lightbox Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            id="product-detail-container"
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
          >
            
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column: Image Area */}
              <div className="relative bg-gray-50 aspect-square md:aspect-auto md:h-full min-h-[300px]">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <button
                  id="detail-close-btn"
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-md text-gray-700 hover:text-indigo-600 rounded-full border border-gray-100 cursor-pointer shadow-sm transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Right Column: Descriptions & Purchase controllers */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  {/* Tags */}
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-indigo-100">
                      {selectedProduct.category}
                    </span>
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-400 hover:text-gray-900 font-semibold text-xs"
                    >
                      Закрыть
                    </button>
                  </div>

                  <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
                    {selectedProduct.name}
                  </h2>

                  {/* Rating Stars */}
                  {selectedProduct.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(selectedProduct.rating || 5) ? 'fill-amber-500' : 'text-gray-200'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-500">
                        {selectedProduct.rating.toFixed(2)} • ({selectedProduct.numReviews} отзывов)
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-gray-500 leading-relaxed text-left">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-4">
                  
                  {/* Stock Status Indicator */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Доступность:</span>
                    {selectedProduct.countInStock > 0 ? (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        В наличии: {selectedProduct.countInStock} шт.
                      </span>
                    ) : (
                      <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded">
                        Временно отсутствует в магазине
                      </span>
                    )}
                  </div>

                  {selectedProduct.countInStock > 0 && (
                    /* Counter input controllers */
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-semibold">Количество:</span>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          id="qty-minus"
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition"
                        >
                          -
                        </button>
                        <span className="px-3 text-sm font-bold text-gray-900 min-w-[24px] text-center">
                          {quantity}
                        </span>
                        <button
                          id="qty-plus"
                          type="button"
                          onClick={() => setQuantity(Math.min(selectedProduct.countInStock, quantity + 1))}
                          className="px-3 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add action */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-gray-400">Общая стоимость:</span>
                      <span className="text-xl font-black text-gray-900">
                        ${(selectedProduct.price * quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      id="detail-add-cart-btn"
                      onClick={() => handleAddToCart(selectedProduct, quantity)}
                      disabled={selectedProduct.countInStock === 0}
                      className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow-md shadow-indigo-150 disabled:shadow-none transition cursor-pointer"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Добавить {(quantity > 1) ? `${quantity} шт.` : ''} в корзину</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
