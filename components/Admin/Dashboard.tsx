
import React, { useState, useMemo, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Order, OrderStatus, Sneaker, Brand, SneakerVariant, ShippingOption, FooterConfig } from '../../types';

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
  footerConfig: FooterConfig;
  onRefresh?: () => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  onSaveProduct?: (productData: Partial<Sneaker>) => Promise<boolean>;
  onDeleteProduct?: (id: string) => Promise<boolean>;
  onSaveShipping?: (option: Partial<ShippingOption>) => Promise<boolean>;
  onDeleteShipping?: (id: string) => Promise<boolean>;
  onSaveFooterConfig?: (config: FooterConfig) => Promise<boolean>;
  isRefreshing?: boolean;
  onLogout?: () => void;
}

type AdminSubView = 'overview' | 'orders' | 'inventory' | 'customers' | 'order-detail' | 'product-form' | 'settings';
type SortKey = 'DATE' | 'STATUS' | 'VALUE';

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

const Dashboard: React.FC<DashboardProps> = ({ 
  orders, sneakers, shippingOptions = [], footerConfig, onRefresh, onUpdateOrderStatus, onSaveProduct, onDeleteProduct, onSaveShipping, onDeleteShipping, onSaveFooterConfig, isRefreshing, onLogout 
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
  const [footerForm, setFooterForm] = useState<FooterConfig>({ ...footerConfig });

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0), [orders]);
  const avgOrderValue = useMemo(() => orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0, [totalRevenue, orders.length]);

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
      return matchesStatus && (o.id.toLowerCase().includes(searchQuery.toLowerCase()) || fullName.includes(searchQuery.toLowerCase()) || o.email.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    return result.sort((a, b) => {
      if (sortKey === 'STATUS') return a.status.localeCompare(b.status);
      if (sortKey === 'VALUE') return b.total - a.total;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [orders, statusFilter, searchQuery, sortKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch(subView) {
      case 'overview': 
        return (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black font-heading tracking-tight italic text-black uppercase">Command Center</h1>
                <p className="text-gray-500 text-sm font-medium">Real-time performance monitoring and vault health.</p>
              </div>
              <button onClick={onRefresh} className="bg-white border border-gray-200 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:border-black transition-all flex items-center space-x-2 shadow-sm">
                <i className={`fa-solid fa-sync ${isRefreshing ? 'animate-spin' : ''}`}></i>
                <span>Sync Vault</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p><h3 className="text-2xl font-black">{totalRevenue.toLocaleString()}৳</h3></div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Order Value</p><h3 className="text-2xl font-black">{avgOrderValue.toLocaleString()}৳</h3></div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p><h3 className="text-2xl font-black">{orders.length}</h3></div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inventory</p><h3 className="text-2xl font-black">{sneakers.length}</h3></div>
            </div>
          </div>
        );
      case 'inventory': 
        return (
          <div className="space-y-8 animate-in fade-in">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase italic font-heading">Vault Inventory</h1>
                <button onClick={() => { 
                  setEditingProduct({ name: '', brand: Brand.NIKE, price: 0, image: '', gallery: [], variants: [] }); 
                  setSubView('product-form'); 
                }} className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Initialize Asset</button>
             </div>
             <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                   <tbody className="divide-y divide-gray-50">
                     {sneakers.map((sneaker) => (
                       <tr key={sneaker.id} className="hover:bg-gray-50/50 transition-colors group">
                         <td className="px-8 py-6"><div className="w-16 h-16 border rounded-xl p-1 overflow-hidden"><img src={sneaker.image} className="w-full h-full object-contain" /></div></td>
                         <td className="px-8 py-6 font-bold uppercase text-xs">{sneaker.name}</td>
                         <td className="px-8 py-6 text-right">
                           <button onClick={() => { setEditingProduct(sneaker); setSubView('product-form'); }} className="p-3 text-gray-400 hover:text-black"><i className="fa-solid fa-pen"></i></button>
                           <button onClick={() => onDeleteProduct?.(sneaker.id)} className="p-3 text-gray-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             </div>
          </div>
        );
      case 'product-form': 
        return editingProduct ? (
          <div className="space-y-8 animate-in fade-in">
             <button onClick={() => setSubView('inventory')} className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black"><i className="fa-solid fa-arrow-left mr-2"></i> Return to Hub</button>
             <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl max-w-4xl mx-auto">
                <h2 className="text-2xl font-black italic uppercase font-heading mb-8">Asset Initialization</h2>
                <form onSubmit={async (e) => { e.preventDefault(); setIsSavingProduct(true); if(await onSaveProduct?.(editingProduct)) setSubView('inventory'); setIsSavingProduct(false); }} className="space-y-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Asset Title*</label>
                        <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none border-2 border-transparent focus:border-black" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Brand*</label>
                        <select value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value as Brand})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none border-2 border-transparent focus:border-black">
                           {Object.values(Brand).map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Primary Frame (Main Image URL)*</label>
                      <div className="flex gap-4">
                        <input type="text" required value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="URL or Base64" className="flex-1 bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none" />
                        <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, (url) => setEditingProduct({...editingProduct, image: url}))} />
                        <button type="button" onClick={() => mainImageInputRef.current?.click()} className="bg-black text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase"><i className="fa-solid fa-upload mr-2"></i> Upload</button>
                      </div>
                      {editingProduct.image && <img src={editingProduct.image} className="mt-4 w-24 h-24 border rounded-lg object-contain p-1" />}
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Asset Gallery (Multiple Images)</label>
                      <div className="space-y-4">
                        {(editingProduct.gallery || []).map((url, idx) => (
                           <div key={idx} className="flex gap-4 items-center">
                              <input type="text" value={url} onChange={e => {
                                 const newGallery = [...(editingProduct.gallery || [])];
                                 newGallery[idx] = e.target.value;
                                 setEditingProduct({...editingProduct, gallery: newGallery});
                              }} placeholder="Gallery URL" className="flex-1 bg-gray-50 p-4 rounded-xl font-bold text-xs" />
                              {/* Fix: Callback ref in React must return void to match RefCallback type */}
                              <input type="file" ref={el => { galleryInputRefs.current[idx] = el; }} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, (newUrl) => {
                                 const newGallery = [...(editingProduct.gallery || [])];
                                 newGallery[idx] = newUrl;
                                 setEditingProduct({...editingProduct, gallery: newGallery});
                              })} />
                              <button type="button" onClick={() => galleryInputRefs.current[idx]?.click()} className="bg-gray-100 p-4 rounded-xl text-black hover:bg-gray-200"><i className="fa-solid fa-upload"></i></button>
                              <button type="button" onClick={() => {
                                 const newGallery = editingProduct.gallery?.filter((_, i) => i !== idx);
                                 setEditingProduct({...editingProduct, gallery: newGallery});
                              }} className="text-red-600"><i className="fa-solid fa-trash-can"></i></button>
                           </div>
                        ))}
                        <button type="button" onClick={() => setEditingProduct({...editingProduct, gallery: [...(editingProduct.gallery || []), '']})} className="w-full border-2 border-dashed border-gray-200 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:border-black hover:text-black transition-all">
                           <i className="fa-solid fa-plus mr-2"></i> Add Gallery Field
                        </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div><label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Price (৳)*</label><input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs" /></div>
                      <div><label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Colorway</label><input type="text" value={editingProduct.colorway} onChange={e => setEditingProduct({...editingProduct, colorway: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs" /></div>
                   </div>

                   <button type="submit" disabled={isSavingProduct} className="w-full bg-red-700 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl disabled:opacity-50">
                      {isSavingProduct ? 'Synchronizing...' : 'Commit to Vault'}
                   </button>
                </form>
             </div>
          </div>
        ) : null;
      case 'orders': 
        return (
          <div className="space-y-8 animate-in fade-in">
             <h1 className="text-3xl font-black uppercase italic font-heading">Protocol Registry</h1>
             <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <th className="px-8 py-4">Order ID</th>
                        <th className="px-8 py-4">Subject</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Value</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {filteredOrders.map(order => (
                       <tr key={order.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => { setSelectedOrder(order); setPendingStatus(order.status); setSubView('order-detail'); }}>
                         <td className="px-8 py-6 font-mono text-xs">{order.id}</td>
                         <td className="px-8 py-6 font-bold text-xs uppercase">{order.first_name} {order.last_name}</td>
                         <td className="px-8 py-6"><span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${getStatusBadgeStyles(order.status)}`}>{order.status}</span></td>
                         <td className="px-8 py-6 font-black italic">{order.total.toLocaleString()}৳</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             </div>
          </div>
        );
      case 'order-detail':
        if (!selectedOrder) return null;
        return (
          <div className="space-y-8 animate-in fade-in">
             <button onClick={() => setSubView('orders')} className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black"><i className="fa-solid fa-arrow-left mr-2"></i> Registry Hub</button>
             <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10">
                <h3 className="text-2xl font-black italic uppercase font-heading mb-6">Manifest {selectedOrder.id}</h3>
                <div className="grid grid-cols-2 gap-10">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Protocol Update</p>
                      <select value={pendingStatus || selectedOrder.status} onChange={e => setPendingStatus(e.target.value as OrderStatus)} className="w-full bg-gray-50 p-4 rounded-xl font-black uppercase text-xs border-2 border-transparent focus:border-black outline-none mb-4">
                         {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={async () => { setIsUpdatingStatus(true); await onUpdateOrderStatus?.(selectedOrder.id, pendingStatus!); setIsUpdatingStatus(false); }} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Execute Status Update</button>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Subject Coordinates</p>
                      <p className="font-bold text-xs uppercase">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                      <p className="text-xs">{selectedOrder.email} | {selectedOrder.mobile_number}</p>
                      <p className="text-xs uppercase">{selectedOrder.street_address}, {selectedOrder.city}</p>
                   </div>
                </div>
             </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8 animate-in fade-in">
             <h1 className="text-3xl font-black uppercase italic font-heading">Protocol Settings</h1>
             <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl max-w-2xl">
                <form onSubmit={async (e) => { e.preventDefault(); if(await onSaveFooterConfig?.(footerForm)) alert('FOOTER ARCHIVE UPDATED'); }} className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Facebook Pixel ID</label>
                      <input type="text" value={footerForm.fb_pixel_id || ''} onChange={e => setFooterForm({...footerForm, fb_pixel_id: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none focus:bg-white border-2 border-transparent focus:border-black" />
                   </div>
                   <button type="submit" className="w-full bg-black text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-widest">Update Vault Archives</button>
                </form>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex bg-[#fafafa] min-h-screen">
      <aside className="w-72 bg-white border-r border-gray-100 p-8 flex flex-col h-screen sticky top-0 shadow-2xl z-30">
        <div className="mb-14 text-center">
          <div className="text-2xl font-black font-heading tracking-tighter italic">SNEAKER<span className="text-red-600">VAULT</span></div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] mt-2 italic">Admin Central</p>
        </div>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'overview', icon: 'fa-gauge-high', label: 'Overview' },
            { id: 'orders', icon: 'fa-folder-tree', label: 'Orders' },
            { id: 'inventory', icon: 'fa-cubes-stacked', label: 'Inventory' },
            { id: 'settings', icon: 'fa-gears', label: 'Settings' },
          ].map((item) => (
            <button key={item.id} onClick={() => setSubView(item.id as AdminSubView)} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subView === item.id ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
              <i className={`fa-solid ${item.icon} w-6`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="mt-auto flex items-center space-x-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase text-red-600 hover:bg-red-50"><i className="fa-solid fa-sign-out-alt w-6"></i><span>Log Off</span></button>
      </aside>
      <main className="flex-1 p-14 overflow-y-auto"><div className="max-w-6xl mx-auto">{renderContent()}</div></main>
    </div>
  );
};

export default Dashboard;
