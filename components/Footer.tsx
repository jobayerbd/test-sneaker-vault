
import React from 'react';
import { FooterConfig } from '../types.ts';

interface FooterProps {
  config: FooterConfig;
  onNavigate: (view: any) => void;
}

const Footer: React.FC<FooterProps> = ({ config, onNavigate }) => {
  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <button onClick={() => onNavigate('home')} className="text-3xl font-black font-heading tracking-tighter italic">
              {config.store_name?.split('VAULT')[0]}<span className="text-red-600">VAULT</span>
            </button>
            <p className="text-gray-400 text-xs leading-relaxed font-medium uppercase tracking-wider max-w-xs">
              {config.description}
            </p>
            <div className="flex space-x-4 pt-4">
              <a href={config.facebook_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <i className="fa-brands fa-facebook-f text-sm"></i>
              </a>
              <a href={config.instagram_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <i className="fa-brands fa-instagram text-sm"></i>
              </a>
              <a href={config.twitter_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <i className="fa-brands fa-twitter text-sm"></i>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-8 italic">Archive Index</h4>
            <ul className="space-y-4">
              {['New Arrivals', 'High Heat Drops', 'Trending Now', 'Best Sellers'].map((item) => (
                <li key={item}>
                  <button onClick={() => onNavigate('shop')} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-8 italic">Protocol Help</h4>
            <ul className="space-y-4">
              {['Shipping Policy', 'Returns & Exchanges', 'Authenticity Guarantee', 'FAQ'].map((item) => (
                <li key={item}>
                  <button className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors text-left">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-8 italic">Intelligence Feed</h4>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Join the vault list for priority access.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-white/5 border border-white/10 py-4 px-5 rounded-sm text-[10px] font-black tracking-widest outline-none focus:border-red-600 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600 hover:text-white transition-colors">
                <i className="fa-solid fa-arrow-right-long"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
            {config.copyright}
          </p>
          <div className="flex space-x-8">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Vault Secured System</span>
            <div className="flex space-x-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
              <i className="fa-brands fa-cc-visa text-xl"></i>
              <i className="fa-brands fa-cc-mastercard text-xl"></i>
              <i className="fa-brands fa-cc-paypal text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
