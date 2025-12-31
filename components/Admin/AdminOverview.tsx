
import React from 'react';
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-[350px]">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 italic">Sales Velocity</h3>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="80%">
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
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-[350px]">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 italic">Traffic Distribution</h3>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="80%">
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
    </div>
  );
};

export default AdminOverview;