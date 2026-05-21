/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import StoreCatalog from './components/StoreCatalog';
import CheckoutView from './components/CheckoutView';
import OrdersView from './components/OrdersView';
import ProfileView from './components/ProfileView';
import AdminPanel from './components/AdminPanel';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'catalog' | 'cart' | 'checkout' | 'orders' | 'profile' | 'admin'>('catalog');
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  // Guard routing permissions and view modifiers
  const navigateToView = (view: typeof currentView) => {
    if (view === 'admin') {
      if (user?.role !== 'admin') {
        setCurrentView('catalog');
        return;
      }
    }
    
    // reset search on moving around views
    if (view !== 'catalog') {
      setSearchValue('');
    }
    
    setCurrentView(view);
    
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 selection:bg-indigo-600 selection:text-white antialiased">
      <Navbar 
        onSearchChange={setSearchValue}
        searchValue={searchValue}
        onViewChange={navigateToView}
        currentView={currentView}
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-grow animate-fade-in pb-16">
        {/* Render catalog */}
        {currentView === 'catalog' && (
          <StoreCatalog 
            category={selectedCategory}
            onCategorySelect={setSelectedCategory}
            search={searchValue}
          />
        )}

        {/* Render dynamic checkout/cart */}
        {(currentView === 'cart' || currentView === 'checkout') && (
          <CheckoutView 
            onViewChange={navigateToView}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Render personal account views */}
        {currentView === 'orders' && (
          <OrdersView onViewChange={navigateToView} />
        )}

        {currentView === 'profile' && (
          <ProfileView />
        )}

        {/* Render admin section */}
        {currentView === 'admin' && (
          <AdminPanel />
        )}
      </main>

      <Footer 
        onCategorySelect={setSelectedCategory}
        onViewChange={navigateToView}
      />

      {/* Auth lightbox Popup modal */}
      <AuthModal 
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

