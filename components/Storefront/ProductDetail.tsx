
import React, { useState, useEffect } from 'react';
import { Sneaker, CartItem } from '../../types.ts';

interface ProductDetailProps {
  sneaker: Sneaker | null;
  sneakers: Sneaker[];
  onAddToCart: (item: CartItem, shouldCheckout?: boolean) => void;
  onBack: () => void;
  onToggleWishlist: (sneaker: Sneaker) => void;
  isInWishlist: boolean;
  onSelectProduct: (sneaker: Sneaker) => void;
  isLoading?: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  sneaker, sneakers, onAddToCart, onBack, onToggleWishlist, isInWishlist, onSelectProduct, isLoading 
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [mainImage, setMainImage] = useState(sneaker?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('DESCRIPTION');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sneaker) return;
    window.scrollTo(0,0);
    setMainImage(sneaker.image);
    setSelectedSize('');
    setQuantity(1);
    setError(null);
  }, [sneaker?.id]);

  if (isLoading || !sneaker) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-1 hidden lg:flex flex-col space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="aspect-square skeleton-shimmer rounded-lg"></div>)}
            </div>
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] skeleton-shimmer rounded-3xl"></div>
            </div>
            <div className="lg:col-span-6 space-y-6">
              <div className="h-10 w-2/3 skeleton-shimmer rounded"></div>
              <div className="h-8 w-1/4 skeleton-shimmer rounded"></div>
              <div className="space-y-4 pt-10">
                <div className="h-4 w-1/3 skeleton-shimmer rounded"></div>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {[...Array(12)].map((_, i) => <div key={i} className="h-12 skeleton-shimmer rounded-xl"></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = (buyNow: boolean = false) => {
    if (!selectedSize) {
      setError("Please select your size to proceed.");
      return;
    }
    setError(null);
    onAddToCart({
      ...sneaker,
      selectedSize,
      quantity
    }, buyNow);
  };

  const relatedProducts = sneakers
    .filter(s => s.id !== sneaker.id && (s.brand === sneaker.brand || s.category === sneaker.category))
    .slice(0, 4);

  const galleryImages = [sneaker.image, ...sneaker.gallery].slice(0, 6);

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-500">
      {/* Container spacing reduced for mobile: py-4 instead of py-12 */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          
          {/* Main Image Container */}
          <div className="lg:col-span-6 relative group">
            <div className="border border-gray-100 aspect-[4/5] bg-white overflow-hidden shadow-sm relative rounded-2xl md:rounded-3xl">
              <img src={mainImage} className="w-full h-full object-cover" alt="" />
              
              {sneaker.is_drop && (
                <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-red-600 text-white px-3 py-1 md:px-4 md:py-2 text-[8px] md:text-[10px] font-black uppercase italic tracking-widest animate-pulse shadow-xl">
                  Limited Release
                </div>
              )}

              {/* Gallery thumbnails integrated into the image body at the bottom-left */}
              <div className="absolute bottom-4 left-4 flex space-x-2 z-10 max-w-[80%] overflow-x-auto no-scrollbar py-1">
                {galleryImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    onClick={(e) => { e.preventDefault(); setMainImage(img); }} 
                    className={`w-10 h-10 md:w-16 md:h-16 flex-shrink-0 border-2 overflow-hidden transition-all rounded-lg md:rounded-xl shadow-lg ${mainImage === img ? 'border-red-600 scale-105' : 'border-white/50 bg-white/30 backdrop-blur-sm opacity-80 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info - spacing tightened for mobile */}
          <div className="lg:col-span-6 flex flex-col pt-2 md:pt-0">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 italic">{sneaker.brand}</p>
                <h1 className="text-2xl md:text-4xl font-black font-heading text-gray-900 leading-tight mb-2 md:mb-4 uppercase italic tracking-tight">{sneaker.name}</h1>
                <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colorway: {sneaker.colorway}</p>
              </div>
              <button 
                type="button"
                onClick={() => onToggleWishlist(sneaker)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${isInWishlist ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-300 hover:text-red-600'}`}
              >
                <i className={`${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart text-lg md:text-xl`}></i>
              </button>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6 mb-4 md:mb-8">
              <span className="text-3xl md:text-4xl font-black text-black italic">{sneaker.price.toLocaleString()}৳</span>
              {sneaker.original_price && sneaker.original_price > sneaker.price && (
                <span className="text-lg md:text-xl text-gray-300 line-through font-bold">{sneaker.original_price.toLocaleString()}৳</span>
              )}
            </div>

            {/* Size Selection - margin reduced for mobile */}
            <div className="mb-4 md:mb-8">
               <div className="flex justify-between items-center mb-2 md:mb-4 px-1">
                 <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Select Size Index</h4>
                 <button type="button" className="text-[9px] md:text-[10px] font-bold text-gray-400 underline underline-offset-4 hover:text-black">Fit Guide</button>
               </div>
               {error && <p className="text-red-600 text-[9px] font-black uppercase mb-3 animate-pulse"><i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}</p>}
               <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {sneaker.variants.map((v) => (
                  <button 
                    key={v.size} 
                    type="button"
                    disabled={v.stock === 0} 
                    onClick={() => { setSelectedSize(v.size); setError(null); }}
                    className={`py-2 md:py-3 text-[10px] md:text-[11px] font-black border-2 transition-all rounded-lg md:rounded-xl relative ${v.stock === 0 ? 'opacity-20 cursor-not-allowed bg-gray-50' : selectedSize === v.size ? 'border-black bg-black text-white shadow-xl scale-[1.05]' : 'border-gray-100 hover:border-black'}`}
                  >
                    {v.size}
                    {v.stock > 0 && v.stock < 5 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions - more compact on mobile */}
            <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-10">
              <div className="flex items-center border-2 border-gray-100 rounded-xl md:rounded-2xl h-10 md:h-14 bg-white overflow-hidden shadow-sm">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 md:px-6 hover:bg-gray-50 transition-colors font-black text-sm md:text-lg">-</button>
                <span className="px-2 md:px-4 font-black text-xs md:text-sm min-w-[30px] md:min-w-[40px] text-center">{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-4 md:px-6 hover:bg-gray-50 transition-colors font-black text-sm md:text-lg">+</button>
              </div>
              <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {sneaker.fit_score || 'True to Size'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); handleAddToCart(false); }}
                className="bg-black text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-[11px] shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-3 md:gap-4 group"
              >
                <i className="fa-solid fa-bag-shopping group-hover:animate-bounce"></i>
                Add to Bag
              </button>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); handleAddToCart(true); }}
                className="bg-red-700 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-[11px] shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3 md:gap-4 italic group"
              >
                <i className="fa-solid fa-bolt group-hover:animate-pulse"></i>
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Tabs - spacing adjusted */}
        <div className="mt-12 md:mt-24 border-t border-gray-100">
           <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
              {['DESCRIPTION', 'SIZE GUIDE'].map((tab) => (
                <button 
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase transition-all relative ${activeTab === tab ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 animate-in slide-in-from-bottom-1"></div>}
                </button>
              ))}
           </div>
           <div className="py-6 md:py-12 max-w-4xl">
              {activeTab === 'DESCRIPTION' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-gray-600 leading-relaxed text-xs md:text-sm whitespace-pre-line mb-6 md:mb-8">
                    {sneaker.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                     <div className="space-y-4">
                        <h4 className="text-[10px] md:text-xs font-black uppercase italic tracking-widest">Specifications</h4>
                        <div className="space-y-3">
                           <div className="flex justify-between border-b border-gray-50 pb-2">
                              <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400">Colorway</span>
                              <span className="text-[9px] md:text-[10px] font-bold text-black uppercase">{sneaker.colorway}</span>
                           </div>
                           <div className="flex justify-between border-b border-gray-50 pb-2">
                              <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400">Release Date</span>
                              <span className="text-[9px] md:text-[10px] font-bold text-black uppercase">{sneaker.release_date}</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                        <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-4 italic"><i className="fa-solid fa-shield-halved mr-2"></i> Vault Guarantee</h4>
                        <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed">
                          Every asset in our vault undergoes a rigorous multi-point verification protocol by our expert authentication unit. 100% Genuine guaranteed.
                        </p>
                     </div>
                  </div>
                </div>
              )}
              {activeTab === 'SIZE GUIDE' && (
                 <div className="animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs md:text-sm text-gray-600 mb-6">Standard US Men's sizing protocol applied. For conversion to UK or EU standards, refer to our global matrix.</p>
                    <div className="bg-gray-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 flex items-center gap-4 md:gap-6">
                       <i className="fa-solid fa-ruler-combined text-2xl md:text-3xl text-gray-200"></i>
                       <div>
                          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Fit Intelligence</p>
                          <p className="text-base md:text-lg font-black italic uppercase text-red-600">{sneaker.fit_score || 'True to size'}</p>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 md:mt-32">
            <h3 className="text-xl md:text-2xl font-black font-heading italic uppercase tracking-widest mb-8 md:mb-12">Related Assets</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {relatedProducts.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => onSelectProduct(s)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/5] bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 mb-3 md:mb-4">
                    <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  </div>
                  <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">{s.brand}</p>
                  <h4 className="text-[10px] md:text-[11px] font-black uppercase truncate group-hover:text-red-600 transition-colors">{s.name}</h4>
                  <p className="text-xs md:text-sm font-black italic mt-1 md:mt-2">{s.price.toLocaleString()}৳</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
