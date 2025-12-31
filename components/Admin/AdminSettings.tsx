
import React, { useState } from 'react';
import { ShippingOption, FooterConfig } from '../../types';

interface AdminSettingsProps {
  shippingOptions: ShippingOption[];
  footerConfig: FooterConfig;
  onSaveShipping: (option: Partial<ShippingOption>) => Promise<boolean>;
  onDeleteShipping: (id: string) => Promise<boolean>;
  onSaveFooterConfig: (config: FooterConfig) => Promise<boolean>;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ shippingOptions, footerConfig, onSaveShipping, onDeleteShipping, onSaveFooterConfig }) => {
  const [editingShipping, setEditingShipping] = useState<Partial<ShippingOption> | null>(null);
  const [footerForm, setFooterForm] = useState<FooterConfig>({ ...footerConfig });
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isSavingFooter, setIsSavingFooter] = useState(false);

  return (
    <div className="space-y-12 animate-in fade-in pb-20">
      <h1 className="text-3xl font-black uppercase italic font-heading">Protocol Infrastructure</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Logistics Section */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-red-600 italic tracking-widest">Logistics Hub</h3>
            <button onClick={() => setEditingShipping({ name: '', rate: 0 })} className="bg-black text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase">Add Method</button>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-50">
                {shippingOptions.map(opt => (
                  <tr key={opt.id} className="group">
                    <td className="px-8 py-4 font-bold text-xs uppercase">{opt.name}</td>
                    <td className="px-8 py-4 font-black italic">{opt.rate}৳</td>
                    <td className="px-8 py-4 text-right">
                      <button onClick={() => setEditingShipping(opt)} className="p-2 text-gray-300 hover:text-black"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => { if(confirm('Delete protocol?')) onDeleteShipping?.(opt.id) }} className="p-2 text-gray-300 hover:text-red-600"><i className="fa-solid fa-trash-can"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editingShipping && (
            <div className="bg-black text-white p-8 rounded-3xl animate-in slide-in-from-top-4">
              <h4 className="text-[10px] font-black uppercase mb-6 italic">Edit Distribution Layer</h4>
              <div className="space-y-4">
                <input type="text" placeholder="METHOD" value={editingShipping.name} onChange={e => setEditingShipping({...editingShipping, name: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none" />
                <input type="number" placeholder="RATE" value={editingShipping.rate} onChange={e => setEditingShipping({...editingShipping, rate: Number(e.target.value)})} className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none" />
                <div className="flex gap-3">
                  <button onClick={async () => { setIsSavingShipping(true); if(await onSaveShipping?.(editingShipping)) setEditingShipping(null); setIsSavingShipping(false); }} className="flex-1 bg-red-700 py-3 rounded-xl font-black text-[10px] uppercase">Commit</button>
                  <button onClick={() => setEditingShipping(null)} className="flex-1 bg-white/10 py-3 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Storefront Identity & Marketing */}
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase text-red-600 italic tracking-widest">Storefront Identity</h3>
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl">
            <form onSubmit={async (e) => { e.preventDefault(); setIsSavingFooter(true); if(await onSaveFooterConfig?.(footerForm)) alert('SYNCED: All configurations updated in vault.'); setIsSavingFooter(false); }} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-2">Store Brand Name</label>
                  <input type="text" value={footerForm.store_name} onChange={e => setFooterForm({...footerForm, store_name: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-2">Brand Description</label>
                  <textarea rows={3} value={footerForm.description} onChange={e => setFooterForm({...footerForm, description: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none resize-none" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-2">Copyright Line</label>
                  <input type="text" value={footerForm.copyright} onChange={e => setFooterForm({...footerForm, copyright: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[9px] font-black uppercase text-gray-400 block mb-2">Facebook URL</label>
                      <input type="text" value={footerForm.facebook_url} onChange={e => setFooterForm({...footerForm, facebook_url: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-[10px] outline-none" />
                   </div>
                   <div>
                      <label className="text-[9px] font-black uppercase text-gray-400 block mb-2">Instagram URL</label>
                      <input type="text" value={footerForm.instagram_url} onChange={e => setFooterForm({...footerForm, instagram_url: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-[10px] outline-none" />
                   </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-2">Meta Pixel Protocol ID</label>
                  <input type="text" value={footerForm.fb_pixel_id || ''} onChange={e => setFooterForm({...footerForm, fb_pixel_id: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none" placeholder="1234567890" />
                </div>
              </div>
              <button type="submit" disabled={isSavingFooter} className="w-full bg-black text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                {isSavingFooter ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-cloud-arrow-up"></i> Update Infrastructure</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
