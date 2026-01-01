
import React, { useState, useMemo } from 'react';
import { Customer, Order, OrderStatus } from '../../types.ts';

interface AdminCustomersProps {
  customers: Customer[];
  orders: Order[];
  isRefreshing?: boolean;
}

const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers, orders, isRefreshing }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.mobile_number || '').includes(searchQuery)
    );
  }, [customers, searchQuery]);

  const getCustomerOrders = (customer: Customer) => {
    return orders.filter(o => o.customer_id === customer.id || o.email === customer.email);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'text-green-600 bg-green-50';
      case OrderStatus.SHIPPED: return 'text-blue-600 bg-blue-50';
      case OrderStatus.PROCESSING: return 'text-amber-600 bg-amber-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  // Detailed View Component
  if (selectedCustomer) {
    const customerOrders = getCustomerOrders(selectedCustomer);
    const totalSpent = customerOrders.reduce((acc, o) => acc + o.total, 0);

    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedCustomer(null)}
            className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black transition-all flex items-center"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Member Archives
          </button>
          <p className="text-red-600 text-[10px] font-black uppercase italic tracking-widest">Operator Identity Locked</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Coordinates */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-black text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <i className="fa-solid fa-user-shield text-8xl"></i>
               </div>
               <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center font-black text-3xl italic mb-6 border border-white/5">
                    {(selectedCustomer.first_name?.[0] || selectedCustomer.email[0]).toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-black italic uppercase font-heading tracking-tight mb-1">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-8">Registry ID: {selectedCustomer.id}</p>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] font-black uppercase text-red-600 tracking-widest mb-1 italic">Contact Sequence</p>
                      <p className="text-xs font-bold truncate">{selectedCustomer.email}</p>
                      <p className="text-[11px] font-black italic text-gray-400 mt-1">{selectedCustomer.mobile_number || 'NO MOBILE LOGGED'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-red-600 tracking-widest mb-1 italic">Primary Logistics Route</p>
                      <p className="text-xs font-bold leading-relaxed">
                        {selectedCustomer.street_address ? (
                          <>{selectedCustomer.street_address}<br/>{selectedCustomer.city}, {selectedCustomer.zip_code}</>
                        ) : 'COORDINATES NOT LOGGED'}
                      </p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest border-b pb-4 italic text-gray-400">Network Metrics</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                     <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Total Protocols</p>
                     <p className="text-xl font-black italic">{customerOrders.length}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                     <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Vault Value</p>
                     <p className="text-xl font-black italic text-red-600">{totalSpent.toLocaleString()}৳</p>
                  </div>
               </div>
               <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Authorized Since</p>
                  <p className="text-xs font-bold uppercase italic">{selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString() : 'N/A'}</p>
               </div>
            </div>
          </div>

          {/* Right Column: Order Manifest */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
               <div className="bg-gray-50 p-6 border-b flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest italic">Order History Manifest</h3>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Filtered Archives</span>
               </div>
               <div className="divide-y divide-gray-50">
                  {customerOrders.length > 0 ? (
                    customerOrders.map(order => (
                      <div key={order.id} className="p-8 hover:bg-gray-50/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest mb-1">{order.id}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(order.created_at || '').toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black italic mb-1">{order.total.toLocaleString()}৳</p>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${getStatusBadge(order.status)}`}>{order.status}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {order.items?.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-2 bg-gray-50 border px-3 py-1.5 rounded-lg">
                                <img src={item.image} className="w-5 h-5 object-contain" alt="" />
                                <span className="text-[9px] font-black uppercase truncate max-w-[100px]">{item.name}</span>
                                <span className="text-[8px] text-red-600 font-bold">SZ:{item.size}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-24 text-center">
                      <i className="fa-solid fa-folder-open text-gray-100 text-5xl mb-4"></i>
                      <p className="text-[10px] font-black uppercase text-gray-300 italic tracking-[0.4em]">Zero orders linked to this operator</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-black uppercase italic font-heading">Member Archives</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 italic">
            Monitoring {customers.length} Registered Operators
          </p>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="SCAN IDENTITY..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border p-4 rounded-xl font-black uppercase text-[10px] outline-none w-64 focus:border-black transition-all shadow-sm"
          />
          <i className="fa-solid fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="px-8 py-6">Identity</th>
              <th className="px-8 py-6">Contact Sequence</th>
              <th className="px-8 py-6">Logistics Route</th>
              <th className="px-8 py-6">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredCustomers.map((customer) => (
              <tr 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-xs italic group-hover:bg-red-600 transition-colors">
                      {(customer.first_name?.[0] || customer.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-xs uppercase italic group-hover:text-red-600 transition-colors">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {customer.id.split('-')[0]}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-xs font-bold">{customer.email}</div>
                  <div className="text-[10px] text-red-600 font-black italic">{customer.mobile_number || 'NO MOBILE LOGGED'}</div>
                </td>
                <td className="px-8 py-6">
                  {customer.street_address ? (
                    <div className="max-w-[200px]">
                      <div className="text-[10px] font-bold uppercase truncate">{customer.street_address}</div>
                      <div className="text-[9px] text-gray-400 font-black uppercase italic">{customer.city}, {customer.zip_code}</div>
                    </div>
                  ) : (
                    <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest italic">Coordinates Pending</span>
                  )}
                </td>
                <td className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase italic">
                  {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <i className="fa-solid fa-user-secret text-gray-100 text-5xl"></i>
                    <p className="text-[10px] font-black uppercase text-gray-300 italic tracking-[0.4em]">Zero identity matches found in archives</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black text-white p-8 rounded-3xl shadow-2xl">
          <p className="text-[9px] font-black uppercase text-red-600 tracking-widest mb-2 italic">Network Density</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black italic">{customers.length}</h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Registered Assets</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2 italic">Active Operators</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black italic">{customers.filter(c => c.first_name).length}</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Profiles Verified</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2 italic">Protocol Reach</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black italic">{new Set(customers.map(c => c.city).filter(Boolean)).size}</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Active Cities</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
