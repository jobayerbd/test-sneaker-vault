
import React from 'react';
import { Order } from '../../types.ts';

interface OrderSuccessProps {
  lastOrder: Order | null;
  onNavigate: (view: any) => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ lastOrder, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-24 px-4 animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center mb-16">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 text-white text-4xl shadow-2xl animate-bounce">
          <i className="fa-solid fa-check-double"></i>
        </div>
        <h1 className="text-5xl font-black italic uppercase font-heading mb-4 tracking-tighter">Order Confirmed!</h1>
        <p className="text-gray-400 mb-2 uppercase font-black text-[10px] tracking-[0.5em] italic">Your order has been placed successfully.</p>
        <div className="bg-gray-50 px-6 py-2 rounded-full border border-gray-100 inline-block mt-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-black">Order ID: <span className="text-red-600">{lastOrder?.id}</span></p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl">
           <h3 className="text-xs font-black uppercase italic tracking-widest border-b border-gray-50 pb-4 mb-6">Customer Details</h3>
           <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-gray-400 mb-1">Full Name</span>
                <span className="text-xs font-bold uppercase">{lastOrder?.first_name} {lastOrder?.last_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-gray-400 mb-1">Contact Info</span>
                <span className="text-xs font-bold uppercase">{lastOrder?.mobile_number}</span>
                <span className="text-[10px] font-medium lowercase text-gray-500">{lastOrder?.email}</span>
              </div>
           </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl">
           <h3 className="text-xs font-black uppercase italic tracking-widest border-b border-gray-50 pb-4 mb-6">Shipping Address</h3>
           <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-gray-400 mb-1">Address</span>
                <span className="text-xs font-bold uppercase">{lastOrder?.street_address}</span>
                <span className="text-xs font-bold uppercase">{lastOrder?.city}, {lastOrder?.zip_code}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-gray-400 mb-1">Shipping Method</span>
                <span className="text-xs font-bold uppercase">{lastOrder?.shipping_name}</span>
              </div>
           </div>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl max-w-2xl mx-auto">
        <div className="bg-black p-8 text-white flex justify-between items-center">
          <h3 className="text-sm font-black uppercase italic tracking-widest font-heading">Order Summary</h3>
          <div className="text-right">
            <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">Payment Method</span>
            <span className="text-[10px] font-black uppercase text-red-600 italic">{lastOrder?.payment_method}</span>
          </div>
        </div>
        <div className="p-8 space-y-6">
          {lastOrder?.items?.map((item, idx) => (
            <div key={idx} className="flex gap-6 items-center border-b border-gray-50 pb-6 last:border-0 last:pb-0">
              <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 shrink-0 border border-gray-100"><img src={item.image} className="w-full h-full object-contain" alt={item.name} /></div>
              <div className="flex-1">
                <h4 className="font-black text-[11px] uppercase tracking-tight mb-1">{item.name}</h4>
                <p className="text-[9px] text-red-600 font-black italic uppercase tracking-widest">Size: {item.size} | Qty: {item.quantity}</p>
              </div>
              <div className="text-right"><p className="text-sm font-black italic">{(item.price * item.quantity).toLocaleString()}৳</p></div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-8 border-t border-gray-100">
          <div className="space-y-3">
            <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-200">
              <span className="text-xs font-black uppercase tracking-widest italic">Total Amount</span>
              <span className="text-3xl font-black text-red-700">{lastOrder?.total?.toLocaleString()}৳</span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-16">
        <button onClick={() => onNavigate('shop')} className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-red-700 transition-all transform active:scale-95">Continue Shopping</button>
      </div>
    </div>
  );
};

export default OrderSuccess;
