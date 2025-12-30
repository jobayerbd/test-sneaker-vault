import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Order, OrderStatus, Sneaker, Brand, SneakerVariant, ShippingOption } from '../../types';

const CHART_DATA = [
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
  shippingOptions?: ShippingOption[];
  onRefresh?: () => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  onSaveProduct?: (productData: Partial<Sneaker>) => Promise<boolean>;
  onDeleteProduct?: (id: string) => Promise<boolean>;
  onSaveShipping?: (option: Partial<ShippingOption>) => Promise<boolean>;
  onDeleteShipping?: (id: string) => Promise<boolean>;
  isRefreshing?: boolean;
  onLogout?: () => void;
}

type AdminSubView = 'overview' | 'orders' | 'inventory' | 'customers' | 'order-detail' | 'product-form' | 'settings';
type SortKey = 'DATE' | 'STATUS' | 'VALUE';

// --- Helper Functions ---
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

// --- Sub-Components ---

const Overview: React.FC<{ orders: Order[], sneakers: Sneaker[], totalRevenue: number, avgOrderValue: number, isRefreshing?: boolean, onRefresh?: () => void }> = ({ orders, sneakers, totalRevenue, avgOrderValue, isRefreshing, onRefresh }) => (
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
            <AreaChart data={CHART_DATA}>
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
            <BarChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#9ca3af'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#9ca3af'}} />
              <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
              <Bar dataKey="traffic" radius={[6, 6, 0, 0]} barSize={40}>
                {CHART_DATA.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

const OrderList: React.FC<{ filteredOrders: Order[], searchQuery: string, setSearchQuery: (q: string) => void, statusFilter: string, setStatusFilter: (s: string) => void, sortKey: SortKey, setSortKey: (k: SortKey) => void, onRefresh?: () => void, isRefreshing?: boolean, handleViewOrder: (order: Order) => void }> = ({ filteredOrders, searchQuery, setSearchQuery, statusFilter, setStatusFilter, sortKey, setSortKey, onRefresh, isRefreshing, handleViewOrder }) => (
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
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-black pl-4 pr-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] outline-none transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="ALL">FILTER BY STATUS</option>
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>{status.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="relative group">
          <select 
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-black pl-4 pr-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] outline-none transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="DATE">SORT BY DATE</option>
            <option value="STATUS">SORT BY STATUS</option>
            <option value="VALUE">SORT BY VALUE</option>
          </select>
        </div>
        <button onClick={onRefresh} className="p-3.5 bg-black text-white rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[50px]">
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
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/70 transition-colors group cursor-pointer" onClick={() => handleViewOrder(order)}>
                <td className="px-8 py-6"><span className="font-mono text-xs font-black bg-gray-100 px-2.5 py-1.5 rounded-lg">{order.id}</span></td>
                <td className="px-8 py-6"><div className="flex flex-col"><span className="font-bold text-sm">{order.first_name} {order.last_name}</span><span className="text-[10px] text-gray-400 font-bold uppercase">{order.email}</span></div></td>
                <td className="px-8 py-6"><span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded italic">{order.items?.length || 0} SECURED</span></td>
                <td className="px-8 py-6"><span className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest inline-flex items-center ${getStatusBadgeStyles(order.status)}`}><span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5"></span>{order.status}</span></td>
                <td className="px-8 py-6"><span className="font-black text-sm italic">{order.total?.toLocaleString() || '0'}৳</span></td>
                <td className="px-8 py-6 text-right"><button className="w-10 h-10 border border-gray-100 rounded-xl flex items-center justify-center"><i className="fa-solid fa-arrow-right-long text-xs"></i></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const OrderDetail: React.FC<{
  order: Order,
  pendingStatus: OrderStatus | null,
  setPendingStatus: (s: OrderStatus) => void,
  executeStatusUpdate: () => void,
  isUpdatingStatus: boolean,
  setSubView: (v: AdminSubView) => void
}> = ({ order, pendingStatus, setPendingStatus, executeStatusUpdate, isUpdatingStatus, setSubView }) => {
  const handlePrint = () => {
    window.print();
  };

  const assetSubtotal = (order.total || 0) - (order.shipping_rate || 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 print:hidden">
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
          <button 
            onClick={handlePrint}
            className="bg-white border-2 border-black text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all shadow-sm flex items-center"
          >
            <i className="fa-solid fa-print mr-3"></i> Print Protocol
          </button>
          <div className="flex items-center bg-white border border-gray-100 rounded-xl px-4 mr-2 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4 italic">Update Protocol:</span>
            <select 
              value={pendingStatus || order.status}
              onChange={(e) => setPendingStatus(e.target.value as OrderStatus)}
              disabled={isUpdatingStatus}
              className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] py-3 outline-none cursor-pointer text-red-700 disabled:opacity-50"
            >
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={executeStatusUpdate}
            disabled={isUpdatingStatus || (pendingStatus === order.status)}
            className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-2xl flex items-center disabled:opacity-50"
          >
            {isUpdatingStatus ? 'Executing...' : 'Commit Status'} <i className="fa-solid fa-bolt ml-4 text-[11px]"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Secure Inventory Manifest</h3>
              <span className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest inline-flex items-center ${getStatusBadgeStyles(order.status)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5"></span>
                {order.status}
              </span>
            </div>
            <div className="p-8 space-y-8">
              {order.items?.map((item, i) => (
                <div key={i} className="flex space-x-8 border-b border-gray-50 pb-8 last:border-0 last:pb-0 group">
                  <div className="w-28 h-28 bg-white rounded-2xl p-2 flex-shrink-0 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-500">
                    <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-3">
                       <h4 className="font-black text-lg uppercase leading-tight font-heading group-hover:text-red-600 transition-colors">{item.name}</h4>
                       <span className="font-black text-lg italic">{item.price?.toLocaleString() || '0'}৳</span>
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
        </div>

        <div className="space-y-8">
          {/* Metadata Card - NEW */}
          <div className="bg-black text-white rounded-3xl shadow-xl overflow-hidden p-8">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 italic">Protocol Registry</p>
            <div className="space-y-6">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Creation Epoch</span>
                  <span className="text-sm font-bold italic">{order.created_at ? new Date(order.created_at).toLocaleString() : 'UNDEFINED'}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Transaction Identity</span>
                  <span className="text-xs font-mono font-black tracking-tighter bg-white/5 p-2 rounded-lg">{order.id}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Vault Status</span>
                  <span className="text-sm font-black uppercase text-red-600 animate-pulse">{order.status}</span>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center">
               <i className="fa-solid fa-id-badge mr-4 text-gray-400"></i>
               <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Subject Profile</h3>
            </div>
            <div className="p-8">
              <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-red-600 transition-colors">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Identity Tag</p>
                <p className="font-black text-xl leading-tight text-gray-900 italic uppercase">{order.first_name} {order.last_name}</p>
                <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-tight">{order.email}</p>
              </div>
              <div className="p-6 rounded-2xl border-2 border-gray-50 group hover:border-black transition-colors">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Coordinates</p>
                <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed text-gray-700">
                  <i className="fa-solid fa-map-pin mr-3 text-red-600"></i>
                  {order.street_address || 'NOT SPECIFIED'}<br />
                  <span className="ml-6 block mt-1">{order.city || 'N/A'}, {order.zip_code || 'N/A'}</span>
                  <span className="ml-6 block mt-1 font-bold italic">BANGLADESH</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Logistics Manifest</p>
             <div className="space-y-3">
               <div className="flex justify-between text-xs font-bold uppercase">
                 <span className="text-gray-400">Asset Subtotal</span>
                 <span>{assetSubtotal?.toLocaleString() || '0'}৳</span>
               </div>
               <div className="flex justify-between text-xs font-bold uppercase">
                 <span className="text-gray-400">Shipping: {order.shipping_name || 'N/A'}</span>
                 <span className="text-red-600">{order.shipping_rate?.toLocaleString() || '0'}৳</span>
               </div>
               <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                 <span className="text-[10px] font-black uppercase tracking-widest italic">Net Settlement</span>
                 <span className="text-2xl font-black italic">{order.total?.toLocaleString() || '0'}৳</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Section */}
      <div id="printable-invoice" className="hidden print:block bg-white p-12 max-w-[800px] mx-auto text-black border border-gray-200">
        <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-10">
          <div>
            <h1 className="text-3xl font-black font-heading italic uppercase leading-none">
              SNEAKER<span className="text-red-600">VAULT</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic text-gray-500">Authenticated Protocol Manifest</p>
            <div className="mt-6 space-y-1">
              <p className="text-xs font-bold uppercase">Transaction ID: <span className="font-mono">{order.id}</span></p>
              <p className="text-xs font-bold uppercase">Protocol Epoch: <span>{new Date(order.created_at || Date.now()).toLocaleDateString()}</span></p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black uppercase tracking-widest bg-black text-white px-4 py-2 inline-block italic mb-4">Official Receipt</h2>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 space-y-1">
              <p>House 12, Road 4, Sector 7</p>
              <p>Uttara, Dhaka - 1230</p>
              <p>support@sneakervault.bd</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
             <h3 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-4 border-b border-gray-100 pb-2">Subject Profile</h3>
             <p className="font-black uppercase text-sm mb-1">{order.first_name} {order.last_name}</p>
             <p className="text-xs font-bold text-gray-500 mb-4">{order.email}</p>
             <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
               {order.street_address}<br />
               {order.city}, {order.zip_code}<br />
               BANGLADESH
             </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Protocol</span>
                <span className="text-xs font-black uppercase italic">Cash on Delivery</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vault Logistics</span>
                <span className="text-xs font-black uppercase italic text-red-600">{order.shipping_name || 'Secure Transport'}</span>
             </div>
          </div>
        </div>

        <div className="mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-4 text-[10px] font-black uppercase tracking-widest">Asset Description</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-center">Protocol Size</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-center">Qty</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, i) => (
                <tr key={i}>
                  <td className="py-6 pr-4">
                    <p className="font-black text-xs uppercase italic leading-tight">{item.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Authentic</p>
                  </td>
                  <td className="py-6 text-center font-bold text-xs uppercase">{item.size}</td>
                  <td className="py-6 text-center font-bold text-xs">{item.quantity}</td>
                  <td className="py-6 text-right font-black italic text-xs">{((item.price || 0) * (item.quantity || 0)).toLocaleString()}৳</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-10 border-t-2 border-black">
          <div className="w-64 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Asset Subtotal</span>
              <span className="font-bold text-sm">{assetSubtotal?.toLocaleString() || '0'}৳</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distribution Fee ({order.shipping_name})</span>
              <span className="text-xs font-bold uppercase italic text-red-600">{order.shipping_rate?.toLocaleString() || '0'}৳</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
               <span className="text-xs font-black uppercase italic tracking-tighter text-red-600">Net Settlement</span>
               <span className="text-2xl font-black italic">{order.total?.toLocaleString() || '0'}৳</span>
            </div>
          </div>
        </div>

        <div className="mt-20 flex justify-between items-end border-t border-gray-100 pt-10">
          <div className="relative">
             <div className="w-24 h-24 border-4 border-black rounded-full flex items-center justify-center opacity-10 absolute -top-8 -left-4 -rotate-12">
                <span className="font-black text-[8px] uppercase tracking-widest text-center">AUTHENTIC<br/>VAULT<br/>SECURED</span>
             </div>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] italic text-gray-300">Terms of Transport:</p>
             <p className="text-[8px] font-bold text-gray-400 max-w-xs mt-2 uppercase leading-relaxed">
               All assets verified by SneakerVault specialists. Returns only valid if original vault tags remain intact. Thank you for securing your grails with the vault.
             </p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-black mb-2"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Vault Dispatch Signature</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
          aside, nav, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const ProductForm: React.FC<{
  editingProduct: Partial<Sneaker>,
  setEditingProduct: (p: Partial<Sneaker>) => void,
  onSave: () => void,
  isSaving: boolean,
  setSubView: (v: AdminSubView) => void
}> = ({ editingProduct, setEditingProduct, onSave, isSaving, setSubView }) => {
  const addGalleryUrl = () => {
    setEditingProduct({ ...editingProduct, gallery: [...(editingProduct.gallery || []), ""] });
  };
  const removeGalleryUrl = (idx: number) => {
    setEditingProduct({ ...editingProduct, gallery: (editingProduct.gallery || []).filter((_, i) => i !== idx) });
  };
  const updateGalleryUrl = (idx: number, val: string) => {
    const next = [...(editingProduct.gallery || [])];
    next[idx] = val;
    setEditingProduct({ ...editingProduct, gallery: next });
  };

  const addVariant = () => {
    setEditingProduct({ ...editingProduct, variants: [...(editingProduct.variants || []), { size: "", stock: 0 }] });
  };
  const removeVariant = (idx: number) => {
    setEditingProduct({ ...editingProduct, variants: (editingProduct.variants || []).filter((_, i) => i !== idx) });
  };
  const updateVariant = (idx: number, key: keyof SneakerVariant, val: any) => {
    const next = [...(editingProduct.variants || [])];
    next[idx] = { ...next[idx], [key]: val };
    setEditingProduct({ ...editingProduct, variants: next });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <button onClick={() => setSubView('inventory')} className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-400 hover:text-black">
          <i className="fa-solid fa-arrow-left"></i><span>Return to Vault</span>
        </button>
        <h2 className="text-xl font-black italic uppercase font-heading">{editingProduct.id ? 'Modify Archive' : 'Initialize Asset'}</h2>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* General Info */}
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-6 italic">Fundamental Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Model Identity</label>
                <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Brand Registry</label>
                <select value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value as Brand})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase outline-none focus:bg-white transition-all">
                  {Object.values(Brand).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Current Price (৳)</label>
                <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Original MSRP (৳)</label>
                <input type="number" value={editingProduct.original_price} onChange={e => setEditingProduct({...editingProduct, original_price: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Colorway ID</label>
                <input type="text" value={editingProduct.colorway} onChange={e => setEditingProduct({...editingProduct, colorway: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Fit Specification</label>
                <input type="text" value={editingProduct.fit_score} onChange={e => setEditingProduct({...editingProduct, fit_score: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Archive Description</label>
              <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold h-32 resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Release Epoch (YYYY-MM-DD)</label>
              <input type="date" value={editingProduct.release_date} onChange={e => setEditingProduct({...editingProduct, release_date: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold" />
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 italic">Inventory Matrix (Variants)</h3>
               <button type="button" onClick={addVariant} className="text-[9px] font-black uppercase tracking-widest bg-gray-100 px-4 py-2 rounded-lg hover:bg-black hover:text-white transition-all">+ Add Size</button>
             </div>
             <div className="space-y-3">
               {(editingProduct.variants || []).map((v, idx) => (
                 <div key={idx} className="flex items-center space-x-4 animate-in fade-in slide-in-from-right-2">
                   <input type="text" placeholder="SIZE" value={v.size} onChange={e => updateVariant(idx, 'size', e.target.value)} className="flex-1 bg-gray-50 p-3 rounded-lg font-bold text-xs" />
                   <input type="number" placeholder="STOCK" value={v.stock} onChange={e => updateVariant(idx, 'stock', Number(e.target.value))} className="w-32 bg-gray-50 p-3 rounded-lg font-bold text-xs" />
                   <button type="button" onClick={() => removeVariant(idx)} className="text-gray-300 hover:text-red-600"><i className="fa-solid fa-trash-can"></i></button>
                 </div>
               ))}
               {(editingProduct.variants || []).length === 0 && <p className="text-center text-[10px] text-gray-400 font-bold uppercase italic py-8">No variants defined.</p>}
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Media */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 italic mb-4">Visual Assets</h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Primary URL</label>
              <input type="text" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-[10px]" />
              {editingProduct.image && <div className="aspect-square bg-white border border-gray-100 rounded-2xl p-2"><img src={editingProduct.image} className="w-full h-full object-contain" /></div>}
            </div>
            
            <div className="space-y-4 pt-6 border-t border-gray-50">
               <div className="flex justify-between items-center">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Gallery Archives</label>
                 <button type="button" onClick={addGalleryUrl} className="text-[9px] font-black text-blue-600 uppercase">Add Image</button>
               </div>
               {(editingProduct.gallery || []).map((url, idx) => (
                 <div key={idx} className="flex items-center space-x-2">
                   <input type="text" value={url} onChange={e => updateGalleryUrl(idx, e.target.value)} className="flex-1 bg-gray-50 p-2 rounded font-bold text-[9px]" placeholder="URL..." />
                   <button type="button" onClick={() => removeGalleryUrl(idx)} className="text-gray-300 hover:text-red-600"><i className="fa-solid fa-xmark"></i></button>
                 </div>
               ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-black text-white p-10 rounded-3xl shadow-2xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 italic">Vault Logic</h3>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest italic">High Heat Drop</span>
              <button type="button" onClick={() => setEditingProduct({...editingProduct, is_drop: !editingProduct.is_drop})} className={`w-12 h-6 rounded-full relative transition-all ${editingProduct.is_drop ? 'bg-red-600' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.is_drop ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest italic">Trending Active</span>
              <button type="button" onClick={() => setEditingProduct({...editingProduct, trending: !editingProduct.trending})} className={`w-12 h-6 rounded-full relative transition-all ${editingProduct.trending ? 'bg-blue-600' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.trending ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-red-700 hover:text-white transition-all transform active:scale-95 disabled:opacity-50">
              {isSaving ? 'Synchronizing...' : 'Commit to Vault'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC<DashboardProps> = ({ 
  orders, 
  sneakers, 
  shippingOptions = [],
  onRefresh, 
  onUpdateOrderStatus, 
  onSaveProduct,
  onDeleteProduct,
  onSaveShipping,
  onDeleteShipping,
  isRefreshing, 
  onLogout 
}) => {
  const [subView, setSubView] = useState<AdminSubView>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Sneaker> | null>(null);
  const [editingShipping, setEditingShipping] = useState<Partial<ShippingOption> | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('DATE');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  // Derived Data
  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0), [orders]);
  const avgOrderValue = useMemo(() => orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0, [totalRevenue, orders.length]);

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        fullName.includes(searchQuery.toLowerCase()) ||
        o.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortKey === 'STATUS') return a.status.localeCompare(b.status);
      if (sortKey === 'VALUE') return b.total - a.total;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [orders, statusFilter, searchQuery, sortKey]);

  // Handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setPendingStatus(order.status);
    setSubView('order-detail');
  };

  const executeStatusUpdate = async () => {
    if (!selectedOrder || !pendingStatus || !onUpdateOrderStatus) return;
    setIsUpdatingStatus(true);
    const success = await onUpdateOrderStatus(selectedOrder.id, pendingStatus);
    if (success) {
      setSelectedOrder({ ...selectedOrder, status: pendingStatus });
      alert('PROTOCOL UPDATED SUCCESSFULLY');
    }
    setIsUpdatingStatus(false);
  };

  const handleAddNewProduct = () => {
    setEditingProduct({
      name: '', brand: Brand.NIKE, price: 0, original_price: 0, image: '', gallery: [], description: '', colorway: '',
      variants: [],
      is_drop: false, trending: false, fit_score: 'True to Size', release_date: new Date().toISOString().split('T')[0]
    });
    setSubView('product-form');
  };

  const executeProductSave = async () => {
    if (!editingProduct || !onSaveProduct) return;
    setIsSavingProduct(true);
    const success = await onSaveProduct(editingProduct);
    if (success) {
      setSubView('inventory');
      setEditingProduct(null);
    }
    setIsSavingProduct(false);
  };

  const renderContent = () => {
    switch(subView) {
      case 'overview': 
        return <Overview orders={orders} sneakers={sneakers} totalRevenue={totalRevenue} avgOrderValue={avgOrderValue} isRefreshing={isRefreshing} onRefresh={onRefresh} />;
      
      case 'orders': 
        return <OrderList filteredOrders={filteredOrders} searchQuery={searchQuery} setSearchQuery={setSearchQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} sortKey={sortKey} setSortKey={setSortKey} onRefresh={onRefresh} isRefreshing={isRefreshing} handleViewOrder={handleViewOrder} />;
      
      case 'inventory': 
        return (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <h1 className="text-3xl font-black font-heading italic uppercase text-black">Inventory Vault</h1>
              <button onClick={handleAddNewProduct} className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all shadow-xl flex items-center">
                <i className="fa-solid fa-plus mr-3 text-sm"></i> Add New Product
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Preview</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Product Model</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sneakers.map((sneaker) => (
                    <tr key={sneaker.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6"><div className="w-16 h-16 bg-white border border-gray-100 rounded-xl p-1 overflow-hidden"><img src={sneaker.image} className="w-full h-full object-contain" /></div></td>
                      <td className="px-8 py-6"><div className="flex flex-col"><span className="font-bold text-sm text-gray-900">{sneaker.name}</span><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sneaker.brand} • {sneaker.colorway}</span></div></td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end space-x-3">
                          <button onClick={() => { setEditingProduct(sneaker); setSubView('product-form'); }} className="p-3 text-gray-400 hover:text-black"><i className="fa-solid fa-pen-to-square"></i></button>
                          <button onClick={() => { if(window.confirm('Delete?')) onDeleteProduct?.(sneaker.id); }} className="p-3 text-gray-400 hover:text-red-600"><i className="fa-solid fa-trash-can"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'product-form':
        if (!editingProduct) return null;
        return (
          <ProductForm 
            editingProduct={editingProduct} 
            setEditingProduct={setEditingProduct} 
            onSave={executeProductSave} 
            isSaving={isSavingProduct} 
            setSubView={setSubView}
          />
        );

      case 'order-detail':
        if (!selectedOrder) return null;
        return (
          <OrderDetail 
            order={selectedOrder} 
            pendingStatus={pendingStatus} 
            setPendingStatus={setPendingStatus} 
            executeStatusUpdate={executeStatusUpdate} 
            isUpdatingStatus={isUpdatingStatus} 
            setSubView={setSubView}
          />
        );

      case 'settings':
        return (
          <div className="space-y-12 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-black font-heading italic uppercase text-black">Logistics</h1>
              <button onClick={() => setEditingShipping({ name: '', rate: 0 })} className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px]">New Method</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-50">
                    {shippingOptions.map((opt) => (
                      <tr key={opt.id} className="group">
                        <td className="px-8 py-6 font-black text-xs uppercase">{opt.name}</td>
                        <td className="px-8 py-6 font-black text-red-600 italic">{opt.rate}৳</td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => setEditingShipping(opt)} className="p-2 text-gray-300 hover:text-black mr-2"><i className="fa-solid fa-pen-nib"></i></button>
                          <button onClick={() => opt.id && onDeleteShipping?.(opt.id)} className="p-2 text-gray-300 hover:text-red-600"><i className="fa-solid fa-trash-can"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {editingShipping && (
                <div className="bg-black text-white p-10 rounded-3xl shadow-2xl">
                  <h3 className="text-xs font-black uppercase italic mb-8 border-b border-white/10 pb-5">Shipping Registry</h3>
                  <form onSubmit={async (e) => { e.preventDefault(); setIsSavingShipping(true); if(await onSaveShipping?.(editingShipping)) setEditingShipping(null); setIsSavingShipping(false); }} className="space-y-6">
                    <input type="text" required value={editingShipping.name} onChange={e => setEditingShipping({...editingShipping, name: e.target.value})} placeholder="METHOD NAME" className="w-full bg-white/5 p-4 rounded-xl font-bold uppercase text-xs" />
                    <input type="number" required value={editingShipping.rate} onChange={e => setEditingShipping({...editingShipping, rate: Number(e.target.value)})} placeholder="RATE" className="w-full bg-white/5 p-4 rounded-xl font-bold text-xs" />
                    <button type="submit" disabled={isSavingShipping} className="w-full bg-red-700 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50">SAVE METHOD</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="flex bg-[#fafafa] min-h-screen">
      <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden lg:flex flex-col h-screen sticky top-0 shadow-2xl z-30 print:hidden">
        <div className="mb-14 text-center">
          <div className="inline-block p-4 bg-black rounded-3xl mb-6 shadow-2xl"><i className="fa-solid fa-vault text-white text-3xl"></i></div>
          <div className="text-2xl font-black font-heading tracking-tighter italic text-black">SNEAKER<span className="text-red-600">VAULT</span></div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] mt-2">ADMIN OS v2.5</p>
        </div>
        <nav className="space-y-2.5 flex-1">
          {[
            { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
            { id: 'orders', icon: 'fa-folder-tree', label: 'Orders' },
            { id: 'inventory', icon: 'fa-cubes-stacked', label: 'Inventory' },
            { id: 'settings', icon: 'fa-gears', label: 'Settings' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setSubView(item.id as AdminSubView); setStatusFilter('ALL'); setSearchQuery(''); }}
              className={`w-full flex items-center space-x-4 px-6 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${subView === item.id || (subView === 'order-detail' && item.id === 'orders') || (subView === 'product-form' && item.id === 'inventory') ? 'bg-black text-white shadow-2xl translate-x-3 scale-105' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
            >
              <i className={`fa-solid ${item.icon} w-6 text-sm`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-8 border-t border-gray-100">
          <button onClick={onLogout} className="w-full flex items-center space-x-4 px-6 py-4.5 rounded-2xl text-[11px] font-black uppercase text-red-600 hover:bg-red-50 transition-all group"><i className="fa-solid fa-sign-out-alt w-6 text-sm group-hover:rotate-45 transition-transform"></i><span>Log Off</span></button>
        </div>
      </aside>
      <main className="flex-1 p-8 md:p-14 overflow-y-auto print:p-0"><div className="max-w-7xl mx-auto">{renderContent()}</div></main>
      <style>{`.animate-in { animation: enter 0.5s cubic-bezier(0.16, 1, 0.3, 1); } @keyframes enter { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
};

export default Dashboard;