
import React, { useMemo } from 'react';
import { Sneaker } from '../../types.ts';

interface ShopProps {
  sneakers: Sneaker[];
  onSelectProduct: (sneaker: Sneaker) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
  categoryFilter?: string | null;
  onCategoryChange?: (slug: string | null) => void;
  isLoading?: boolean;
}

const Shop: React.FC<ShopProps> = ({ 
  sneakers, 
  onSelectProduct, 
  searchQuery = '', 
  onClearSearch, 
  categoryFilter,
  onCategoryChange,
  isLoading
}) => {
  const filteredSneakers = useMemo(() => {
    let results = sneakers;
    if (categoryFilter) {
      results = results.filter(s => {
        const productCats = (s.categories || [s.category]).map(c => c?.toLowerCase());
        const target = categoryFilter.toLowerCase();
        return (productCats.some(c => c === target || c?.replace(/\s+/g, '-') === target) || (s.brand && s.brand.toLowerCase() === target));
      });
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(s => s.name.toLowerCase().includes(query) || (s.brand && s.brand.toLowerCase().includes(query)));
    }
    return results;
  }, [sneakers, searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    sneakers.forEach(s => { if (s.categories) s.categories.forEach(c => cats.add(c)); else if (s.category) cats.add(s.category); });
    return Array.from(cats);
  }, [sneakers]);

  const ProductSkeleton = () => (
    <div className="flex flex-col">
      <div className="aspect-[4/5] skeleton-shimmer rounded-xl mb-4"></div>
      <div className="h-3 w-3/4 skeleton-shimmer rounded mb-2"></div>
      <div className="h-3 w-1/4 skeleton-shimmer rounded"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-16 text-center">
        <h1 className="text-5xl font-black italic uppercase font-heading mb-4">Vault Archives</h1>
        <div className="w-20 h-1 bg-red-600 mb-4"></div>
        
        <div className="flex flex-wrap justify-center gap-3 mt-8">
           <button onClick={() => onCategoryChange?.(null)} className={`px-4 py-2 text-[9px] font-black uppercase border transition-all ${!categoryFilter ? 'bg-black text-white' : 'text-gray-400 border-gray-100'}`}>ALL ASSETS</button>
           {categories.map(cat => (
             <button key={cat} onClick={() => onCategoryChange?.(cat.toLowerCase())} className={`px-4 py-2 text-[9px] font-black uppercase border transition-all ${categoryFilter === cat.toLowerCase() ? 'bg-black text-white' : 'text-gray-400 border-gray-100'}`}>{cat.toUpperCase()}</button>
           ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {isLoading ? (
          [...Array(12)].map((_, i) => <ProductSkeleton key={i} />)
        ) : (
          filteredSneakers.map(s => (
            <div key={s.id} onClick={() => onSelectProduct(s)} className="group cursor-pointer flex flex-col">
              <div className="aspect-[4/5] bg-white border border-gray-100 overflow-hidden relative mb-4">
                <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={s.name} />
              </div>
              <h3 className="font-bold text-[10px] uppercase truncate w-full mb-1 tracking-widest">{s.name}</h3>
              <p className="font-black italic text-sm text-red-600">{s.price}৳</p>
            </div>
          ))
        )}
      </div>

      {!isLoading && filteredSneakers.length === 0 && (
        <div className="py-24 text-center">
          <h3 className="text-xl font-black italic uppercase font-heading mb-2">Zero Assets Identified</h3>
        </div>
      )}
    </div>
  );
};

export default Shop;
