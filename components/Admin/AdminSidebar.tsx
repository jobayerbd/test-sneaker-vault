
import React from 'react';
import { AdminSubView, SiteIdentity } from '../../types.ts';

interface AdminSidebarProps {
  currentView: AdminSubView;
  onNavigate: (view: AdminSubView) => void;
  onLogout?: () => void;
  onVisitSite?: () => void;
  siteIdentity: SiteIdentity;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onNavigate, onLogout, onVisitSite, siteIdentity }) => {
  const sections = [
    {
      label: 'REPORTS',
      items: [
        { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
        { id: 'orders', icon: 'fa-folder-tree', label: 'Orders' },
        { id: 'customers', icon: 'fa-users', label: 'Customers' },
      ]
    },
    {
      label: 'INVENTORY',
      items: [
        { id: 'inventory', icon: 'fa-cubes-stacked', label: 'Product List' },
        { id: 'brands', icon: 'fa-tags', label: 'Brands' },
        { id: 'categories', icon: 'fa-layer-group', label: 'Categories' },
      ]
    },
    {
      label: 'APPEARANCE',
      items: [
        { id: 'identity', icon: 'fa-fingerprint', label: 'Site Branding' },
        { id: 'slider', icon: 'fa-images', label: 'Slider Settings' },
        { id: 'menu', icon: 'fa-bars', label: 'Navigation Menu' },
        { id: 'home-layout', icon: 'fa-house-laptop', label: 'Home Page' },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'checkout-config', icon: 'fa-list-check', label: 'Checkout Fields' },
        { id: 'settings', icon: 'fa-gears', label: 'Settings' }
      ]
    }
  ];

  const isActive = (id: string) => {
    if (currentView === id) return true;
    if (id === 'orders' && currentView === 'order-detail') return true;
    if (id === 'inventory' && currentView === 'product-form') return true;
    return false;
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden lg:flex flex-col h-screen sticky top-0 shadow-2xl z-30">
      <div className="mb-8 text-center flex flex-col items-center">
        {siteIdentity.logo_url ? (
          <div className="mb-4">
            <img src={siteIdentity.logo_url} alt={siteIdentity.title} className="h-14 w-auto object-contain" />
          </div>
        ) : (
          <div className="inline-block p-4 bg-black rounded-3xl mb-4 shadow-2xl">
            <i className="fa-solid fa-store text-white text-3xl"></i>
          </div>
        )}
        
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-1 italic">
          {siteIdentity.tagline || 'Admin Panel'}
        </p>
      </div>

      <div className="mb-8 px-2">
        <button 
          onClick={onVisitSite}
          className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-sm"
        >
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
          View Store
        </button>
      </div>
      
      <nav className="flex-1 space-y-8 overflow-y-auto no-scrollbar pb-8">
        {sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <h4 className="px-6 text-[8px] font-black uppercase text-gray-300 tracking-[0.3em] mb-4">{section.label}</h4>
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as AdminSubView)}
                className={`w-full flex items-center space-x-4 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive(item.id) ? 'bg-black text-white shadow-xl translate-x-1' : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-sm`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      
      <button 
        onClick={onLogout}
        className="pt-6 border-t border-gray-50 flex items-center space-x-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase text-red-600 hover:bg-red-50 transition-all group"
      >
        <i className="fa-solid fa-sign-out-alt w-5 text-sm"></i>
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
