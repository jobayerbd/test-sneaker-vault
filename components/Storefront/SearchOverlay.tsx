
import React, { useState, useEffect, useRef } from 'react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSearch }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col items-center justify-center p-6">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-white hover:text-red-600 transition-colors group"
      >
        <i className="fa-solid fa-xmark text-3xl group-hover:rotate-90 transition-transform duration-300"></i>
      </button>

      <div className="w-full max-w-4xl text-center">
        <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.5em] mb-8 italic animate-pulse">
          Initializing Vault Search Protocol
        </p>
        
        <form onSubmit={handleSubmit} className="relative group">
          <input
            ref={inputRef}
            type="text"
            placeholder="SCAN ARCHIVES (e.g. Jordan, Nike, Panda...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-b-4 border-white/10 focus:border-red-600 py-6 text-2xl md:text-5xl font-black text-white uppercase italic outline-none transition-all placeholder:text-white/20 tracking-tighter"
          />
          <button 
            type="submit"
            className="absolute right-0 bottom-6 text-white/40 group-hover:text-red-600 transition-colors"
          >
            <i className="fa-solid fa-arrow-right-long text-3xl"></i>
          </button>
        </form>

        <div className="mt-12 flex flex-wrap justify-center gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <p className="w-full text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 italic">Trending Keywords</p>
          {['JORDAN 4', 'DUNK LOW', 'TRAVIS SCOTT', 'RETRO', 'OFF-WHITE'].map((tag) => (
            <button 
              key={tag}
              onClick={() => { setQuery(tag); onSearch(tag); }}
              className="px-6 py-2 border border-white/10 rounded-full text-[10px] font-black text-white/60 hover:bg-white hover:text-black transition-all uppercase tracking-widest"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">
        <span>Vault Connection: Secured</span>
        <span>Press ESC to abort mission</span>
      </div>
    </div>
  );
};

export default SearchOverlay;
