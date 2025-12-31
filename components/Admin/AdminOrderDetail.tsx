
import React, { useState } from 'react';
import { Order, OrderStatus, TimelineEvent } from '../../types.ts';

interface AdminOrderDetailProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  onBack: () => void;
}

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

const AdminOrderDetail: React.FC<AdminOrderDetailProps> = ({ order: initialOrder, onUpdateStatus, onBack }) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus>(initialOrder.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const subtotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;

  const handleUpdate = async () => {
    setIsUpdating(true);
    const success = await onUpdateStatus(order.id, pendingStatus);
    if (success) {
      const newEvent: TimelineEvent = {
        status: pendingStatus,
        timestamp: new Date().toISOString(),
        note: `Order protocol updated to ${pendingStatus} manually from Command Center.`
      };
      setOrder({
        ...order,
        status: pendingStatus,
        timeline: [...(order.timeline || []), newEvent]
      });
      alert('VAULT UPDATED: Order status and timeline synced successfully.');
    } else {
      alert('ERROR: Connection failed. Could not sync vault.');
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack} 
          className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black transition-all"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Registry Hub
        </button>
        <button onClick={() => window.print()} className="bg-white border p-4 rounded-xl font-black uppercase text-[10px] tracking-widest">
          <i className="fa-solid fa-print mr-2"></i> Print Manifest
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Items Manifest */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h3 className="text-sm font-black italic uppercase font-heading">Secure Manifest Detail</h3>
              <span className="text-[9px] font-black uppercase text-gray-400">Registry ID: {order.id}</span>
            </div>
            <div className="space-y-6">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-6 items-center border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  <div className="w-20 h-20 border rounded-xl p-1 shrink-0 bg-gray-50">
                    <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xs uppercase">{item.name}</h4>
                    <p className="text-[10px] text-red-600 font-black italic mt-1 uppercase tracking-widest">
                      SIZE Index: {item.size} | QTY: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black italic text-sm">{item.price.toLocaleString()}৳</p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase italic">Unit Price</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Settlement Breakdown */}
            <div className="mt-10 pt-10 border-t-2 border-dashed border-gray-100 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Subtotal Protocol</span>
                <span>{subtotal.toLocaleString()}৳</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Logistics Fee ({order.shipping_name || 'Standard'})</span>
                <span>{(order.shipping_rate || 0).toLocaleString()}৳</span>
              </div>
              <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-200">
                <span className="text-xs font-black uppercase tracking-widest italic">Final Settlement Value</span>
                <span className="text-3xl font-black text-red-700">{order.total.toLocaleString()}৳</span>
              </div>
            </div>
          </div>
          
          {/* Order Timeline */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10">
            <h3 className="text-sm font-black italic uppercase font-heading mb-8 border-b pb-4">Order Protocol Timeline</h3>
            <div className="relative pl-8 space-y-8 border-l-2 border-gray-100 ml-4">
              {(order.timeline || []).length > 0 ? (
                [...(order.timeline || [])].reverse().map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${idx === 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <i className={`fa-solid ${getStatusIcon(event.status)} text-[10px]`}></i>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-black' : 'text-gray-400'}`}>{event.status}</span>
                        <span className="text-[9px] font-bold text-gray-300 uppercase">
                          {new Date(event.timestamp).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium italic">{event.note}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-300 italic">No historical data in the vault archives for this protocol.</div>
              )}
            </div>
          </div>
        </div>

        {/* Intelligence Controls & Data */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
            <h3 className="text-[10px] font-black uppercase text-red-600 mb-6 italic tracking-widest">Protocol Intelligence</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Current Status</p>
                <p className="text-xs font-black uppercase italic text-black">{order.status}</p>
              </div>
              <select 
                value={pendingStatus} 
                onChange={e => setPendingStatus(e.target.value as OrderStatus)} 
                className="w-full bg-white border-2 border-gray-100 p-4 rounded-xl font-black uppercase text-xs outline-none focus:border-black transition-all"
              >
                {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
              <button 
                disabled={isUpdating || pendingStatus === order.status} 
                onClick={handleUpdate} 
                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-30 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                {isUpdating ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-check-double"></i> Commit Status Update</>}
              </button>
            </div>
          </div>

          <div className="bg-black text-white p-8 rounded-3xl shadow-2xl space-y-8">
            <div>
              <h3 className="text-[10px] font-black uppercase text-red-600 mb-4 italic tracking-widest">Subject Coordinates</h3>
              <div className="space-y-4 text-xs font-bold uppercase">
                <div className="border-l-2 border-red-600 pl-4">
                  <p className="text-gray-400 text-[9px] mb-1">Identity</p>
                  <p className="text-white">{order.first_name} {order.last_name}</p>
                </div>
                <div className="border-l-2 border-red-600 pl-4">
                  <p className="text-gray-400 text-[9px] mb-1">Contact Sequence</p>
                  <p className="text-white">{order.mobile_number}</p>
                  <p className="text-[10px] font-medium lowercase text-gray-500 mt-1">{order.email}</p>
                </div>
                <div className="border-l-2 border-red-600 pl-4">
                  <p className="text-gray-400 text-[9px] mb-1">Destination Parameters</p>
                  <p className="text-white italic leading-relaxed">
                    {order.street_address}<br/>
                    {order.city}, {order.zip_code}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
               <h3 className="text-[10px] font-black uppercase text-red-600 mb-4 italic tracking-widest">Transaction Protocols</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Gateway</p>
                    <p className="text-[10px] font-black uppercase text-white truncate">{order.payment_method || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Logistics</p>
                    <p className="text-[10px] font-black uppercase text-white truncate">{order.shipping_name || 'N/A'}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
