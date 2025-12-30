import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Storefront/Home';
import ProductDetail from './components/Storefront/ProductDetail';
import Dashboard from './components/Admin/Dashboard';
import Login from './components/Admin/Login';
import { Sneaker, CartItem, Order, OrderStatus } from './types';
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
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [isFetchingSneakers, setIsFetchingSneakers] = useState(false);

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
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sneakers?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Fallback to mock if database is actually empty
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

  useEffect(() => {
    const session = localStorage.getItem('sv_admin_session');
    if (session === 'active') {
      setIsAdminAuthenticated(true);
    }
    fetchSneakers();
    fetchOrders();
  }, [fetchSneakers, fetchOrders]);

  const handleSelectProduct = (sneaker: Sneaker) => {
    setSelectedProduct(sneaker);
    setCurrentView('pdp');
  };

  const handleAddToCart = (item: CartItem, shouldCheckout: boolean = false) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedSize === item.selectedSize);
      if (existing) {
        return prev.map(i => i.id === item.id && i.selectedSize === item.selectedSize 
          ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
    
    if (shouldCheckout) {
      setCurrentView('checkout');
    } else {
      alert(`Added ${item.name} to vault!`);
    }
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
    const total = Math.round(subtotal * 1.08);

    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
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

      if (!response.ok) throw new Error("Database Sync Error");

      const responseData = await response.json();
      const savedOrder = Array.isArray(responseData) ? responseData[0] : responseData;
      
      setOrders(prev => [savedOrder, ...prev]);
      setLastOrder(savedOrder);
      setCart([]);
      setCurrentView('order-success');
    } catch (err) {
      alert("Order placement failed. Check connection.");
    } finally {
      setIsPlacingOrder(false);
    }
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
      case 'wishlist':
        return (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-black font-heading mb-10 italic uppercase">Your Watchlist</h1>
            {wishlist.length === 0 ? (
              <div className="text-center py-32 bg-gray-50 rounded-sm border-2 border-dashed border-gray-200">
                <i className="fa-regular fa-heart text-6xl text-gray-200 mb-6"></i>
                <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest italic">The vault is currently empty of grails.</p>
                <button onClick={() => setCurrentView('shop')} className="bg-black text-white px-10 py-4 font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl">Explore Collection</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {wishlist.map(sneaker => (
                  <div key={sneaker.id} className="bg-white border border-gray-100 p-4 group relative hover:shadow-2xl transition-all">
                    <button onClick={(e) => { e.stopPropagation(); toggleWishlist(sneaker); }} className="absolute top-6 right-6 z-10 text-red-500 hover:scale-125 transition-transform"><i className="fa-solid fa-heart text-xl"></i></button>
                    <div className="aspect-[4/5] bg-gray-50 mb-4 overflow-hidden" onClick={() => handleSelectProduct(sneaker)}><img src={sneaker.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{sneaker.brand}</p>
                    <h3 className="font-bold text-[11px] mb-3 truncate uppercase" onClick={() => handleSelectProduct(sneaker)}>{sneaker.name}</h3>
                    <div className="flex justify-between items-center"><span className="font-black text-sm italic">{sneaker.price}৳</span><button onClick={() => handleSelectProduct(sneaker)} className="bg-black text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors">View Detail</button></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'cart':
        const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        return (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-black font-heading mb-10 italic uppercase">Your Vault Bag</h1>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-sm">
                <i className="fa-solid fa-bag-shopping text-6xl text-gray-200 mb-6"></i>
                <p className="text-sm font-bold text-gray-400 mb-8 font-heading uppercase tracking-widest italic">No items secured yet.</p>
                <button onClick={() => setCurrentView('shop')} className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-600 transition-colors">Start Shopping</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex space-x-6 border-b border-gray-100 pb-8">
                      <div className="w-32 h-32 bg-gray-50 rounded-sm p-2 flex-shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-sm uppercase leading-tight font-heading">{item.name}</h3>
                            <button onClick={() => removeFromCart(idx)} className="text-gray-400 hover:text-red-600 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                          </div>
                          <p className="text-[10px] text-gray-500 uppercase font-black mt-1 tracking-widest">{item.brand} | Size: {item.selectedSize}</p>
                        </div>
                        <div className="flex justify-between items-end">
                           <div className="flex items-center border rounded overflow-hidden h-8">
                             <button className="px-3 h-full hover:bg-gray-100 border-r text-xs font-bold">-</button>
                             <span className="px-4 font-bold text-xs">{item.quantity}</span>
                             <button className="px-3 h-full hover:bg-gray-100 border-l text-xs font-bold">+</button>
                           </div>
                           <span className="font-black text-lg italic text-red-600">{item.price * item.quantity}৳</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 p-8 rounded-sm h-fit border border-gray-100 shadow-sm">
                   <h3 className="text-lg font-black font-heading uppercase italic mb-6 border-b pb-4 border-gray-200">Order Summary</h3>
                   <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest"><span>Subtotal</span><span className="text-black">{cartTotal}৳</span></div>
                      <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest"><span>Shipping</span><span className="text-green-600 uppercase">Free</span></div>
                      <div className="pt-4 border-t border-gray-200 flex justify-between"><span className="text-base font-black uppercase italic font-heading">Total</span><span className="text-xl font-black text-red-700">{cartTotal}৳</span></div>
                   </div>
                   <button onClick={() => setCurrentView('checkout')} className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all">Go to Checkout</button>
                </div>
              </div>
            )}
          </div>
        );
      case 'checkout':
        const checkTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        return (
          <div className="max-w-5xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-black font-heading mb-10 italic uppercase">Secure Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="bg-white p-8 border border-gray-100">
                  <h3 className="text-lg font-black font-heading uppercase mb-6 flex items-center">Shipping Details</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">First Name</label><input type="text" value={checkoutForm.firstName} onChange={e => setCheckoutForm({...checkoutForm, firstName: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold text-xs" /></div>
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Last Name</label><input type="text" value={checkoutForm.lastName} onChange={e => setCheckoutForm({...checkoutForm, lastName: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold text-xs" /></div>
                    </div>
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Email</label><input type="email" value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold text-xs" /></div>
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Street Address</label><input type="text" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold text-xs" /></div>
                  </div>
                </div>
                <div className="bg-white p-8 border border-gray-100">
                  <h3 className="text-lg font-black font-heading uppercase mb-6">Payment</h3>
                  <div className="p-4 border-2 border-black flex items-center justify-between bg-gray-50"><div className="flex items-center"><i className="fa-solid fa-truck-fast mr-4 text-xl"></i><span className="font-black text-[10px] uppercase tracking-widest">Cash on Delivery</span></div><i className="fa-solid fa-circle-check text-black"></i></div>
                </div>
              </div>
              <div className="bg-black text-white p-8 h-fit shadow-2xl">
                <h3 className="text-xl font-black font-heading uppercase italic mb-8 border-b border-white/10 pb-4">Vault Summary</h3>
                <div className="space-y-4 mb-8">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400"><span>{item.name} (x{item.quantity})</span><span>{item.price * item.quantity}৳</span></div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                   <span className="text-xs font-black uppercase italic font-heading">Total Secured</span>
                   <span className="text-2xl font-black">{checkTotal}৳</span>
                </div>
                <button onClick={handlePlaceOrder} className="w-full bg-red-700 text-white py-5 font-black uppercase tracking-[0.2em] mt-8 hover:bg-white hover:text-red-700 transition-all">Confirm Order</button>
              </div>
            </div>
          </div>
        );
      case 'admin':
        return <Dashboard orders={orders} onRefresh={fetchOrders} isRefreshing={isFetchingOrders} onLogout={handleLogout} />;
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
            else setCurrentView(view as View);
          }} 
          cartCount={cart.length} 
          wishlistCount={wishlist.length}
          currentView={currentView} 
        />
      )}
      <div className="flex-1">{renderView()}</div>
    </div>
  );
};

export default App;