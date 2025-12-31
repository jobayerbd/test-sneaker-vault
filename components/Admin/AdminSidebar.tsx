
import React from 'react';
import { AdminSubView } from '../../types.ts';

interface AdminSidebarProps {
  currentView: AdminSubView;
  onNavigate: (view: AdminSubView) => void;
  onLogout?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
    { id: 'orders', icon: 'fa-folder-tree', label: 'Orders' },
    { id: 'inventory', icon: 'fa-cubes-stacked', label: 'Inventory' },
    { id: 'home-layout', icon: 'fa-house-laptop', label: 'Home Layout' },
    { id: 'menu', icon: 'fa-bars', label: 'Menu Hub' },
    { id: 'slider', icon: 'fa-images', label: 'Slider Hub' },
    { id: 'checkout-config', icon: 'fa-list-check', label: 'Checkout Config' },
    { id: 'brands', icon: 'fa-tags', label: 'Brands' },
    { id: 'categories', icon: 'fa-layer-group', label: 'Categories' },
    { id: 'settings', icon: 'fa-gears', label: 'Settings' }
  ];

  const isActive = (id: string) => {
    if (currentView === id) return true;
    if (id === 'orders' && currentView === 'order-detail') return true;
    if (id === 'inventory' && currentView === 'product-form') return true;
    return false;
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden lg:flex flex-col h-screen sticky top-0 shadow-2xl z-30">
      <div className="mb-14 text-center">
        <div className="inline-block p-4 bg-black rounded-3xl mb-6 shadow-2xl">
          <i className="fa-solid fa-vault text-white text-3xl"></i>
        </div>
        <div className="text-2xl font-black font-heading tracking-tighter italic text-black uppercase">
          SNEAKER<span className="text-red-600">VAULT</span>
        </div>
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] mt-2 italic">Admin OS 2.5</p>
      </div>
      
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as AdminSubView)}
            className={`w-full flex items-center space-x-4 px-6 py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isActive(item.id) ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6 text-sm`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <button 
        onClick={onLogout}
        className="mt-auto flex items-center space-x-4 px-6 py-4.5 rounded-2xl text-[10px] font-black uppercase text-red-600 hover:bg-red-50 transition-all group"
      >
        <i className="fa-solid fa-sign-out-alt w-6 text-sm"></i>
        <span>Log Off System</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
