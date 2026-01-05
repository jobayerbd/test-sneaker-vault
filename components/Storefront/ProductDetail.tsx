
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

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Thumbnails */}
          <div className="lg:col-span-1 hidden lg:flex flex-col space-y-3">
            {[sneaker.image, ...sneaker.gallery].slice(0, 6).map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(img)} 
                className={`aspect-square border-2 overflow-hidden transition-all rounded-lg ${mainImage === img ? 'border-red-600 shadow-lg' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="lg:col-span-5 relative group">
            <div className="border border-gray-100 aspect-[4/5] bg-white overflow-hidden shadow-sm relative rounded-3xl">
              <img src={mainImage} className="w-full h-full object-cover" alt="" />
              {sneaker.is_drop && (
                <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 text-[10px] font-black uppercase italic tracking-widest animate-pulse shadow-xl">
                  Limited Release
                </div>
              )}
            </div>
            {/* Mobile Thumbnails */}
            <div className="flex lg:hidden overflow-x-auto space-x-3 mt-4 no-scrollbar pb-2">
               {[sneaker.image, ...sneaker.gallery].map((img, idx) => (
                <button key={idx} onClick={() => setMainImage(img)} className={`w-20 aspect-square border-2 shrink-0 rounded-xl overflow-hidden ${mainImage === img ? 'border-red-600' : 'border-gray-100'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
               ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2 italic">{sneaker.brand}</p>
                <h1 className="text-3xl md:text-4xl font-black font-heading text-gray-900 leading-tight mb-4 uppercase italic tracking-tight">{sneaker.name}</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Colorway: {sneaker.colorway}</p>
              </div>
              <button 
                onClick={() => onToggleWishlist(sneaker)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isInWishlist ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-300 hover:text-red-600'}`}
              >
                <i className={`${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart text-xl`}></i>
              </button>
            </div>

            <div className="flex items-center space-x-6 mb-8">
              <span className="text-4xl font-black text-black italic">{sneaker.price.toLocaleString()}৳</span>
              {sneaker.original_price && sneaker.original_price > sneaker.price && (
                <span className="text-xl text-gray-300 line-through font-bold">{sneaker.original_price.toLocaleString()}৳</span>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-8">
               <div className="flex justify-between items-center mb-4 px-1">
                 <h4 className="text-[11px] font-black uppercase tracking-widest">Select Size Index</h4>
                 <button className="text-[10px] font-bold text-gray-400 underline underline-offset-4 hover:text-black">Fit Guide</button>
               </div>
               {error && <p className="text-red-600 text-[9px] font-black uppercase mb-3 animate-pulse"><i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}</p>}
               <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {sneaker.variants.map((v) => (
                  <button 
                    key={v.size} 
                    disabled={v.stock === 0} 
                    onClick={() => { setSelectedSize(v.size); setError(null); }}
                    className={`py-3 text-[11px] font-black border-2 transition-all rounded-xl relative ${v.stock === 0 ? 'opacity-20 cursor-not-allowed bg-gray-50' : selectedSize === v.size ? 'border-black bg-black text-white shadow-xl scale-[1.05]' : 'border-gray-100 hover:border-black'}`}
                  >
                    {v.size}
                    {v.stock > 0 && v.stock < 5 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6 mb-10">
              <div className="flex items-center border-2 border-gray-100 rounded-2xl h-14 bg-white overflow-hidden shadow-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-6 hover:bg-gray-50 transition-colors font-black text-lg">-</button>
                <span className="px-4 font-black text-sm min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-6 hover:bg-gray-50 transition-colors font-black text-lg">+</button>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {sneaker.fit_score || 'True to Size'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => handleAddToCart(false)}
                className="bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-4 group"
              >
                <i className="fa-solid fa-bag-shopping group-hover:animate-bounce"></i>
                Add to Bag
              </button>
              <button 
                onClick={() => handleAddToCart(true)}
                className="bg-red-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-4 italic group"
              >
                <i className="fa-solid fa-bolt group-hover:animate-pulse"></i>
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Tabs */}
        <div className="mt-24 border-t border-gray-100">
           <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
              {['DESCRIPTION', 'SIZE GUIDE'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-10 py-6 text-[11px] font-black tracking-[0.4em] uppercase transition-all relative ${activeTab === tab ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 animate-in slide-in-from-bottom-1"></div>}
                </button>
              ))}
           </div>
           <div className="py-12 max-w-4xl">
              {activeTab === 'DESCRIPTION' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line mb-8">
                    {sneaker.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase italic tracking-widest">Specifications</h4>
                        <div className="space-y-3">
                           <div className="flex justify-between border-b border-gray-50 pb-2">
                              <span className="text-[10px] font-black uppercase text-gray-400">Colorway</span>
                              <span className="text-[10px] font-bold text-black uppercase">{sneaker.colorway}</span>
                           </div>
                           <div className="flex justify-between border-b border-gray-50 pb-2">
                              <span className="text-[10px] font-black uppercase text-gray-400">Release Date</span>
                              <span className="text-[10px] font-bold text-black uppercase">{sneaker.release_date}</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-gray-50 p-6 rounded-3xl">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 italic"><i className="fa-solid fa-shield-halved mr-2"></i> Vault Guarantee</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Every asset in our vault undergoes a rigorous multi-point verification protocol by our expert authentication unit. 100% Genuine guaranteed.
                        </p>
                     </div>
                  </div>
                </div>
              )}
              {activeTab === 'SIZE GUIDE' && (
                 <div className="animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-sm text-gray-600 mb-6">Standard US Men's sizing protocol applied. For conversion to UK or EU standards, refer to our global matrix.</p>
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 flex items-center gap-6">
                       <i className="fa-solid fa-ruler-combined text-3xl text-gray-200"></i>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">Fit Intelligence</p>
                          <p className="text-lg font-black italic uppercase text-red-600">{sneaker.fit_score || 'True to size'}</p>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <h3 className="text-2xl font-black font-heading italic uppercase tracking-widest mb-12">Related Assets</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => onSelectProduct(s)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-4">
                    <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  </div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">{s.brand}</p>
                  <h4 className="text-[11px] font-black uppercase truncate group-hover:text-red-600 transition-colors">{s.name}</h4>
                  <p className="text-sm font-black italic mt-2">{s.price.toLocaleString()}৳</p>
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
