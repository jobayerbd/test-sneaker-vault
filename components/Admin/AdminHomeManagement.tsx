
import React, { useState } from 'react';
import { Sneaker } from '../../types';

interface AdminHomeManagementProps {
  sneakers: Sneaker[];
  onUpdateProduct: (product: Partial<Sneaker>) => Promise<boolean>;
}

const AdminHomeManagement: React.FC<AdminHomeManagementProps> = ({ sneakers, onUpdateProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredSneakers = sneakers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = async (sneaker: Sneaker, field: 'is_drop' | 'trending') => {
    setLoadingId(`${sneaker.id}-${field}`);
    const updatedValue = !sneaker[field];
    const success = await onUpdateProduct({ id: sneaker.id, [field]: updatedValue });
    if (!success) alert("VAULT ERROR: Protocol sync failed.");
    setLoadingId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase italic font-heading">Home Layout Control</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Management protocol for Featured Sections</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="SCAN ASSETS..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border p-4 rounded-xl font-black uppercase text-[10px] outline-none w-64 focus:border-black transition-all"
          />
          <i className="fa-solid fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hype Drops Dashboard */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
          <div className="flex items-center gap-3 mb-8 border-b pb-4">
             <i className="fa-solid fa-fire text-red-600 text-xl"></i>
             <h3 className="text-sm font-black uppercase italic tracking-widest">Hype Drops Registry</h3>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {sneakers.filter(s => s.is_drop).map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-left-2">
                <div className="flex items-center gap-4">
                  <img src={s.image} className="w-12 h-12 object-contain bg-white rounded-lg p-1 border" alt="" />
                  <span className="text-[10px] font-black uppercase truncate max-w-[150px]">{s.name}</span>
                </div>
                <button 
                  onClick={() => handleToggle(s, 'is_drop')}
                  disabled={loadingId === `${s.id}-is_drop`}
                  className="text-red-600 hover:text-black p-2 transition-colors disabled:opacity-30"
                >
                  {loadingId === `${s.id}-is_drop` ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-minus-circle"></i>}
                </button>
              </div>
            ))}
            {sneakers.filter(s => s.is_drop).length === 0 && (
              <p className="text-center py-10 text-[9px] text-gray-400 uppercase font-black italic">No assets tagged for high heat drops</p>
            )}
          </div>
        </div>

        {/* Trending Now Dashboard */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
          <div className="flex items-center gap-3 mb-8 border-b pb-4">
             <i className="fa-solid fa-bolt text-amber-500 text-xl"></i>
             <h3 className="text-sm font-black uppercase italic tracking-widest">Trending Pulse Control</h3>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {sneakers.filter(s => s.trending).map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-right-2">
                <div className="flex items-center gap-4">
                  <img src={s.image} className="w-12 h-12 object-contain bg-white rounded-lg p-1 border" alt="" />
                  <span className="text-[10px] font-black uppercase truncate max-w-[150px]">{s.name}</span>
                </div>
                <button 
                  onClick={() => handleToggle(s, 'trending')}
                  disabled={loadingId === `${s.id}-trending`}
                  className="text-amber-600 hover:text-black p-2 transition-colors disabled:opacity-30"
                >
                  {loadingId === `${s.id}-trending` ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-minus-circle"></i>}
                </button>
              </div>
            ))}
            {sneakers.filter(s => s.trending).length === 0 && (
              <p className="text-center py-10 text-[9px] text-gray-400 uppercase font-black italic">No assets tagged for trending pulse</p>
            )}
          </div>
        </div>
      </div>

      {/* Global Asset Search for Adding to Sections */}
      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl">
        <h3 className="text-[10px] font-black uppercase text-gray-400 mb-8 italic tracking-widest">Asset Management: Global Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSneakers.slice(0, 15).map(s => (
            <div key={s.id} className="p-5 border border-gray-50 bg-gray-50/30 rounded-2xl flex flex-col gap-4 group hover:border-black transition-all">
              <div className="flex gap-4">
                <img src={s.image} className="w-16 h-16 object-contain bg-white rounded-xl p-2 border" alt="" />
                <div className="flex-1">
                  <h4 className="text-[10px] font-black uppercase leading-tight line-clamp-2">{s.name}</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{s.brand}</p>
                </div>
              </div>
              <div className="flex gap-2 border-t border-gray-100 pt-4 mt-auto">
                <button 
                  onClick={() => handleToggle(s, 'is_drop')}
                  className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${s.is_drop ? 'bg-red-600 text-white' : 'bg-white text-gray-400 border border-gray-100 hover:bg-black hover:text-white'}`}
                >
                  {s.is_drop ? 'Hype Drop' : 'Add Hype'}
                </button>
                <button 
                  onClick={() => handleToggle(s, 'trending')}
                  className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${s.trending ? 'bg-amber-500 text-white' : 'bg-white text-gray-400 border border-gray-100 hover:bg-black hover:text-white'}`}
                >
                  {s.trending ? 'Trending' : 'Add Trend'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHomeManagement;
