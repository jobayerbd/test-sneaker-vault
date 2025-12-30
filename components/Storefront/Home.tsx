
import React, { useState, useEffect } from 'react';
import { MOCK_SNEAKERS } from '../../constants';
import { Sneaker } from '../../types';

interface HomeProps {
  onSelectProduct: (sneaker: Sneaker) => void;
  onNavigate: (view: any) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectProduct, onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const drops = MOCK_SNEAKERS.filter(s => s.isDrop);
  const trending = MOCK_SNEAKERS.filter(s => s.trending);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        return { ...prev, hours: Math.max(0, prev.hours - 1), minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden bg-black flex items-center">
        <div className="absolute inset-0 opacity-60">
          <img 
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="Hero Background"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl text-white">
            <h1 className="text-7xl font-black font-heading leading-none mb-6 tracking-tighter uppercase italic">
              UNLEASH THE<br /><span className="text-red-600">HYPE</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-md">
              Secure the most coveted releases. Authentic. Verified. Delivered to your vault.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => onNavigate('shop')}
                className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Shop All
              </button>
              <button className="border-2 border-white text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                Upcoming Drops
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Drops Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black font-heading uppercase italic">Next Big Drop</h2>
            <p className="text-gray-500">Don't miss out on the most anticipated releases.</p>
          </div>
          <div className="flex space-x-4">
            <div className="bg-black text-white px-4 py-2 rounded flex flex-col items-center min-w-[60px]">
              <span className="text-xl font-bold">{timeLeft.hours}</span>
              <span className="text-[10px] uppercase">Hrs</span>
            </div>
            <div className="bg-black text-white px-4 py-2 rounded flex flex-col items-center min-w-[60px]">
              <span className="text-xl font-bold">{timeLeft.minutes}</span>
              <span className="text-[10px] uppercase">Min</span>
            </div>
            <div className="bg-black text-white px-4 py-2 rounded flex flex-col items-center min-w-[60px] animate-pulse-red">
              <span className="text-xl font-bold">{timeLeft.seconds}</span>
              <span className="text-[10px] uppercase">Sec</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {drops.map(sneaker => (
            <div 
              key={sneaker.id}
              onClick={() => onSelectProduct(sneaker)}
              className="group cursor-pointer bg-white border border-gray-100 p-4 relative overflow-hidden transition-all hover:shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">Limited Drop</span>
              </div>
              <div className="aspect-square bg-gray-50 mb-4 overflow-hidden rounded">
                <img 
                  src={sneaker.image} 
                  alt={sneaker.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{sneaker.brand}</p>
              <h3 className="text-xl font-bold mb-2 group-hover:text-red-600 transition-colors">{sneaker.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-lg font-black">${sneaker.price}</span>
                <button className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-tighter hover:bg-red-600 transition-colors">
                  Notify Me
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Navigation */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mb-10">Featured Partners</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center opacity-40 grayscale hover:grayscale-0 transition-all">
            {['Nike', 'Adidas', 'Jordan', 'Yeezy', 'New Balance'].map(brand => (
              <span key={brand} className="text-2xl font-black font-heading italic">{brand.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-black font-heading uppercase italic mb-8">Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {trending.map(sneaker => (
            <div 
              key={sneaker.id}
              onClick={() => onSelectProduct(sneaker)}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-gray-50 mb-3 overflow-hidden rounded relative">
                 <img 
                  src={sneaker.image} 
                  alt={sneaker.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform bg-white/90 backdrop-blur-sm">
                   <button className="w-full bg-black text-white py-2 text-[10px] font-bold uppercase tracking-widest">Quick View</button>
                </div>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">{sneaker.brand}</p>
              <h4 className="text-sm font-bold truncate mb-1">{sneaker.name}</h4>
              <p className="text-sm font-black">${sneaker.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
