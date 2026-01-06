
import React, { useState, useMemo } from 'react';
import { Sneaker, Order, OrderStatus, ShippingOption, PaymentMethod, OrderItem } from '../../types.ts';

interface AdminOrderFormProps {
  sneakers: Sneaker[];
  shippingOptions: ShippingOption[];
  paymentMethods: PaymentMethod[];
  onSave: (order: Order) => Promise<boolean>;
  onCancel: () => void;
}

const generateOrderId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SV-ADMIN-${randomNum}`;
};

const AdminOrderForm: React.FC<AdminOrderFormProps> = ({ 
  sneakers, shippingOptions, paymentMethods, onSave, onCancel 
}) => {
  const [formData, setFormData] = useState<Partial<Order>>({
    id: generateOrderId(),
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    street_address: '',
    city: '',
    zip_code: '',
    status: OrderStatus.PLACED,
    items: [],
    shipping_name: shippingOptions[0]?.name || '',
    shipping_rate: shippingOptions[0]?.rate || 0,
    payment_method: paymentMethods[0]?.name || '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredSneakers = useMemo(() => {
    if (!searchQuery) return [];
    return sneakers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [sneakers, searchQuery]);

  const subtotal = useMemo(() => {
    return (formData.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [formData.items]);

  const total = subtotal + (formData.shipping_rate || 0);

  const addItem = (sneaker: Sneaker) => {
    const newItem: OrderItem = {
      sneakerId: sneaker.id,
      name: sneaker.name,
      image: sneaker.image,
      size: sneaker.variants[0]?.size || 'N/A',
      quantity: 1,
      price: sneaker.price
    };
    setFormData({ ...formData, items: [...(formData.items || []), newItem] });
    setSearchQuery('');
  };

  const removeItem = (idx: number) => {
    setFormData({ ...formData, items: (formData.items || []).filter((_, i) => i !== idx) });
  };

  const updateItem = (idx: number, updates: Partial<OrderItem>) => {
    const newItems = [...(formData.items || [])];
    newItems[idx] = { ...newItems[idx], ...updates };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.items || formData.items.length === 0) {
      alert("ACQUISITION ERROR: Items manifest cannot be empty.");
      return;
    }
    
    setIsSaving(true);
    const finalOrder: Order = {
      ...formData as Order,
      total,
      timeline: [],
      created_at: new Date().toISOString()
    };
    
    if (await onSave(finalOrder)) {
      onCancel();
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <button onClick={onCancel} className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black transition-all">
          <i className="fa-solid fa-arrow-left mr-2"></i> Return to Registry
        </button>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl max-w-5xl mx-auto">
        <h2 className="text-2xl font-black italic uppercase font-heading mb-10 border-b pb-6">Initialize Manual Protocol</h2>
        
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase text-red-600 tracking-widest italic">Subject Identification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1 px-1">First Name</label>
                  <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:border-black border-2 border-transparent transition-all" />
                </div>
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1 px-1">Last Name</label>
                  <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:border-black border-2 border-transparent transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1 px-1">Vault Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none focus:border-black border-2 border-transparent transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1 px-1">Contact Sequence</label>
                  <input type="text" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none focus:border-black border-2 border-transparent transition-all" />
                </div>
              </div>

              <h3 className="text-[10px] font-black uppercase text-red-600 tracking-widest italic pt-4">Logistics Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1 px-1">Street Address</label>
                  <input required type="text" value={formData.street_address} onChange={e => setFormData({...formData, street_address: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:border-black border-2 border-transparent transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 mb-1 px-1">City</label>
                    <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-xs outline-none focus:border-black border-2 border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 mb-1 px-1">Zip Code</label>
                    <input required type="text" value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none focus:border-black border-2 border-transparent transition-all" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase text-red-600 tracking-widest italic">Acquisition Manifest</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="SCAN INVENTORY..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-black text-white p-4 rounded-xl font-black uppercase text-[10px] outline-none tracking-widest"
                />
                {filteredSneakers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-10 overflow-hidden">
                    {filteredSneakers.map(s => (
                      <button key={s.id} type="button" onClick={() => addItem(s)} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left border-b last:border-0">
                        <img src={s.image} className="w-10 h-10 object-contain bg-gray-50 rounded" alt="" />
                        <div>
                          <p className="text-[10px] font-black uppercase truncate max-w-[200px]">{s.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold italic">{s.price}৳</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 min-h-[200px]">
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4 animate-in slide-in-from-right-2">
                    <img src={item.image} className="w-12 h-12 object-contain bg-white rounded border p-1" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase truncate">{item.name}</p>
                      <div className="flex gap-4 mt-1 items-center">
                        <div className="flex flex-col">
                          <label className="text-[7px] font-black uppercase text-gray-400">Size</label>
                          <input type="text" value={item.size} onChange={e => updateItem(idx, { size: e.target.value })} className="bg-transparent border-b border-gray-200 text-[9px] font-black uppercase w-12 outline-none" />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[7px] font-black uppercase text-gray-400">Qty</label>
                          <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="bg-transparent border-b border-gray-200 text-[9px] font-black w-8 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black italic">{item.price * item.quantity}৳</p>
                       <button type="button" onClick={() => removeItem(idx)} className="text-red-600 hover:text-black transition-colors"><i className="fa-solid fa-xmark text-xs"></i></button>
                    </div>
                  </div>
                ))}
                {(!formData.items || formData.items.length === 0) && (
                  <div className="h-full flex items-center justify-center border-2 border-dashed rounded-2xl py-12">
                    <p className="text-[9px] font-black uppercase text-gray-300 italic tracking-widest">No assets in manifest</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400 mb-1 px-1">Logistics Protocol</label>
                      <select value={formData.shipping_name} onChange={e => {
                        const opt = shippingOptions.find(o => o.name === e.target.value);
                        setFormData({...formData, shipping_name: e.target.value, shipping_rate: opt?.rate || 0});
                      }} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-[10px] outline-none">
                        {shippingOptions.map(o => <option key={o.id} value={o.name}>{o.name.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400 mb-1 px-1">Gateway protocol</label>
                      <select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold uppercase text-[10px] outline-none">
                        {paymentMethods.map(pm => <option key={pm.id} value={pm.name}>{pm.name.toUpperCase()}</option>)}
                      </select>
                    </div>
                 </div>
                 
                 <div className="bg-black text-white p-6 rounded-2xl space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                      <span>Subtotal</span>
                      <span>{subtotal.toLocaleString()}৳</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                      <span>Logistics</span>
                      <span>{formData.shipping_rate}৳</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                       <span className="text-xs font-black uppercase italic tracking-widest">Total Settlement</span>
                       <span className="text-2xl font-black text-red-600">{total.toLocaleString()}৳</span>
                    </div>
                 </div>
              </div>
            </section>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.5em] text-xs shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-4"
          >
            {isSaving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-check-double"></i> Commit Order Protocol</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminOrderForm;
