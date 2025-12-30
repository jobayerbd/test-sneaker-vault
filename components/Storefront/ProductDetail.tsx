import React, { useState, useEffect } from 'react';
import { Sneaker, CartItem } from '../../types';
import { generateHypeDescription } from '../../services/geminiService';
import { MOCK_SNEAKERS } from '../../constants';

interface ProductDetailProps {
  sneaker: Sneaker;
  onAddToCart: (item: CartItem) => void;
  onBack: () => void;
  onToggleWishlist: (sneaker: Sneaker) => void;
  isInWishlist: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  sneaker, 
  onAddToCart, 
  onBack, 
  onToggleWishlist, 
  isInWishlist
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [mainImage, setMainImage] = useState(sneaker.image);
  const [aiDescription, setAiDescription] = useState(sneaker.description);
  const [loadingAi, setLoadingAi] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('DESCRIPTION');

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
  }, [sneaker]);

  const handleAddToCart = (directToCheckout = false) => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    onAddToCart({ ...sneaker, selectedSize, quantity });
    if (directToCheckout) {
      // In a real app, logic to navigate to checkout
      console.log("Navigating to checkout...");
    }
  };

  const relatedProducts = MOCK_SNEAKERS.filter(s => s.id !== sneaker.id).slice(0, 4);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4 flex items-center space-x-2">
          <span className="cursor-pointer hover:text-black" onClick={onBack}>Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-black">{sneaker.brand}</span>
          <span>/</span>
          <span className="text-gray-900">{sneaker.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Gallery Thumbnails (Left Column) */}
          <div className="lg:col-span-1 hidden lg:flex flex-col space-y-2">
            {[sneaker.image, ...sneaker.gallery].slice(0, 6).map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`aspect-square border cursor-pointer p-1 transition-all ${mainImage === img ? 'border-red-600' : 'border-gray-200'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
              </div>
            ))}
          </div>

          {/* Main Image (Center Column) */}
          <div className="lg:col-span-5 relative">
            <div className="border border-gray-100 aspect-[4/5] bg-white overflow-hidden group">
              <img 
                src={mainImage} 
                alt={sneaker.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-4 left-4 w-12 h-12 bg-black/80 rounded-full flex items-center justify-center text-xs text-white font-bold">
                -41%
              </div>
              {/* Overlay for small screens thumbnails */}
              <div className="lg:hidden flex space-x-2 absolute bottom-4 left-4 right-4 overflow-x-auto pb-2">
                 {[sneaker.image, ...sneaker.gallery].map((img, idx) => (
                  <div key={idx} onClick={() => setMainImage(img)} className="w-12 h-12 border border-white shrink-0 bg-white p-0.5">
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Product Info (Right Column) */}
          <div className="lg:col-span-6 flex flex-col">
            <h1 className="text-2xl font-black font-heading text-gray-900 leading-tight mb-2 uppercase italic">{sneaker.name}</h1>
            <div className="w-12 h-[3px] bg-red-700 mb-4"></div>
            
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-sm text-gray-400 line-through font-bold">{(sneaker.price * 1.5).toFixed(0)}৳</span>
              <span className="text-2xl font-black text-red-700 italic">{sneaker.price}৳</span>
            </div>

            <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center mb-6 hover:text-red-700 transition-colors">
              <i className="fa-solid fa-ruler-horizontal mr-2"></i> SIZE CHART
            </button>

            <div className="mb-6">
              <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-3">
                Select Size ↓ (সাইজ সিলেক্ট করুন): <span className="text-gray-400">Size/{selectedSize || '--'}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {sneaker.variants.map((v) => (
                  <button
                    key={v.size}
                    disabled={v.stock === 0}
                    onClick={() => setSelectedSize(v.size)}
                    className={`
                      px-4 py-2 text-[11px] font-bold border transition-all
                      ${selectedSize === v.size ? 'border-red-600 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600 hover:border-black'}
                      ${v.stock === 0 ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    Size/{v.size}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setSelectedSize('')} 
                className="text-[9px] font-bold text-gray-400 uppercase mt-2 hover:text-black underline underline-offset-2"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[11px] font-black text-green-600 uppercase tracking-widest">In stock</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-200 h-12">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full hover:bg-gray-50 font-bold"
                >-</button>
                <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full hover:bg-gray-50 font-bold"
                >+</button>
              </div>
              <button 
                onClick={() => handleAddToCart(false)}
                className="h-12 px-8 bg-[#BDBDBD] text-white font-black uppercase text-[11px] tracking-widest hover:bg-gray-400 transition-colors"
              >
                ADD TO CART
              </button>
              <button 
                onClick={() => handleAddToCart(true)}
                className="h-12 px-8 bg-red-700 text-white font-black uppercase text-[11px] tracking-widest hover:bg-red-800 transition-colors shadow-lg"
              >
                BUY NOW
              </button>
            </div>

            <div className="bg-gray-50 p-4 border border-gray-100 mb-8">
              <p className="text-[11px] text-gray-600 leading-relaxed italic">
                সারাদেশে ২-৫ দিনে হোম-ডেলিভারি। একসাথে যত খুশি পণ্য অর্ডার করুন, ডেলিভারি চার্জ একই থাকবে। প্রয়োজনে কল করুনঃ 01324250470
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU: <span className="text-gray-900">SV_{sneaker.id}_{selectedSize || 'GEN'}</span></p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categories: <span className="text-gray-900">{sneaker.brand}, Hot Deal, New Arrival, Casual Shoes</span></p>
            </div>
          </div>
        </div>

        {/* Info Tabs */}
        <div className="mt-20 border-t border-gray-100">
          <div className="flex justify-center space-x-8 -mt-[1px]">
            {['DESCRIPTION', 'ADDITIONAL INFORMATION', 'REVIEWS (0)', 'SIZE CHARTS'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-[11px] font-black tracking-widest uppercase transition-all border-t-2 ${activeTab === tab ? 'border-red-700 text-red-700' : 'border-transparent text-gray-400 hover:text-black'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="py-10 max-w-4xl mx-auto">
            {activeTab === 'DESCRIPTION' && (
              <div className="text-xs text-gray-600 leading-8 text-center space-y-4">
                <p>
                  {loadingAi ? 'Decoding vault archives...' : aiDescription}
                </p>
                <p>
                  Step up your style and performance with these sleek and versatile sneakers! Designed for both the urban explorer and the everyday adventurer, these shoes feature a durable, multi-textured upper that blends breathable mesh with supportive overlays.
                </p>
              </div>
            )}
            {activeTab !== 'DESCRIPTION' && (
              <div className="text-center py-10 text-gray-300 italic text-sm">
                No information available currently in the vault archives.
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-lg font-black text-gray-900 font-heading italic tracking-wider">RELATED PRODUCTS</h2>
            <div className="w-10 h-[2px] bg-red-700 mx-auto mt-2"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map(s => (
              <div 
                key={s.id} 
                onClick={() => { window.scrollTo(0,0); }}
                className="group border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2 left-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-[9px] text-white font-bold">-48%</div>
                </div>
                <div className="p-4 flex flex-col items-center text-center">
                  <div className="flex gap-1 mb-2">
                    {['40', '42', '44'].map(sz => (
                      <span key={sz} className="text-[8px] font-bold text-gray-400 border border-gray-100 px-1 py-0.5">Size/{sz}</span>
                    ))}
                  </div>
                  <h4 className="text-[10px] font-bold uppercase truncate w-full mb-1">{s.name}</h4>
                  <div className="flex space-x-2">
                    <span className="text-[9px] text-gray-400 line-through">{(s.price * 1.5).toFixed(0)}৳</span>
                    <span className="text-[10px] font-black text-red-700 italic">{s.price}৳</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;