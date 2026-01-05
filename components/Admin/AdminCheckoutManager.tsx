
import React, { useState } from 'react';
import { CheckoutField } from '../../types.ts';

interface AdminCheckoutManagerProps {
  fields: CheckoutField[];
  onSave: (field: Partial<CheckoutField>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const AdminCheckoutManager: React.FC<AdminCheckoutManagerProps> = ({ fields, onSave, onDelete }) => {
  const [editing, setEditing] = useState<Partial<CheckoutField> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState<CheckoutField | null>(null);

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.label || !editing?.field_key) return;
    setIsSaving(true);
    if (await onSave(editing)) setEditing(null);
    setIsSaving(false);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteWarning) return;
    
    const idToDelete = showDeleteWarning.id;
    setShowDeleteWarning(null); // Close modal first
    setDeletingId(idToDelete);
    
    const success = await onDelete(idToDelete);
    if (!success) {
      alert("VAULT ERROR: Erase protocol failed. Record remains in archives.");
    }
    setDeletingId(null);
  };

  const handleAddNew = () => {
    setEditing({
      field_key: '',
      label: '',
      placeholder: '',
      type: 'text',
      required: true,
      enabled: true,
      width: 'full',
      order: fields.length + 1
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Custom In-App Warning Modal */}
      {showDeleteWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
            </div>
            <h3 className="text-xl font-black uppercase italic mb-3 tracking-tighter font-heading">Security Protocol</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-8 leading-relaxed">
              You are about to permanently erase the <span className="text-black font-black">[{showDeleteWarning.label}]</span> protocol. This action cannot be undone.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleConfirmDelete}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
              >
                Confirm Deletion
              </button>
              <button 
                onClick={() => setShowDeleteWarning(null)}
                className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-100 transition-all"
              >
                Abort Mission
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic font-heading text-black">Registry Protocol</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 italic">Configure database mapping and UI layout</p>
        </div>
        <button 
          onClick={handleAddNew}
          disabled={!!deletingId}
          className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
        >
          Add Protocol Field
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic mb-2">Active Database Fields</h3>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="divide-y divide-gray-50">
              {sortedFields.map((field) => (
                <div key={field.id} className={`p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-all ${deletingId === field.id ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-6">
                     <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-xs italic text-gray-400">
                        {field.order}
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                           <h4 className="text-sm font-black uppercase italic text-black">{field.label}</h4>
                           {!field.enabled && <span className="bg-gray-100 text-gray-400 text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest">Disabled</span>}
                           {field.required && <span className="bg-red-50 text-red-600 text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest">Required</span>}
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                          DB Key: <span className="text-black font-black">{field.field_key}</span> | Layout: <span className="text-red-600 font-black">{field.width?.toUpperCase() || 'FULL'}</span>
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditing(field)} 
                      className="p-3 bg-white border border-gray-100 hover:border-black rounded-xl transition-all shadow-sm"
                    >
                      <i className="fa-solid fa-gear text-xs"></i>
                    </button>
                    <button 
                      onClick={() => setShowDeleteWarning(field)} 
                      className="p-3 bg-white border border-gray-100 hover:text-red-600 hover:border-red-600 rounded-xl transition-all shadow-sm"
                    >
                      {deletingId === field.id ? (
                        <i className="fa-solid fa-circle-notch animate-spin text-xs"></i>
                      ) : (
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                <div className="p-12 text-center text-[10px] font-black uppercase text-gray-300 italic tracking-[0.4em]">
                  Zero fields detected in the vault archives
                </div>
              )}
            </div>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
             <i className="fa-solid fa-circle-info text-amber-600 mt-1"></i>
             <div>
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest italic">System Note</p>
                <p className="text-[10px] text-amber-800 font-medium mt-1 leading-relaxed">
                  Ensure <code className="font-black">first_name</code> and <code className="font-black">last_name</code> keys match your database columns exactly. Set both to 'Half' width to show them side-by-side.
                </p>
             </div>
          </div>
        </div>

        {editing && (
          <div className="bg-black text-white p-10 rounded-[2.5rem] h-fit sticky top-8 animate-in slide-in-from-right-8 shadow-2xl border border-white/5">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
               <h3 className="text-xl font-black uppercase italic tracking-tighter font-heading">Protocol Config</h3>
               {editing.id && <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">{editing.field_key}</span>}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Database Key (e.g. first_name)</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editing.id}
                    value={editing.field_key} 
                    onChange={e => setEditing({...editing, field_key: e.target.value})}
                    placeholder="field_key"
                    className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600 border border-white/5 disabled:opacity-50" 
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Rename Display Label</label>
                  <input 
                    type="text" 
                    required
                    value={editing.label} 
                    onChange={e => setEditing({...editing, label: e.target.value})}
                    placeholder="FIRST NAME"
                    className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600 border border-white/5" 
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Layout Width</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setEditing({...editing, width: 'half'})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${editing.width === 'half' ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'}`}
                    >
                      Half (50%)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditing({...editing, width: 'full'})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${editing.width === 'full' || !editing.width ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'}`}
                    >
                      Full (100%)
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Placeholder Hint</label>
                    <input 
                      type="text" 
                      value={editing.placeholder || ''} 
                      onChange={e => setEditing({...editing, placeholder: e.target.value})}
                      className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600 border border-white/5" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Sort Sequence</label>
                    <input 
                      type="number" 
                      value={editing.order} 
                      onChange={e => setEditing({...editing, order: Number(e.target.value)})}
                      className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none border border-white/5" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={editing.required} onChange={e => setEditing({...editing, required: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white italic">Required</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={editing.enabled} onChange={e => setEditing({...editing, enabled: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-white/5 text-green-600 focus:ring-green-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white italic">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSaving} className="flex-1 bg-red-700 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 hover:bg-white hover:text-black transition-all">
                  {isSaving ? 'Syncing...' : 'Save Protocol'}
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
