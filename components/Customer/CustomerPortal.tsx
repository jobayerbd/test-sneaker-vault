
import React, { useState } from 'react';
import { Customer, Order, OrderStatus } from '../../types.ts';

interface CustomerPortalProps {
  customer: Customer;
  orders: Order[];
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<Customer>) => Promise<boolean>;
  onSelectOrder: (order: Order) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case OrderStatus.DELIVERED: return 'text-green-600';
    case OrderStatus.SHIPPED: return 'text-blue-600';
    case OrderStatus.PROCESSING: return 'text-amber-600';
    default: return 'text-red-600';
  }
};

const CustomerPortal: React.FC<CustomerPortalProps> = ({ customer, orders, onLogout, onUpdateProfile, onSelectOrder }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'address'>('orders');
  const [isSaving, setIsSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    mobile_number: customer?.mobile_number || '',
    street_address: customer?.street_address || '',
    city: customer?.city || '',
    zip_code: customer?.zip_code || ''
  });

  if (!customer) return null;

  const myOrders = orders.filter(o => o.customer_id === customer.id || o.email === customer.email);
  const totalSpent = myOrders.reduce((acc, o) => acc + o.total, 0);

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await onUpdateProfile(addressForm);
    if (success) {
      alert('VAULT UPDATED: Logistics coordinates synced.');
    } else {
      alert('ERROR: Sync protocol failed.');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] italic mb-2">Authenticated Member</p>
          <h1 className="text-4xl font-black font-heading italic uppercase tracking-tighter text-black">
            Vault Index: {customer.first_name || 'Protocol User'}
          </h1>
        </div>
        <button 
          onClick={onLogout}
          className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-lg"
        >
          Deactivate Session
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Protocols</p>
          <p className="text-xl font-black italic">{myOrders.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vault Investment</p>
          <p className="text-xl font-black italic text-red-600">{totalSpent.toLocaleString()}৳</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Registry Status</p>
          <p className="text-xl font-black italic text-green-600">ACTIVE</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
          <p className="text-xl font-black italic">{customer.created_at ? new Date(customer.created_at).getFullYear() : '2024'}</p>
        </div>
      </div>

      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'orders' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
        >
          Order Registry
          {activeTab === 'orders' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 animate-in slide-in-from-bottom-1"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('address')}
          className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'address' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
        >
          Logistics Management
          {activeTab === 'address' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 animate-in slide-in-from-bottom-1"></div>}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-black p-6 text-white flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic">Active Registry Manifest</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {myOrders.length > 0 ? (
                myOrders.map(order => (
                  <div key={order.id} className="p-8 hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => onSelectOrder(order)}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[11px] font-black text-black group-hover:text-red-600 transition-colors uppercase tracking-widest">{order.id}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                          Protocol Initiated: {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black italic">{order.total.toLocaleString()}৳</p>
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg bg-gray-100 ${getStatusColor(order.status)}`}>{order.status}</span>
                      </div>
                    </div>
                    <div className="pl-4 border-l-2 border-red-50 relative space-y-4">
                      {order.timeline?.slice(-2).reverse().map((event, idx) => (
                        <div key={idx}>
                          <p className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-black' : 'text-gray-400'}`}>
                            {event.status} <span className="text-gray-300 font-bold ml-2">[{new Date(event.timestamp).toLocaleDateString()}]</span>
                          </p>
                          <p className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">{event.note}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-[9px] font-black uppercase text-red-600 italic tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Manifest Details <i className="fa-solid fa-arrow-right-long ml-2"></i>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <p className="text-[10px] font-black uppercase text-gray-300 italic tracking-[0.4em]">Zero active order protocols found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'address' && (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-10 max-w-3xl mx-auto w-full animate-in slide-in-from-bottom-4">
            <h3 className="text-sm font-black uppercase italic mb-8 border-b pb-4 tracking-widest">Logistics Coordinates</h3>
            <form onSubmit={handleUpdateAddress} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-black block mb-2 px-1 tracking-widest">First Name</label>
                  <input type="text" value={addressForm.first_name} onChange={e => setAddressForm({...addressForm, first_name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-black block mb-2 px-1 tracking-widest">Last Name</label>
                  <input type="text" value={addressForm.last_name} onChange={e => setAddressForm({...addressForm, last_name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-black block mb-2 px-1 tracking-widest">Mobile Number</label>
                  <input type="text" value={addressForm.mobile_number} onChange={e => setAddressForm({...addressForm, mobile_number: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-black block mb-2 px-1 tracking-widest">Street Address</label>
                  <input type="text" value={addressForm.street_address} onChange={e => setAddressForm({...addressForm, street_address: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-black block mb-2 px-1 tracking-widest">City</label>
                  <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-black block mb-2 px-1 tracking-widest">Zip Code</label>
                  <input type="text" value={addressForm.zip_code} onChange={e => setAddressForm({...addressForm, zip_code: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3"
              >
                {isSaving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                Commit Logistics Updates
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;
