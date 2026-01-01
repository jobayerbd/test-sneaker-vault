
import React from 'react';
import { AdminSubView } from '../../types.ts';

interface AdminSidebarProps {
  currentView: AdminSubView;
  onNavigate: (view: AdminSubView) => void;
  onLogout?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const sections = [
    {
      label: 'COMMAND',
      items: [
        { id: 'overview', icon: 'fa-gauge-high', label: 'Intelligence' },
        { id: 'orders', icon: 'fa-folder-tree', label: 'Order Registry' },
        { id: 'customers', icon: 'fa-users', label: 'Member Directory' },
      ]
    },
    {
      label: 'ARCHIVES',
      items: [
        { id: 'inventory', icon: 'fa-cubes-stacked', label: 'Asset Bank' },
        { id: 'brands', icon: 'fa-tags', label: 'Brands' },
        { id: 'categories', icon: 'fa-layer-group', label: 'Categories' },
      ]
    },
    {
      label: 'DESIGN',
      items: [
        { id: 'identity', icon: 'fa-fingerprint', label: 'Site Identity' },
        { id: 'slider', icon: 'fa-images', label: 'Slider Hub' },
        { id: 'menu', icon: 'fa-bars', label: 'Menu Hub' },
        { id: 'home-layout', icon: 'fa-house-laptop', label: 'Home Layout' },
      ]
    },
    {
      label: 'CORE',
      items: [
        { id: 'checkout-config', icon: 'fa-list-check', label: 'Checkout Schema' },
        { id: 'settings', icon: 'fa-gears', label: 'Infrastructure' }
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
      <div className="mb-10 text-center">
        <div className="inline-block p-4 bg-black rounded-3xl mb-4 shadow-2xl">
          <i className="fa-solid fa-vault text-white text-3xl"></i>
        </div>
        <div className="text-xl font-black font-heading tracking-tighter italic text-black uppercase">
          SNEAKER<span className="text-red-600">VAULT</span>
        </div>
        <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.5em] mt-1 italic">Security Core</p>
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
        <span>Log Off Protocol</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
