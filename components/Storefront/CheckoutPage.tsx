
import React from 'react';
import { CartItem, CheckoutField, ShippingOption, PaymentMethod, Customer } from '../../types.ts';

interface CheckoutPageProps {
  cart: CartItem[];
  checkoutFields: CheckoutField[];
  shippingOptions: ShippingOption[];
  paymentMethods: PaymentMethod[];
  selectedShipping: ShippingOption | null;
  selectedPayment: PaymentMethod | null;
  checkoutForm: Record<string, any>;
  checkoutError: string | null;
  isPlacingOrder: boolean;
  createAccount: boolean;
  accountPassword: string;
  currentCustomer: Customer | null;
  onFormChange: (field: string, value: any) => void;
  onShippingChange: (option: ShippingOption) => void;
  onPaymentChange: (method: PaymentMethod) => void;
  onToggleCreateAccount: (val: boolean) => void;
  onPasswordChange: (val: string) => void;
  onUpdateCartQuantity: (idx: number, delta: number) => void;
  onRemoveFromCart: (idx: number) => void;
  onPlaceOrder: () => void;
  onNavigate: (view: any) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart, checkoutFields, shippingOptions, paymentMethods, selectedShipping, selectedPayment,
  checkoutForm, checkoutError, isPlacingOrder, createAccount, accountPassword, currentCustomer,
  onFormChange, onShippingChange, onPaymentChange, onToggleCreateAccount, onPasswordChange,
  onUpdateCartQuantity, onRemoveFromCart, onPlaceOrder, onNavigate
}) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const finalTotal = subtotal + (selectedShipping?.rate || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-in fade-in duration-500">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl font-black uppercase font-heading italic mb-4">Checkout</h1>
        <div className="w-16 h-1 bg-red-600 mb-2"></div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Fill in your details to complete the order</p>
      </div>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-3xl shadow-sm">
          <i className="fa-solid fa-bag-shopping text-4xl text-gray-200 mb-6"></i>
          <h3 className="text-xl font-black uppercase italic mb-4">Your Cart is Empty</h3>
          <button onClick={() => onNavigate('shop')} className="bg-black text-white px-12 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all">Back to Shop</button>
        </div>
      ) : (
        <>
          {checkoutError && (
            <div className="max-w-4xl mx-auto mb-10 bg-red-600 text-white p-6 rounded-2xl flex items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
              <i className="fa-solid fa-triangle-exclamation text-2xl animate-pulse"></i>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">{checkoutError}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 border border-gray-100 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black uppercase italic mb-8 border-b pb-4 tracking-widest flex items-center gap-3">
                  <i className="fa-solid fa-id-card text-red-600"></i> Shipping Details
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {checkoutFields.filter(f => f.enabled).sort((a,b) => a.order - b.order).map((field) => (
                    <div key={field.id} className={`${field.width === 'half' ? 'col-span-1' : 'col-span-2'} space-y-1`}>
                      <label className="text-[10px] font-black uppercase text-black px-1 tracking-widest">{field.label} {field.required && '*'}</label>
                      <input 
                        type={field.type} 
                        placeholder={field.placeholder.toUpperCase()} 
                        value={checkoutForm[field.field_key] || ''} 
                        onChange={e => onFormChange(field.field_key, e.target.value)} 
                        className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5 border border-transparent focus:border-gray-200 transition-all" 
                      />
                    </div>
                  ))}
                  
                  {!currentCustomer && (
                    <div className="col-span-2 mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" checked={createAccount} onChange={e => onToggleCreateAccount(e.target.checked)} className="w-5 h-5 rounded border-gray-200 text-red-600 focus:ring-red-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-black italic">Create an Account</span>
                       </label>
                       {createAccount && (
                          <div className="space-y-2 animate-in slide-in-from-top-2">
                             <label className="text-[9px] font-black uppercase text-gray-400 px-1 italic">Account Password</label>
                             <input 
                               type="password" 
                               value={accountPassword} 
                               onChange={e => onPasswordChange(e.target.value)} 
                               placeholder="ENTER PASSWORD" 
                               className="w-full bg-white p-4 rounded-xl outline-none font-bold text-xs border-2 border-transparent focus:border-black"
                             />
                          </div>
                       )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-10 border border-gray-100 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black uppercase italic mb-8 border-b pb-4 tracking-widest flex items-center gap-3">
                  <i className="fa-solid fa-truck-fast text-red-600"></i> Shipping Methods
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shippingOptions.map(o => (
                    <div 
                      key={o.id} 
                      onClick={() => onShippingChange(o)} 
                      className={`p-6 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-all duration-300 ${selectedShipping?.id === o.id ? 'border-black bg-black text-white shadow-xl scale-[1.02]' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-black text-[10px] uppercase tracking-widest mb-1">{o.name}</span>
                        <span className={`text-[9px] font-bold ${selectedShipping?.id === o.id ? 'text-gray-300' : 'text-black'} uppercase`}>Delivery Option</span>
                      </div>
                      <span className="font-black italic text-sm">{o.rate}৳</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 border border-gray-100 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black uppercase italic mb-8 border-b pb-4 tracking-widest flex items-center gap-3">
                  <i className="fa-solid fa-credit-card text-red-600"></i> Payment Methods
                </h3>
                <div className="space-y-4">
                  {paymentMethods.map(pm => (
                    <div 
                      key={pm.id}
                      onClick={() => onPaymentChange(pm)}
                      className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${selectedPayment?.id === pm.id ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-black text-xs uppercase tracking-widest">{pm.name}</span>
                         {selectedPayment?.id === pm.id && <i className="fa-solid fa-circle-check text-red-600"></i>}
                      </div>
                      {pm.details && <p className="text-[10px] text-gray-500 font-medium italic leading-relaxed whitespace-pre-line">{pm.details}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-black text-white p-10 rounded-3xl h-fit shadow-2xl sticky top-24">
              <h3 className="text-xl font-black uppercase italic border-b border-white/10 pb-6 mb-8 tracking-tighter font-heading">Order Summary</h3>
              
              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 no-scrollbar border-b border-white/5 pb-8">
                 {cart.map((item, idx) => (
                   <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 items-center animate-in slide-in-from-right-2">
                      <div className="w-12 h-12 bg-white/10 rounded-lg p-1 shrink-0"><img src={item.image} className="w-full h-full object-contain" alt="" /></div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-[9px] font-black uppercase truncate mb-1">{item.name}</h4>
                         <div className="flex items-center gap-2">
                            <div className="flex items-center border border-white/10 rounded-md overflow-hidden bg-white/5">
                               <button 
                                 disabled={item.quantity <= 1}
                                 onClick={() => onUpdateCartQuantity(idx, -1)} 
                                 className="px-2 py-0.5 hover:bg-white/10 transition-colors text-[10px] disabled:opacity-20 disabled:cursor-not-allowed"
                               >-</button>
                               <span className="px-2 font-black text-[9px] border-x border-white/10">{item.quantity}</span>
                               <button onClick={() => onUpdateCartQuantity(idx, 1)} className="px-2 py-0.5 hover:bg-white/10 transition-colors text-[10px]">+</button>
                            </div>
                            <span className="text-[8px] font-bold text-gray-500 uppercase">Size: {item.selectedSize}</span>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black italic">{(item.price * item.quantity).toLocaleString()}৳</p>
                         <button 
                           disabled={cart.length <= 1}
                           onClick={() => onRemoveFromCart(idx)} 
                           className="text-[9px] text-red-600 font-black uppercase hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                         >Remove</button>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/60">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()}৳</span>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/60">
                  <span>Shipping Fee</span>
                  <span>{selectedShipping?.rate || 0}৳</span>
                </div>
                <div className="flex justify-between items-end pt-6 border-t border-white/10">
                  <span className="text-xs font-black uppercase tracking-[0.2em] italic">Total Amount</span>
                  <span className="text-3xl font-black text-red-600">{finalTotal.toLocaleString()}৳</span>
                </div>
              </div>
              
              <button 
                onClick={onPlaceOrder} 
                disabled={isPlacingOrder || cart.length === 0} 
                className="w-full bg-red-700 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-white hover:text-black transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                {isPlacingOrder ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-lock text-sm"></i> Place Order</>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutPage;
