
import React, { useState, useEffect } from 'react';
import { FooterConfig } from '../../types.ts';

interface AdminFooterSettingsProps {
  footerConfig: FooterConfig;
  onSaveFooterConfig: (config: FooterConfig) => Promise<boolean>;
}

const AdminFooterSettings: React.FC<AdminFooterSettingsProps> = ({ footerConfig, onSaveFooterConfig }) => {
  const [footerForm, setFooterForm] = useState<FooterConfig>({ ...footerConfig });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setFooterForm({ ...footerConfig });
  }, [footerConfig]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccess(false);
    const success = await onSaveFooterConfig(footerForm);
    if (success) {
      setShowSuccess(true);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20 relative">
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
                <p className="text-xs font-bold leading-tight">FOOTER ARCHIVE SYNCHRONIZED</p>
              </div>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black uppercase italic font-heading">Footer Protocol</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Management of site-wide base information and social coordinates</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Store Designation</label>
                <input 
                  type="text" 
                  value={footerForm.store_name} 
                  onChange={e => setFooterForm({...footerForm, store_name: e.target.value})} 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none transition-all" 
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Copyright Signature</label>
                <input 
                  type="text" 
                  value={footerForm.copyright} 
                  onChange={e => setFooterForm({...footerForm, copyright: e.target.value})} 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Brand Description</label>
              <textarea 
                rows={5} 
                value={footerForm.description} 
                onChange={e => setFooterForm({...footerForm, description: e.target.value})} 
                className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none resize-none h-full transition-all leading-relaxed" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
             <div className="md:col-span-3">
                <h4 className="text-[10px] font-black uppercase text-red-600 mb-4 italic tracking-[0.2em]">External API Coordinates</h4>
             </div>
             <div>
                <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Meta Pixel ID</label>
                <input 
                  type="text" 
                  value={footerForm.fb_pixel_id || ''} 
                  onChange={e => setFooterForm({...footerForm, fb_pixel_id: e.target.value})} 
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-black" 
                  placeholder="ID: 000000000" 
                />
             </div>
             <div>
                <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Facebook URL</label>
                <input 
                  type="text" 
                  value={footerForm.facebook_url} 
                  onChange={e => setFooterForm({...footerForm, facebook_url: e.target.value})} 
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold text-[10px] outline-none border-2 border-transparent focus:border-black" 
                />
             </div>
             <div>
                <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Instagram URL</label>
                <input 
                  type="text" 
                  value={footerForm.instagram_url} 
                  onChange={e => setFooterForm({...footerForm, instagram_url: e.target.value})} 
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold text-[10px] outline-none border-2 border-transparent focus:border-black" 
                />
             </div>
             <div className="md:col-span-3">
                <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 px-1">Twitter/X URL</label>
                <input 
                  type="text" 
                  value={footerForm.twitter_url} 
                  onChange={e => setFooterForm({...footerForm, twitter_url: e.target.value})} 
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold text-[10px] outline-none border-2 border-transparent focus:border-black" 
                />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving} 
            className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-4 transform active:scale-[0.98]"
          >
            {isSaving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-cloud-arrow-up"></i> Sync Footer Infrastructure</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminFooterSettings;
