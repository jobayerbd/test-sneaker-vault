
import React from 'react';
import { Order, OrderStatus } from '../../types.ts';

interface AdminOrdersProps {
  orders: Order[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectOrder: (order: Order) => void;
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
  switch (status) {
    case OrderStatus.DELIVERED: return 'bg-green-50 text-green-700 border-green-200';
    case OrderStatus.SHIPPED: return 'bg-blue-50 text-blue-700 border-blue-200';
    case OrderStatus.PROCESSING: return 'bg-amber-50 text-amber-700 border-amber-200';
    case OrderStatus.RETURNED: return 'bg-red-50 text-red-700 border-red-200';
    case OrderStatus.PLACED: return 'bg-purple-50 text-purple-700 border-purple-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const AdminOrders: React.FC<AdminOrdersProps> = ({ 
  orders, 
  statusFilter, 
  onStatusFilterChange, 
  searchQuery, 
  onSearchChange, 
  onSelectOrder,
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
  
  const resolveCustomerName = (order: any) => {
    const first = String(order.first_name || '').trim();
    const last = String(order.last_name || '').trim();
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    return 'GUEST OPERATOR';
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
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
        {orders.map(order => (
          <div 
            key={order.id} 
            onClick={() => onSelectOrder(order)}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 active:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-[10px] font-black text-red-600">{order.id}</p>
                <h4 className="font-bold text-xs uppercase mt-1">{resolveCustomerName(order)}</h4>
              </div>
              <p className="font-black italic text-xs">{order.total.toLocaleString()}৳</p>
            </div>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border ${getStatusBadgeStyles(order.status)}`}>
                {order.status}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase italic">
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        ))}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => (
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
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border w-fit ${getStatusBadgeStyles(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-8 py-6 font-black italic text-right">{order.total.toLocaleString()}৳</td>
              </tr>
            ))}
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
