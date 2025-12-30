
import React from 'react';

interface NavigationProps {
  onNavigate: (view: 'home' | 'shop' | 'admin' | 'cart' | 'wishlist') => void;
  cartCount: number;
  wishlistCount: number;
  currentView: string;
}

const Navigation: React.FC<NavigationProps> = ({ onNavigate, cartCount, wishlistCount, currentView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="text-2xl font-black font-heading tracking-tighter flex items-center space-x-2"
            >
              <i className="fa-solid fa-bolt text-red-600"></i>
              <span>SNEAKER<span className="text-red-600">VAULT</span></span>
            </button>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <button onClick={() => onNavigate('shop')} className={`text-sm font-semibold ${currentView === 'shop' ? 'text-red-600' : 'text-gray-900 hover:text-red-600'}`}>SHOP</button>
              <button className="text-sm font-semibold text-gray-900 hover:text-red-600">DROPS</button>
              <button className="text-sm font-semibold text-gray-900 hover:text-red-600">BRANDS</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onNavigate('admin')}
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 border border-black rounded hover:bg-black hover:text-white transition-colors ${currentView === 'admin' ? 'bg-black text-white' : ''}`}
            >
              Admin
            </button>
            
            <button onClick={() => onNavigate('wishlist')} className="relative p-2">
              <i className={`fa-heart text-xl ${wishlistCount > 0 ? 'fa-solid text-red-500' : 'fa-regular text-gray-800'}`}></i>
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button onClick={() => onNavigate('cart')} className="relative p-2">
              <i className="fa-solid fa-bag-shopping text-xl text-gray-800"></i>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="hidden sm:block">
              <i className="fa-regular fa-user text-xl text-gray-800"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
