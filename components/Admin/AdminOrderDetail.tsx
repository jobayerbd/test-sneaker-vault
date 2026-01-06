
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, TimelineEvent } from '../../types.ts';

interface AdminOrderDetailProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  onDeleteOrder: (id: string) => Promise<boolean>;
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

const AdminOrderDetail: React.FC<AdminOrderDetailProps> = ({ order: initialOrder, onUpdateStatus, onDeleteOrder, onBack }) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus>(initialOrder.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Derive latest status from timeline
  const currentStatus = (order.timeline && order.timeline.length > 0) 
    ? [...order.timeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].status
    : order.status;

  useEffect(() => {
    setOrder(initialOrder);
    // Sync pending status with the derived current status
    const derivedStatus = (initialOrder.timeline && initialOrder.timeline.length > 0)
      ? [...initialOrder.timeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].status
      : initialOrder.status;
    setPendingStatus(derivedStatus);
  }, [initialOrder]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const subtotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;

  const handleUpdate = async () => {
    setIsUpdating(true);
    setNotification(null);
    
    const success = await onUpdateStatus(order.id, pendingStatus);
    
    if (success) {
      setNotification({
        type: 'success',
        message: 'VAULT SYNCED: STATUS SECURED IN DATABASE'
      });
    } else {
      setNotification({
        type: 'error',
        message: 'VAULT ERROR: DATABASE PROTOCOL FAILED'
      });
    }
    setIsUpdating(false);
  };

  const confirmPurge = async () => {
    setIsDeleting(true);
    const success = await onDeleteOrder(order.id);
    if (success) {
      onBack();
    } else {
      alert("ARCHIVE FAILURE: Protocol could not be hidden in the archives.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const resolveCustomerName = (orderData: any) => {
    const first = String(orderData.first_name || '').trim();
    const last = String(orderData.last_name || '').trim();
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    return 'GUEST OPERATOR';
  };

  return (
    <div className="space-y-8 animate-in fade-in relative">
      {/* On-Page Archive Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-14 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 text-center">
            <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10">
              <i className="fa-solid fa-box-archive text-4xl"></i>
            </div>
            <h3 className="text-3xl font-black uppercase italic mb-4 tracking-tighter font-heading">Confirm Archive</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-12 leading-relaxed">
              Archive manifest <span className="text-black font-black">[{order.id}]</span>? It will no longer appear in the active registry list.
            </p>
            <div className="space-y-4">
              <button 
                onClick={confirmPurge}
                disabled={isDeleting}
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-eye-slash"></i>}
                Proceed with Archive
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="w-full bg-gray-50 text-gray-400 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tactical UI Notification System */}
      {notification && (
        <div className={`fixed top-8 right-8 z-[100] max-w-sm w-full p-6 rounded-2xl border-l-4 shadow-2xl animate-in slide-in-from-right-4 duration-300 ${
          notification.type === 'success' ? 'bg-black text-white border-green-500' : 'bg-red-600 text-white border-white'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-500/20' : 'bg-white/20'}`}>
              <i className={`fa-solid ${notification.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest italic">{notification.type === 'success' ? 'Protocol Online' : 'System Alert'}</p>
              <p className="text-xs font-bold leading-tight mt-0.5">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="opacity-40 hover:opacity-100 transition-opacity">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={onBack} 
          className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black transition-all"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Registry Hub
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={() => window.print()} className="bg-white border p-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors flex-1 sm:flex-none">
            <i className="fa-solid fa-print mr-2"></i> Print Manifest
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="bg-amber-50 text-amber-600 border border-amber-100 p-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 hover:text-white transition-all flex-1 sm:flex-none"
          >
            {isDeleting ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-box-archive mr-2"></i> Archive Manifest</>}
          </button>
        </div>
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
                [...(order.timeline || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((event, idx) => (
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
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
            {/* Database Sync Overlay */}
            {isUpdating && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                 <i className="fa-solid fa-circle-notch animate-spin text-red-600 text-2xl mb-2"></i>
                 <p className="text-[8px] font-black uppercase tracking-widest">Syncing Vault...</p>
              </div>
            )}
            <h3 className="text-[10px] font-black uppercase text-red-600 mb-6 italic tracking-widest">Protocol Intelligence</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Live Status Protocol</p>
                <p className="text-xs font-black uppercase italic text-black">{currentStatus}</p>
              </div>
              <select 
                value={pendingStatus} 
                onChange={e => setPendingStatus(e.target.value as OrderStatus)} 
                className="w-full bg-white border-2 border-gray-100 p-4 rounded-xl font-black uppercase text-xs outline-none focus:border-black transition-all"
              >
                {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
              <button 
                disabled={isUpdating || pendingStatus === currentStatus} 
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
                  <p className="text-white font-black">{resolveCustomerName(order)}</p>
                </div>
                <div className="border-l-2 border-red-600 pl-4">
                  <p className="text-gray-400 text-[9px] mb-1">Contact Sequence</p>
                  <p className="text-white">{order.mobile_number || 'NOT PROVIDED'}</p>
                  <p className="text-[10px] font-medium lowercase text-gray-500 mt-1">{order.email === 'EMPTY' ? 'Guest Participation' : order.email}</p>
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
