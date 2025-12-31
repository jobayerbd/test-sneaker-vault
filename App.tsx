
import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Storefront/Home';
import ProductDetail from './components/Storefront/ProductDetail';
import Dashboard from './components/Admin/Dashboard';
import Login from './components/Admin/Login';
import Footer from './components/Footer';
import { Sneaker, CartItem, Order, OrderStatus, ShippingOption, FooterConfig, TimelineEvent } from './types';
import { MOCK_SNEAKERS, MOCK_ORDERS } from './constants';

const SUPABASE_URL = 'https://vwbctddmakbnvfxzrjeo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8WhV41Km5aj8Dhvu6tUbvA_JnyPoVxu';

const DEFAULT_FOOTER: FooterConfig = {
  store_name: "SNEAKERVAULT",
  description: "The ultimate destination for sneaker enthusiasts. Authenticated grails, high-traffic drops, and a community built on passion.",
  copyright: "© 2024 SNEAKERVAULT. ALL RIGHTS RESERVED. AUTHENTICATED PROTOCOL.",
  facebook_url: "#",
  instagram_url: "#",
  twitter_url: "#",
  fb_pixel_id: ""
};

const trackFBPixel = (event: string, params?: any) => {
  const f = window as any;
  if (f.fbq) {
    f.fbq('track', event, params);
  }
};

