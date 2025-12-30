import React, { useState, useEffect } from 'react';
import { MOCK_SNEAKERS } from '../../constants';
import { Sneaker } from '../../types';

interface HomeProps {
  onSelectProduct: (sneaker: Sneaker) => void;
  onNavigate: (view: any) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectProduct, onNavigate }) => {
  const sections = [
    { title: "NEW ARRIVAL", data: MOCK_SNEAKERS.slice(0, 4) },
    { title: "BEST SELLING", subtitle: "BEST SELLING SHOES NOMINATED BY YOU", data: MOCK_SNEAKERS.slice(1, 5) },
    { title: "MENS COLLECTION", data: MOCK_SNEAKERS.slice(0, 4) },
    { title: "LADIES COLLECTION", data: MOCK_SNEAKERS.slice(2, 6) },
  ];

  const ProductCard = ({ sneaker }: { sneaker: Sneaker }) => (
    <div 
      onClick={() => onSelectProduct(sneaker)}
      className="group bg-white border border-gray-100 p-0 flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-[4/5] bg-white overflow-hidden">
        <img 
          src={sneaker.image} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          alt={sneaker.name} 
        />
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
          -41%
        </div>
        {/* Brand Overlay */}
        <div className="absolute top-3 right-3 opacity-30 text-[10px] font-black uppercase tracking-tighter italic">
          {sneaker.brand}
        </div>
      </div>
      
      <div className="p-4 flex flex-col items-center text-center">
        {/* Size Selector Mockup */}
        <div className="flex flex-wrap justify-center gap-1 mb-3">
          {['38', '40', '42', '44'].map(size => (
            <span key={size} className="text-[8px] font-bold text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded-sm">
              Size/{size}
            </span>
          ))}
        </div>
        
        <h3 className="text-[11px] font-bold text-gray-800 uppercase mb-1 truncate w-full">{sneaker.name}</h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-gray-400 line-through">{(sneaker.price * 1.5).toFixed(0)}৳</span>
          <span className="text-[11px] font-black text-red-600 italic">{sneaker.price}৳</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      {/* 1. Winter Fest Banner */}
      <div className="relative w-full aspect-[21/9] md:aspect-[21/7] bg-[#B91C1C] overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Snowflake background simulation */}
          <div className="grid grid-cols-12 grid-rows-6 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <i key={i} className="fa-solid fa-snowflake text-white/40 text-sm m-auto"></i>
            ))}
          </div>
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-yellow-400 text-sm md:text-xl font-bold mb-2 tracking-widest italic drop-shadow-md">মাসব্যাপী শীত উৎসব</p>
          <h1 className="text-white text-5xl md:text-9xl font-black font-heading leading-none drop-shadow-2xl">
            WINTER <br />
            <span className="text-yellow-400 italic text-4xl md:text-8xl mt-[-10px] block">Fest 2025</span>
          </h1>
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-between px-10 text-[10px] text-white font-bold tracking-widest uppercase opacity-80">
            <span>❄ Exclusive offers & deals</span>
            <span>❄ Quality is Affordable</span>
          </div>
        </div>
      </div>

      {/* 2. Promo Grid */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[
          { label: '99 DEALS', color: 'bg-[#7F1D1D]' },
          { label: 'HOT SALE', color: 'bg-black' },
          { label: 'NEW ARRIVAL', color: 'bg-[#1F2937]' }
        ].map((promo, i) => (
          <div key={i} className={`${promo.color} h-32 flex flex-col items-center justify-center text-white relative group cursor-pointer overflow-hidden rounded-sm`}>
            <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-colors"></div>
            <i className="fa-solid fa-gift text-2xl mb-2"></i>
            <span className="text-lg font-black font-heading tracking-widest italic">{promo.label}</span>
            <span className="text-[8px] mt-2 border-b border-white opacity-60">SHOP NOW</span>
          </div>
        ))}
      </div>

      {/* 3. Dynamic Categorical Sections */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
        {sections.map((section, idx) => (
          <section key={idx} className="flex flex-col items-center">
            <div className="text-center mb-10">
              <h2 className="text-lg font-black text-red-700 font-heading italic tracking-wider">{section.title}</h2>
              <div className="w-10 h-[2px] bg-red-700 mx-auto mt-2 mb-2"></div>
              {section.subtitle && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{section.subtitle}</p>}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {section.data.map(sneaker => (
                <ProductCard key={sneaker.id} sneaker={sneaker} />
              ))}
            </div>

            <button 
              onClick={() => onNavigate('shop')}
              className="mt-12 px-6 py-2 border-2 border-red-700 text-red-700 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 hover:text-white transition-all flex items-center"
            >
              Shop All <i className="fa-solid fa-chevron-right ml-2 text-[8px]"></i>
            </button>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Home;