
import React from 'react';
import { CartItem } from '../../types.ts';

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (idx: number, delta: number) => void;
  onRemove: (idx: number) => void;
  onCheckout: () => void;
}

const CartOverlay: React.FC<CartOverlayProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout 
}) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    onCheckout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Desktop Right Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white z-[110] shadow-2xl transition-transform duration-500 transform hidden md:flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 bg-black text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black font-heading italic uppercase tracking-tighter">Shopping Bag</h2>
            <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.3em] mt-1 italic">Secure Vault Archive</p>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <i className="fa-solid fa-bag-shopping text-6xl text-gray-100 mb-6"></i>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic leading-relaxed px-12">
                Your archive is currently empty. Initialize a acquisition protocol to proceed.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-6 items-center animate-in slide-in-from-right-4 duration-300">
                <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-xl p-2 shrink-0 overflow-hidden">
                  <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black uppercase truncate mb-1 tracking-tight">{item.name}</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mb-3">SIZE INDEX: {item.selectedSize}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8">
                       <button onClick={() => onUpdateQuantity(idx, -1)} className="px-3 hover:bg-gray-100 transition-colors text-xs font-black">-</button>
                       <span className="px-3 text-xs font-black border-x border-gray-100 min-w-[32px] text-center">{item.quantity}</span>
                       <button onClick={() => onUpdateQuantity(idx, 1)} className="px-3 hover:bg-gray-100 transition-colors text-xs font-black">+</button>
                    </div>
                    <button onClick={() => onRemove(idx)} className="text-[9px] font-black text-red-600 uppercase hover:text-black transition-colors underline underline-offset-4">Remove</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black italic">{(item.price * item.quantity).toLocaleString()}৳</p>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Acquisition Subtotal</span>
              <span className="text-xl font-black italic">{subtotal.toLocaleString()}৳</span>
            </div>
            <button 
              onClick={handleCheckoutClick}
              className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-4 group"
            >
              <i className="fa-solid fa-lock text-sm group-hover:animate-pulse"></i>
              PROCEED TO CHECKOUT
            </button>
            <p className="text-center text-[8px] text-gray-300 font-bold uppercase tracking-[0.2em]">Shipping and taxes calculated at secure checkout</p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Notification Bar / Sheet */}
      <div 
        className={`fixed bottom-0 left-0 w-full bg-white z-[110] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] transition-transform duration-500 transform md:hidden flex flex-col rounded-t-[2.5rem] overflow-hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2" onClick={onClose} />
        
        <div className="px-8 pb-4 pt-2 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-sm font-black font-heading italic uppercase">Cart ({cart.length})</h3>
          <button onClick={onClose} className="p-2 -mr-2"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[50vh] p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <i className="fa-solid fa-bag-shopping text-4xl text-gray-100 mb-4"></i>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Vault Empty</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-xl p-1 shrink-0"><img src={item.image} className="w-full h-full object-contain" alt="" /></div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-[10px] font-black uppercase truncate mb-1">{item.name}</h4>
                   <div className="flex items-center gap-3">
                      <span className="text-[8px] font-bold text-gray-400 uppercase">SZ: {item.selectedSize}</span>
                      <div className="flex items-center gap-2">
                         <button onClick={() => onUpdateQuantity(idx, -1)} className="w-5 h-5 bg-gray-100 rounded-full text-[10px] font-black">-</button>
                         <span className="text-[10px] font-black">{item.quantity}</span>
                         <button onClick={() => onUpdateQuantity(idx, 1)} className="w-5 h-5 bg-gray-100 rounded-full text-[10px] font-black">+</button>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black italic">{item.price.toLocaleString()}৳</p>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-black text-white space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">Total Settlement</span>
                <span className="text-lg font-black italic">{subtotal.toLocaleString()}৳</span>
             </div>
             <button 
               onClick={handleCheckoutClick}
               className="w-full bg-red-700 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3"
             >
               CHECKOUT NOW
             </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartOverlay;
