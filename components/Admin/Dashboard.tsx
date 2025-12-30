import React, { useState } from 'react';
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

  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setSubView('order-detail');
  };

  const Overview = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight italic">COMMAND CENTER</h1>
          <p className="text-gray-500">Real-time performance monitoring and vault health.</p>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6 italic">Channel Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Bar dataKey="traffic" radius={[6, 6, 0, 0]}>
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
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight italic uppercase">Order Management</h1>
          <p className="text-gray-500">Processing vault transactions and logistics.</p>
        </div>
        <div className="flex space-x-2">
           <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2">
              <i className="fa-solid fa-filter text-xs text-gray-400"></i>
              <span className="text-xs font-bold uppercase tracking-widest">Filter: All Status</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Purchase</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleViewOrder(order)}>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-black bg-gray-100 px-2 py-1 rounded">{order.id}</span>
                  <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Sync Pending'}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight">{order.first_name} {order.last_name}</span>
                    <span className="text-[10px] text-gray-400">{order.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {order.items?.length || 0} ITEMS IN VAULT
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' :
                    order.status === OrderStatus.SHIPPED ? 'bg-blue-100 text-blue-700' :
                    order.status === OrderStatus.PROCESSING ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-sm">{order.total}৳</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-300 group-hover:text-black transition-colors"><i className="fa-solid fa-chevron-right"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const OrderDetail = () => {
    if (!selectedOrder) return null;
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
          <button onClick={() => setSubView('orders')} className="text-gray-400 hover:text-black font-bold uppercase tracking-widest text-[10px] flex items-center">
            <i className="fa-solid fa-arrow-left mr-2"></i> Back to Orders
          </button>
          <div className="flex space-x-2">
            <button className="bg-white border border-gray-200 px-4 py-2 rounded font-bold uppercase tracking-widest text-[10px] hover:border-black"><i className="fa-solid fa-print mr-2"></i> Print Manifest</button>
            <button className="bg-black text-white px-4 py-2 rounded font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 transition-colors">Mark as Shipped</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Vault Contents</h3>
              </div>
              <div className="p-6 space-y-6">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex space-x-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 flex-shrink-0 border border-gray-100">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm uppercase leading-tight font-heading mb-1">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Size: {item.size} | Quantity: {item.quantity}</p>
                      <p className="font-black text-sm">{item.price}৳</p>
                    </div>
                  </div>
                ))}
                {!selectedOrder.items?.length && (
                  <div className="text-center py-10">
                    <p className="text-gray-400 text-xs italic font-bold uppercase tracking-widest">Legacy order format: items list unavailable.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Logistics Log */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black uppercase tracking-widest italic font-heading mb-6 border-b pb-4">Logistics History</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><i className="fa-solid fa-check text-xs"></i></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Order Protocol Initiated</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{new Date(selectedOrder.created_at || '').toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Customer & Shipping */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Customer Profile</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Identity</p>
                  <p className="font-bold text-sm">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shipping Coordinates</p>
                  <p className="text-xs font-bold uppercase leading-relaxed">
                    {selectedOrder.street_address}<br />
                    {selectedOrder.city}, {selectedOrder.zip_code}<br />
                    BANGLADESH
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-black text-white rounded-xl shadow-xl overflow-hidden">
               <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <h3 className="text-sm font-black uppercase tracking-widest italic font-heading">Ledger Summary</h3>
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400"><span>Subtotal</span><span>{selectedOrder.total}৳</span></div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-400"><span>Shipping</span><span>FREE</span></div>
                 <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-xs font-black uppercase italic tracking-widest font-heading">Settled Total</span>
                    <span className="text-xl font-black">{selectedOrder.total}৳</span>
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
      default: return <div className="text-center py-20 text-gray-300 font-bold uppercase tracking-widest">Protocol View Under Construction</div>;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar - Integrated here for full control */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="mb-10 text-center">
           <span className="text-xl font-black font-heading tracking-tighter italic">
            VAULT<span className="text-red-600">ADMIN</span>
          </span>
        </div>
        <nav className="space-y-1 flex-1">
          {[
            { id: 'overview', icon: 'fa-chart-pie', label: 'Overview' },
            { id: 'inventory', icon: 'fa-box', label: 'Inventory' },
            { id: 'orders', icon: 'fa-shopping-cart', label: 'Orders' },
            { id: 'customers', icon: 'fa-users', label: 'Customers' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setSubView(item.id as AdminSubView)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${subView === item.id ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-10 border border-transparent hover:border-red-100"
        >
          <i className="fa-solid fa-right-from-bracket w-5"></i>
          <span>Secure Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>

      <style>{`
        .animate-in {
          animation: enter 0.5s ease-out;
        }
        @keyframes enter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;