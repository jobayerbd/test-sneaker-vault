
import React, { useState, useEffect } from 'react';
import { ShippingOption, PaymentMethod } from '../../types.ts';

interface AdminSettingsProps {
  shippingOptions: ShippingOption[];
  paymentMethods: PaymentMethod[];
  onSaveShipping: (option: Partial<ShippingOption>) => Promise<boolean>;
  onDeleteShipping: (id: string) => Promise<boolean>;
  onSavePaymentMethod: (method: Partial<PaymentMethod>) => Promise<boolean>;
  onDeletePaymentMethod: (id: string) => Promise<boolean>;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ 
  shippingOptions, 
  paymentMethods,
  onSaveShipping, 
  onDeleteShipping, 
  onSavePaymentMethod,
  onDeletePaymentMethod
}) => {
  const [editingShipping, setEditingShipping] = useState<Partial<ShippingOption> | null>(null);
  const [editingPayment, setEditingPayment] = useState<Partial<PaymentMethod> | null>(null);
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Custom Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; type: 'logistics' | 'gateway'; name: string } | null>(null);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const triggerDelete = async () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'logistics') {
      await onDeleteShipping(deleteConfirmation.id);
    } else {
      await onDeletePaymentMethod(deleteConfirmation.id);
    }
    setDeleteConfirmation(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in pb-20 relative">
      {/* Success Notification Bar */}
      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-black text-white border-l-4 border-green-500 p-5 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest italic text-green-500">System Secure</p>
                <p className="text-xs font-bold leading-tight">VAULT SYNCHRONIZED: SETTINGS PERSISTED</p>
              </div>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-black uppercase italic font-heading">System Parameters</h1>
      
      {/* Custom Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              </div>
              <h3 className="text-lg font-black uppercase italic mb-2 tracking-tight">Security Protocol</h3>
              <p className="text-xs text-gray-500 font-medium mb-8 leading-relaxed">
                You are about to permanently erase the <span className="text-black font-black">[{deleteConfirmation.name}]</span> protocol from the archives. This action is irreversible.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={triggerDelete}
                  className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all"
                >
                  Confirm Erasure
                </button>
                <button 
                  onClick={() => setDeleteConfirmation(null)}
                  className="w-full bg-gray-50 text-gray-400 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                >
                  Abort Mission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Logistics Section */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-red-600 italic tracking-widest">Logistics Hub</h3>
            <button onClick={() => setEditingShipping({ name: '', rate: 0, description: '' })} className="bg-black text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase">Add Method</button>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-gray-50">
                {shippingOptions.map(opt => (
                  <tr key={opt.id} className="group">
                    <td className="px-8 py-4">
                      <div className="font-bold uppercase">{opt.name}</div>
                      {opt.description && <div className="text-[9px] text-gray-400 font-medium italic mt-0.5">{opt.description}</div>}
                    </td>
                    <td className="px-8 py-4 font-black italic">{opt.rate}৳</td>
                    <td className="px-8 py-4 text-right">
                      <button onClick={() => setEditingShipping(opt)} className="p-2 text-gray-300 hover:text-black transition-colors">
                        <i className="fa-solid fa-pen pointer-events-none"></i>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmation({ id: opt.id, type: 'logistics', name: opt.name })} 
                        className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can pointer-events-none"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {shippingOptions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-10 text-center text-gray-300 italic font-bold uppercase tracking-widest">No logistics protocols found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {editingShipping && (
            <div className="bg-black text-white p-8 rounded-3xl animate-in slide-in-from-top-4">
              <h4 className="text-[10px] font-black uppercase mb-6 italic">Edit Distribution Layer</h4>
              <div className="space-y-4">
                <input type="text" placeholder="METHOD NAME" value={editingShipping.name} onChange={e => setEditingShipping({...editingShipping, name: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600" />
                <input type="number" placeholder="RATE (৳)" value={editingShipping.rate} onChange={e => setEditingShipping({...editingShipping, rate: Number(e.target.value)})} className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600" />
                <textarea placeholder="DESCRIPTION (e.g. 2-3 Days Delivery)" value={editingShipping.description || ''} onChange={e => setEditingShipping({...editingShipping, description: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600 resize-none h-20" />
                <div className="flex gap-3">
                  <button onClick={async () => { setIsSavingShipping(true); if(await onSaveShipping(editingShipping)) { setEditingShipping(null); setShowSuccess(true); } setIsSavingShipping(false); }} className="flex-1 bg-red-700 py-3 rounded-xl font-black text-[10px] uppercase">Commit</button>
                  <button onClick={() => setEditingShipping(null)} className="flex-1 bg-white/10 py-3 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Gateway Protocol */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-red-600 italic tracking-widest">Payment Gateway Protocol</h3>
            <button onClick={() => setEditingPayment({ name: '', details: '' })} className="bg-black text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase">Initialize Gateway</button>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-gray-50">
                {paymentMethods.map(pm => (
                  <tr key={pm.id} className="group">
                    <td className="px-8 py-4">
                      <div className="font-bold uppercase">{pm.name}</div>
                      <div className="text-[9px] text-gray-400 font-medium italic">{pm.details || 'No active details'}</div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button onClick={() => setEditingPayment(pm)} className="p-2 text-gray-300 hover:text-black transition-colors">
                        <i className="fa-solid fa-pen pointer-events-none"></i>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmation({ id: pm.id, type: 'gateway', name: pm.name })} 
                        className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can pointer-events-none"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {paymentMethods.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-8 py-10 text-center text-gray-300 italic font-bold uppercase tracking-widest">No gateway protocols found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {editingPayment && (
            <div className="bg-black text-white p-8 rounded-3xl animate-in slide-in-from-top-4">
              <h4 className="text-[10px] font-black uppercase mb-6 italic">Secure Gateway Config</h4>
              <div className="space-y-4">
                <input type="text" placeholder="GATEWAY NAME (e.g. bKash)" value={editingPayment.name} onChange={e => setEditingPayment({...editingPayment, name: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600" />
                <textarea placeholder="INSTRUCTIONS / DETAILS" value={editingPayment.details} onChange={e => setEditingPayment({...editingPayment, details: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600 resize-none h-20" />
                <div className="flex gap-3">
                  <button onClick={async () => { setIsSavingPayment(true); if(await onSavePaymentMethod(editingPayment)) { setEditingPayment(null); setShowSuccess(true); } setIsSavingPayment(false); }} className="flex-1 bg-red-700 py-3 rounded-xl font-black text-[10px] uppercase">Sync Protocol</button>
                  <button onClick={() => setEditingPayment(null)} className="flex-1 bg-white/10 py-3 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
