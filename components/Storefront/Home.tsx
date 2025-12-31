
import React from 'react';
import { Sneaker } from '../../types';

interface HomeProps {
  sneakers: Sneaker[];
  onSelectProduct: (sneaker: Sneaker) => void;
  onNavigate: (view: any) => void;
}

const Home: React.FC<HomeProps> = ({ sneakers, onSelectProduct, onNavigate }) => {
  const sections = [
    { title: "NEW ARRIVAL", data: sneakers.filter(s => !s.is_drop).slice(0, 4) },
    { title: "HYPE DROPS", subtitle: "EXCLUSIVE LIMITED RELEASES", data: sneakers.filter(s => s.is_drop).slice(0, 4) },
    { title: "TRENDING NOW", data: sneakers.filter(s => s.trending).slice(0, 4) },
  ];

  // Fix: Explicitly type ProductCard as React.FC to avoid issues with reserved 'key' prop during map()
  const ProductCard: React.FC<{ sneaker: Sneaker }> = ({ sneaker }) => (
    <div 
      onClick={() => onSelectProduct(sneaker)}
      className="group bg-white border border-gray-100 p-0 flex flex-col cursor-pointer hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative aspect-[4/5] bg-white overflow-hidden">
        <img 
          src={sneaker.image} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          alt={sneaker.name} 
        />
        {sneaker.is_drop && (
          <div className="absolute top-3 left-3 bg-red-600 text-[8px] text-white font-black px-2 py-1 uppercase tracking-widest italic animate-pulse">High Heat</div>
        )}
      </div>
      
      <div className="p-4 flex flex-col items-center text-center">
        <h3 className="text-[10px] font-black text-gray-900 uppercase mb-1 truncate w-full tracking-widest">{sneaker.name}</h3>
        <p className="text-[11px] font-black text-red-600 italic">{sneaker.price}৳</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <div className="relative w-full aspect-[21/9] bg-[#B91C1C] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-12 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <i key={i} className="fa-solid fa-shield-halved text-white text-4xl m-auto"></i>
            ))}
          </div>
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-yellow-400 text-xs md:text-lg font-black mb-2 tracking-[0.4em] uppercase italic">The Vault Is Open</p>
          <h1 className="text-white text-5xl md:text-9xl font-black font-heading leading-none drop-shadow-2xl italic">
            AUTHENTIC <br />
            <span className="text-yellow-400 italic text-3xl md:text-7xl block mt-2">GRAILS ONLY</span>
          </h1>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
        {sections.map((section, idx) => (
          <section key={idx} className="flex flex-col items-center">
            <div className="text-center mb-12">
              <h2 className="text-xl font-black text-red-700 font-heading italic tracking-[0.3em] uppercase">{section.title}</h2>
              <div className="w-12 h-[3px] bg-red-700 mx-auto mt-3 mb-3"></div>
              {section.subtitle && <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">{section.subtitle}</p>}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
              {section.data.map(sneaker => (
                <ProductCard key={sneaker.id} sneaker={sneaker} />
              ))}
            </div>

            <button 
              onClick={() => onNavigate('shop')}
              className="mt-12 px-8 py-3 border-2 border-black text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all italic"
            >
              Explore Full Collection
            </button>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Home;
