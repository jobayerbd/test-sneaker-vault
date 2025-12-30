import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Storefront/Home';
import ProductDetail from './components/Storefront/ProductDetail';
import Dashboard from './components/Admin/Dashboard';
import Login from './components/Admin/Login';
import { Sneaker, CartItem, Order, OrderStatus, ShippingOption } from './types';
import { MOCK_SNEAKERS, MOCK_ORDERS } from './constants';

// Supabase Configuration
const SUPABASE_URL = 'https://vwbctddmakbnvfxzrjeo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8WhV41Km5aj8Dhvu6tUbvA_JnyPoVxu';

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
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [isFetchingSneakers, setIsFetchingSneakers] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  });

  const fetchSneakers = useCallback(async () => {
    setIsFetchingSneakers(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sneakers?select=*&order=name.asc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSneakers(data.length > 0 ? data : MOCK_SNEAKERS);
      } else {
        setSneakers(MOCK_SNEAKERS);
      }
    } catch (err) {
      console.error("Failed to fetch sneakers:", err);
      setSneakers(MOCK_SNEAKERS);
    } finally {
      setIsFetchingSneakers(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsFetchingOrders(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.length > 0 ? data : MOCK_ORDERS);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders(MOCK_ORDERS);
    } finally {
      setIsFetchingOrders(false);
    }
  }, []);

  const fetchShippingOptions = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/shipping_options?select=*&order=rate.asc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setShippingOptions(data);
      }
    } catch (err) {
      console.error("Failed to fetch shipping options:", err);
    }
  }, []);

  useEffect(() => {
    const session = localStorage.getItem('sv_admin_session');
    if (session === 'active') {
      setIsAdminAuthenticated(true);
    }
    fetchSneakers();
    fetchOrders();
    fetchShippingOptions();
  }, [fetchSneakers, fetchOrders, fetchShippingOptions]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Update status error:", err);
      return false;
    }
  };

  const handleSaveProduct = async (productData: Partial<Sneaker>) => {
    const isNew = !productData.id;
    const url = isNew 
      ? `${SUPABASE_URL}/rest/v1/sneakers` 
      : `${SUPABASE_URL}/rest/v1/sneakers?id=eq.${productData.id}`;
    
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        await fetchSneakers();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Save product error:", err);
      return false;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sneakers?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (response.ok) {
        setSneakers(prev => prev.filter(s => s.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Delete product error:", err);
      return false;
    }
  };

  const handleSaveShippingOption = async (option: Partial<ShippingOption>) => {
    const isNew = !option.id;
    const url = isNew 
      ? `${SUPABASE_URL}/rest/v1/shipping_options` 
      : `${SUPABASE_URL}/rest/v1/shipping_options?id=eq.${option.id}`;
    
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(option)
      });

      if (response.ok) {
        await fetchShippingOptions();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Save shipping error:", err);
      return false;
    }
  };

  const handleDeleteShippingOption = async (id: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/shipping_options?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (response.ok) {
        setShippingOptions(prev => prev.filter(o => o.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Delete shipping error:", err);
      return false;
    }
  };

  const handleSelectProduct = (sneaker: Sneaker) => {
    setSelectedProduct(sneaker);
    setCurrentView('pdp');
    setIsCartSidebarOpen(false);
  };

  const handleAddToCart = (item: CartItem, shouldCheckout: boolean = false) => {
    setCart(prev => {
      const existingItemIndex = prev.findIndex(i => i.id === item.id && i.selectedSize === item.selectedSize);
      
      if (existingItemIndex !== -1) {
        const newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + item.quantity
        };
        return newCart;
      }
      return [...prev, item];
    });
    
    if (shouldCheckout) {
      setCurrentView('checkout');
      setIsCartSidebarOpen(false);
    } else {
      setIsCartSidebarOpen(true);
    }
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      const newQuantity = newCart[index].quantity + delta;
      if (newQuantity <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      newCart[index] = { ...newCart[index], quantity: newQuantity };
      return newCart;
    });
  };

  const toggleWishlist = (sneaker: Sneaker) => {
    setWishlist(prev => {
      const exists = prev.find(s => s.id === sneaker.id);
      if (exists) {
        return prev.filter(s => s.id !== sneaker.id);
      }
      return [...prev, sneaker];
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    localStorage.removeItem('sv_admin_session');
    setIsAdminAuthenticated(false);
    setCurrentView('home');
  };

  const navigateToAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
      fetchOrders();
      fetchSneakers();
      fetchShippingOptions();
    } else {
      setCurrentView('admin-login');
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutForm.firstName || !checkoutForm.email) {
      alert("Please fill out your details.");
      return;
    }

    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal;

    const orderId = `ORD-${Math.floor(Math.random() * 90000) + 10000}`;
    const newOrder = {
      id: orderId,
      first_name: checkoutForm.firstName,
      last_name: checkoutForm.lastName,
      email: checkoutForm.email,
      street_address: checkoutForm.address,
      city: checkoutForm.city,
      zip_code: checkoutForm.zip,
      total: total,
      status: OrderStatus.PLACED,
      items: cart.map(item => ({
        sneakerId: item.id,
        name: item.name,
        image: item.image,
        size: item.selectedSize,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newOrder)
      });

      const responseData = await response.json();
      const savedOrder = Array.isArray(responseData) ? responseData[0] : responseData;
      
      setOrders(prev => [savedOrder || newOrder, ...prev]);
      setLastOrder(savedOrder || newOrder);
      setCart([]);
      setCurrentView('order-success');
    } catch (err) {
      console.error("Order error:", err);
      setLastOrder(newOrder);
      setCart([]);
      setCurrentView('order-success');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const CartSidebar = () => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return (
      <>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${isCartSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsCartSidebarOpen(false)}
        />
        {/* Sidebar Drawer */}
        <div className={`fixed right-0 top-0 h-screen w-full max-w-md bg-white z-[70] shadow-2xl transition-transform duration-500 ease-in-out transform ${isCartSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-black text-white">
              <h2 className="text-xl font-black font-heading italic tracking-tighter uppercase">Vault Bag</h2>
              <button onClick={() => setIsCartSidebarOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <i className="fa-solid fa-bag-shopping text-6xl mb-4 text-gray-200"></i>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">The vault is currently empty</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex space-x-4 border-b border-gray-50 pb-6 group animate-in fade-in slide-in-from-right-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl p-2 shrink-0 border border-gray-100 shadow-sm overflow-hidden">
                      <img src={item.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-[10px] font-black uppercase truncate w-40">{item.name}</h4>
                          <p className="text-[9px] text-red-600 font-black uppercase tracking-widest mt-0.5">Size: {item.selectedSize}</p>
                        </div>
                        <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-600 transition-colors p-1">
                          <i className="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden h-8 bg-gray-50">
                          <button 
                            onClick={() => updateCartQuantity(idx, -1)}
                            className="px-3 h-full hover:bg-white text-gray-400 hover:text-black transition-colors"
                          >-</button>
                          <span className="px-3 font-black text-[10px]">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(idx, 1)}
                            className="px-3 h-full hover:bg-white text-gray-400 hover:text-black transition-colors"
                          >+</button>
                        </div>
                        <p className="text-sm font-black italic">{(item.price * item.quantity).toLocaleString()}৳</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Estimated Protocol Value</span>
                  <span className="text-[9px] font-bold text-green-600 uppercase">Secure Shipping: Included</span>
                </div>
                <span className="text-3xl font-black italic tracking-tighter">{total.toLocaleString()}৳</span>
              </div>
              <button 
                onClick={() => { setCurrentView('checkout'); setIsCartSidebarOpen(false); }}
                disabled={cart.length === 0}
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-red-700 transition-all transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Secure Checkout <i className="fa-solid fa-arrow-right-long ml-4"></i>
              </button>
              <button 
                onClick={() => setIsCartSidebarOpen(false)}
                className="w-full bg-white border-2 border-gray-100 text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:border-black transition-all"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home sneakers={sneakers} onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} />;
      case 'pdp':
        return selectedProduct ? (
          <ProductDetail 
            sneaker={selectedProduct} 
            onAddToCart={handleAddToCart} 
            onBack={() => setCurrentView('shop')} 
            onToggleWishlist={toggleWishlist}
            isInWishlist={wishlist.some(s => s.id === selectedProduct.id)}
          />
        ) : <Home sneakers={sneakers} onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} />;
      case 'admin-login':
        return (
          <Login 
            supabaseUrl={SUPABASE_URL} 
            supabaseKey={SUPABASE_KEY} 
            onLoginSuccess={() => {
              setIsAdminAuthenticated(true);
              setCurrentView('admin');
              fetchOrders();
              fetchSneakers();
              fetchShippingOptions();
            }} 
          />
        );
      case 'shop':
        return (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div>
                <h1 className="text-6xl font-black font-heading italic uppercase tracking-tighter">The Vault Collection</h1>
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">Authenticated Grails Only</p>
              </div>
              <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <span>Filter: Newest First</span>
                <i className="fa-solid fa-chevron-down text-[8px]"></i>
              </div>
            </div>
            
            {isFetchingSneakers ? (
              <div className="flex flex-col items-center justify-center py-40">
                <i className="fa-solid fa-circle-notch animate-spin text-4xl text-red-600 mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Opening Vault...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                {sneakers.map(sneaker => (
                  <div 
                    key={sneaker.id}
                    onClick={() => handleSelectProduct(sneaker)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[4/5] bg-white border border-gray-100 rounded-sm overflow-hidden mb-6 relative shadow-sm hover:shadow-2xl transition-all duration-500">
                      <img src={sneaker.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      {sneaker.is_drop && (
                        <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest italic animate-pulse-red">High Heat</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{sneaker.brand}</p>
                    <h3 className="font-bold text-xs mb-1 group-hover:text-red-600 transition-colors uppercase truncate">{sneaker.name}</h3>
                    <p className="font-black text-sm italic">{sneaker.price}৳</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'order-success':
        return (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl animate-bounce">
              <i className="fa-solid fa-check text-white text-4xl"></i>
            </div>
            <h1 className="text-5xl font-black font-heading italic uppercase tracking-tighter mb-4">VAULT SECURED!</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest mb-12">Protocol Completed. Your grails are being prepared.</p>
            
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden mb-12">
               <div className="bg-black p-6 flex justify-between items-center text-white">
                 <div className="text-left">
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Transaction ID</p>
                   <p className="font-mono text-lg font-black">{lastOrder?.id}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Protocol Value</p>
                   <p className="text-2xl font-black italic">{lastOrder?.total.toLocaleString()}৳</p>
                 </div>
               </div>
               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { icon: 'fa-shield-check', title: 'VERIFIED', desc: 'Legitimacy confirmed by vault' },
                      { icon: 'fa-box-open', title: 'PROCESSING', desc: 'Preparing for secure transport' },
                      { icon: 'fa-truck-ramp-box', title: 'SHIPPING', desc: 'Arriving in 2-5 days' },
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3 text-black">
                          <i className={`fa-solid ${step.icon} text-lg`}></i>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">{step.title}</h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8 border-t border-gray-50 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 text-center">Protocol Manifest</p>
                    <div className="space-y-4 max-h-40 overflow-y-auto pr-4 custom-scrollbar">
                      {lastOrder?.items.map((item, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-50 rounded p-1 shrink-0"><img src={item.image} className="w-full h-full object-contain" /></div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase truncate">{item.name}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase">Size: {item.size} | Qty: {item.quantity}</p>
                          </div>
                          <span className="text-[10px] font-black">{item.price.toLocaleString()}৳</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button onClick={() => setCurrentView('shop')} className="px-10 py-5 bg-black text-white font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all">Continue Exploring</button>
              <button className="px-10 py-5 border-2 border-black text-black font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">Download Manifest</button>
            </div>
          </div>
        );
      case 'checkout':
        const checkTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        return (
          <div className="max-w-5xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-black font-heading mb-10 italic uppercase tracking-tighter">Secure Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="bg-white p-8 border border-gray-100 rounded-xl shadow-sm">
                  <h3 className="text-lg font-black font-heading uppercase mb-6 flex items-center italic">Shipping Coordinates</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 italic">First Name</label><input type="text" value={checkoutForm.firstName} onChange={e => setCheckoutForm({...checkoutForm, firstName: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-red-600 transition-colors font-bold text-xs" /></div>
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 italic">Last Name</label><input type="text" value={checkoutForm.lastName} onChange={e => setCheckoutForm({...checkoutForm, lastName: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-red-600 transition-colors font-bold text-xs" /></div>
                    </div>
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 italic">Email Address</label><input type="email" value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-red-600 transition-colors font-bold text-xs" /></div>
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 italic">Physical Location</label><input type="text" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-red-600 transition-colors font-bold text-xs" placeholder="STREET, AREA" /></div>
                  </div>
                </div>
                <div className="bg-white p-8 border border-gray-100 rounded-xl shadow-sm">
                  <h3 className="text-lg font-black font-heading uppercase mb-6 italic">Payment Protocol</h3>
                  <div className="p-5 border-2 border-black flex items-center justify-between bg-gray-50 rounded-xl"><div className="flex items-center"><i className="fa-solid fa-truck-fast mr-4 text-xl text-red-600"></i><span className="font-black text-[10px] uppercase tracking-widest">Cash on Delivery</span></div><i className="fa-solid fa-circle-check text-black"></i></div>
                </div>
              </div>
              <div className="bg-black text-white p-8 h-fit shadow-2xl rounded-2xl group">
                <h3 className="text-xl font-black font-heading uppercase italic mb-8 border-b border-white/10 pb-4">Protocol Summary</h3>
                <div className="space-y-4 mb-8">
                  {cart.map((item, i) => (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400"><span>{item.name} ({item.selectedSize}) x{item.quantity}</span><span className="text-white">{(item.price * item.quantity).toLocaleString()}৳</span></div>
                  ))}
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-400"><span>Secure Shipping</span><span>FREE</span></div>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                   <span className="text-xs font-black uppercase italic font-heading tracking-widest text-red-600">Total Settlement</span>
                   <span className="text-3xl font-black group-hover:scale-105 transition-transform origin-right duration-500">{checkTotal.toLocaleString()}৳</span>
                </div>
                <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full bg-red-700 text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] mt-8 hover:bg-white hover:text-red-700 transition-all shadow-xl disabled:opacity-50">
                  {isPlacingOrder ? 'Processing...' : 'Secure My Order'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'admin':
        return (
          <Dashboard 
            sneakers={sneakers} 
            orders={orders} 
            shippingOptions={shippingOptions}
            onRefresh={() => { fetchOrders(); fetchSneakers(); fetchShippingOptions(); }} 
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onSaveShipping={handleSaveShippingOption}
            onDeleteShipping={handleDeleteShippingOption}
            isRefreshing={isFetchingOrders || isFetchingSneakers} 
            onLogout={handleLogout} 
          />
        );
      default:
        return <Home sneakers={sneakers} onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {currentView !== 'admin' && (
        <Navigation 
          onNavigate={(view) => {
            if (view === 'admin') navigateToAdmin();
            else {
               setCurrentView(view as View);
               setIsCartSidebarOpen(false);
            }
          }} 
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
          wishlistCount={wishlist.length}
          currentView={currentView} 
          onOpenCart={() => setIsCartSidebarOpen(true)}
        />
      )}
      <div className="flex-1">{renderView()}</div>
      <CartSidebar />
    </div>
  );
};

export default App;