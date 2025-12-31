
import React, { useRef } from 'react';
import { Sneaker, HomeSlide } from '../../types.ts';
import HeroSlider from './HeroSlider.tsx';

interface HomeProps {
  sneakers: Sneaker[];
  slides: HomeSlide[];
  onSelectProduct: (sneaker: Sneaker) => void;
  onNavigate: (view: any) => void;
  onSearch: (query: string) => void;
}

const Home: React.FC<HomeProps> = ({ sneakers, slides, onSelectProduct, onNavigate }) => {
  // 1. New Arrivals: Automatically sort by most recent additions
  const newArrivals = [...sneakers].sort((a, b) => {
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  }).slice(0, 8);

  // 2. Featured Sections (Managed via Admin)
  const sections = [
    { 
      id: 'drops',
      title: "HYPE DROPS", 
      subtitle: "EXCLUSIVE LIMITED RELEASES", 
      data: sneakers.filter(s => s.is_drop),
      isCarousel: true 
    },
    { 
      id: 'trending',
      title: "TRENDING NOW", 
      data: sneakers.filter(s => s.trending),
      isCarousel: true 
    },
  ];

  const ProductCard: React.FC<{ sneaker: Sneaker; isLarge?: boolean }> = ({ sneaker, isLarge = false }) => (
    <div 
      onClick={() => onSelectProduct(sneaker)}
      className={`group bg-white border border-gray-100 p-0 flex flex-col cursor-pointer hover:shadow-2xl transition-all duration-500 ${isLarge ? 'min-w-[280px] md:min-w-[320px]' : ''}`}
    >
      <div className="relative aspect-[4/5] bg-white overflow-hidden">
        <img 
          src={sneaker.image} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={sneaker.name} 
        />
        {sneaker.is_drop && (
          <div className="absolute top-4 left-4 bg-red-600 text-[9px] text-white font-black px-3 py-1.5 uppercase tracking-widest italic animate-pulse shadow-xl">Vault Priority</div>
        )}
      </div>
      
      <div className="p-6 flex flex-col items-center text-center">
        <h3 className="text-[11px] font-black text-gray-900 uppercase mb-2 truncate w-full tracking-widest">{sneaker.name}</h3>
        <p className="text-sm font-black text-red-600 italic">{sneaker.price}৳</p>
      </div>
    </div>
  );

  const Carousel: React.FC<{ data: Sneaker[] }> = ({ data }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = 300;
        scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      }
    };

    return (
      <div className="relative w-full group">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -translate-x-6 hover:bg-red-700 shadow-2xl"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto space-x-6 pb-12 pt-4 no-scrollbar scroll-smooth"
        >
          {data.map(sneaker => (
            <ProductCard key={sneaker.id} sneaker={sneaker} isLarge />
          ))}
        </div>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center translate-x-6 hover:bg-red-700 shadow-2xl"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Dynamic Hero Slider */}
      <HeroSlider slides={slides} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-32">
        
        {/* Automatic New Arrivals Section (Standard Grid) */}
        <section className="flex flex-col items-center">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-black text-black font-heading italic tracking-[0.4em] uppercase">NEW ARRIVALS</h2>
            <div className="w-16 h-[4px] bg-red-700 mx-auto mt-4 mb-4"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">FRESH ASSETS JUST SECURED IN THE VAULT</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
            {newArrivals.map(sneaker => (
              <ProductCard key={sneaker.id} sneaker={sneaker} />
            ))}
          </div>

          <button 
            onClick={() => onNavigate('shop')}
            className="mt-16 px-12 py-4 border-2 border-black text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all italic shadow-lg"
          >
            Explore All Assets
          </button>
        </section>

        {/* Managed Featured Sections (Carousel Layout) */}
        {sections.map((section, idx) => (
          <section key={idx} className="flex flex-col w-full">
            <div className="flex justify-between items-end mb-12 px-2">
              <div>
                <h2 className="text-3xl font-black text-red-700 font-heading italic tracking-[0.2em] uppercase">{section.title}</h2>
                <div className="w-12 h-[3px] bg-red-700 mt-3 mb-3"></div>
                {section.subtitle && <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">{section.subtitle}</p>}
              </div>
              <button 
                onClick={() => onNavigate('shop')}
                className="text-[10px] font-black uppercase tracking-widest text-black border-b-2 border-transparent hover:border-red-600 transition-all pb-1 hidden sm:block"
              >
                View Registry
              </button>
            </div>

            {section.data.length > 0 ? (
              <Carousel data={section.data} />
            ) : (
              <div className="py-20 bg-gray-50 border border-dashed rounded-3xl text-center text-[10px] font-black uppercase text-gray-400 italic tracking-widest">
                No active assets in this protocol.
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Home;
