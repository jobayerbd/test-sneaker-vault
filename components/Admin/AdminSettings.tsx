
import React, { useState } from 'react';
import { ShippingOption, FooterConfig, PaymentMethod } from '../../types.ts';

interface AdminSettingsProps {
  shippingOptions: ShippingOption[];
  paymentMethods: PaymentMethod[];
  footerConfig: FooterConfig;
  onSaveShipping: (option: Partial<ShippingOption>) => Promise<boolean>;
  onDeleteShipping: (id: string) => Promise<boolean>;
  onSavePaymentMethod: (method: Partial<PaymentMethod>) => Promise<boolean>;
  onDeletePaymentMethod: (id: string) => Promise<boolean>;
  onSaveFooterConfig: (config: FooterConfig) => Promise<boolean>;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ 
  shippingOptions, 
  paymentMethods,
  footerConfig, 
  onSaveShipping, 
  onDeleteShipping, 
  onSavePaymentMethod,
  onDeletePaymentMethod,
  onSaveFooterConfig 
}) => {
  const [editingShipping, setEditingShipping] = useState<Partial<ShippingOption> | null>(null);
  const [editingPayment, setEditingPayment] = useState<Partial<PaymentMethod> | null>(null);
  const [footerForm, setFooterForm] = useState<FooterConfig>({ ...footerConfig });
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSavingFooter, setIsSavingFooter] = useState(false);

  // Custom Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; type: 'logistics' | 'gateway'; name: string } | null>(null);

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
      <h1 className="text-3xl font-black uppercase italic font-heading">Protocol Infrastructure</h1>
      
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
            <button onClick={() => setEditingShipping({ name: '', rate: 0 })} className="bg-black text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase">Add Method</button>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-gray-50">
                {shippingOptions.map(opt => (
                  <tr key={opt.id} className="group">
                    <td className="px-8 py-4 font-bold uppercase">{opt.name}</td>
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
                <input type="number" placeholder="RATE (৳)" value={editingShipping.rate} onChange={e => setEditingShipping({...editingShipping, rate: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600" />
                <div className="flex gap-3">
                  <button onClick={async () => { setIsSavingShipping(true); if(await onSaveShipping(editingShipping)) setEditingShipping(null); setIsSavingShipping(false); }} className="flex-1 bg-red-700 py-3 rounded-xl font-black text-[10px] uppercase">Commit</button>
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
                  <button onClick={async () => { setIsSavingPayment(true); if(await onSavePaymentMethod(editingPayment)) setEditingPayment(null); setIsSavingPayment(false); }} className="flex-1 bg-red-700 py-3 rounded-xl font-black text-[10px] uppercase">Sync Protocol</button>
                  <button onClick={() => setEditingPayment(null)} className="flex-1 bg-white/10 py-3 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Storefront Identity */}
        <div className="space-y-8 lg:col-span-2">
          <h3 className="text-[10px] font-black uppercase text-red-600 italic tracking-widest">Storefront Identity Protocol</h3>
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl">
            <form onSubmit={async (e) => { e.preventDefault(); setIsSavingFooter(true); if(await onSaveFooterConfig(footerForm)) alert('SYNCED: Storefront updated.'); setIsSavingFooter(false); }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Brand Designation</label>
                    <input type="text" value={footerForm.store_name} onChange={e => setFooterForm({...footerForm, store_name: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Copyright Signature</label>
                    <input type="text" value={footerForm.copyright} onChange={e => setFooterForm({...footerForm, copyright: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Brand Ethos Statement</label>
                  <textarea rows={5} value={footerForm.description} onChange={e => setFooterForm({...footerForm, description: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none resize-none h-full transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Meta Pixel Protocol ID</label>
                    <input type="text" value={footerForm.fb_pixel_id || ''} onChange={e => setFooterForm({...footerForm, fb_pixel_id: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-black" placeholder="ID: 000000000" />
                 </div>
                 <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Facebook Coordinate</label>
                    <input type="text" value={footerForm.facebook_url} onChange={e => setFooterForm({...footerForm, facebook_url: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-[10px] outline-none" />
                 </div>
                 <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Instagram Coordinate</label>
                    <input type="text" value={footerForm.instagram_url} onChange={e => setFooterForm({...footerForm, instagram_url: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-[10px] outline-none" />
                 </div>
              </div>

              <button type="submit" disabled={isSavingFooter} className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-4">
                {isSavingFooter ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-cloud-arrow-up"></i> Sync Core Infrastructure</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
