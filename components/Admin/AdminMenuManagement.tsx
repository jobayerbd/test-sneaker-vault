
import React, { useState } from 'react';
import { NavItem, Category, BrandEntity } from '../../types.ts';

interface AdminMenuManagementProps {
  navItems: NavItem[];
  categories: Category[];
  brands: BrandEntity[];
  onSave: (item: Partial<NavItem>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const AdminMenuManagement: React.FC<AdminMenuManagementProps> = ({ navItems, categories, brands, onSave, onDelete }) => {
  const [editing, setEditing] = useState<Partial<NavItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedItems = [...navItems].sort((a, b) => a.order - b.order);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.label) return;
    
    // Safety check: ensure link_type and link_value are set if missing (for legacy items)
    const payload = { 
      ...editing,
      link_type: editing.link_type || 'view',
      link_value: editing.link_value || editing.target_view || 'home'
    };

    setIsSaving(true);
    const success = await onSave(payload);
    if (success) setEditing(null);
    else alert("VAULT ERROR: Synchronization failed. Review network connectivity.");
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('PROTOCOL ALERT: Are you sure you want to permanently erase this navigation asset?')) return;
    
    setDeletingId(id);
    const success = await onDelete(id);
    if (!success) {
      alert("VAULT ERROR: Erase protocol failed. Record remains in archives.");
    }
    setDeletingId(null);
  };

  const handleMove = async (item: NavItem, direction: 'up' | 'down') => {
    const currentIndex = sortedItems.findIndex(i => i.id === item.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sortedItems.length) return;

    const targetItem = sortedItems[targetIndex];
    
    // Swap orders
    await onSave({ id: item.id, order: targetItem.order });
    await onSave({ id: targetItem.id, order: item.order });
  };

  const renderDestinationInput = () => {
    if (!editing) return null;
    const type = editing.link_type || 'view';

    switch (type) {
      case 'category':
        return (
          <div>
            <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Select Category Destination</label>
            <select 
              value={editing.link_value || ''} 
              onChange={e => setEditing({...editing, link_value: e.target.value})}
              className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none border-2 border-transparent focus:border-red-600 appearance-none"
            >
              <option value="" className="bg-black">SELECT COLLECTION...</option>
              <optgroup label="BRANDS" className="bg-black">
                {brands.map(b => <option key={b.id} value={b.name.toLowerCase()} className="bg-black">{b.name.toUpperCase()}</option>)}
              </optgroup>
              <optgroup label="CATEGORIES" className="bg-black">
                {categories.map(c => <option key={c.id} value={c.name.toLowerCase()} className="bg-black">{c.name.toUpperCase()}</option>)}
              </optgroup>
            </select>
          </div>
        );
      case 'url':
        return (
          <div>
            <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Custom URL Sequence</label>
            <input 
              type="url" 
              value={editing.link_value || ''} 
              onChange={e => setEditing({...editing, link_value: e.target.value})}
              className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600" 
              placeholder="https://example.com"
            />
          </div>
        );
      default: // view
        return (
          <div>
            <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Select View Protocol</label>
            <select 
              value={editing.link_value || editing.target_view || 'home'} 
              onChange={e => setEditing({...editing, link_value: e.target.value, target_view: e.target.value})}
              className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none border-2 border-transparent focus:border-red-600 appearance-none"
            >
              <option value="home" className="bg-black">HOME</option>
              <option value="shop" className="bg-black">SHOP / ARCHIVES</option>
              <option value="drops" className="bg-black">DROPS</option>
            </select>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic font-heading">Menu Config Hub</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Cross-Platform Navigation Directives</p>
        </div>
        <button 
          disabled={!!deletingId}
          onClick={() => setEditing({ label: '', link_type: 'view', link_value: 'shop', order: navItems.length + 1, active: true })} 
          className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all disabled:opacity-50"
        >
          Add Nav Item
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic mb-2">Live Navigation Tree</h3>
          {sortedItems.map((item, idx) => (
            <div key={item.id} className={`bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:shadow-md transition-all ${deletingId === item.id ? 'opacity-50 grayscale' : ''}`}>
              <div className="flex items-center gap-6">
                 <div className="flex flex-col gap-1">
                    <button disabled={idx === 0 || !!deletingId} onClick={() => handleMove(item, 'up')} className="p-1 text-gray-300 hover:text-black disabled:opacity-0 transition-all"><i className="fa-solid fa-caret-up"></i></button>
                    <button disabled={idx === sortedItems.length - 1 || !!deletingId} onClick={() => handleMove(item, 'down')} className="p-1 text-gray-300 hover:text-black disabled:opacity-0 transition-all"><i className="fa-solid fa-caret-down"></i></button>
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                       <h4 className="text-sm font-black uppercase italic">{item.label}</h4>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                      Dest: <span className="text-red-600">[{item.link_type?.toUpperCase() || 'VIEW'}]</span> {item.link_value || item.target_view}
                    </p>
                 </div>
              </div>
              <div className="flex gap-2">
                <button 
                  disabled={!!deletingId}
                  onClick={() => setEditing(item)} 
                  className="p-3 bg-gray-50 hover:bg-black hover:text-white rounded-xl transition-all disabled:opacity-30"
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <button 
                  disabled={!!deletingId}
                  onClick={() => handleDelete(item.id)} 
                  className="p-3 bg-gray-50 hover:bg-red-600 hover:text-white rounded-xl transition-all disabled:opacity-30 flex items-center justify-center min-w-[42px]"
                >
                  {deletingId === item.id ? <i className="fa-solid fa-circle-notch animate-spin text-xs"></i> : <i className="fa-solid fa-trash text-xs"></i>}
                </button>
              </div>
            </div>
          ))}
          {navItems.length === 0 && (
            <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-3xl">
              <p className="text-gray-300 font-black uppercase tracking-widest italic">Navigation tree is empty</p>
            </div>
          )}
        </div>

        {editing && (
          <div className="bg-black text-white p-10 rounded-3xl h-fit sticky top-8 animate-in slide-in-from-right-8 shadow-2xl border border-white/5">
            <h3 className="text-xl font-black uppercase italic mb-8 tracking-tighter border-b border-white/10 pb-4 font-heading">Protocol Update</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Link Label</label>
                  <input 
                    type="text" 
                    required
                    value={editing.label} 
                    onChange={e => setEditing({...editing, label: e.target.value})}
                    className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600" 
                    placeholder="e.g. MEN"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Destination Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['view', 'category', 'url'].map(type => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => setEditing({...editing, link_type: type as any, link_value: ''})}
                        className={`py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${editing.link_type === type ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {renderDestinationInput()}

                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Sequence Order</label>
                  <input 
                    type="number" 
                    value={editing.order} 
                    onChange={e => setEditing({...editing, order: Number(e.target.value)})}
                    className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600" 
                  />
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input type="checkbox" checked={editing.active} onChange={e => setEditing({...editing, active: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Activate Directive</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSaving} className="flex-1 bg-red-700 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 hover:bg-white hover:text-black transition-all">
                  {isSaving ? 'Syncing...' : 'Commit'}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-white/10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMenuManagement;
