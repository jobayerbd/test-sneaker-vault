
import React, { useState, useEffect } from 'react';
import { Sneaker, CartItem } from '../../types.ts';
import { generateHypeDescription } from '../../services/geminiService.ts';

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
  const [aiDescription, setAiDescription] = useState(sneaker?.description || '');
  const [loadingAi, setLoadingAi] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('DESCRIPTION');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sneaker) return;
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

  const relatedProducts = sneakers.filter(s => s.id !== sneaker.id).slice(0, 4);

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-1 hidden lg:flex flex-col space-y-3">
            {[sneaker.image, ...sneaker.gallery].slice(0, 6).map((img, idx) => (
              <button key={idx} onClick={() => setMainImage(img)} className={`aspect-square border-2 overflow-hidden transition-all rounded-lg ${mainImage === img ? 'border-red-600' : 'border-gray-100 opacity-60'}`}>
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
          <div className="lg:col-span-5 relative">
            <div className="border border-gray-100 aspect-[4/5] bg-white overflow-hidden shadow-sm relative rounded-3xl">
              <img src={mainImage} className="w-full h-full object-cover" alt="" />
            </div>
          </div>
          <div className="lg:col-span-6 flex flex-col">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2 italic">{sneaker.brand}</p>
            <h1 className="text-3xl font-black font-heading text-gray-900 leading-tight mb-4 uppercase italic tracking-tight">{sneaker.name}</h1>
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-3xl font-black text-black italic">{sneaker.price.toLocaleString()}৳</span>
            </div>
            <div className="mb-8">
               <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {sneaker.variants.map((v) => (
                  <button key={v.size} disabled={v.stock === 0} onClick={() => setSelectedSize(v.size)} className={`py-3 text-[11px] font-black border rounded-xl ${selectedSize === v.size ? 'border-black bg-black text-white' : 'border-gray-100'}`}>{v.size}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
