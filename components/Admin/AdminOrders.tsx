
import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types.ts';

interface AdminOrdersProps {
  orders: Order[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectOrder: (order: Order) => void;
  onAddOrder: () => void;
  onDeleteOrder: (id: string) => Promise<boolean>;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const getStatusBadgeStyles = (status: string) => {
  if (!status) return 'bg-gray-50 text-gray-700 border-gray-200';
  const s = status.toLowerCase();
  
  if (s.includes('delivered')) return 'bg-green-50 text-green-700 border-green-200';
  if (s.includes('shipped')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s.includes('processing')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (s.includes('returned')) return 'bg-red-50 text-red-700 border-red-200';
  if (s.includes('placed')) return 'bg-purple-50 text-purple-700 border-purple-200';
  
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const AdminOrders: React.FC<AdminOrdersProps> = ({ 
  orders, 
  statusFilter, 
  onStatusFilterChange, 
  searchQuery, 
  onSearchChange, 
  onSelectOrder,
  onAddOrder,
  onDeleteOrder,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  onRefresh,
  isRefreshing
}) => {
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const resolveCustomerName = (order: any) => {
    const first = String(order.first_name || '').trim();
    const last = String(order.last_name || '').trim();
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    return 'GUEST OPERATOR';
  };

  const getLatestStatus = (order: Order) => {
    if (Array.isArray(order.timeline) && order.timeline.length > 0) {
      const sorted = [...order.timeline].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return sorted[0].status;
    }
    return order.status || OrderStatus.PLACED;
  };

  const handleDeleteTrigger = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setDeleteError(null);
    setOrderToDelete(order);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const success = await onDeleteOrder(orderToDelete.id);
      if (success) {
        setOrderToDelete(null);
      } else {
        setDeleteError("Archive Failed. Check permissions or database constraints.");
      }
    } catch (err) {
      setDeleteError("System Error: Operation aborted.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      {/* Tactical Archive Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <i className="fa-solid fa-box-archive text-3xl"></i>
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-3 tracking-tighter font-heading">Archive Protocol</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-8 leading-relaxed">
                You are about to move acquisition manifest <span className="text-black font-black">[{orderToDelete.id}]</span> to the hidden archives. It will no longer appear in the active registry.
              </p>
              
              {deleteError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6 flex items-center gap-3">
                  <i className="fa-solid fa-triangle-exclamation text-red-600"></i>
                  <span className="text-[10px] font-black uppercase text-red-600">{deleteError}</span>
                </div>
              )}

              <div className="space-y-4">
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-eye-slash"></i>}
                  Hide from Registry
                </button>
                <button 
                  onClick={() => setOrderToDelete(null)}
                  disabled={isDeleting}
                  className="w-full bg-gray-50 text-gray-400 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-gray-100 transition-all active:scale-95"
                >
                  Abort Mission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black uppercase italic font-heading">Protocol Registry</h1>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); onRefresh?.(); }}
                className={`w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-black shadow-sm ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
                title="Sync Manifest"
              >
                <i className={`fa-solid fa-sync text-xs ${isRefreshing ? 'animate-spin' : ''}`}></i>
              </button>
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Monitoring {totalItems} Transactions</p>
          </div>
          <button 
            onClick={onAddOrder}
            className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95"
          >
            Create Order Protocol
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-[9px] font-black uppercase text-gray-400 px-1 italic">Start Date</label>
            <input type="date" value={startDate} onChange={e => onStartDateChange(e.target.value)} className="bg-white border p-3 rounded-xl font-black uppercase text-[10px] outline-none w-full" />
          </div>
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-[9px] font-black uppercase text-gray-400 px-1 italic">End Date</label>
            <input type="date" value={endDate} onChange={e => onEndDateChange(e.target.value)} className="bg-white border p-3 rounded-xl font-black uppercase text-[10px] outline-none w-full" />
          </div>
          
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-[9px] font-black uppercase text-gray-400 px-1 italic">Status Protocol</label>
            <select value={statusFilter} onChange={e => onStatusFilterChange(e.target.value)} className="bg-white border p-3 rounded-xl font-black uppercase text-[10px] outline-none w-full">
              <option value="ALL">ALL STATUS</option>
              {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 col-span-1">
             <label className="text-[9px] font-black uppercase text-gray-400 px-1 italic">Search Manifest</label>
             <input type="text" placeholder="SCAN..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="bg-white border p-3 rounded-xl font-black uppercase text-[10px] outline-none w-full md:w-48" />
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {orders.map(order => {
          const currentStatus = getLatestStatus(order);
          // Safety checks for rendering
          const totalDisplay = typeof order.total === 'number' ? order.total.toLocaleString() : '0';
          const dateDisplay = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A';
          
          return (
            <div 
              key={order.id} 
              onClick={() => onSelectOrder(order)}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 active:bg-gray-50 transition-colors relative group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-[10px] font-black text-red-600">{order.id}</p>
                  <h4 className="font-bold text-xs uppercase mt-1">{resolveCustomerName(order)}</h4>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-black italic text-xs">{totalDisplay}৳</p>
                  <button 
                    onClick={(e) => handleDeleteTrigger(e, order)}
                    className="text-gray-300 hover:text-amber-600 transition-colors p-2"
                  >
                    <i className="fa-solid fa-box-archive text-[10px]"></i>
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border ${getStatusBadgeStyles(currentStatus)}`}>
                  {currentStatus}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase italic">
                  {dateDisplay}
                </span>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-[9px] font-black uppercase text-gray-300 italic tracking-widest">Zero records identified</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="px-8 py-6">Protocol ID</th>
              <th className="px-8 py-6">Subject</th>
              <th className="px-8 py-6">Timestamp</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Settlement</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => {
              const currentStatus = getLatestStatus(order);
              // Safety checks for rendering
              const totalDisplay = typeof order.total === 'number' ? order.total.toLocaleString() : '0';
              const dateDisplay = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A';

              return (
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50/50 cursor-pointer group transition-colors" 
                  onClick={() => onSelectOrder(order)}
                >
                  <td className="px-8 py-6 font-mono text-xs font-black">{order.id}</td>
                  <td className="px-8 py-6 font-bold text-xs uppercase">
                    <div className="text-black font-black">{resolveCustomerName(order)}</div>
                    <div className="text-[9px] text-gray-400 font-medium lowercase truncate max-w-[150px]">{order.email === 'EMPTY' ? 'Guest Participant' : order.email}</div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase italic">
                    {dateDisplay}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border w-fit ${getStatusBadgeStyles(currentStatus)}`}>
                      {currentStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black italic text-right">{totalDisplay}৳</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={(e) => handleDeleteTrigger(e, order)}
                      className="p-3 text-gray-300 hover:text-amber-600 transition-all opacity-0 group-hover:opacity-100"
                      title="Archive Protocol"
                    >
                      <i className="fa-solid fa-box-archive"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100">
          <span className="text-[9px] font-black uppercase text-gray-400 italic">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="p-3 bg-gray-50 rounded-xl text-gray-400 disabled:opacity-20"><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
            <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="p-3 bg-gray-50 rounded-xl text-gray-400 disabled:opacity-20"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
