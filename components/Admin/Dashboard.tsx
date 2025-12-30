
import React from 'react';
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
}

const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const getTrackingUrl = (carrier?: string, trackingNumber?: string) => {
    if (!trackingNumber) return '#';
    const c = carrier?.toLowerCase();
    if (c?.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    if (c?.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    if (c?.includes('ups')) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    return `https://google.com/search?q=track+order+${trackingNumber}`;
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight italic">COMMAND CENTER</h1>
          <p className="text-gray-500">Real-time performance monitoring and vault health.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-100 px-4 py-2 rounded text-sm font-bold hover:border-black transition-colors">Export Data</button>
          <button className="bg-black text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-900 transition-colors">Update Stock</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}`, trend: '+12.5%', color: 'text-green-600', icon: 'fa-dollar-sign' },
          { label: 'Avg Order Value', value: `$${Math.round(orders.reduce((acc, o) => acc + o.total, 0) / (orders.length || 1))}`, trend: '+4.2%', color: 'text-green-600', icon: 'fa-chart-line' },
          { label: 'Conversion Rate', value: '3.82%', trend: '-0.4%', color: 'text-red-600', icon: 'fa-percent' },
          { label: 'Active Visitors', value: '1,248', trend: 'Live', color: 'text-blue-600', icon: 'fa-users' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-gray-50 ${kpi.color}`}>
                <i className={`fa-solid ${kpi.icon} text-xl`}></i>
              </div>
              <span className={`text-xs font-bold ${kpi.color}`}>{kpi.trend}</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6">Weekly Revenue Growth</h3>
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-widest mb-6">Traffic Sources</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="traffic" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase tracking-widest">Recent Sales Activity</h3>
          <button className="text-sm font-bold text-red-600 hover:underline">View All Orders</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Order ID</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Customer</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Logistics & Tracking</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-bold text-sm">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm group-hover:text-red-600 transition-colors">{order.first_name} {order.last_name}</span>
                      <span className="text-xs text-gray-500">{order.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' :
                      order.status === OrderStatus.SHIPPED ? 'bg-blue-100 text-blue-700' :
                      order.status === OrderStatus.PROCESSING ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.trackingNumber ? (
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                           <span className="text-[10px] font-black text-gray-900 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                             {order.carrier}
                           </span>
                           <a 
                             href={getTrackingUrl(order.carrier, order.trackingNumber)} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             onClick={(e) => e.stopPropagation()}
                             className="text-blue-600 hover:text-blue-800 text-xs font-bold underline decoration-dotted"
                           >
                             #{order.trackingNumber}
                             <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[8px]"></i>
                           </a>
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter italic">Last Scan: In Transit</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                          {order.status === OrderStatus.PROCESSING ? 'Fulfilling Grails...' : 'Awaiting Processing'}
                        </span>
                        {order.status === OrderStatus.PROCESSING && (
                          <div className="w-24 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                             <div className="h-full bg-orange-400 animate-[loading_1.5s_infinite]" style={{width: '60%'}}></div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-black text-sm">${order.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;