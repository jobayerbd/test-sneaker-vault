
import React, { useState, useRef } from 'react';
import { SiteIdentity } from '../../types.ts';

interface AdminIdentityProps {
  identity: SiteIdentity;
  onSave: (config: SiteIdentity) => Promise<boolean>;
}

const AdminIdentity: React.FC<AdminIdentityProps> = ({ identity, onSave }) => {
  const [form, setForm] = useState<SiteIdentity>({ ...identity });
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'favicon_url') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, [field]: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await onSave(form);
    if (success) {
      alert('IDENTITY SYNCED: Site branding protocol updated successfully.');
    } else {
      alert('SYNC ERROR: Failed to update site identity in vault.');
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div>
        <h1 className="text-3xl font-black uppercase italic font-heading">Site Identity</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Global Branding & Metadata Protocols</p>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Text Metadata */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Site Title Protocol</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. SNEAKERVAULT"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Site Tagline / Slogan</label>
                <input 
                  type="text" 
                  value={form.tagline} 
                  onChange={e => setForm({...form, tagline: e.target.value})}
                  placeholder="e.g. Premium Footwear Protocol"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl font-bold text-xs outline-none transition-all"
                />
              </div>
            </div>

            {/* Visual Assets */}
            <div className="space-y-8">
              {/* Logo Manager */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-3 px-1">Primary Brand Mark (Logo)</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {form.logo_url ? (
                      <img src={form.logo_url} className="w-full h-full object-contain p-2" alt="Logo Preview" />
                    ) : (
                      <i className="fa-solid fa-image text-gray-200 text-2xl"></i>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button 
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full bg-black text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-red-700 transition-all"
                    >
                      Update Logo
                    </button>
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'logo_url')} 
                    />
                    <input 
                      type="text" 
                      value={form.logo_url} 
                      onChange={e => setForm({...form, logo_url: e.target.value})}
                      placeholder="OR ENTER LOGO URL"
                      className="w-full bg-gray-50 p-2 rounded-lg text-[8px] font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Favicon Manager */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-3 px-1">Browser Identity (Favicon)</label>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {form.favicon_url ? (
                      <img src={form.favicon_url} className="w-full h-full object-contain p-1" alt="Favicon Preview" />
                    ) : (
                      <i className="fa-solid fa-circle text-gray-200"></i>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button 
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                      className="w-full bg-gray-100 text-black py-2 rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Update Favicon
                    </button>
                    <input 
                      type="file" 
                      ref={faviconInputRef} 
                      className="hidden" 
                      accept="image/x-icon,image/png,image/svg+xml" 
                      onChange={(e) => handleFileChange(e, 'favicon_url')} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-4"
            >
              {isSaving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-shield-halved"></i> Sync Brand Identity</>}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-4xl">
        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 italic">Protocol Advisory</p>
        <p className="text-[10px] text-red-800 leading-relaxed font-medium">Updating the Site Title and Favicon will affect how the application appears in browser tabs and search engine results globally across the network.</p>
      </div>
    </div>
  );
};

export default AdminIdentity;
