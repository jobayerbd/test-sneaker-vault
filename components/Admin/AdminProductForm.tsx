
import React, { useRef, useState, useEffect } from 'react';
import { Sneaker, BrandEntity, Category, SneakerVariant } from '../../types.ts';

interface AdminProductFormProps {
  product: Partial<Sneaker>;
  brands: BrandEntity[];
  categories: Category[];
  onSave: (product: Partial<Sneaker>) => Promise<boolean>;
  onCancel: () => void;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ 
  product: initialProduct, brands, categories, onSave, onCancel 
}) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Sneaker>>({
    variants: [],
    gallery: [],
    categories: [],
    ...initialProduct
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { callback(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVariant = () => {
    const newVariants = [...(editingProduct.variants || []), { size: '', stock: 0 }];
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = editingProduct.variants?.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const handleUpdateVariant = (index: number, field: keyof SneakerVariant, value: string | number) => {
    const newVariants = [...(editingProduct.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const handleCategoryToggle = (catName: string) => {
    const currentCats = editingProduct.categories || [];
    if (currentCats.includes(catName)) {
      setEditingProduct({ ...editingProduct, categories: currentCats.filter(c => c !== catName) });
    } else {
      setEditingProduct({ ...editingProduct, categories: [...currentCats, catName] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccess(false);
    
    // Logic: original_price (Regular Price) is mandatory. 
    // price (Offer Price) is what the user pays.
    // If user leaves price empty, we set price = original_price.
    const finalData = { ...editingProduct };
    
    if (!finalData.original_price) {
        alert("CRITICAL ERROR: REGULAR PRICE IS MANDATORY");
        setIsSaving(false);
        return;
    }

    if (!finalData.price) {
        finalData.price = finalData.original_price;
    }
    
    try {
      const success = await onSave(finalData);
      if (success) {
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20 relative">
      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-black text-white border-l-4 border-green-500 p-5 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest italic text-green-500">Protocol Secure</p>
                <p className="text-xs font-bold leading-tight uppercase">Vault Synchronized: Data Persisted</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowSuccess(false)} className="text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button 
          type="button"
          onClick={onCancel} 
          className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black transition-all flex items-center"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Return to Hub
        </button>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl max-w-5xl mx-auto">
        <h2 className="text-2xl font-black italic uppercase font-heading mb-10 border-b pb-6">Product Metadata Architecture</h2>
        
        <form onSubmit={handleSubmit} className="space-y-12">
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Core Parameters</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Asset Title*</label>
                <input type="text" required value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none border-2 border-transparent focus:border-black transition-all" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Brand Protocol</label>
                <select value={editingProduct.brand || ''} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none border-2 border-transparent focus:border-black appearance-none cursor-pointer">
                  <option value="">NO BRAND</option>
                  {brands.map(b => <option key={b.id} value={b.name}>{b.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-4 px-1 italic">Category Registry</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={editingProduct.categories?.includes(c.name)} 
                        onChange={() => handleCategoryToggle(c.name)}
                        className="w-5 h-5 rounded border-gray-200 text-red-600 focus:ring-red-600" 
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-black transition-colors">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Regular Price (৳)*</label>
                <input 
                  type="number" 
                  required
                  value={editingProduct.original_price || ''} 
                  onChange={e => setEditingProduct({...editingProduct, original_price: e.target.value === '' ? undefined : Number(e.target.value)})} 
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-black" 
                  placeholder="e.g. 15000"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Offer Price (৳) [Optional]</label>
                <input 
                  type="number" 
                  value={editingProduct.price || ''} 
                  onChange={e => setEditingProduct({...editingProduct, price: e.target.value === '' ? undefined : Number(e.target.value)})} 
                  placeholder="Leave blank to use Regular Price"
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-black" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Colorway Registry</label>
                <input type="text" value={editingProduct.colorway || ''} onChange={e => setEditingProduct({...editingProduct, colorway: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-black" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Fit Intelligence</label>
                <input type="text" value={editingProduct.fit_score || ''} onChange={e => setEditingProduct({...editingProduct, fit_score: e.target.value})} placeholder="e.g. True to Size" className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-black" />
              </div>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Asset Description</label>
              <textarea 
                rows={6} 
                value={editingProduct.description || ''} 
                onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} 
                placeholder="ENTER PRODUCT STORY..."
                className="w-full bg-gray-50 p-4 rounded-xl font-medium text-xs outline-none border-2 border-transparent focus:border-black transition-all resize-none leading-relaxed" 
              />
            </div>
          </section>

          <section className="space-y-6 pt-6 border-t border-gray-50">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Imaging Protocol</h3>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Primary Frame (Main Image)*</label>
              <div className="flex gap-4">
                <input type="text" required value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="URL or Base64" className="flex-1 bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none" />
                <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, (url) => setEditingProduct({...editingProduct, image: url}))} />
                <button type="button" onClick={() => mainImageInputRef.current?.click()} className="bg-black text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase hover:bg-red-700 transition-colors">
                  <i className="fa-solid fa-upload mr-2"></i> Upload
                </button>
              </div>
              {editingProduct.image && <img src={editingProduct.image} className="mt-4 w-32 h-32 border-2 border-gray-100 rounded-2xl object-contain p-2 bg-gray-50" />}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Gallery</label>
              <div className="space-y-4">
                {(editingProduct.gallery || []).map((url, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <input type="text" value={url} onChange={e => {
                      const newGallery = [...(editingProduct.gallery || [])];
                      newGallery[idx] = e.target.value;
                      setEditingProduct({...editingProduct, gallery: newGallery});
                    }} className="flex-1 bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none" />
                    <button type="button" onClick={() => {
                      const newGallery = editingProduct.gallery?.filter((_, i) => i !== idx);
                      setEditingProduct({...editingProduct, gallery: newGallery});
                    }} className="p-4 text-red-600 hover:bg-red-50 rounded-xl">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setEditingProduct({...editingProduct, gallery: [...(editingProduct.gallery || []), '']})} className="w-full border-2 border-dashed border-gray-100 p-6 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:border-black hover:text-black hover:bg-gray-50 transition-all">
                  <i className="fa-solid fa-plus mr-2"></i> Add Gallery Frame
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-6 border-t border-gray-50">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Variant Inventory Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(editingProduct.variants || []).map((variant, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-end gap-4">
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-2">Size</label>
                    <input 
                      type="text" 
                      value={variant.size} 
                      onChange={e => handleUpdateVariant(idx, 'size', e.target.value)}
                      className="w-full bg-white p-3 rounded-xl font-black text-xs outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-2">Stock</label>
                    <input 
                      type="number" 
                      value={variant.stock} 
                      onChange={e => handleUpdateVariant(idx, 'stock', Number(e.target.value))}
                      className="w-full bg-white p-3 rounded-xl font-black text-xs outline-none text-center"
                    />
                  </div>
                  <button type="button" onClick={() => handleRemoveVariant(idx)} className="p-3 text-red-600 hover:bg-red-100 rounded-xl">
                    <i className="fa-solid fa-minus"></i>
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddVariant} className="bg-gray-50 border-2 border-dashed border-gray-200 p-8 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:border-black hover:text-black hover:bg-white transition-all">
                <i className="fa-solid fa-plus-circle text-xl"></i>
              </button>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={isSaving} 
            className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.5em] text-xs shadow-2xl disabled:opacity-50 hover:bg-red-700 transition-all flex items-center justify-center gap-4"
          >
            {isSaving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-shield-halved"></i> Commit Asset Protocol</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
