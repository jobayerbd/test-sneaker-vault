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
  const [orders, setOrders] = useState<Order[]>([]); // Start empty to wait for DB
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  });

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
        // If DB is empty, use mock for visuals, otherwise use real data
        if (data && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(MOCK_ORDERS);
        }
      }
    } catch (err) {
      console.error("Failed to fetch from Supabase:", err);
      setOrders(MOCK_ORDERS); // Fallback on error
    } finally {
      setIsFetchingOrders(false);
    }
  }, []);

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('sv_admin_session');
    if (session === 'active') {
      setIsAdminAuthenticated(true);
    }
    fetchOrders();
  }, [fetchOrders]);

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
      fetchOrders(); // Refresh when entering admin
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase Error: ${errorText}`);
      }

      const responseData = await response.json();
      const savedOrder = Array.isArray(responseData) ? responseData[0] : responseData;
      
      setOrders(prev => [savedOrder, ...prev]);
      setLastOrder(savedOrder);
      setCart([]);
      setCurrentView('order-success');
    } catch (err) {
      console.error("Checkout Sync Error:", err);
      alert("Order placement failed. Check Supabase 'orders' table.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} />;
      case 'pdp':
        return selectedProduct ? (
          <ProductDetail 
            sneaker={selectedProduct} 
            onAddToCart={handleAddToCart} 
            onBack={() => setCurrentView('shop')} 
            onToggleWishlist={toggleWishlist}
            isInWishlist={wishlist.some(s => s.id === selectedProduct.id)}
          />
        ) : <Home onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} />;
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
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-5xl font-black font-heading italic uppercase mb-10">The Vault Collection</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {MOCK_SNEAKERS.map(sneaker => (
                <div 
                  key={sneaker.id}
                  onClick={() => handleSelectProduct(sneaker)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-square bg-white border border-gray-100 rounded-xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-xl transition-all">
                    <img src={sneaker.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    {sneaker.isDrop && (
                      <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest italic">Drop</span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{sneaker.brand}</p>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-red-600 transition-colors">{sneaker.name}</h3>
                  <p className="font-black">${sneaker.price}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'wishlist':
        return (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-black font-heading mb-10 italic uppercase">Your Watchlist</h1>
            {wishlist.length === 0 ? (
              <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <i className="fa-regular fa-heart text-7xl text-gray-200 mb-6"></i>
                <p className="text-xl font-bold text-gray-400 mb-8 uppercase tracking-widest">No grails saved yet.</p>
                <button onClick={() => setCurrentView('shop')} className="bg-black text-white px-10 py-4 font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl">Find Your Next Pair</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {wishlist.map(sneaker => (
                  <div key={sneaker.id} className="bg-white border border-gray-100 rounded-2xl p-4 group relative hover:shadow-2xl transition-all">
                    <button onClick={(e) => { e.stopPropagation(); toggleWishlist(sneaker); }} className="absolute top-6 right-6 z-10 text-red-500 hover:scale-110 transition-transform"><i className="fa-solid fa-heart text-xl"></i></button>
                    <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden" onClick={() => handleSelectProduct(sneaker)}><img src={sneaker.image} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" /></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{sneaker.brand}</p>
                    <h3 className="font-bold text-sm mb-3 truncate" onClick={() => handleSelectProduct(sneaker)}>{sneaker.name}</h3>
                    <div className="flex justify-between items-center"><span className="font-black text-lg">${sneaker.price}</span><button onClick={() => handleSelectProduct(sneaker)} className="bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors">View Details</button></div>
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
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <i className="fa-solid fa-bag-shopping text-6xl text-gray-200 mb-6"></i>
                <p className="text-xl font-bold text-gray-400 mb-8 font-heading uppercase tracking-widest">Your vault is empty.</p>
                <button onClick={() => setCurrentView('shop')} className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-600 transition-colors">Go Shop</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex space-x-6 border-b border-gray-100 pb-8">
                      <div className="w-32 h-32 bg-gray-50 rounded-xl p-2 flex-shrink-0"><img src={item.image} className="w-full h-full object-contain" /></div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg uppercase leading-tight font-heading">{item.name}</h3>
                            <button onClick={() => removeFromCart(idx)} className="text-gray-400 hover:text-red-600"><i className="fa-solid fa-trash-can"></i></button>
                          </div>
                          <p className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-widest">{item.brand} | Size: {item.selectedSize}</p>
                        </div>
                        <div className="flex justify-between items-end">
                           <div className="flex items-center border rounded overflow-hidden">
                             <button className="px-3 py-1 hover:bg-gray-100 border-r text-xs font-bold">-</button>
                             <span className="px-4 font-bold text-sm">{item.quantity}</span>
                             <button className="px-3 py-1 hover:bg-gray-100 border-l text-xs font-bold">+</button>
                           </div>
                           <span className="font-black text-xl">${item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 p-8 rounded-2xl h-fit border border-gray-100">
                   <h3 className="text-xl font-black font-heading uppercase italic mb-6 border-b pb-4 border-gray-200">Order Summary</h3>
                   <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest"><span>Subtotal</span><span className="text-black">${cartTotal}</span></div>
                      <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest"><span>Shipping</span><span className="text-green-600 uppercase">Free</span></div>
                      <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest"><span>Tax</span><span className="text-black">${(cartTotal * 0.08).toFixed(0)}</span></div>
                      <div className="pt-4 border-t border-gray-200 flex justify-between"><span className="text-lg font-black uppercase italic font-heading">Total</span><span className="text-2xl font-black">${(cartTotal * 1.08).toFixed(0)}</span></div>
                   </div>
                   <button onClick={() => setCurrentView('checkout')} className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all">Proceed to Checkout</button>
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
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black font-heading uppercase mb-6 flex items-center"><span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-xs italic">1</span> Shipping Details</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">First Name</label><input type="text" placeholder="John" value={checkoutForm.firstName} onChange={e => setCheckoutForm({...checkoutForm, firstName: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold" /></div>
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Last Name</label><input type="text" placeholder="Doe" value={checkoutForm.lastName} onChange={e => setCheckoutForm({...checkoutForm, lastName: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold" /></div>
                    </div>
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Email Address</label><input type="email" placeholder="john@example.com" value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold" /></div>
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Street Address</label><input type="text" placeholder="123 Sneaker St" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold" /></div>
                    <div className="grid grid-cols-2 gap-6">
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">City</label><input type="text" placeholder="New York" value={checkoutForm.city} onChange={e => setCheckoutForm({...checkoutForm, city: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold" /></div>
                      <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Zip Code</label><input type="text" placeholder="10001" value={checkoutForm.zip} onChange={e => setCheckoutForm({...checkoutForm, zip: e.target.value})} className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-black transition-colors font-bold" /></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black font-heading uppercase mb-6 flex items-center"><span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-xs italic">2</span> Payment Method</h3>
                  <div className="p-4 border-2 border-black rounded-xl flex items-center justify-between bg-gray-50"><div className="flex items-center"><i className="fa-solid fa-credit-card mr-4 text-xl"></i><span className="font-bold text-sm">Vault Pay Express</span></div><i className="fa-solid fa-circle-check text-black"></i></div>
                </div>
              </div>
              <div>
                <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-2xl sticky top-24">
                  <h3 className="text-xl font-black font-heading uppercase italic mb-6 border-b border-white/10 pb-4">Vault Summary</h3>
                  <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item, i) => (
                      <div key={i} className="flex justify-between items-center"><div className="flex flex-col"><span className="text-xs font-bold uppercase truncate max-w-[150px]">{item.name}</span><span className="text-[10px] text-gray-400 uppercase">Size {item.selectedSize} × {item.quantity}</span></div><span className="text-sm font-black">${item.price * item.quantity}</span></div>
                    ))}
                  </div>
                  <div className="space-y-3 pt-6 border-t border-white/10 mb-8">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400 tracking-widest"><span>Subtotal</span><span>${checkTotal}</span></div>
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400 tracking-widest"><span>Shipping</span><span className="text-green-400">FREE</span></div>
                    <div className="flex justify-between text-lg font-black uppercase italic font-heading"><span>Total</span><span>${(checkTotal * 1.08).toFixed(0)}</span></div>
                  </div>
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={isPlacingOrder}
                    className={`w-full bg-red-600 text-white py-5 font-black uppercase tracking-[0.2em] shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 ${isPlacingOrder ? 'opacity-70 cursor-not-allowed bg-gray-600' : 'hover:bg-white hover:text-red-600'}`}
                  >
                    {isPlacingOrder ? (
                      <><i className="fa-solid fa-circle-notch animate-spin"></i><span>Securing Order...</span></>
                    ) : (
                      <span>Complete Purchase</span>
                    )}
                  </button>
                  <p className="text-[9px] text-gray-500 mt-6 text-center uppercase tracking-widest">Secured by Vault Defense Systems™</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'order-success':
        return (
          <div className="max-w-2xl mx-auto px-4 py-32 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 animate-bounce shadow-inner"><i className="fa-solid fa-check text-4xl"></i></div>
            <h1 className="text-5xl font-black font-heading mb-6 italic uppercase">Order Secured</h1>
            <p className="text-gray-500 mb-4 font-medium">Confirmation ID: <span className="text-black font-black font-mono tracking-tighter">{lastOrder?.id}</span></p>
            <p className="text-gray-400 mb-12 max-w-sm mx-auto">Your grails have been verified and placed in the shipping queue. Prepare your feet for the arrival.</p>
            <div className="space-y-4">
              <button onClick={() => setCurrentView('shop')} className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all">Continue Shopping</button>
              <button onClick={() => setCurrentView('home')} className="w-full bg-white border border-gray-200 text-black py-4 font-black uppercase tracking-widest text-xs hover:border-black transition-colors">Return Home</button>
            </div>
          </div>
        );
      case 'admin':
        return (
          <Dashboard 
            orders={orders} 
            onRefresh={fetchOrders} 
            isRefreshing={isFetchingOrders} 
            onLogout={handleLogout}
          />
        );
      default:
        return <Home onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {currentView !== 'admin' && (
        <Navigation 
          onNavigate={(view) => {
            if (view === 'admin') {
              navigateToAdmin();
            } else {
              setCurrentView(view as View);
            }
          }} 
          cartCount={cart.length} 
          wishlistCount={wishlist.length}
          currentView={currentView} 
        />
      )}
      <div className="flex-1">
        {renderView()}
      </div>
      
      {/* Footer is only visible on customer-facing views */}
      {currentView !== 'admin' && (
        <footer className="bg-[#1A1A1A] text-white pt-16 pb-8 border-t-4 border-red-700">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16 mb-12">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-b border-white/10 pb-2">About Us</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                SneakerVault is the premium marketplace for authentic sneakers and streetwear grails. We provide only verified quality shoes and accessories for enthusiasts and collectors.
              </p>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Contact Us | Career</p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-b border-white/10 pb-2">Policy</h4>
              <ul className="space-y-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <li className="hover:text-white cursor-pointer transition-colors">Happiness Program</li>
                <li className="hover:text-white cursor-pointer transition-colors">Exchange & Complain</li>
                <li className="hover:text-white cursor-pointer transition-colors">Return & Refund</li>
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms and Conditions</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-b border-white/10 pb-2">Connect With Us</h4>
              <p className="text-[10px] text-gray-400 mb-6 italic uppercase tracking-tighter leading-relaxed">
                Join our SneakerVault Elite community for exclusive drop access and community events.
              </p>
              <button className="bg-red-700 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest mb-6 hover:bg-white hover:text-red-700 transition-all rounded-sm">
                Join Elite Review Group &gt;
              </button>
              <div className="flex space-x-4 text-gray-400">
                 <i className="fa-brands fa-facebook text-xl hover:text-white cursor-pointer"></i>
                 <i className="fa-brands fa-instagram text-xl hover:text-white cursor-pointer"></i>
                 <i className="fa-brands fa-tiktok text-xl hover:text-white cursor-pointer"></i>
                 <i className="fa-brands fa-youtube text-xl hover:text-white cursor-pointer"></i>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/5 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
             <p>Copyright © 2025 | SneakerVault Lifestyle | Build v1.0.6</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;