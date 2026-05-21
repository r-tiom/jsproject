import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  cartItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('store_cart_items');
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cached cart items:', e);
      }
    }
  }, []);

  // Sync to localStorage
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('store_cart_items', JSON.stringify(items));
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const existing = cartItems.find(item => item.product.id === product.id);
    if (existing) {
      const newQty = existing.quantity + quantity;
      // Guard against stock
      const finalQty = Math.min(newQty, product.countInStock);
      updateQuantity(product.id, finalQty);
    } else {
      const finalQty = Math.min(quantity, product.countInStock);
      if (finalQty > 0) {
        saveCart([...cartItems, { product, quantity: finalQty }]);
      }
    }
  };

  const removeFromCart = (productId: string) => {
    const nextItems = cartItems.filter(item => item.product.id !== productId);
    saveCart(nextItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const nextItems = cartItems.map(item => {
      if (item.product.id === productId) {
        const checkedQty = Math.max(1, Math.min(quantity, item.product.countInStock));
        return { ...item, quantity: checkedQty };
      }
      return item;
    });
    saveCart(nextItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Pricing math constants
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingPrice = itemsPrice === 0 ? 0 : itemsPrice > 150 ? 0 : 15; // Free over $150
  const taxPrice = itemsPrice * 0.13; // 13% average tax/VAT
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      cartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
