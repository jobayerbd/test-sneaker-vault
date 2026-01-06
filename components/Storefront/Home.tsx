
import React, { useRef, useEffect, useState } from 'react';
import { Sneaker, HomeSlide } from '../../types.ts';
import HeroSlider from './HeroSlider.tsx';

interface HomeProps {
  sneakers: Sneaker[];
  slides: HomeSlide[];
  onSelectProduct: (sneaker: Sneaker) => void;
  onNavigate: (view: any) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const Home: React.FC<HomeProps> = ({ sneakers = [], slides = [], onSelectProduct, onNavigate, isLoading }) => {
  const newArrivals = [...sneakers].sort((a, b) => {
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  }).slice(0, 8);

  const sections = [
    { 
      id: 'drops',
      title: "SPECIAL OFFERS", 
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

  const ProductSkeleton = () => (
    <div className="bg-white border border-gray-100 p-0 flex flex-col w-full">
      <div className="aspect-[4/5] skeleton-shimmer"></div>
      <div className="p-4 md:p-6 flex flex-col items-center gap-2">
        <div className="h-2 w-3/4 skeleton-shimmer rounded"></div>
        <div className="h-2 w-1/4 skeleton-shimmer rounded"></div>
      </div>
    </div>
  );

  const ProductCard: React.FC<{ sneaker: Sneaker; isLarge?: boolean }> = ({ sneaker, isLarge = false }) => (
    <div 
      onClick={() => onSelectProduct(sneaker)}
      className={`group bg-white border border-gray-100 p-0 flex flex-col cursor-pointer hover:shadow-2xl transition-all duration-500 shrink-0 ${isLarge ? 'w-[calc(50%-8px)] md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]' : 'w-full'}`}
    >
      <div className="relative aspect-[4/5] bg-white overflow-hidden">
        <img src={sneaker.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={sneaker.name} />
      </div>
      <div className="p-4 md:p-6 flex flex-col items-center text-center">
        <h3 className="text-[9px] md:text-[11px] font-black text-gray-900 uppercase mb-1 md:mb-2 truncate w-full tracking-widest">{sneaker.name}</h3>
        <p className="text-xs md:text-sm font-black text-red-600 italic">{sneaker.price}৳</p>
      </div>
    </div>
  );

  const Carousel: React.FC<{ data: Sneaker[] }> = ({ data }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const { current } = scrollRef;
        const scrollAmount = current.clientWidth * 0.8;
        if (direction === 'right') {
          if (current.scrollLeft + current.clientWidth >= current.scrollWidth - 20) current.scrollTo({ left: 0, behavior: 'smooth' });
          else current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
          if (current.scrollLeft <= 10) current.scrollTo({ left: current.scrollWidth, behavior: 'smooth' });
          else current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    };

    useEffect(() => {
      if (isPaused || data.length === 0) return;
      const interval = setInterval(() => scroll('right'), 4000);
      return () => clearInterval(interval);
    }, [data, isPaused]);

    return (
      <div className="relative w-full group" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <div ref={scrollRef} className="flex overflow-x-auto space-x-4 md:space-x-6 pb-8 md:pb-12 pt-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
          {data.map(sneaker => (
            <div key={sneaker.id} className="snap-start contents">
               <ProductCard sneaker={sneaker} isLarge={true} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="w-full aspect-[16/9] md:aspect-[21/9] skeleton-shimmer"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-16 md:space-y-32">
          <section className="flex flex-col items-center">
            <div className="w-48 h-8 skeleton-shimmer mb-8 md:mb-16 rounded"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <HeroSlider slides={slides} onNavigate={onNavigate} />
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 space-y-20 md:space-y-32">
        {/* New Arrivals Section */}
        <section className="flex flex-col items-center">
          <div className="text-center mb-10 md:mb-16 px-4">
            <h2 className="text-xl md:text-2xl font-black text-black font-heading italic tracking-[0.3em] md:tracking-[0.4em] uppercase">NEW ARRIVALS</h2>
            <div className="w-12 md:w-16 h-[3px] md:h-[4px] bg-red-700 mx-auto mt-3 md:mt-4 mb-3 md:mb-4"></div>
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] italic">FRESH STYLES ADDED TO OUR COLLECTION</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full">
            {newArrivals.map(sneaker => <ProductCard key={sneaker.id} sneaker={sneaker} />)}
          </div>
          <button onClick={() => onNavigate('shop')} className="mt-10 md:mt-16 px-8 md:px-12 py-3.5 md:py-4 border-2 border-black text-black text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-black hover:text-white transition-all italic shadow-lg active:scale-95">
            Shop All Products
          </button>
        </section>

        {/* Carousel Sections */}
        {sections.map((section, idx) => (
          <section key={idx} className="flex flex-col w-full">
            <div className="flex justify-between items-end mb-6 md:mb-12 px-2">
              <div>
                <h2 className="text-xl md:text-3xl font-black text-red-700 font-heading italic tracking-[0.15em] md:tracking-[0.2em] uppercase">{section.title}</h2>
                <div className="w-10 md:w-12 h-[2px] md:h-[3px] bg-red-700 mt-2 md:mt-3 mb-2 md:mb-3"></div>
              </div>
            </div>
            {section.data.length > 0 ? (
              <Carousel data={section.data} />
            ) : (
              <div className="py-16 md:py-20 bg-gray-50 border border-dashed rounded-2xl md:rounded-3xl text-center text-[9px] md:text-[10px] font-black uppercase text-gray-400 italic tracking-widest">
                No products found in this archive.
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Home;
