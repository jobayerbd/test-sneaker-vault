
import React, { useState } from 'react';
import { HomeSlide } from '../../types.ts';

interface AdminSliderProps {
  slides: HomeSlide[];
  onSave: (slide: Partial<HomeSlide>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const AdminSlider: React.FC<AdminSliderProps> = ({ slides, onSave, onDelete }) => {
  const [editing, setEditing] = useState<Partial<HomeSlide> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.image || !editing?.headline) {
      alert("CRITICAL ERROR: IMAGE AND HEADLINE ARE MANDATORY");
      return;
    }
    setIsSaving(true);
    if (await onSave(editing!)) setEditing(null);
    setIsSaving(false);
  };

  const handleMove = async (slide: HomeSlide, direction: 'up' | 'down') => {
    const currentIndex = sortedSlides.findIndex(s => s.id === slide.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sortedSlides.length) return;

    const targetSlide = sortedSlides[targetIndex];
    
    // Swap orders
    await onSave({ id: slide.id, order: targetSlide.order });
    await onSave({ id: targetSlide.id, order: slide.order });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditing({ ...editing, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic font-heading">Hero Slider Hub</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Managed Front-End Directives</p>
        </div>
        <button 
          onClick={() => setEditing({ headline: '', subtext: '', button_text: 'EXPLORE NOW', button_link: 'shop', active: true, order: slides.length + 1 })} 
          className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all"
        >
          Initialize Slide
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic mb-2">Active Sequence</h3>
          {sortedSlides.map((slide, idx) => (
            <div key={slide.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center gap-6 group hover:shadow-md transition-all relative overflow-hidden">
              <div className="w-32 aspect-video rounded-xl overflow-hidden bg-gray-50 border shrink-0">
                <img src={slide.image} className="w-full h-full object-cover" alt="Preview" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <span className={`w-2 h-2 rounded-full ${slide.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                   <h4 className="text-[11px] font-black uppercase tracking-tight truncate max-w-[150px]">{slide.headline.replace('\\n', ' ')}</h4>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase italic">Index: {slide.order}</p>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-1">
                  <button 
                    disabled={idx === 0}
                    onClick={() => handleMove(slide, 'up')} 
                    className="p-2 bg-gray-50 hover:bg-black hover:text-white rounded-lg transition-all disabled:opacity-10"
                  >
                    <i className="fa-solid fa-chevron-up text-[10px]"></i>
                  </button>
                  <button 
                    disabled={idx === sortedSlides.length - 1}
                    onClick={() => handleMove(slide, 'down')} 
                    className="p-2 bg-gray-50 hover:bg-black hover:text-white rounded-lg transition-all disabled:opacity-10"
                  >
                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                  </button>
                </div>
                <button onClick={() => setEditing(slide)} className="p-4 bg-gray-50 hover:bg-black hover:text-white rounded-xl transition-all">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button onClick={() => { if(confirm('Erase slide from archives?')) onDelete(slide.id) }} className="p-4 bg-gray-50 hover:bg-red-600 hover:text-white rounded-xl transition-all">
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
          {slides.length === 0 && (
            <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-3xl">
              <p className="text-gray-300 font-black uppercase tracking-widest italic">No slider assets registered</p>
            </div>
          )}
        </div>

        {editing && (
          <div className="bg-black text-white p-10 rounded-3xl h-fit sticky top-8 animate-in slide-in-from-bottom-8 shadow-2xl">
            <h3 className="text-xl font-black uppercase italic mb-8 tracking-tighter border-b border-white/10 pb-4 font-heading">Protocol Configuration</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                   <div className="flex-1 h-40 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden relative group">
                      {editing.image ? (
                        <img src={editing.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                           <i className="fa-solid fa-cloud-arrow-up text-3xl mb-2"></i>
                           <span className="text-[9px] font-black uppercase tracking-widest">Upload Key Visual</span>
                        </div>
                      )}
                      <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Headline Matrix (Use \n for split)</label>
                    <textarea 
                      value={editing.headline} 
                      onChange={e => setEditing({...editing, headline: e.target.value})} 
                      className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600 h-24 resize-none" 
                      placeholder="AIR JORDAN 1\nRETRO HIGH OG" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Subtext Directive</label>
                    <input 
                      type="text" 
                      value={editing.subtext} 
                      onChange={e => setEditing({...editing, subtext: e.target.value})} 
                      className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600" 
                      placeholder="THE ULTIMATE GRAIL. SECURED." 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Action Label</label>
                    <input 
                      type="text" 
                      value={editing.button_text} 
                      onChange={e => setEditing({...editing, button_text: e.target.value})} 
                      className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:ring-1 ring-red-600" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block italic">Target Link</label>
                    <input 
                      type="text" 
                      value={editing.button_link} 
                      onChange={e => setEditing({...editing, button_link: e.target.value})} 
                      className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs outline-none focus:ring-1 ring-red-600" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={editing.active} onChange={e => setEditing({...editing, active: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors italic">Activate Asset</span>
                  </label>
                  <div className="text-[9px] font-black uppercase text-gray-600 italic">Sequence Order: {editing.order}</div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSaving} className="flex-1 bg-red-700 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 hover:bg-white hover:text-black transition-all">
                  {isSaving ? 'Syncing...' : 'Commit Protocol'}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-white/10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/20 transition-all">Abort</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlider;
