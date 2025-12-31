
import React, { useRef, useState } from 'react';
import { Sneaker, Brand } from '../../types';

interface AdminProductFormProps {
  product: Partial<Sneaker>;
  onSave: (product: Partial<Sneaker>) => Promise<boolean>;
  onCancel: () => void;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ product: initialProduct, onSave, onCancel }) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Sneaker>>(initialProduct);
  const [isSaving, setIsSaving] = useState(false);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { callback(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(editingProduct);
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <button 
        onClick={onCancel} 
        className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black transition-all"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i> Return to Hub
      </button>

      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-black italic uppercase font-heading mb-8">Asset Initialization</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Asset Title*</label>
              <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none border-2 border-transparent focus:border-black" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Brand Protocol*</label>
              <select value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value as Brand})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none border-2 border-transparent focus:border-black appearance-none cursor-pointer">
                {Object.values(Brand).map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Primary Frame (Main Image)*</label>
            <div className="flex gap-4">
              <input type="text" required value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="URL or Base64" className="flex-1 bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none" />
              <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, (url) => setEditingProduct({...editingProduct, image: url}))} />
              <button type="button" onClick={() => mainImageInputRef.current?.click()} className="bg-black text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase">
                <i className="fa-solid fa-upload mr-2"></i> Upload
              </button>
            </div>
            {editingProduct.image && <img src={editingProduct.image} className="mt-4 w-24 h-24 border rounded-lg object-contain p-1" />}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Asset Gallery (Dynamic Matrix)</label>
            <div className="space-y-4">
              {(editingProduct.gallery || []).map((url, idx) => (
                <div key={idx} className="flex gap-4 items-center animate-in slide-in-from-left-2">
                  <input type="text" value={url} onChange={e => {
                    const newGallery = [...(editingProduct.gallery || [])];
                    newGallery[idx] = e.target.value;
                    setEditingProduct({...editingProduct, gallery: newGallery});
                  }} placeholder="Gallery URL" className="flex-1 bg-gray-50 p-4 rounded-xl font-bold text-xs" />
                  <input type="file" ref={el => { galleryInputRefs.current[idx] = el; }} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, (newUrl) => {
                    const newGallery = [...(editingProduct.gallery || [])];
                    newGallery[idx] = newUrl;
                    setEditingProduct({...editingProduct, gallery: newGallery});
                  })} />
                  <button type="button" onClick={() => galleryInputRefs.current[idx]?.click()} className="bg-gray-100 p-4 rounded-xl text-black hover:bg-gray-200">
                    <i className="fa-solid fa-upload"></i>
                  </button>
                  <button type="button" onClick={() => {
                    const newGallery = editingProduct.gallery?.filter((_, i) => i !== idx);
                    setEditingProduct({...editingProduct, gallery: newGallery});
                  }} className="text-red-600">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setEditingProduct({...editingProduct, gallery: [...(editingProduct.gallery || []), '']})} className="w-full border-2 border-dashed border-gray-200 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:border-black hover:text-black transition-all">
                <i className="fa-solid fa-plus mr-2"></i> Add Gallery Data Point
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Protocol Value (৳)*</label>
              <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Colorway Registry</label>
              <input type="text" value={editingProduct.colorway} onChange={e => setEditingProduct({...editingProduct, colorway: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving} 
            className="w-full bg-red-700 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl disabled:opacity-50 hover:bg-black transition-all"
          >
            {isSaving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Commit Protocol to Vault'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
