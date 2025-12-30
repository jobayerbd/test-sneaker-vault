
import React, { useState, useEffect } from 'react';
import { Sneaker, CartItem } from '../../types';
import { generateHypeDescription } from '../../services/geminiService';

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
  const [view360, setView360] = useState(false);

  useEffect(() => {
    const fetchHype = async () => {
      setLoadingAi(true);
      const desc = await generateHypeDescription(sneaker.name, sneaker.colorway);
      setAiDescription(desc);
      setLoadingAi(false);
    };
    fetchHype();
    window.scrollTo(0,0);
  }, [sneaker]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    onAddToCart({ ...sneaker, selectedSize, quantity: 1 });
  };

  const currentVariant = sneaker.variants.find(v => v.size === selectedSize);
  const stock = currentVariant ? currentVariant.stock : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 pb-20">
      <button onClick={onBack} className="flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-black mb-8">
        <i className="fa-solid fa-arrow-left"></i>
        <span>BACK TO SHOP</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Visuals */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src={mainImage} 
              alt={sneaker.name} 
              className={`max-w-full max-h-full object-contain transition-all duration-700 ${view360 ? 'animate-spin-slow' : ''}`} 
            />
            {sneaker.isDrop && (
              <div className="absolute top-6 left-6 flex flex-col space-y-2">
                <span className="bg-red-600 text-white text-xs font-black px-4 py-2 uppercase tracking-widest italic animate-pulse">Rare Vault Find</span>
              </div>
            )}
            <button 
              onClick={() => setView360(!view360)}
              className="absolute bottom-6 right-6 bg-white shadow-lg p-3 rounded-full hover:bg-black hover:text-white transition-colors"
            >
              <i className="fa-solid fa-rotate"></i>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest">360 View</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[sneaker.image, ...sneaker.gallery].map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`aspect-square bg-gray-50 rounded cursor-pointer border-2 transition-all p-2 ${mainImage === img ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
              >
                <img src={img} className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="border-b border-gray-100 pb-6 mb-6">
            <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">{sneaker.brand} / {sneaker.colorway}</p>
            <h1 className="text-4xl font-black font-heading mb-4 leading-tight">{sneaker.name.toUpperCase()}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-black">${sneaker.price}</span>
              {sneaker.originalPrice && sneaker.originalPrice > sneaker.price && (
                <span className="text-xl text-gray-400 line-through">${sneaker.originalPrice}</span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Vault Insider Note</h3>
            <div className="bg-gray-50 p-6 border-l-4 border-black italic">
              {loadingAi ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">"{aiDescription}"</p>
              )}
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold uppercase tracking-widest">Select Size (US Men)</span>
                <button className="text-[10px] font-bold text-gray-500 underline underline-offset-4 hover:text-black">SIZE GUIDE</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sneaker.variants.map((v) => (
                  <button
                    key={v.size}
                    disabled={v.stock === 0}
                    onClick={() => setSelectedSize(v.size)}
                    className={`
                      py-3 font-bold border rounded transition-all
                      ${(v.stock === 0) ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200' : 
                        selectedSize === v.size ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white text-black border-gray-200 hover:border-black'}
                    `}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-gray-500 flex items-center">
                <i className="fa-solid fa-circle-info mr-2"></i>
                FIT: <span className="font-bold text-black ml-1">{sneaker.fitScore}</span>
              </p>
            </div>

            {selectedSize && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${stock > 5 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="text-xs font-bold uppercase tracking-tight">
                    {stock > 5 ? 'In Stock' : `Only ${stock} left in this size!`}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">Ready to ship</span>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-4">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.2em] hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 shadow-xl"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add To Vault</span>
            </button>

            <div className="flex space-x-4">
              <button 
                onClick={() => onToggleWishlist(sneaker)}
                className={`flex-1 border py-4 font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center space-x-2 ${
                  isInWishlist ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-black hover:border-black'
                }`}
              >
                <i className={`${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                <span>{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>
              <button className="flex-1 bg-white border border-gray-200 py-4 font-bold uppercase text-xs tracking-widest hover:border-black transition-colors flex items-center justify-center space-x-2">
                <i className="fa-solid fa-share-nodes"></i>
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-100 rounded">
              <i className="fa-solid fa-shield-check text-green-600 mb-2"></i>
              <p className="text-[10px] font-bold uppercase tracking-tighter">100% Authentic</p>
            </div>
            <div className="text-center p-4 border border-gray-100 rounded">
              <i className="fa-solid fa-truck-fast text-blue-600 mb-2"></i>
              <p className="text-[10px] font-bold uppercase tracking-tighter">Fast Shipping</p>
            </div>
            <div className="text-center p-4 border border-gray-100 rounded">
              <i className="fa-solid fa-rotate-left text-purple-600 mb-2"></i>
              <p className="text-[10px] font-bold uppercase tracking-tighter">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
