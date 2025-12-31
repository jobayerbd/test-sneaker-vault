
import React, { useState } from 'react';
import { CheckoutField } from '../../types';

interface AdminCheckoutManagerProps {
  fields: CheckoutField[];
  onSave: (field: Partial<CheckoutField>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const AdminCheckoutManager: React.FC<AdminCheckoutManagerProps> = ({ fields, onSave, onDelete }) => {
  const [editing, setEditing] = useState<Partial<CheckoutField> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.field_key || !editing?.label) return;
    setIsSaving(true);
    if (await onSave(editing)) setEditing(null);
    setIsSaving(false);
  };

  const PREDEFINED_KEYS = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'mobile_number', label: 'Mobile Number' },
    { key: 'email', label: 'Email Address' },
    { key: 'street_address', label: 'Street Address' },
    { key: 'city', label: 'City' },
    { key: 'zip_code', label: 'Zip/Postal' },
    { key: 'company', label: 'Company Name' },
    { key: 'order_notes', label: 'Order Notes' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic font-heading">Registry Schema</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Checkout Field Protocol Management</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setEditing({ field_key: '', label: '', placeholder: '', type: 'text', required: true, enabled: true, width: 'full', order: fields.length + 1 })} 
            className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all"
          >
            Custom Field
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic mb-2">Active Field Protocol</h3>
          {sortedFields.map((field) => (
            <div key={field.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                 <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-gray-300 uppercase">Order</span>
                    <span className="text-sm font-black italic">{field.order}</span>
                 </div>
                 <div>
                    <div className="flex items-center gap-3">
                       <h4 className="text-sm font-black uppercase italic">{field.label}</h4>
                       {!field.enabled && <span className="bg-gray-100 text-gray-400 text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest">Disabled</span>}
                       {field.required && <span className="bg-red-50 text-red-600 text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest">Required</span>}
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                      Key: {field.field_key} | Type: {field.type} | Width: {field.width === 'half' ? '50%' : '100%'}
                    </p>
                 </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(field)} className="p-3 bg-gray-50 hover:bg-black hover:text-white rounded-xl transition-all">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button onClick={() => { if(confirm('Delete field protocol?')) onDelete(field.id) }} className="p-3 bg-gray-50 hover:bg-red-600 hover:text-white rounded-xl transition-all">
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <div className="bg-black text-white p-10 rounded-3xl h-fit sticky top-8 animate-in slide-in-from-right-8 shadow-2xl border border-white/5">
            <h3 className="text-xl font-black uppercase italic mb-8 tracking-tighter border-b border-white/10 pb-4 font-heading">Protocol Config</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Field Identity (Key)</label>
                  <select 
                    value={editing.field_key} 
                    onChange={e => {
                      const selected = PREDEFINED_KEYS.find(k => k.key === e.target.value);
                      setEditing({...editing, field_key: e.target.value, label: selected?.label || editing.label});
                    }}
                    className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600 appearance-none"
                  >
                    <option value="" className="bg-black">SELECT ARCHIVE KEY...</option>
                    {PREDEFINED_KEYS.map(k => <option key={k.key} value={k.key} className="bg-black">{k.label.toUpperCase()}</option>)}
                    <option value="custom" className="bg-black">CUSTOM KEY...</option>
                  </select>
                </div>
                {editing.field_key === 'custom' && (
                  <input 
                    type="text" 
                    placeholder="ENTER CUSTOM KEY..."
                    onChange={e => setEditing({...editing, field_key: e.target.value})}
                    className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600"
                  />
                )}
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Display Label</label>
                  <input 
                    type="text" 
                    value={editing.label} 
                    onChange={e => setEditing({...editing, label: e.target.value})}
                    className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Placeholder Hint</label>
                  <input 
                    type="text" 
                    value={editing.placeholder} 
                    onChange={e => setEditing({...editing, placeholder: e.target.value})}
                    className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Width Protocol</label>
                    <select 
                      value={editing.width} 
                      onChange={e => setEditing({...editing, width: e.target.value as 'full' | 'half'})}
                      className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none border-2 border-transparent focus:border-red-600 appearance-none"
                    >
                      <option value="full" className="bg-black">FULL (100%)</option>
                      <option value="half" className="bg-black">HALF (50%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Sequence Index</label>
                    <input 
                      type="number" 
                      value={editing.order} 
                      onChange={e => setEditing({...editing, order: Number(e.target.value)})}
                      className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={editing.required} onChange={e => setEditing({...editing, required: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white italic">Mandatory</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={editing.enabled} onChange={e => setEditing({...editing, enabled: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-white/5 text-green-600 focus:ring-green-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white italic">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSaving} className="flex-1 bg-red-700 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 hover:bg-white hover:text-black transition-all">
                  {isSaving ? 'Syncing...' : 'Commit Protocol'}
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

export default AdminCheckoutManager;