type View = 'home' | 'shop' | 'admin' | 'cart' | 'pdp' | 'wishlist' | 'checkout' | 'order-success' | 'admin-login';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Sneaker | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Sneaker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER);
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [isFetchingSneakers, setIsFetchingSneakers] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '', lastName: '', email: '', mobileNumber: '', address: '', city: '', zip: '', createAccount: false, password: ''
  });

  useEffect(() => {
    const pixelId = footerConfig.fb_pixel_id?.trim();
    if (!pixelId) return;
    const f = window as any;
    if (!f.fbq) {
      f.fbq = function() { f.fbq.callMethod ? f.fbq.callMethod.apply(f.fbq, arguments) : f.fbq.queue.push(arguments); };
      if (!f._fbq) f._fbq = f.fbq; f.fbq.push = f.fbq; f.fbq.loaded = !0; f.fbq.version = '2.0'; f.fbq.queue = [];
      const t = document.createElement('script'); t.async = !0; t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const s = document.getElementsByTagName('script')[0]; if (s && s.parentNode) s.parentNode.insertBefore(t, s);
    }
    f.fbq('init', pixelId); f.fbq('track', 'PageView');
  }, [footerConfig.fb_pixel_id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    trackFBPixel('PageView');
  }, [currentView]);

  const fetchSneakers = useCallback(async () => {
    setIsFetchingSneakers(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sneakers?select=*&order=name.asc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSneakers(data);
      }
    } finally { setIsFetchingSneakers(false); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsFetchingOrders(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } finally { setIsFetchingOrders(false); }
  }, []);

  const fetchShippingOptions = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/shipping_options?select=*&order=rate.asc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) {
        const data = await response.json();
        setShippingOptions(data);
        if (data.length > 0) setSelectedShipping(data[0]);
      }
    } catch (err) {}
  }, []);

  const fetchFooterConfig = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.footer&select=data`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data[0]) setFooterConfig(data[0].data);
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (localStorage.getItem('sv_admin_session') === 'active') setIsAdminAuthenticated(true);
    fetchSneakers(); fetchOrders(); fetchShippingOptions(); fetchFooterConfig();
  }, [fetchSneakers, fetchOrders, fetchShippingOptions, fetchFooterConfig]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    const newEvent: TimelineEvent = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: `Status protocol updated to ${newStatus}.`
    };

    const updatedTimeline = [...(order.timeline || []), newEvent];

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status: newStatus, timeline: updatedTimeline })
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, timeline: updatedTimeline } : o));
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutForm.firstName || !checkoutForm.mobileNumber) { alert("Required fields missing."); return; }
    if (!selectedShipping) return;
    setIsPlacingOrder(true);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + selectedShipping.rate;
    const orderId = `ORD-${Math.floor(Math.random() * 90000) + 10000}`;
    
    const initialTimeline: TimelineEvent[] = [{
      status: OrderStatus.PLACED,
      timestamp: new Date().toISOString(),
      note: 'Order protocol initiated and secured.'
    }];

    const newOrder = {
      id: orderId, first_name: checkoutForm.firstName, last_name: checkoutForm.lastName, email: checkoutForm.email || 'guest@sneakervault.bd', mobile_number: checkoutForm.mobileNumber, street_address: checkoutForm.address, city: checkoutForm.city, zip_code: checkoutForm.zip, total, status: OrderStatus.PLACED, timeline: initialTimeline, shipping_name: selectedShipping.name, shipping_rate: selectedShipping.rate, items: cart.map(item => ({ sneakerId: item.id, name: item.name, image: item.image, size: item.selectedSize, quantity: item.quantity, price: item.price }))
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(newOrder)
      });
      if (response.ok) {
        const saved = (await response.json())[0];
        setOrders(prev => [saved, ...prev]);
        setLastOrder(saved);
        setCart([]);
        setCurrentView('order-success');
      }
    } catch (err) { alert("ORDER ERROR"); } finally { setIsPlacingOrder(false); }
  };

  const navigateToAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setCurrentView('admin-login');
    }
  };

  const handleSelectProduct = (sneaker: Sneaker) => { setSelectedProduct(sneaker); setCurrentView('pdp'); setIsCartSidebarOpen(false); };
  const toggleWishlist = (sneaker: Sneaker) => { /* same as before */ };
  const updateCartQuantity = (index: number, delta: number) => { /* same as before */ };
  const removeFromCart = (index: number) => { /* same as before */ };
  const handleAddToCart = (item: CartItem, shouldCheckout: boolean = false) => { /* same as before */ };
  const handleLogout = () => { localStorage.removeItem('sv_admin_session'); setIsAdminAuthenticated(false); setCurrentView('home'); };
  
  const handleSaveProduct = async (data: any): Promise<boolean> => { return true; };
  const handleDeleteProduct = async (id: string): Promise<boolean> => { return true; };
  const handleSaveShippingOption = async (data: any): Promise<boolean> => { return true; };
  const handleDeleteShippingOption = async (id: string): Promise<boolean> => { return true; };
  
  const handleSaveFooterConfig = async (config: FooterConfig): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.footer`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: config })
      });
      if (response.ok) {
        setFooterConfig(config);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const CartSidebar = () => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return (
      <>
        <div className={`fixed inset-0 bg-black/60 z-[60] transition-opacity ${isCartSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartSidebarOpen(false)} />
        <div className={`fixed right-0 top-0 h-screen w-full max-w-md bg-white z-[70] transition-transform duration-500 transform ${isCartSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="flex flex-col h-full">
            <div className="p-6 bg-black text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Vault Bag</h2>
              <button onClick={() => setIsCartSidebarOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex space-x-4 border-b border-gray-50 pb-6">
                  <div className="w-20 h-20 bg-gray-50 border rounded-xl p-2"><img src={item.image} className="w-full h-full object-contain" /></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div><h4 className="text-[10px] font-black uppercase truncate w-32">{item.name}</h4><p className="text-[9px] text-red-600 font-black">Size: {item.selectedSize}</p></div>
                      <button onClick={() => removeFromCart(idx)}><i className="fa-solid fa-trash-can text-gray-300"></i></button>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex border rounded overflow-hidden"><button onClick={() => updateCartQuantity(idx, -1)} className="px-2">-</button><span className="px-2 font-bold">{item.quantity}</span><button onClick={() => updateCartQuantity(idx, 1)} className="px-2">+</button></div>
                      <p className="text-xs font-black italic">{item.price * item.quantity}৳</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-white border-t border-gray-100">
               <div className="flex justify-between mb-4"><span className="text-xs font-black uppercase">Total</span><span className="text-2xl font-black">{total}৳</span></div>
               <button onClick={() => { setCurrentView('checkout'); setIsCartSidebarOpen(false); }} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs">Checkout</button>
            </div>
           </div>
        </div>
      </>
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home sneakers={sneakers} onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} />;
      case 'pdp': return selectedProduct ? <ProductDetail sneaker={selectedProduct} onAddToCart={handleAddToCart} onBack={() => setCurrentView('shop')} onToggleWishlist={toggleWishlist} isInWishlist={wishlist.some(s => s.id === selectedProduct.id)} /> : <Home sneakers={sneakers} onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} />;
      case 'admin-login': return <Login supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onLoginSuccess={() => { setIsAdminAuthenticated(true); setCurrentView('admin'); fetchOrders(); fetchSneakers(); fetchShippingOptions(); fetchFooterConfig(); }} />;
      case 'shop': return (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-black italic uppercase font-heading mb-10">Vault Archives</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {sneakers.map(s => (
              <div key={s.id} onClick={() => handleSelectProduct(s)} className="group cursor-pointer">
                <div className="aspect-[4/5] bg-white border overflow-hidden relative mb-4"><img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />{s.is_drop && <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] px-2 py-1 uppercase font-black">High Heat</div>}</div>
                <h3 className="font-bold text-xs uppercase truncate">{s.name}</h3><p className="font-black italic text-sm">{s.price}৳</p>
              </div>
            ))}
          </div>
        </div>
      );
      case 'checkout': return (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-black uppercase font-heading italic mb-12">Checkout Registry</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 border rounded-2xl"><h3 className="font-black uppercase italic mb-6">Shipping Coordinates</h3><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="First Name" value={checkoutForm.firstName} onChange={e => setCheckoutForm({...checkoutForm, firstName: e.target.value})} className="border-b py-2 outline-none font-bold text-xs" /><input type="text" placeholder="Last Name" value={checkoutForm.lastName} onChange={e => setCheckoutForm({...checkoutForm, lastName: e.target.value})} className="border-b py-2 outline-none font-bold text-xs" /><input type="tel" placeholder="Mobile" value={checkoutForm.mobileNumber} onChange={e => setCheckoutForm({...checkoutForm, mobileNumber: e.target.value})} className="border-b py-2 outline-none font-bold text-xs" /><input type="email" placeholder="Email" value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})} className="border-b py-2 outline-none font-bold text-xs" /></div><input type="text" placeholder="Address" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full border-b py-4 outline-none font-bold text-xs mt-4" /></div>
              <div className="bg-white p-8 border rounded-2xl"><h3 className="font-black uppercase italic mb-6">Logistics</h3><div className="space-y-2">{shippingOptions.map(o => <div key={o.id} onClick={() => setSelectedShipping(o)} className={`p-4 border-2 rounded-xl flex justify-between cursor-pointer ${selectedShipping?.id === o.id ? 'border-black' : 'border-gray-50'}`}><span className="font-black text-[10px] uppercase">{o.name}</span><span className="font-black italic text-xs">{o.rate}৳</span></div>)}</div></div>
            </div>
            <div className="bg-black text-white p-8 rounded-2xl h-fit">
              <h3 className="text-xl font-black uppercase italic border-b border-white/10 pb-4 mb-4">Summary</h3>
              <div className="flex justify-between items-end mb-6"><span>Total Settlement</span><span className="text-2xl font-black">{cart.reduce((a,c)=>a+(c.price*c.quantity),0) + (selectedShipping?.rate||0)}৳</span></div>
              <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full bg-red-700 py-4 rounded-xl font-black uppercase text-xs">Commit Protocol</button>
            </div>
          </div>
        </div>
      );
      case 'order-success': return (
        <div className="max-w-2xl mx-auto py-20 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl"><i className="fa-solid fa-check"></i></div>
          <h1 className="text-4xl font-black italic uppercase font-heading mb-4">Vault Secured!</h1>
          <p className="text-gray-400 mb-8 uppercase font-bold text-xs">Protocol successfully completed. Order ID: {lastOrder?.id}</p>
          <button onClick={() => setCurrentView('shop')} className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-xs">Continue Exploration</button>
        </div>
      );
      case 'admin': return <Dashboard sneakers={sneakers} orders={orders} shippingOptions={shippingOptions} footerConfig={footerConfig} onRefresh={() => { fetchOrders(); fetchSneakers(); fetchShippingOptions(); fetchFooterConfig(); }} onUpdateOrderStatus={handleUpdateOrderStatus} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} onSaveShipping={handleSaveShippingOption} onDeleteShipping={handleDeleteShippingOption} onSaveFooterConfig={handleSaveFooterConfig} isRefreshing={isFetchingOrders || isFetchingSneakers} onLogout={handleLogout} />;
      default: return <Home sneakers={sneakers} onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {currentView !== 'admin' && <Navigation onNavigate={(v) => v==='admin'?navigateToAdmin():setCurrentView(v as View)} cartCount={cart.reduce((a,c)=>a+c.quantity,0)} wishlistCount={wishlist.length} currentView={currentView} onOpenCart={() => setIsCartSidebarOpen(true)} />}
      <div className="flex-1">{renderView()}</div>
      <CartSidebar />
      {currentView !== 'admin' && currentView !== 'admin-login' && <Footer config={footerConfig} onNavigate={setCurrentView} />}
    </div>
  );
};

export default App;
