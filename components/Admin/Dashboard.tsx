import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Order, OrderStatus } from '../../types';

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
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onLogout?: () => void;
}

type AdminSubView = 'overview' | 'orders' | 'inventory' | 'customers' | 'order-detail';

const Dashboard: React.FC<DashboardProps> = ({ orders, onRefresh, isRefreshing, onLogout }) => {
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
          <h1 className="text-3xl font-black font-heading tracking-tight italic">COMMAND CENTER</h1>
          <p className="text-gray-500 text-sm">Real-time performance monitoring and vault health.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`bg-white border border-gray-100 px-4 py-2 rounded text-sm font-bold hover:border-black transition-colors flex items-center space-x-2 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          { label: 'Active Visitors', value: '1,248', trend: 'Live', color: 'text-blue-600', icon: 'fa-users' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-gray-50 ${kpi.color}`}>
                <i className={`fa-solid ${kpi.icon} text-xl`}></i>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${kpi.color}`}>{kpi.trend}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black tracking-tight">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6 italic">Performance Analytics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6 italic">Channel Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="traffic" radius={[4, 4, 0, 0]}>
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
          <h1 className="text-3xl font-black font-heading tracking-tight italic uppercase">Order Management</h1>
          <p className="text-gray-500 text-sm">Reviewing {filteredOrders.length} protocols across all status channels.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input 
              type="text"
              placeholder="SEARCH ID OR SUBJECT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-2 border-gray-100 focus:border-black pl-10 pr-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none transition-all w-64"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-filter text-xs text-gray-400 group-focus-within:text-black transition-colors"></i>
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-black pl-10 pr-10 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">ALL PROTOCOLS</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
              <i className="fa-solid fa-chevron-down text-[8px]"></i>
            </div>
          </div>

          <button 
            onClick={onRefresh}
            className="p-3 bg-black text-white rounded-lg hover:bg-red-700 transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[48px]"
            title="Refresh Database"
          >
            <i className={`fa-solid fa-rotate ${isRefreshing ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Protocol Subject</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Inventory Contents</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Total Value</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <i className="fa-solid fa-inbox text-gray-200 text-2xl"></i>
                      </div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">No orders match the current protocol parameters.</p>
                      <button 
                        onClick={() => { setStatusFilter('ALL'); setSearchQuery(''); }}
                        className="mt-4 text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors group cursor-pointer" onClick={() => handleViewOrder(order)}>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-black bg-gray-100 group-hover:bg-white border border-transparent group-hover:border-gray-200 px-2 py-1 rounded transition-all">
                        {order.id}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-1.5 uppercase font-bold tracking-tighter">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'SYNC PENDING'}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight text-gray-900">{order.first_name} {order.last_name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{order.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-50 border border-gray-100 overflow-hidden shadow-sm">
                              <img src={item.image} alt="" className="h-full w-full object-contain" />
                            </div>
                          ))}
                          {(order.items?.length || 0) > 3 && (
                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                              +{(order.items?.length || 0) - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {order.items?.length || 0} ITEMS
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest inline-flex items-center ${getStatusBadgeStyles(order.status)}`}>
                        <span className="w-1 h-1 rounded-full bg-current mr-2 animate-pulse"></span>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-sm text-gray-900 tracking-tight">{order.total.toLocaleString()}৳</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-gray-300 group-hover:text-black group-hover:bg-white group-hover:shadow-sm rounded-lg transition-all border border-transparent group-hover:border-gray-200">
                        <i className="fa-solid fa-chevron-right text-xs"></i>
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

  const OrderDetail = () => {
    if (!selectedOrder) return null;
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <button 
            onClick={() => setSubView('orders')} 
            className="group text-gray-400 hover:text-black font-bold uppercase tracking-widest text-[10px] flex items-center transition-all"
          >
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center mr-3 group-hover:border-black transition-colors">
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            Return to Protocol Hub
          </button>
          <div className="flex space-x-2">
            <button className="bg-white border-2 border-gray-100 px-4 py-2.5 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:border-black transition-all shadow-sm">
              <i className="fa-solid fa-print mr-2"></i> Print Manifest
            </button>
            <button className="bg-black text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-lg flex items-center">
              Execute Protocol <i className="fa-solid fa-bolt ml-3 text-[10px]"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Manifest Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Secure Inventory Manifest</h3>
                <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded italic">VERIFIED</span>
              </div>
              <div className="p-8 space-y-8">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex space-x-6 border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                    <div className="w-24 h-24 bg-white rounded-xl p-2 flex-shrink-0 border-2 border-gray-50 shadow-sm hover:scale-105 transition-transform duration-500">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-base uppercase leading-tight font-heading">{item.name}</h4>
                         <span className="font-black text-sm">{item.price.toLocaleString()}৳</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center mb-4">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-sm mr-2">SIZE: {item.size}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded-sm">QTY: {item.quantity}</span>
                      </p>
                    </div>
                  </div>
                ))}
                {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                  <div className="text-center py-20 bg-gray-50/30 rounded-xl border border-dashed border-gray-100">
                    <i className="fa-solid fa-box-open text-4xl text-gray-200 mb-4 block"></i>
                    <p className="text-gray-400 text-xs italic font-bold uppercase tracking-widest">Legacy protocol format: item details archived.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Logistics Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
              <h3 className="text-sm font-black uppercase tracking-widest italic font-heading mb-8 border-b border-gray-50 pb-4">Logistics Timeline</h3>
              <div className="relative space-y-8 before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gray-50">
                <div className="relative flex items-start space-x-6">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-lg z-10"><i className="fa-solid fa-paper-plane text-[10px]"></i></div>
                  <div className="flex-1 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-900">Protocol Initiated</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{new Date(selectedOrder.created_at || '').toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 mt-3 font-medium leading-relaxed italic border-l-2 border-black pl-3">Order received and logged into central vault database. Status updated to PLACED.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Stats Area */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center">
                 <i className="fa-solid fa-id-badge mr-3 text-gray-300"></i>
                 <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Subject Profile</h3>
              </div>
              <div className="p-8">
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-red-600 transition-colors">Digital Identity</p>
                  <p className="font-bold text-lg leading-tight">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{selectedOrder.email}</p>
                </div>
                <div className="p-4 rounded-xl border-2 border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Shipping Coordinates</p>
                  <p className="text-xs font-bold uppercase tracking-widest leading-relaxed text-gray-700">
                    <i className="fa-solid fa-map-pin mr-2 text-red-500"></i>
                    {selectedOrder.street_address}<br />
                    <span className="ml-5">{selectedOrder.city}, {selectedOrder.zip_code}</span><br />
                    <span className="ml-5">BANGLADESH</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black text-white rounded-2xl shadow-2xl overflow-hidden group">
               <div className="px-6 py-5 border-b border-white/10 bg-white/5 flex items-center">
                <i className="fa-solid fa-receipt mr-3 text-red-600"></i>
                <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Ledger Resolution</h3>
              </div>
              <div className="p-8 space-y-5">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                   <span>Inventory Value</span>
                   <span className="text-white">{selectedOrder.total.toLocaleString()}৳</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-400">
                   <span>Shipping Waiver</span>
                   <span>- FREE -</span>
                 </div>
                 <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <span className="text-xs font-black uppercase italic tracking-widest font-heading text-red-600">PROTOCOL TOTAL</span>
                      <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">STATUS: FULLY SETTLED</p>
                    </div>
                    <span className="text-3xl font-black group-hover:scale-105 transition-transform origin-right duration-500">{selectedOrder.total.toLocaleString()}৳</span>
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
      case 'order-detail': return <OrderDetail />;
      default: return (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
          <i className="fa-solid fa-lock text-6xl text-gray-100 mb-6"></i>
          <h2 className="text-gray-300 font-black uppercase tracking-[0.4em] text-xl">Protocol View Locked</h2>
          <button onClick={() => setSubView('overview')} className="mt-8 text-red-600 font-black uppercase tracking-widest text-xs hover:underline">Return to Root Command</button>
        </div>
      );
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 hidden lg:flex flex-col h-screen sticky top-0 shadow-sm z-30">
        <div className="mb-10 text-center">
          <div className="inline-block p-2.5 bg-black rounded-xl mb-4 shadow-2xl">
             <i className="fa-solid fa-vault text-white text-xl"></i>
          </div>
          <div className="text-lg font-black font-heading tracking-tighter italic">
            SNEAKER<span className="text-red-600">VAULT</span>
          </div>
          <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">ADMINISTRATOR OS v1.0.6</p>
        </div>

        <nav className="space-y-1.5 flex-1">
          {[
            { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
            { id: 'orders', icon: 'fa-folder-open', label: 'Orders' },
            { id: 'inventory', icon: 'fa-cube', label: 'Inventory' },
            { id: 'customers', icon: 'fa-address-book', label: 'Customers' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => {
                setSubView(item.id as AdminSubView);
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subView === item.id || (subView === 'order-detail' && item.id === 'orders') ? 'bg-black text-white shadow-xl translate-x-1' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-sm`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group"
          >
            <i className="fa-solid fa-power-off w-5 text-sm group-hover:rotate-12 transition-transform"></i>
            <span>Log Off Securely</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Context Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <style>{`
        .animate-in {
          animation: enter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes enter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        select::-ms-expand {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;