import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Order, OrderStatus, Sneaker, Brand, SneakerVariant } from '../../types';

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
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  onSaveProduct?: (productData: Partial<Sneaker>) => Promise<boolean>;
  onDeleteProduct?: (id: string) => Promise<boolean>;
  isRefreshing?: boolean;
  onLogout?: () => void;
}

type AdminSubView = 'overview' | 'orders' | 'inventory' | 'customers' | 'order-detail' | 'product-form';
type SortKey = 'DATE' | 'STATUS' | 'VALUE';

const Dashboard: React.FC<DashboardProps> = ({ 
  orders, 
  sneakers, 
  onRefresh, 
  onUpdateOrderStatus, 
  onSaveProduct,
  onDeleteProduct,
  isRefreshing, 
  onLogout 
}) => {
  const [subView, setSubView] = useState<AdminSubView>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Sneaker> | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('DATE');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Derived Data
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

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
      if (sortKey === 'STATUS') {
        return a.status.localeCompare(b.status);
      } else if (sortKey === 'VALUE') {
        return b.total - a.total;
      } else {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      }
    });
  }, [orders, statusFilter, searchQuery, sortKey]);

  // Handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setSubView('order-detail');
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder || !onUpdateOrderStatus) return;
    setIsUpdatingStatus(true);
    const success = await onUpdateOrderStatus(selectedOrder.id, newStatus);
    if (success) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    setIsUpdatingStatus(false);
  };

  const handleEditProduct = (sneaker: Sneaker) => {
    setEditingProduct(sneaker);
    setSubView('product-form');
  };

  const handleAddNewProduct = () => {
    setEditingProduct({
      name: '',
      brand: Brand.NIKE,
      price: 0,
      image: '',
      gallery: [],
      description: '',
      colorway: '',
      variants: [{ size: '8', stock: 10 }, { size: '9', stock: 10 }, { size: '10', stock: 10 }],
      is_drop: false,
      trending: false,
      fit_score: 'True to Size',
      release_date: new Date().toISOString().split('T')[0]
    });
    setSubView('product-form');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('WARNING: THIS WILL PERMANENTLY ERASE THIS MODEL FROM THE VAULT. CONTINUE?')) {
      if (onDeleteProduct) {
        await onDeleteProduct(id);
      }
    }
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !onSaveProduct) return;
    
    setIsSavingProduct(true);
    const success = await onSaveProduct(editingProduct);
    if (success) {
      setSubView('inventory');
      setEditingProduct(null);
    } else {
      alert('PROTOCOL ERROR: FAILED TO LOG PRODUCT INTO VAULT DATABASE');
    }
    setIsSavingProduct(false);
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
              <option value="ALL">FILTER BY STATUS</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-sort text-xs text-gray-400 group-focus-within:text-black transition-colors"></i>
            </div>
            <select 
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-black pl-11 pr-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] outline-none transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="DATE">SORT BY DATE</option>
              <option value="STATUS">SORT BY STATUS</option>
              <option value="VALUE">SORT BY VALUE</option>
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
                      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] italic">No orders match parameters.</p>
                      <button 
                        onClick={() => { setStatusFilter('ALL'); setSearchQuery(''); setSortKey('DATE'); }}
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
        <button 
          onClick={handleAddNewProduct}
          className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all shadow-xl flex items-center"
        >
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
                         <button 
                          onClick={() => handleEditProduct(sneaker)}
                          className="p-3 text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 shadow-sm"
                         >
                           <i className="fa-solid fa-pen-to-square text-sm"></i>
                         </button>
                         <button 
                          onClick={() => handleDelete(sneaker.id)}
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm"
                         >
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

  const ProductForm = () => {
    if (!editingProduct) return null;

    const handleVariantChange = (index: number, field: keyof SneakerVariant, value: any) => {
      const newVariants = [...(editingProduct.variants || [])];
      newVariants[index] = { ...newVariants[index], [field]: value };
      setEditingProduct({ ...editingProduct, variants: newVariants });
    };

    const addVariant = () => {
      setEditingProduct({
        ...editingProduct,
        variants: [...(editingProduct.variants || []), { size: '', stock: 0 }]
      });
    };

    const removeVariant = (index: number) => {
      setEditingProduct({
        ...editingProduct,
        variants: (editingProduct.variants || []).filter((_, i) => i !== index)
      });
    };

    const handleGalleryImageChange = (index: number, value: string) => {
      const newGallery = [...(editingProduct.gallery || [])];
      newGallery[index] = value;
      setEditingProduct({ ...editingProduct, gallery: newGallery });
    };

    const addGalleryImage = () => {
      setEditingProduct({
        ...editingProduct,
        gallery: [...(editingProduct.gallery || []), '']
      });
    };

    const removeGalleryImage = (index: number) => {
      setEditingProduct({
        ...editingProduct,
        gallery: (editingProduct.gallery || []).filter((_, i) => i !== index)
      });
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSubView('inventory')}
            className="group flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
          >
            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-black group-hover:shadow-lg transition-all">
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <span>Vault Inventory</span>
          </button>
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            {editingProduct.id ? 'Modify Protocol' : 'Initialize New Asset'}
          </h2>
        </div>

        <form onSubmit={handleSaveProductForm} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Model Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    placeholder="E.G. JORDAN 1 RETRO HIGH"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl outline-none font-bold text-xs uppercase transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Brand Identity</label>
                  <select 
                    value={editingProduct.brand}
                    onChange={e => setEditingProduct({...editingProduct, brand: e.target.value as Brand})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl outline-none font-bold text-xs uppercase transition-all appearance-none cursor-pointer"
                  >
                    {Object.values(Brand).map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Market Value (৳)</label>
                  <input 
                    type="number" 
                    required
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl outline-none font-bold text-xs transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Colorway Signature</label>
                  <input 
                    type="text" 
                    value={editingProduct.colorway}
                    onChange={e => setEditingProduct({...editingProduct, colorway: e.target.value})}
                    placeholder="CHICAGO / PANDA"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl outline-none font-bold text-xs uppercase transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Vault Description</label>
                <textarea 
                  rows={4}
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl outline-none font-bold text-xs transition-all resize-none"
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest italic">Variant Manifest (Sizes)</h3>
                  <button 
                    type="button" 
                    onClick={addVariant}
                    className="text-[9px] font-black text-red-600 uppercase tracking-widest hover:underline"
                  >
                    + Add Size Entry
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {editingProduct.variants?.map((v, i) => (
                    <div key={i} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-xl">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="SIZE"
                          value={v.size}
                          onChange={e => handleVariantChange(i, 'size', e.target.value)}
                          className="bg-white p-2 rounded-lg text-xs font-bold uppercase border border-gray-100"
                        />
                        <input 
                          type="number" 
                          placeholder="STOCK"
                          value={v.stock}
                          onChange={e => handleVariantChange(i, 'stock', Number(e.target.value))}
                          className="bg-white p-2 rounded-lg text-xs font-bold border border-gray-100"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeVariant(i)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-gray-300 hover:text-red-600 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-8">
              {/* Primary Image */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Primary Asset Image (URL)</label>
                <input 
                  type="text" 
                  value={editingProduct.image}
                  onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black p-4 rounded-xl outline-none font-bold text-xs transition-all"
                />
                {editingProduct.image && (
                  <div className="aspect-[4/5] bg-gray-50 rounded-2xl p-4 border border-gray-100 overflow-hidden relative group">
                    <img src={editingProduct.image} className="w-full h-full object-contain" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Main Thumbnail</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Management */}
              <div className="pt-8 border-t border-gray-50 space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Asset Gallery (Multiple)</label>
                  <button 
                    type="button" 
                    onClick={addGalleryImage}
                    className="text-[9px] font-black text-red-600 uppercase tracking-widest hover:underline"
                  >
                    + Add Image
                  </button>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {(editingProduct.gallery || []).map((url, idx) => (
                    <div key={idx} className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="text" 
                          value={url}
                          onChange={e => handleGalleryImageChange(idx, e.target.value)}
                          placeholder="Gallery URL..."
                          className="flex-1 bg-white border border-gray-100 p-2 rounded-lg outline-none font-bold text-[10px] transition-all"
                        />
                        <button 
                          type="button" 
                          onClick={() => removeGalleryImage(idx)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-gray-300 hover:text-red-600 transition-colors"
                        >
                          <i className="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                      </div>
                      {url && (
                        <div className="h-20 w-full bg-white rounded-lg border border-gray-100 p-1">
                          <img src={url} className="h-full w-full object-contain" />
                        </div>
                      )}
                    </div>
                  ))}
                  {(editingProduct.gallery || []).length === 0 && (
                    <p className="text-[9px] text-gray-400 font-bold uppercase text-center py-4 border-2 border-dashed border-gray-100 rounded-2xl">No gallery assets archived.</p>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">High Heat Drop</label>
                  <button 
                    type="button" 
                    onClick={() => setEditingProduct({...editingProduct, is_drop: !editingProduct.is_drop})}
                    className={`w-12 h-6 rounded-full transition-all relative ${editingProduct.is_drop ? 'bg-red-600' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.is_drop ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Trending Status</label>
                  <button 
                    type="button" 
                    onClick={() => setEditingProduct({...editingProduct, trending: !editingProduct.trending})}
                    className={`w-12 h-6 rounded-full transition-all relative ${editingProduct.trending ? 'bg-black' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.trending ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSavingProduct}
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center transform active:scale-95 disabled:opacity-50"
              >
                {isSavingProduct ? <i className="fa-solid fa-circle-notch animate-spin mr-3"></i> : <i className="fa-solid fa-cloud-arrow-up mr-3"></i>}
                {editingProduct.id ? 'UPDATE VAULT LOG' : 'COMMENCE ARCHIVE'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

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
            <div className="flex items-center bg-white border border-gray-100 rounded-xl px-4 mr-2 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4 italic">Update Protocol:</span>
              <select 
                defaultValue={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(e.target.value as OrderStatus)}
                disabled={isUpdatingStatus}
                className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] py-3 outline-none cursor-pointer text-red-700 disabled:opacity-50"
              >
                {Object.values(OrderStatus).map(status => (
                  <option key={status} value={status}>{status.toUpperCase()}</option>
                ))}
              </select>
            </div>
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
                <span className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest inline-flex items-center ${getStatusBadgeStyles(selectedOrder.status)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-2.5 animate-pulse"></span>
                  {selectedOrder.status}
                </span>
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
      case 'product-form': return <ProductForm />;
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
      <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden lg:flex flex-col h-screen sticky top-0 shadow-2xl z-30">
        <div className="mb-14 text-center">
          <div className="inline-block p-4 bg-black rounded-3xl mb-6 shadow-2xl group hover:scale-110 transition-transform duration-500">
             <i className="fa-solid fa-vault text-white text-3xl"></i>
          </div>
          <div className="text-2xl font-black font-heading tracking-tighter italic text-black">
            SNEAKER<span className="text-red-600">VAULT</span>
          </div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] mt-2">ADMIN OS v2.5</p>
        </div>

        <nav className="space-y-2.5 flex-1">
          {[
            { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
            { id: 'orders', icon: 'fa-folder-tree', label: 'Orders' },
            { id: 'inventory', icon: 'fa-cubes-stacked', label: 'Inventory' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => {
                setSubView(item.id as AdminSubView);
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className={`w-full flex items-center space-x-4 px-6 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all group ${subView === item.id || (subView === 'order-detail' && item.id === 'orders') || (subView === 'product-form' && item.id === 'inventory') ? 'bg-black text-white shadow-2xl translate-x-3 scale-105' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
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

      <main className="flex-1 p-8 md:p-14 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <style>{`
        .animate-in { animation: enter 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes enter {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;