import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Order, OrderStatus, Sneaker } from '../../types';

const data = [
  { name: 'Mon', sales: 4000, traffic: 2400 },
  { name: 'Tue', sales: 3000, traffic: 1398 },
  { name: 'Wed', sales: 2000, traffic: 9800 },
  { name: 'Thu', sales: 2780, traffic: 3908 },
  { name: 'Fri', sales: 1890, traffic: 4800 },
  { name: 'Sat', sales: 2390, traffic: 3800 },
  { name: 'Sun', sales: 3490, traffic: 4300 },
];

const COLORS = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b'];

interface DashboardProps {
  orders: Order[];
  sneakers: Sneaker[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onLogout?: () => void;
}

type AdminSubView = 'overview' | 'orders' | 'inventory' | 'customers' | 'order-detail';

const Dashboard: React.FC<DashboardProps> = ({ orders, sneakers, onRefresh, isRefreshing, onLogout }) => {
  const [subView, setSubView] = useState<AdminSubView>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Derived Data
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        fullName.includes(searchQuery.toLowerCase()) ||
        o.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setSubView('order-detail');
  };

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

  // Sub-components
  const Overview = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight italic text-black">COMMAND CENTER</h1>
          <p className="text-gray-500 text-sm font-medium">Real-time performance monitoring and vault health.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`bg-white border border-gray-200 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:border-black transition-all flex items-center space-x-2 shadow-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <i className={`fa-solid fa-sync ${isRefreshing ? 'animate-spin' : ''}`}></i>
            <span>{isRefreshing ? 'Syncing...' : 'Sync Vault'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `${totalRevenue.toLocaleString()}৳`, trend: 'Live Data', color: 'text-green-600', icon: 'fa-dollar-sign' },
          { label: 'Avg Order Value', value: `${avgOrderValue.toLocaleString()}৳`, trend: 'Stable', color: 'text-blue-600', icon: 'fa-chart-line' },
          { label: 'Total Orders', value: orders.length, trend: 'Database Count', color: 'text-red-600', icon: 'fa-shopping-bag' },
          { label: 'Inventory Count', value: sneakers.length, trend: 'SKU Count', color: 'text-amber-600', icon: 'fa-box-open' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-xl bg-gray-50 ${kpi.color} group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${kpi.icon} text-xl`}></i>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-gray-50 ${kpi.color}`}>{kpi.trend}</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black tracking-tight text-black">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-widest mb-8 italic font-heading">Performance Analytics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#9ca3af'}} />
                <Tooltip 
                   contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                   itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-widest mb-8 italic font-heading">Channel Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                <Bar dataKey="traffic" radius={[6, 6, 0, 0]} barSize={40}>
                  {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const OrderList = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight italic uppercase text-black">Order Management</h1>
          <p className="text-gray-500 text-sm font-medium">Reviewing {filteredOrders.length} protocols across all status channels.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input 
              type="text"
              placeholder="SEARCH ID OR SUBJECT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-2 border-gray-100 focus:border-black pl-11 pr-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none transition-all w-72 shadow-sm"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-filter text-xs text-gray-400 group-focus-within:text-black transition-colors"></i>
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-black pl-11 pr-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] outline-none transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="ALL">ALL PROTOCOLS</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={onRefresh}
            className="p-3.5 bg-black text-white rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[50px]"
            title="Refresh Database"
          >
            <i className={`fa-solid fa-rotate ${isRefreshing ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Protocol Subject</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Contents</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Total Value</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                        <i className="fa-solid fa-inbox text-gray-200 text-3xl"></i>
                      </div>
                      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] italic">No orders match the current protocol parameters.</p>
                      <button 
                        onClick={() => { setStatusFilter('ALL'); setSearchQuery(''); }}
                        className="mt-4 text-[11px] font-black text-red-600 uppercase tracking-[0.2em] hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors group cursor-pointer" onClick={() => handleViewOrder(order)}>
                    <td className="px-8 py-6">
                      <span className="font-mono text-xs font-black bg-gray-100 group-hover:bg-white border border-transparent group-hover:border-gray-200 px-2.5 py-1.5 rounded-lg transition-all">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight text-gray-900">{order.first_name} {order.last_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{order.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                         <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded italic">
                          {order.items?.length || 0} SECURED
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest inline-flex items-center ${getStatusBadgeStyles(order.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 animate-pulse"></span>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-sm text-gray-900 tracking-tight italic">{order.total.toLocaleString()}৳</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="w-10 h-10 bg-white border border-gray-100 text-gray-400 group-hover:text-black group-hover:border-black group-hover:shadow-xl rounded-xl transition-all flex items-center justify-center mx-auto mr-0">
                        <i className="fa-solid fa-arrow-right-long text-xs"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const InventoryView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight italic uppercase text-black">Inventory Vault</h1>
          <p className="text-gray-500 text-sm font-medium">Managing {sneakers.length} authenticated sneaker models in the central vault.</p>
        </div>
        <button className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all shadow-xl flex items-center">
          <i className="fa-solid fa-plus mr-3 text-sm"></i> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Preview</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Product Model</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Brand</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Market Price</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Vault Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sneakers.map((sneaker) => {
                const totalStock = sneaker.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                return (
                  <tr key={sneaker.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl p-1 shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                        <img src={sneaker.image} className="w-full h-full object-contain" alt={sneaker.name} />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900 group-hover:text-red-600 transition-colors leading-tight">{sneaker.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {sneaker.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600">
                        {sneaker.brand}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-sm text-gray-900 italic">{sneaker.price.toLocaleString()}৳</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                           <div className={`w-2 h-2 rounded-full ${totalStock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                             {totalStock > 0 ? `${totalStock} IN STOCK` : 'DEPLETED'}
                           </span>
                        </div>
                        <div className="w-full bg-gray-100 h-1 rounded-full mt-2 overflow-hidden">
                          <div className={`h-full ${totalStock > 20 ? 'bg-green-500' : 'bg-amber-500'} transition-all`} style={{ width: `${Math.min(totalStock * 2, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end space-x-3">
                         <button className="p-3 text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 shadow-sm">
                           <i className="fa-solid fa-pen-to-square text-sm"></i>
                         </button>
                         <button className="p-3 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm">
                           <i className="fa-solid fa-trash-can text-sm"></i>
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const OrderDetail = () => {
    if (!selectedOrder) return null;
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <button 
            onClick={() => setSubView('orders')} 
            className="group text-gray-400 hover:text-black font-bold uppercase tracking-widest text-[10px] flex items-center transition-all"
          >
            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center mr-4 group-hover:border-black transition-colors group-hover:shadow-xl">
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            Protocol Hub
          </button>
          <div className="flex space-x-2">
            <button className="bg-white border border-gray-200 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:border-black transition-all shadow-sm">
              <i className="fa-solid fa-print mr-2"></i> Print Manifest
            </button>
            <button className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-2xl flex items-center">
              Execute Protocol <i className="fa-solid fa-bolt ml-4 text-[11px]"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Secure Inventory Manifest</h3>
                <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded italic">VERIFIED BY VAULT</span>
              </div>
              <div className="p-8 space-y-8">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex space-x-8 border-b border-gray-50 pb-8 last:border-0 last:pb-0 group">
                    <div className="w-28 h-28 bg-white rounded-2xl p-2 flex-shrink-0 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-500">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-3">
                         <h4 className="font-black text-lg uppercase leading-tight font-heading group-hover:text-red-600 transition-colors">{item.name}</h4>
                         <span className="font-black text-lg italic">{item.price.toLocaleString()}৳</span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] flex items-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-lg mr-3 text-black">SIZE: {item.size}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-black">QTY: {item.quantity}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
              <h3 className="text-sm font-black uppercase tracking-widest italic font-heading mb-10 border-b border-gray-50 pb-5">Logistics Log</h3>
              <div className="relative space-y-10 before:absolute before:inset-0 before:left-5 before:h-full before:w-0.5 before:bg-gray-50">
                <div className="relative flex items-start space-x-8">
                  <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xl z-10"><i className="fa-solid fa-paper-plane text-xs"></i></div>
                  <div className="flex-1 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 group hover:border-black transition-colors">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-1">Protocol Initiated</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{new Date(selectedOrder.created_at || '').toLocaleString()}</p>
                    <p className="text-[11px] text-gray-500 mt-4 font-bold leading-relaxed italic border-l-3 border-black pl-4">Order successfully received and logged into central vault database. Verification process complete.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center">
                 <i className="fa-solid fa-id-badge mr-4 text-gray-400"></i>
                 <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Subject Profile</h3>
              </div>
              <div className="p-8">
                <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-red-600 transition-colors">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Identity Tag</p>
                  <p className="font-black text-xl leading-tight text-gray-900 italic uppercase">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-tight">{selectedOrder.email}</p>
                </div>
                <div className="p-6 rounded-2xl border-2 border-gray-50 group hover:border-black transition-colors">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Coordinates</p>
                  <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed text-gray-700">
                    <i className="fa-solid fa-map-pin mr-3 text-red-600"></i>
                    {selectedOrder.street_address}<br />
                    <span className="ml-6 block mt-1">{selectedOrder.city}, {selectedOrder.zip_code}</span>
                    <span className="ml-6 block mt-1">BANGLADESH</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black text-white rounded-3xl shadow-2xl overflow-hidden group">
               <div className="px-8 py-6 border-b border-white/10 bg-white/5 flex items-center">
                <i className="fa-solid fa-receipt mr-4 text-red-600"></i>
                <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Ledger Resolution</h3>
              </div>
              <div className="p-8 space-y-6">
                 <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
                   <span>Inventory Value</span>
                   <span className="text-white">{selectedOrder.total.toLocaleString()}৳</span>
                 </div>
                 <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-green-400">
                   <span>Vault Shipping</span>
                   <span>- FREE -</span>
                 </div>
                 <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <span className="text-xs font-black uppercase italic tracking-[0.3em] font-heading text-red-600">TOTAL SETTLED</span>
                      <p className="text-[9px] text-gray-500 font-black uppercase mt-1 tracking-widest">Protocol: Complete</p>
                    </div>
                    <span className="text-4xl font-black italic group-hover:scale-110 transition-transform origin-right duration-500">{selectedOrder.total.toLocaleString()}৳</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(subView) {
      case 'overview': return <Overview />;
      case 'orders': return <OrderList />;
      case 'inventory': return <InventoryView />;
      case 'order-detail': return <OrderDetail />;
      default: return (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
          <i className="fa-solid fa-lock text-7xl text-gray-100 mb-8"></i>
          <h2 className="text-gray-300 font-black uppercase tracking-[0.6em] text-2xl">Protocol Hub Locked</h2>
          <button onClick={() => setSubView('overview')} className="mt-10 px-10 py-4 bg-black text-white font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-700 transition-all shadow-xl">Return to Root Command</button>
        </div>
      );
    }
  };

  return (
    <div className="flex bg-[#fafafa] min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden lg:flex flex-col h-screen sticky top-0 shadow-2xl z-30">
        <div className="mb-14 text-center">
          <div className="inline-block p-4 bg-black rounded-3xl mb-6 shadow-2xl group hover:scale-110 transition-transform duration-500">
             <i className="fa-solid fa-vault text-white text-3xl"></i>
          </div>
          <div className="text-2xl font-black font-heading tracking-tighter italic text-black">
            SNEAKER<span className="text-red-600">VAULT</span>
          </div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] mt-2">ADMIN OS v2.0</p>
        </div>

        <nav className="space-y-2.5 flex-1">
          {[
            { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
            { id: 'orders', icon: 'fa-folder-tree', label: 'Orders' },
            { id: 'inventory', icon: 'fa-cubes-stacked', label: 'Inventory' },
            { id: 'customers', icon: 'fa-address-card', label: 'Customers' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => {
                setSubView(item.id as AdminSubView);
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className={`w-full flex items-center space-x-4 px-6 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all group ${subView === item.id || (subView === 'order-detail' && item.id === 'orders') ? 'bg-black text-white shadow-2xl translate-x-3 scale-105' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
            >
              <i className={`fa-solid ${item.icon} w-6 text-sm group-hover:scale-125 transition-transform`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-4 px-6 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group"
          >
            <i className="fa-solid fa-sign-out-alt w-6 text-sm group-hover:rotate-45 transition-transform"></i>
            <span>Log Off</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Context Area */}
      <main className="flex-1 p-8 md:p-14 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <style>{`
        .animate-in {
          animation: enter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes enter {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        select::-ms-expand { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;