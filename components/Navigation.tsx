
import React, { useState } from 'react';
import { NavItem, SiteIdentity } from '../types.ts';

interface NavigationProps {
  onNavigate: (view: any, params?: Record<string, string>) => void;
  cartCount: number;
  wishlistCount: number;
  currentView: string;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  navItems: NavItem[];
  siteIdentity: SiteIdentity;
  isLoggedIn?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
  onNavigate, cartCount, wishlistCount, currentView, 
  onOpenCart, onOpenSearch, navItems, siteIdentity, isLoggedIn 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeNavItems = navItems.filter(i => i.active).sort((a, b) => a.order - b.order);

  const handleItemClick = (item: NavItem) => {
    const type = item.link_type || 'view';
    const value = item.link_value || item.target_view;

    if (type === 'category') {
      onNavigate('shop', { category: value || '' });
    } else if (type === 'url') {
      if (value) window.open(value, '_blank');
    } else {
      // For 'view' type, if it's 'shop', we explicitly reset category to clear filters
      const params = value === 'shop' ? { category: '' } : undefined;
      onNavigate(value as any, params);
    }
    
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    onNavigate('home', { category: '' }); // Clear category when going home
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Left Group: Menu + Logo */}
          <div className="flex items-center space-x-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-600 hover:text-black transition-colors"
            >
              <i className="fa-solid fa-bars-staggered text-xl"></i>
            </button>

            <button 
              onClick={handleLogoClick}
              className="flex items-center"
            >
              {siteIdentity.logo_url ? (
                <img src={siteIdentity.logo_url} alt={siteIdentity.title} className="h-8 md:h-10 w-auto object-contain" />
              ) : (
                <span className="text-xl md:text-2xl font-black font-heading tracking-tighter italic">
                  {siteIdentity.title.toUpperCase().split('VAULT')[0]}<span className="text-red-600">VAULT</span>
                </span>
              )}
            </button>

            {/* Desktop Navigation Items */}
            <div className="hidden lg:flex items-center space-x-8 ml-8">
              {activeNavItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleItemClick(item)} 
                  className="text-[11px] font-bold text-gray-800 uppercase tracking-widest hover:text-red-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => onNavigate('order-tracking')} 
                className={`text-[11px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors ${currentView === 'order-tracking' ? 'text-red-600' : 'text-gray-800'}`}
              >
                Track Order
              </button>
            </div>
          </div>

          {/* Right Group: Icons */}
          <div className="flex items-center space-x-3 md:space-x-5">
            <button 
              onClick={onOpenSearch}
              className="text-gray-600 hover:text-black transition-colors"
              title="Search Products"
            >
              <i className="fa-solid fa-magnifying-glass text-lg"></i>
            </button>
            <button 
              onClick={() => onNavigate('customer')} 
              className={`${isLoggedIn ? 'text-red-600' : 'text-gray-600'} hover:text-black transition-colors`} 
              title={isLoggedIn ? "My Account" : "Sign In"}
            >
              <i className={`${isLoggedIn ? 'fa-solid' : 'fa-regular'} fa-user text-xl`}></i>
            </button>
            <button 
              onClick={onOpenCart}
              className="flex items-center space-x-2 border border-gray-200 px-2 md:px-3 py-1.5 rounded-sm hover:border-black transition-colors"
            >
              <i className="fa-solid fa-bag-shopping text-gray-800"></i>
              <span className="hidden sm:inline text-xs font-bold text-gray-800 italic">{cartCount} Items</span>
              <span className="sm:hidden text-xs font-bold text-gray-800">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMobileMenuOpen(false)} 
      />
      <div className={`fixed left-0 top-0 h-screen w-full max-w-[280px] bg-white z-[70] transition-transform duration-500 transform lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full shadow-2xl">
          <div className="p-8 bg-black text-white flex justify-between items-center">
            <span className="text-xl font-black font-heading tracking-tighter italic">
              Menu
            </span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="hover:rotate-90 transition-transform">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-4">
              <p className="text-red-600 text-[9px] font-black uppercase tracking-[0.4em] italic mb-6">Navigation</p>
              {activeNavItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-left text-lg font-black uppercase italic tracking-tight hover:text-red-600 transition-colors flex justify-between items-center group"
                >
                  {item.label}
                  <i className="fa-solid fa-arrow-right-long opacity-0 group-hover:opacity-100 transition-opacity text-sm"></i>
                </button>
              ))}
              <button 
                onClick={() => { onNavigate('order-tracking'); setIsMobileMenuOpen(false); }}
                className="w-full text-left text-lg font-black uppercase italic tracking-tight hover:text-red-600 transition-colors flex justify-between items-center group"
              >
                Track Order
                <i className="fa-solid fa-satellite-dish opacity-100 text-sm"></i>
              </button>
            </div>

            <div className="pt-8 border-t border-gray-100 space-y-4">
               <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.4em] italic mb-6">User Options</p>
               <button 
                 onClick={() => { onNavigate('customer'); setIsMobileMenuOpen(false); }}
                 className="w-full text-left text-xs font-black uppercase tracking-widest flex items-center gap-3"
               >
                 <i className={`${isLoggedIn ? 'fa-solid text-red-600' : 'fa-regular text-gray-400'} fa-circle-user`}></i>
                 {isLoggedIn ? "My Account" : "Sign In"}
               </button>
               <button 
                 onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                 className="w-full text-left text-xs font-black uppercase tracking-widest flex items-center gap-3"
               >
                 <i className="fa-solid fa-shield-halved text-red-600"></i>
                 Admin Dashboard
               </button>
               <button 
                 onClick={() => { onOpenSearch(); setIsMobileMenuOpen(false); }}
                 className="w-full text-left text-xs font-black uppercase tracking-widest flex items-center gap-3"
               >
                 <i className="fa-solid fa-magnifying-glass text-red-600"></i>
                 Search Products
               </button>
            </div>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-100">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Store Status: Online
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
