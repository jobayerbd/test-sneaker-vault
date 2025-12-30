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
      fetchSneakers();
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
    const total = subtotal; // Simplified for demo

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
      // Fallback for demo if network fails
      setLastOrder(newOrder);
      setCart([]);
      setCurrentView('order-success');
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
              fetchSneakers();
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
      case 'admin':
        return <Dashboard sneakers={sneakers} orders={orders} onRefresh={() => { fetchOrders(); fetchSneakers(); }} isRefreshing={isFetchingOrders || isFetchingSneakers} onLogout={handleLogout} />;
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