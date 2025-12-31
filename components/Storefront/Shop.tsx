
import React, { useMemo } from 'react';
import { Sneaker } from '../../types';

interface ShopProps {
  sneakers: Sneaker[];
  onSelectProduct: (sneaker: Sneaker) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
  categoryFilter?: string | null;
  onCategoryChange?: (slug: string | null) => void;
}

const Shop: React.FC<ShopProps> = ({ 
  sneakers, 
  onSelectProduct, 
  searchQuery = '', 
  onClearSearch, 
  categoryFilter,
  onCategoryChange 
}) => {
  const filteredSneakers = useMemo(() => {
    let results = sneakers;
    
    // Apply Category Filter (Handles both single and multiple categories)
    if (categoryFilter) {
      results = results.filter(s => {
        const productCats = (s.categories || [s.category]).map(c => c?.toLowerCase());
        const target = categoryFilter.toLowerCase();
        
        return (
          productCats.some(c => c === target || c?.replace(/\s+/g, '-') === target) ||
          (s.brand && s.brand.toLowerCase() === target)
        );
      });
    }

    // Apply Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(s => 
        s.name.toLowerCase().includes(query) || 
        (s.brand && s.brand.toLowerCase().includes(query)) ||
        (s.colorway && s.colorway.toLowerCase().includes(query)) ||
        (s.categories && s.categories.some(c => c.toLowerCase().includes(query))) ||
        (s.category && s.category.toLowerCase().includes(query))
      );
    }
    
    return results;
  }, [sneakers, searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    sneakers.forEach(s => {
      if (s.categories) {
        s.categories.forEach(c => cats.add(c));
      } else if (s.category) {
        cats.add(s.category);
      }
    });
    return Array.from(cats);
  }, [sneakers]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-16 text-center">
        <h1 className="text-5xl font-black italic uppercase font-heading mb-4">Vault Archives</h1>
        <div className="w-20 h-1 bg-red-600 mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">
          {categoryFilter ? `Active Protocol: ${categoryFilter.toUpperCase()}` : 'Accessing secured inventory records'}
        </p>
        
        {/* Category Quick Filter */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
           <button 
             onClick={() => onCategoryChange?.(null)}
             className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${!categoryFilter ? 'bg-black text-white border-black' : 'text-gray-400 border-gray-100 hover:border-black'}`}
           >
             ALL ASSETS
           </button>
           {categories.map(cat => (
             <button 
               key={cat}
               onClick={() => onCategoryChange?.(cat.toLowerCase())}
               className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${categoryFilter === cat.toLowerCase() ? 'bg-black text-white border-black' : 'text-gray-400 border-gray-100 hover:border-black'}`}
             >
               {cat.toUpperCase()}
             </button>
           ))}
        </div>
        
        {(searchQuery || categoryFilter) && (
          <button 
            onClick={() => {
              onClearSearch?.();
              onCategoryChange?.(null);
            }}
            className="mt-6 text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-600 px-4 py-2 hover:bg-red-600 hover:text-white transition-all italic"
          >
            Reset All Filters
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredSneakers.map(s => (
          <div 
            key={s.id} 
            onClick={() => onSelectProduct(s)} 
            className="group cursor-pointer flex flex-col"
          >
            <div className="aspect-[4/5] bg-white border border-gray-100 overflow-hidden relative mb-4">
              <img 
                src={s.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={s.name}
              />
              {s.is_drop && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] px-2 py-1 uppercase font-black italic animate-pulse">
                  High Heat
                </div>
              )}
            </div>
            <h3 className="font-bold text-[10px] uppercase truncate w-full mb-1 tracking-widest">{s.name}</h3>
            <p className="font-black italic text-sm text-red-600">{s.price}৳</p>
          </div>
        ))}
      </div>

      {filteredSneakers.length === 0 && (
        <div className="py-24 text-center animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-gray-200">
            <i className="fa-solid fa-box-open text-gray-200 text-3xl"></i>
          </div>
          <h3 className="text-xl font-black italic uppercase font-heading mb-2">Zero Assets Identified</h3>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] italic">No records found matching current protocol.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
