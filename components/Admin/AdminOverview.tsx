
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Order, Sneaker } from '../../types.ts';

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

interface AdminOverviewProps {
  orders: Order[];
  sneakers: Sneaker[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ orders, sneakers, isRefreshing, onRefresh }) => {
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Best Sellers Aggregation Logic
  const bestSellers = useMemo(() => {
    const itemMap: Record<string, { id: string; name: string; image: string; quantity: number; revenue: number }> = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!itemMap[item.sneakerId]) {
          itemMap[item.sneakerId] = {
            id: item.sneakerId,
            name: item.name,
            image: item.image,
            quantity: 0,
            revenue: 0
          };
        }
        itemMap[item.sneakerId].quantity += item.quantity;
        itemMap[item.sneakerId].revenue += item.quantity * item.price;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  const kpis = [
    { label: 'Total Revenue', value: `${totalRevenue.toLocaleString()}৳`, icon: 'fa-solid fa-dollar-sign', color: 'text-green-600' },
    { label: 'Avg Order Value', value: `${avgOrderValue.toLocaleString()}৳`, icon: 'fa-solid fa-chart-line', color: 'text-blue-600' },
    { label: 'Total Orders', value: orders.length, icon: 'fa-solid fa-shopping-bag', color: 'text-red-600' },
    { label: 'SKU Count', value: sneakers.length, icon: 'fa-solid fa-box', color: 'text-amber-600' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight italic text-black uppercase">Command Center</h1>
          <p className="text-gray-500 text-sm font-medium">Real-time performance monitoring and vault health.</p>
        </div>
        <button 
          onClick={onRefresh} 
          className="bg-white border border-gray-200 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:border-black transition-all flex items-center space-x-2 shadow-sm"
        >
          <i className={`fa-solid fa-sync ${isRefreshing ? 'animate-spin' : ''}`}></i>
          <span>Sync Vault</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`p-3 rounded-lg bg-gray-50 ${kpi.color} w-fit mb-4`}>
              <i className={kpi.icon}></i>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Velocity Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-[400px]">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 italic flex items-center gap-3">
             <i className="fa-solid fa-bolt-lightning text-red-600"></i> Sales Velocity
          </h3>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="75%">
              <AreaChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#ef4444" fill="#fee2e2" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Chart (Desktop Only Visualization) */}
        <div className="hidden lg:block bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-[400px]">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 italic flex items-center gap-3">
             <i className="fa-solid fa-signal text-blue-600"></i> Network Traffic
          </h3>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="75%">
              <BarChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800}} />
                <Bar dataKey="traffic" radius={[4, 4, 0, 0]} barSize={20}>
                  {CHART_DATA.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Best Sellers Protocol Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-3">
              <i className="fa-solid fa-ranking-star text-amber-500"></i> Top Acquisition Targets
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Based on historical quantity manifest</p>
          </div>
          <span className="text-[9px] font-black uppercase bg-black text-white px-3 py-1 rounded-full tracking-widest italic">Live Intelligence</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b">
                <th className="px-8 py-5">Asset Preview</th>
                <th className="px-8 py-5">Product Identity</th>
                <th className="px-8 py-5 text-center">Volume</th>
                <th className="px-8 py-5 text-right">Yield (Revenue)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bestSellers.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="w-14 h-14 bg-white border border-gray-100 rounded-xl p-1 flex items-center justify-center shrink-0">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-[10px] md:text-xs uppercase group-hover:text-red-600 transition-colors">{item.name}</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Index: {idx + 1}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <div className="inline-flex items-center justify-center bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
                      <span className="font-black text-xs italic">{item.quantity}</span>
                      <span className="text-[8px] font-bold text-gray-400 ml-1 uppercase">Units</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <span className="font-black italic text-sm text-green-600">{item.revenue.toLocaleString()}৳</span>
                  </td>
                </tr>
              ))}
              {bestSellers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <i className="fa-solid fa-box-open text-gray-100 text-5xl"></i>
                       <p className="text-[10px] font-black uppercase text-gray-300 italic tracking-widest">Zero historical sales records located</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100">
           <p className="text-[8px] font-black text-gray-300 text-center uppercase tracking-widest italic">End of Manifest - Secure Vault Synchronization active</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
