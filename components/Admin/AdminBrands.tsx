
import React, { useState } from 'react';
import { BrandEntity } from '../../types.ts';

interface AdminBrandsProps {
  brands: BrandEntity[];
  onSave: (brand: Partial<BrandEntity>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const AdminBrands: React.FC<AdminBrandsProps> = ({ brands, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState<Partial<BrandEntity> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing?.name) return;
    setIsSaving(true);
    if (await onSave(isEditing)) setIsEditing(null);
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black uppercase italic font-heading">Brand Registry</h1>
        <button 
          onClick={() => setIsEditing({ name: '' })} 
          className="bg-black text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl"
        >
          Initialize Brand
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-8 py-4">Brand Name</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-sm uppercase">{brand.name}</td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button onClick={() => setIsEditing(brand)} className="text-gray-400 hover:text-black"><i className="fa-solid fa-pen"></i></button>
                    <button onClick={() => { if(confirm('Delete brand?')) onDelete(brand.id) }} className="text-gray-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isEditing && (
          <div className="bg-black text-white p-8 rounded-3xl h-fit sticky top-8 animate-in slide-in-from-right-4">
            <h3 className="text-sm font-black uppercase italic mb-6 tracking-widest">Protocol: {isEditing.id ? 'Edit' : 'New'} Brand</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 block mb-2">Brand Identity</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={isEditing.name} 
                  onChange={e => setIsEditing({...isEditing, name: e.target.value})}
                  className="w-full bg-white/10 border-2 border-transparent focus:border-red-600 p-4 rounded-xl font-bold uppercase text-xs outline-none transition-all"
                  placeholder="e.g. NIKE"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" disabled={isSaving} className="flex-1 bg-red-700 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50">
                  {isSaving ? 'Syncing...' : 'Commit'}
                </button>
                <button type="button" onClick={() => setIsEditing(null)} className="flex-1 bg-white/10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBrands;
