
import React, { useState, useEffect } from 'react';
import { HomeSlide } from '../../types';

interface HeroSliderProps {
  slides: HomeSlide[];
  onNavigate: (view: any) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides, onNavigate }) => {
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
      <div className="relative w-full aspect-[21/9] bg-[#B91C1C] flex items-center justify-center text-center">
        <h1 className="text-white text-5xl md:text-9xl font-black font-heading italic">SNEAKERVAULT</h1>
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
              src={slide.image} 
              className="w-full h-full object-cover" 
              alt={slide.headline} 
            />
          </div>
          
          {/* Dark Tactical Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

          {/* Content */}
          <div className="relative h-full flex flex-col items-start justify-center px-6 md:px-24 max-w-7xl mx-auto">
            <p className={`text-red-600 text-[10px] md:text-sm font-black mb-4 tracking-[0.4em] uppercase italic transition-all duration-700 delay-300 ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              Vault Directive: {idx + 1}/{activeSlides.length}
            </p>
            <h2 className={`text-white text-3xl md:text-7xl lg:text-8xl font-black font-heading leading-none drop-shadow-2xl italic uppercase transition-all duration-700 delay-500 ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {slide.headline.split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}<br/></React.Fragment>
              ))}
            </h2>
            <p className={`text-gray-300 text-xs md:text-lg max-w-xl mt-6 font-medium uppercase tracking-widest leading-relaxed transition-all duration-700 delay-700 ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {slide.subtext}
            </p>
            <button 
              onClick={() => onNavigate(slide.button_link || 'shop')}
              className={`mt-10 px-8 md:px-12 py-3 md:py-4 bg-red-700 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 italic shadow-2xl flex items-center gap-4 group ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              {slide.button_text}
              <i className="fa-solid fa-arrow-right-long group-hover:translate-x-2 transition-transform"></i>
            </button>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-6 md:left-24 flex space-x-4">
        {activeSlides.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrent(idx)}
            className="group flex flex-col items-center"
          >
            <div className={`h-1 transition-all duration-500 rounded-full ${idx === current ? 'w-12 bg-red-600' : 'w-4 bg-white/20 hover:bg-white/40'}`}></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
