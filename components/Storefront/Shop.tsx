
import React from 'react';
import { Sneaker } from '../../types';

interface ShopProps {
  sneakers: Sneaker[];
  onSelectProduct: (sneaker: Sneaker) => void;
}

const Shop: React.FC<ShopProps> = ({ sneakers, onSelectProduct }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-16 text-center">
        <h1 className="text-5xl font-black italic uppercase font-heading mb-4">Vault Archives</h1>
        <div className="w-20 h-1 bg-red-600 mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Accessing secured inventory records</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {sneakers.map(s => (
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
            </div>
            <h3 className="font-bold text-[10px] uppercase truncate w-full mb-1 tracking-widest">{s.name}</h3>
            <p className="font-black italic text-sm text-red-600">{s.price}৳</p>
          </div>
        ))}
      </div>

      {sneakers.length === 0 && (
        <div className="py-20 text-center">
          <i className="fa-solid fa-box-open text-gray-200 text-6xl mb-6"></i>
          <p className="text-gray-400 font-bold uppercase tracking-widest italic">No assets found in current sector</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
