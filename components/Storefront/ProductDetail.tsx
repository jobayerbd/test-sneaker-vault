
import React, { useState, useEffect } from 'react';
import { Sneaker, CartItem } from '../../types';
import { generateHypeDescription } from '../../services/geminiService';
import { MOCK_SNEAKERS } from '../../constants';

interface ProductDetailProps {
  sneaker: Sneaker;
  onAddToCart: (item: CartItem, shouldCheckout?: boolean) => void;
  onBack: () => void;
  onToggleWishlist: (sneaker: Sneaker) => void;
  isInWishlist: boolean;
  onSelectProduct: (sneaker: Sneaker) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  sneaker, 
  onAddToCart, 
  onBack, 
  onToggleWishlist, 
  isInWishlist,
  onSelectProduct
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [mainImage, setMainImage] = useState(sneaker.image);
  const [aiDescription, setAiDescription] = useState(sneaker.description);
  const [loadingAi, setLoadingAi] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('DESCRIPTION');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHype = async () => {
      setLoadingAi(true);
      const desc = await generateHypeDescription(sneaker.name, sneaker.colorway);
      setAiDescription(desc);
      setLoadingAi(false);
    };
    fetchHype();
    window.scrollTo(0,0);
    setMainImage(sneaker.image);
    setSelectedSize('');
    setQuantity(1);
    setError(null);
  }, [sneaker]);

  const handleAction = (directToCheckout: boolean = false) => {
    if (!selectedSize) {
      setError('PROTOCOL ERROR: SIZE INDEX NOT SELECTED');
      // Auto clear after 3 seconds
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const cartItem: CartItem = { 
      ...sneaker, 
      selectedSize, 
      quantity 
    };
    
    onAddToCart(cartItem, directToCheckout);
  };

  const navigateToCategory = (cat: string) => {
    // We use the browser history API to trigger the category filter in App.tsx
    const url = `/?category=${cat.toLowerCase().replace(/\s+/g, '-')}`;
    window.history.pushState({ view: 'shop', category: cat.toLowerCase() }, '', url);
    // Force a popstate event to trigger App.tsx routing logic
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const relatedProducts = MOCK_SNEAKERS.filter(s => s.id !== sneaker.id).slice(0, 4);

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-8 flex items-center space-x-2">
          <button className="cursor-pointer hover:text-black transition-colors" onClick={onBack}>ARCHIVES</button>
          <span className="text-gray-200">/</span>
          <span className="text-gray-400">{sneaker.brand || 'UNBRANDED'}</span>
          <span className="text-gray-200">/</span>
          <span className="text-black italic">{sneaker.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Gallery Thumbnails (Left Column) */}
          <div className="lg:col-span-1 hidden lg:flex flex-col space-y-3">
            {[sneaker.image, ...sneaker.gallery].slice(0, 6).map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`aspect-square border-2 overflow-hidden transition-all duration-300 ${mainImage === img ? 'border-red-600 scale-105' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`variant-${idx}`} />
              </button>
            ))}
          </div>

          {/* Main Image (Center Column) */}
          <div className="lg:col-span-5 relative">
            <div className="border border-gray-100 aspect-[4/5] bg-white overflow-hidden group shadow-sm">
              <img 
                src={mainImage} 
                alt={sneaker.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              />
              {sneaker.is_drop && (
                <div className="absolute top-6 left-6 bg-red-600 text-[10px] text-white font-black px-4 py-2 uppercase tracking-[0.2em] italic shadow-2xl animate-pulse">
                  Vault Priority
                </div>
              )}
            </div>
            
            {/* Mobile Thumbnails */}
            <div className="lg:hidden flex space-x-3 mt-4 overflow-x-auto pb-4 no-scrollbar">
               {[sneaker.image, ...sneaker.gallery].map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img)} 
                  className={`w-16 h-16 border-2 shrink-0 bg-white p-1 transition-all ${mainImage === img ? 'border-red-600' : 'border-gray-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`mobile-variant-${idx}`} />
                </button>
               ))}
            </div>
          </div>

          {/* Product Info (Right Column) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2 italic">{sneaker.brand || 'Vault Original'}</p>
                <h1 className="text-3xl font-black font-heading text-gray-900 leading-tight mb-4 uppercase italic tracking-tight">{sneaker.name}</h1>
              </div>
              <button 
                onClick={() => onToggleWishlist(sneaker)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isInWishlist ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-100 text-gray-300 hover:text-black hover:border-black'}`}
              >
                <i className={`${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart text-lg`}></i>
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-8">
              <span className="text-2xl font-black text-black italic">{sneaker.price}৳</span>
              <span className="text-sm text-gray-300 line-through font-bold">{(sneaker.price * 1.5).toFixed(0)}৳</span>
              <span className="bg-black text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest">33% OFF</span>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                  Protocol Size Index <span className="text-red-600 ml-2">{selectedSize ? `[${selectedSize}]` : '[SELECT]'}</span>
                </label>
                <button className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-black underline underline-offset-4">Size Guide</button>
              </div>
              
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {sneaker.variants.map((v) => (
                  <button
                    key={v.size}
                    disabled={v.stock === 0}
                    onClick={() => {
                      setSelectedSize(v.size);
                      setError(null);
                    }}
                    className={`
                      py-3 text-[11px] font-black border transition-all duration-300
                      ${selectedSize === v.size ? 'border-black bg-black text-white shadow-xl scale-105' : 'border-gray-100 text-gray-600 hover:border-gray-300'}
                      ${v.stock === 0 ? 'opacity-20 cursor-not-allowed bg-gray-50 border-transparent' : ''}
                    `}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-10">
              {/* Custom In-Page Alert */}
              {error && (
                <div className="bg-red-600 text-white p-3 rounded-xl flex items-center justify-center gap-3 animate-in slide-in-from-top-2 duration-300">
                  <i className="fa-solid fa-triangle-exclamation animate-pulse"></i>
                  <span className="text-[9px] font-black uppercase tracking-widest italic">{error}</span>
                </div>
              )}

              {/* Quantity Selector - Large & Circular */}
              <div className="flex items-center border-2 border-gray-100 h-16 rounded-full overflow-hidden bg-gray-50/50">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-16 h-full hover:bg-white transition-colors font-black text-xl"
                >-</button>
                <div className="flex-1 text-center font-black text-base tracking-widest">
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-16 h-full hover:bg-white transition-colors font-black text-xl"
                >+</button>
              </div>
              
              {/* Action Buttons - SIDE-BY-SIDE ON THE SAME LINE */}
              <div className="flex flex-row gap-2 sm:gap-4 h-16">
                <button 
                  onClick={() => handleAction(false)}
                  className="flex-1 h-full bg-white border-2 border-black text-black font-black uppercase text-[9px] sm:text-[11px] tracking-widest hover:bg-black hover:text-white transition-all duration-300 rounded-full flex items-center justify-center px-1"
                >
                  ADD TO CART
                </button>
                
                <button 
                  onClick={() => handleAction(true)}
                  className="flex-1 h-full bg-red-700 text-white font-black uppercase text-[9px] sm:text-[11px] tracking-widest hover:bg-black transition-all duration-300 rounded-full shadow-lg shadow-red-700/10 active:scale-95 flex items-center justify-center px-1"
                >
                  BUY NOW
                </button>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-8 space-y-4">
              <div className="flex items-center space-x-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center"><i className="fa-solid fa-truck-fast text-red-600 mr-2"></i> Fast Transit</div>
                <div className="flex items-center"><i className="fa-solid fa-shield-check text-red-600 mr-2"></i> Authenticated</div>
                <div className="flex items-center"><i className="fa-solid fa-rotate text-red-600 mr-2"></i> Easy Return</div>
              </div>
              <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-relaxed">
                <p className="mb-1">ID: SV_{sneaker.id}_PRT</p>
                <div className="flex flex-wrap items-center gap-x-2">
                  <span>CATEGORIES:</span>
                  {(sneaker.categories || [sneaker.category || 'GENERAL']).map((cat, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => navigateToCategory(cat)}
                      className="text-red-600 hover:text-black transition-colors underline underline-offset-2"
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                  <span className="text-gray-200">|</span>
                  <span>{sneaker.brand || 'VAULT'}</span>
                  <span className="text-gray-200">|</span>
                  <span>SEASON_24</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Tabs */}
        <div className="mt-24">
          <div className="flex justify-center border-b border-gray-100 mb-12 overflow-x-auto no-scrollbar whitespace-nowrap">
            {['DESCRIPTION', 'SPECIFICATIONS', 'REVIEWS'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-8 py-4 text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.3em] uppercase transition-all relative shrink-0 ${activeTab === tab ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 animate-in slide-in-from-bottom-1"></div>}
              </button>
            ))}
          </div>
          
          <div className="max-w-3xl mx-auto min-h-[200px]">
            {activeTab === 'DESCRIPTION' && (
              <div className="animate-in fade-in slide-in-from-top-4">
                <p className="text-xs text-gray-500 leading-8 text-center italic font-medium whitespace-pre-wrap">
                  {loadingAi ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-circle-notch animate-spin"></i> Analyzing asset aesthetics...
                    </span>
                  ) : (sneaker.description || aiDescription)}
                </p>
              </div>
            )}
            {activeTab !== 'DESCRIPTION' && (
              <div className="text-center py-10 text-gray-200 italic text-xs uppercase tracking-widest font-black">
                Registry records currently encrypted.
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-32">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-xl font-black text-black font-heading italic tracking-[0.2em] uppercase">Tactical Alternatives</h2>
            <div className="w-12 h-1 bg-red-600 mt-4"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(s => (
              <div 
                key={s.id} 
                onClick={() => onSelectProduct(s)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden border border-gray-100 mb-4 bg-white">
                  <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={s.name} />
                </div>
                <h4 className="text-[10px] font-black uppercase truncate w-full mb-1 tracking-widest">{s.name}</h4>
                <p className="text-xs font-black text-red-600 italic">{s.price}৳</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
