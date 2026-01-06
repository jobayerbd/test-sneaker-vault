
import React, { useState } from 'react';
import { vaultApi } from '../../services/api.ts';
import { Order, OrderStatus } from '../../types.ts';

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PLACED: return 'fa-box';
    case OrderStatus.PROCESSING: return 'fa-gears';
    case OrderStatus.SHIPPED: return 'fa-truck-fast';
    case OrderStatus.DELIVERED: return 'fa-house-circle-check';
    case OrderStatus.RETURNED: return 'fa-rotate-left';
    default: return 'fa-circle';
  }
};

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await vaultApi.fetchOrderById(orderId.trim());
      if (result) {
        setOrder(result);
      } else {
        setError("VAULT ERROR: PROTOCOL ID NOT FOUND IN ARCHIVES.");
      }
    } catch (err) {
      setError("SYSTEM FAILURE: CONNECTION TO VAULT INTERRUPTED.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-black rounded-3xl mb-6 shadow-2xl">
          <i className="fa-solid fa-satellite-dish text-white text-3xl"></i>
        </div>
        <h1 className="text-4xl font-black font-heading italic uppercase tracking-tight text-black">TRACK ACQUISITION</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 italic">REAL-TIME VAULT SYNCHRONIZATION</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-12">
        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="fa-solid fa-barcode absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
            <input 
              type="text" 
              placeholder="ENTER PROTOCOL ID (e.g. SV123456)" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-black py-5 pl-14 pr-6 rounded-2xl outline-none transition-all font-black text-xs uppercase tracking-widest shadow-inner"
            />
          </div>
          <button 
            disabled={isLoading}
            className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
            SCAN VAULT
          </button>
        </form>

        {error && (
          <div className="mt-8 bg-red-50 border-l-4 border-red-600 p-6 rounded-r-2xl animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-triangle-exclamation text-red-600 text-xl"></i>
              <span className="text-[10px] font-black uppercase text-red-600 tracking-widest italic">{error}</span>
            </div>
          </div>
        )}
      </div>

      {order && (
        <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-8">
          <div className="bg-black text-white p-10 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
              <i className="fa-solid fa-box-open text-[12rem]"></i>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-10 mb-10">
              <div>
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">MANIFEST SECURED</p>
                <h2 className="text-3xl font-black font-heading italic uppercase tracking-tighter">ORDER: {order.id}</h2>
              </div>
              <div className="text-right">
                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-600 text-red-600 bg-red-600/5`}>
                  STATUS: {order.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 italic mb-6">Subject Logistics</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-red-600 shrink-0 border border-white/5">
                      <i className="fa-solid fa-user-tag"></i>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Acquirer</p>
                      <p className="text-xs font-black uppercase">{order.first_name} {order.last_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-red-600 shrink-0 border border-white/5">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Destination</p>
                      <p className="text-xs font-black uppercase italic leading-relaxed">
                        {order.street_address}<br/>
                        {order.city}, {order.zip_code}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 italic mb-6">Protocol Timeline</h3>
                <div className="relative pl-8 space-y-8 border-l-2 border-white/10 ml-4">
                  {(order.timeline || []).length > 0 ? (
                    [...(order.timeline || [])].reverse().map((event, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full border-4 border-black flex items-center justify-center shadow-sm ${idx === 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-gray-500'}`}>
                          <i className={`fa-solid ${getStatusIcon(event.status)} text-[10px]`}></i>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-white' : 'text-gray-500'}`}>{event.status}</span>
                            <span className="text-[9px] font-bold text-gray-600 uppercase">
                              {new Date(event.timestamp).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium italic">{event.note}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 italic">Historical data encrypted or pending synchronization.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Protocol Security: Active Vault Monitoring Enabled</p>
            <button 
              onClick={() => { setOrder(null); setOrderId(''); }}
              className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-black transition-colors"
            >
              Clear Manifest <i className="fa-solid fa-xmark ml-2"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
