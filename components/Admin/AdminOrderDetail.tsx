
import React, { useState } from 'react';
import { Order, OrderStatus, TimelineEvent } from '../../types';

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
            <h3 className="text-sm font-black italic uppercase font-heading mb-8 border-b pb-4">Secure Manifest Detail</h3>
            <div className="space-y-6">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-6 items-center">
                  <div className="w-20 h-20 border rounded-xl p-1 shrink-0">
                    <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xs uppercase">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 font-black">SIZE: {item.size} | QTY: {item.quantity}</p>
                  </div>
                  <p className="font-black italic text-sm">{item.price.toLocaleString()}৳</p>
                </div>
              ))}
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

        {/* Intelligence Controls */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
            <h3 className="text-[10px] font-black uppercase text-red-600 mb-6 italic tracking-widest">Protocol Intelligence</h3>
            <div className="space-y-4">
              <select 
                value={pendingStatus} 
                onChange={e => setPendingStatus(e.target.value as OrderStatus)} 
                className="w-full bg-gray-50 p-4 rounded-xl font-black uppercase text-xs outline-none border-2 border-transparent focus:border-black"
              >
                {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
              <button 
                disabled={isUpdating || pendingStatus === order.status} 
                onClick={handleUpdate} 
                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-30 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                {isUpdating ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-check-double"></i> Commit Status</>}
              </button>
            </div>
          </div>
          <div className="bg-black text-white p-8 rounded-3xl shadow-2xl">
            <h3 className="text-[10px] font-black uppercase text-red-600 mb-6 italic tracking-widest">Subject Coordinates</h3>
            <div className="space-y-3 text-xs font-bold uppercase">
              <p className="text-gray-400">{order.first_name} {order.last_name}</p>
              <p className="text-gray-400">{order.email}</p>
              <p className="text-gray-400">{order.mobile_number}</p>
              <div className="pt-4 mt-4 border-t border-white/10 italic text-[10px] text-white">
                {order.street_address}<br/>{order.city}, {order.zip_code}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
