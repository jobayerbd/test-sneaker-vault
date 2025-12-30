import React from 'react';

interface NavigationProps {
  onNavigate: (view: 'home' | 'shop' | 'admin' | 'cart' | 'wishlist') => void;
  cartCount: number;
  wishlistCount: number;
  currentView: string;
  onOpenCart: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onNavigate, cartCount, wishlistCount, currentView, onOpenCart }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center"
          >
            <span className="text-2xl font-black font-heading tracking-tighter italic">
              SNEAKER<span className="text-red-600">VAULT</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-10">
            <button onClick={() => onNavigate('shop')} className="text-[11px] font-bold text-gray-800 uppercase tracking-widest hover:text-red-600">Men <i className="fa-solid fa-chevron-down text-[8px] ml-1"></i></button>
            <button className="text-[11px] font-bold text-gray-800 uppercase tracking-widest hover:text-red-600">Women <i className="fa-solid fa-chevron-down text-[8px] ml-1"></i></button>
            <button className="text-[11px] font-bold text-gray-800 uppercase tracking-widest hover:text-red-600">Accessories</button>
            <button className="text-[11px] font-bold text-gray-800 uppercase tracking-widest hover:text-red-600">Drops</button>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <button className="text-gray-600 hover:text-black"><i className="fa-solid fa-magnifying-glass text-lg"></i></button>
            <button onClick={() => onNavigate('admin')} className="text-gray-600 hover:text-black"><i className="fa-regular fa-user text-xl"></i></button>
            <button onClick={() => onNavigate('wishlist')} className="text-gray-600 hover:text-black relative">
              <i className="fa-regular fa-heart text-xl"></i>
              {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1 rounded-full">{wishlistCount}</span>}
            </button>
            <button 
              onClick={onOpenCart}
              className="flex items-center space-x-2 border border-gray-200 px-3 py-1.5 rounded-sm hover:border-black transition-colors"
            >
              <i className="fa-solid fa-bag-shopping text-gray-800"></i>
              <span className="text-xs font-bold text-gray-800 italic">{cartCount} Secured</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;