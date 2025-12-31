
import React from 'react';
import { Order, OrderStatus } from '../../types';

interface AdminOrdersProps {
  orders: Order[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectOrder: (order: Order) => void;
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

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, statusFilter, onStatusFilterChange, searchQuery, onSearchChange, onSelectOrder }) => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase italic font-heading">Protocol Registry</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Monitoring {orders.length} Transactions</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={statusFilter} 
            onChange={e => onStatusFilterChange(e.target.value)} 
            className="bg-white border p-4 rounded-xl font-black uppercase text-[10px] outline-none"
          >
            <option value="ALL">ALL STATUS</option>
            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="SEARCH REGISTRY..." 
            value={searchQuery} 
            onChange={e => onSearchChange(e.target.value)} 
            className="bg-white border p-4 rounded-xl font-black uppercase text-[10px] outline-none w-64" 
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="px-8 py-6">Protocol ID</th>
              <th className="px-8 py-6">Subject</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Settlement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => (
              <tr 
                key={order.id} 
                className="hover:bg-gray-50/50 cursor-pointer group" 
                onClick={() => onSelectOrder(order)}
              >
                <td className="px-8 py-6 font-mono text-xs font-black">{order.id}</td>
                <td className="px-8 py-6 font-bold text-xs uppercase">
                  <div>{order.first_name} {order.last_name}</div>
                  <div className="text-[9px] text-gray-400 font-medium">{order.email}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${getStatusBadgeStyles(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-8 py-6 font-black italic text-right">{order.total.toLocaleString()}৳</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
