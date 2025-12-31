
import React from 'react';
import { Order, OrderStatus } from '../../types.ts';

interface AdminOrdersProps {
  orders: Order[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectOrder: (order: Order) => void;
  // New Props for Pagination and Date Filter
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
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
  totalItems
}) => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-black uppercase italic font-heading">Protocol Registry</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Monitoring {totalItems} Transactions</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          {/* Date Filters */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-gray-400 px-1 italic">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => onStartDateChange(e.target.value)} 
              className="bg-white border p-3 rounded-xl font-black uppercase text-[10px] outline-none hover:border-black transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-gray-400 px-1 italic">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => onEndDateChange(e.target.value)} 
              className="bg-white border p-3 rounded-xl font-black uppercase text-[10px] outline-none hover:border-black transition-all"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-gray-400 px-1 italic">Status Protocol</label>
            <select 
              value={statusFilter} 
              onChange={e => onStatusFilterChange(e.target.value)} 
              className="bg-white border p-3 rounded-xl font-black uppercase text-[10px] outline-none hover:border-black transition-all"
            >
              <option value="ALL">ALL STATUS</option>
              {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Search Registry */}
          <div className="flex flex-col gap-1">
             <label className="text-[9px] font-black uppercase text-gray-400 px-1 italic">Search Manifest</label>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="SCAN REGISTRY..." 
                  value={searchQuery} 
                  onChange={e => onSearchChange(e.target.value)} 
                  className="bg-white border p-3 rounded-xl font-black uppercase text-[10px] outline-none w-48 hover:border-black transition-all" 
                />
                <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]"></i>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
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
                  <div>{order.first_name} {order.last_name}</div>
                  <div className="text-[9px] text-gray-400 font-medium">{order.email}</div>
                </td>
                <td className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase italic">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${getStatusBadgeStyles(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-8 py-6 font-black italic text-right">{order.total.toLocaleString()}৳</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <p className="text-[10px] font-black uppercase text-gray-300 italic tracking-[0.5em]">Zero records identified in current archive scope</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-gray-50/50 px-8 py-6 flex justify-between items-center border-t border-gray-50">
            <span className="text-[10px] font-black uppercase text-gray-400 italic">
              Page {currentPage} of {totalPages} | Total Registry Hits: {totalItems}
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black transition-all disabled:opacity-20"
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
              </button>
              
              {/* Simple page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                // Show first, last, and current +/- 1
                if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                  return (
                    <button
                      key={p}
                      onClick={() => onPageChange(p)}
                      className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border ${currentPage === p ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === currentPage - 2 || p === currentPage + 2) {
                   return <span key={p} className="text-gray-300 text-[10px]">...</span>;
                }
                return null;
              })}

              <button 
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black transition-all disabled:opacity-20"
              >
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
