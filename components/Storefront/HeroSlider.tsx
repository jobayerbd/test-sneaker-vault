
import React, { useState, useEffect } from 'react';
import { HomeSlide } from '../../types.ts';

interface HeroSliderProps {
  slides: HomeSlide[];
  onNavigate: (view: any) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides = [], onNavigate }) => {
  const activeSlides = slides.filter(s => s.active).sort((a, b) => a.order - b.order);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  if (activeSlides.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[#B91C1C] flex items-center justify-center text-center px-4">
        <h1 className="text-white text-3xl md:text-9xl font-black font-heading italic tracking-tighter uppercase">SNEAKERVAULT</h1>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-black">
      {activeSlides.map((slide, idx) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Ken Burns Effect on Image */}
          <div className={`absolute inset-0 transition-transform duration-[6000ms] ease-linear ${idx === current ? 'scale-110' : 'scale-100'}`}>
            <img 
              src={slide.image || 'https://via.placeholder.com/1920x1080?text=Vault+Visual'} 
              className="w-full h-full object-cover" 
              alt={slide.headline || 'Vault Slide'} 
            />
          </div>
          
          {/* Dark Tactical Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>

          {/* Content */}
          <div className="relative h-full flex flex-col items-start justify-center px-6 md:px-20 max-w-7xl mx-auto">
            <p className={`text-red-600 text-[8px] md:text-sm font-black mb-3 md:mb-4 tracking-[0.3em] md:tracking-[0.4em] uppercase italic transition-all duration-700 delay-300 ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              Vault Directive: {idx + 1}/{activeSlides.length}
            </p>
            <h2 className={`text-white text-2xl md:text-7xl lg:text-8xl font-black font-heading leading-[1.1] md:leading-none drop-shadow-2xl italic uppercase transition-all duration-700 delay-500 ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {(slide.headline || 'PREMIUM FOOTWEAR').replace(/\\n/g, '\n').split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}<br/></React.Fragment>
              ))}
            </h2>
            <p className={`text-gray-300 text-[10px] md:text-lg max-w-xs md:max-w-xl mt-4 md:mt-6 font-medium uppercase tracking-widest leading-relaxed transition-all duration-700 delay-700 ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {slide.subtext || 'SECURE THE ULTIMATE ACQUISITION.'}
            </p>
            <button 
              onClick={() => onNavigate(slide.button_link || 'shop')}
              className={`mt-8 md:mt-10 px-6 md:px-12 py-3 md:py-4 bg-red-700 text-white text-[9px] md:text-xs font-black uppercase tracking-[0.25em] md:tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 italic shadow-2xl flex items-center gap-3 md:gap-4 group active:scale-95 ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              {slide.button_text || 'EXPLORE NOW'}
              <i className="fa-solid fa-arrow-right-long group-hover:translate-x-2 transition-transform"></i>
            </button>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-6 md:bottom-10 left-6 md:left-20 flex space-x-3 md:space-x-4">
        {activeSlides.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrent(idx)}
            className="group flex flex-col items-center"
          >
            <div className={`h-[3px] md:h-1 transition-all duration-500 rounded-full ${idx === current ? 'w-8 md:w-12 bg-red-600' : 'w-3 md:w-4 bg-white/20 hover:bg-white/40'}`}></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
