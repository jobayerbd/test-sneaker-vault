
import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Storefront/Home';
import Shop from './components/Storefront/Shop';
import ProductDetail from './components/Storefront/ProductDetail';
import Dashboard from './components/Admin/Dashboard';
import Login from './components/Admin/Login';
import Footer from './components/Footer';
import { Sneaker, CartItem, Order, OrderStatus, ShippingOption, FooterConfig, TimelineEvent, BrandEntity, Category, PaymentMethod, HomeSlide, NavItem } from './types';

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
  const [brands, setBrands] = useState<BrandEntity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER);
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [isFetchingSneakers, setIsFetchingSneakers] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
    
    if (currentView === 'checkout') {
      trackFBPixel('InitiateCheckout', {
        content_category: 'Sneakers',
        num_items: cart.length,
        value: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        currency: 'BDT'
      });
    }
  }, [currentView, cart]);

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

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/brands?select=*&order=name.asc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) setBrands(await response.json());
    } catch (err) {}
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) setCategories(await response.json());
    } catch (err) {}
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/payment_methods?select=*&order=name.asc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
        if (data.length > 0) setSelectedPayment(data[0]);
      }
    } catch (err) {}
  }, []);

  const fetchSlides = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/home_slides?select=*&order=order.asc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) setSlides(await response.json());
    } catch (err) {}
  }, []);

  const fetchNavItems = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_navigation?select=*&order=order.asc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) setNavItems(await response.json());
    } catch (err) {}
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsFetchingOrders(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) setOrders(await response.json());
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
    fetchSneakers(); fetchOrders(); fetchShippingOptions(); fetchFooterConfig(); fetchBrands(); fetchCategories(); fetchPaymentMethods(); fetchSlides(); fetchNavItems();
  }, [fetchSneakers, fetchOrders, fetchShippingOptions, fetchFooterConfig, fetchBrands, fetchCategories, fetchPaymentMethods, fetchSlides, fetchNavItems]);

  const handleAddToCart = (item: CartItem, shouldCheckout: boolean = false) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedSize === item.selectedSize);
      if (existing) {
        return prev.map(i => (i.id === item.id && i.selectedSize === item.selectedSize) ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
    
    trackFBPixel('AddToCart', { 
      content_ids: [item.id], 
      content_name: item.name, 
      content_type: 'product',
      value: item.price, 
      currency: 'BDT' 
    });

    if (shouldCheckout) {
      setCurrentView('checkout');
      setIsCartSidebarOpen(false);
    } else {
      setIsCartSidebarOpen(true);
    }
  };

  const toggleWishlist = (sneaker: Sneaker) => {
    setWishlist(prev => {
      const exists = prev.find(s => s.id === sneaker.id);
      if (exists) return prev.filter(s => s.id !== sneaker.id);
      
      trackFBPixel('AddToWishlist', {
        content_ids: [sneaker.id],
        content_name: sneaker.name,
        content_type: 'product',
        value: sneaker.price,
        currency: 'BDT'
      });
      
      return [...prev, sneaker];
    });
  };

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
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
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
    setCheckoutError(null);
    if (!checkoutForm.firstName || !checkoutForm.mobileNumber || !checkoutForm.address) { 
      setCheckoutError("REGISTRY ERROR: CORE FIELDS (NAME, MOBILE, ADDRESS) ARE MISSING");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; 
    }
    if (!selectedShipping || !selectedPayment) { 
      setCheckoutError("LOGISTICS ERROR: PROTOCOL NOT INITIALIZED");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; 
    }
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
      id: orderId, first_name: checkoutForm.firstName, last_name: checkoutForm.lastName, email: checkoutForm.email || 'guest@sneakervault.bd', mobile_number: checkoutForm.mobileNumber, street_address: checkoutForm.address, city: checkoutForm.city, zip_code: checkoutForm.zip, total, status: OrderStatus.PLACED, timeline: initialTimeline, shipping_name: selectedShipping.name, shipping_rate: selectedShipping.rate, payment_method: selectedPayment.name, items: cart.map(item => ({ sneakerId: item.id, name: item.name, image: item.image, size: item.selectedSize, quantity: item.quantity, price: item.price }))
    };
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(newOrder)
      });
      if (response.ok) {
        const saved = (await response.json())[0];
        trackFBPixel('Purchase', { value: total, currency: 'BDT', content_ids: cart.map(item => item.id), content_type: 'product', num_items: cart.length });
        setOrders(prev => [saved, ...prev]);
        setLastOrder(saved);
        setCart([]);
        setCurrentView('order-success');
      } else {
        setCheckoutError("SERVER ERROR: VAULT CONNECTION TIMEOUT");
      }
    } catch (err) { 
      setCheckoutError("CRITICAL SYSTEM ERROR: TRANSACTION FAILED");
    } finally { setIsPlacingOrder(false); }
  };

  const handleSaveSlide = async (data: Partial<HomeSlide>): Promise<boolean> => {
    const isUpdate = !!data.id;
    const url = isUpdate ? `${SUPABASE_URL}/rest/v1/home_slides?id=eq.${data.id}` : `${SUPABASE_URL}/rest/v1/home_slides`;
    const method = isUpdate ? 'PATCH' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) { fetchSlides(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleDeleteSlide = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/home_slides?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) { fetchSlides(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleSaveNavItem = async (data: Partial<NavItem>): Promise<boolean> => {
    const isUpdate = !!data.id;
    const url = isUpdate ? `${SUPABASE_URL}/rest/v1/site_navigation?id=eq.${data.id}` : `${SUPABASE_URL}/rest/v1/site_navigation`;
    const method = isUpdate ? 'PATCH' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) { fetchNavItems(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleDeleteNavItem = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_navigation?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) { fetchNavItems(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const navigateToAdmin = () => {
    if (isAdminAuthenticated) setCurrentView('admin');
    else setCurrentView('admin-login');
  };

  const handleSelectProduct = (sneaker: Sneaker) => { 
    setSelectedProduct(sneaker); 
    setCurrentView('pdp'); 
    setIsCartSidebarOpen(false); 
    trackFBPixel('ViewContent', { content_ids: [sneaker.id], content_name: sneaker.name, content_type: 'product', value: sneaker.price, currency: 'BDT' });
  };
  
  const handleSaveProduct = async (data: any): Promise<boolean> => {
    const isUpdate = !!data.id;
    const url = isUpdate ? `${SUPABASE_URL}/rest/v1/sneakers?id=eq.${data.id}` : `${SUPABASE_URL}/rest/v1/sneakers`;
    const method = isUpdate ? 'PATCH' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) { fetchSneakers(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleDeleteProduct = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sneakers?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) { fetchSneakers(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleSaveBrand = async (data: any): Promise<boolean> => {
    const isUpdate = !!data.id;
    const url = isUpdate ? `${SUPABASE_URL}/rest/v1/brands?id=eq.${data.id}` : `${SUPABASE_URL}/rest/v1/brands`;
    const method = isUpdate ? 'PATCH' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) { fetchBrands(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleDeleteBrand = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/brands?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) { fetchBrands(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleSaveCategory = async (data: any): Promise<boolean> => {
    const isUpdate = !!data.id;
    const url = isUpdate ? `${SUPABASE_URL}/rest/v1/categories?id=eq.${data.id}` : `${SUPABASE_URL}/rest/v1/categories`;
    const method = isUpdate ? 'PATCH' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) { fetchCategories(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleDeleteCategory = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) { fetchCategories(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleSaveShippingOption = async (data: any): Promise<boolean> => {
    const isUpdate = !!data.id;
    const url = isUpdate ? `${SUPABASE_URL}/rest/v1/shipping_options?id=eq.${data.id}` : `${SUPABASE_URL}/rest/v1/shipping_options`;
    const method = isUpdate ? 'PATCH' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) { fetchShippingOptions(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleDeleteShippingOption = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/shipping_options?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) { fetchShippingOptions(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleSavePaymentMethod = async (data: any): Promise<boolean> => {
    const isUpdate = !!data.id;
    const url = isUpdate ? `${SUPABASE_URL}/rest/v1/payment_methods?id=eq.${data.id}` : `${SUPABASE_URL}/rest/v1/payment_methods`;
    const method = isUpdate ? 'PATCH' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) { fetchPaymentMethods(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleDeletePaymentMethod = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/payment_methods?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (response.ok) { fetchPaymentMethods(); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleSaveFooterConfig = async (config: FooterConfig): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.footer`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: config })
      });
      if (response.ok) { setFooterConfig(config); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleLogout = () => { localStorage.removeItem('sv_admin_session'); setIsAdminAuthenticated(false); setCurrentView('home'); };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(false);
    setCurrentView('shop');
  };

  const SearchOverlay = () => {
    const [localQuery, setLocalQuery] = useState('');
    return (
      <div className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl transition-all duration-500 flex flex-col p-8 md:p-24 ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-full'}`}>
        <button onClick={() => setIsSearchOpen(false)} className="absolute top-10 right-10 text-white text-3xl hover:rotate-90 transition-transform"><i className="fa-solid fa-xmark"></i></button>
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
          <p className="text-red-600 text-[10px] md:text-xs font-black uppercase tracking-[0.5em] mb-8 italic">Archive Search Protocol</p>
          <div className="w-full relative">
            <input 
              autoFocus={isSearchOpen}
              type="text" 
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(localQuery)}
              placeholder="ENTER ASSET NAME..." 
              className="w-full bg-transparent border-b-4 border-white/20 focus:border-red-600 outline-none text-white text-4xl md:text-7xl font-black italic uppercase font-heading py-8 transition-colors"
            />
            <button 
              onClick={() => handleSearch(localQuery)}
              className="absolute right-0 bottom-8 text-white text-4xl hover:text-red-600 transition-colors"
            >
              <i className="fa-solid fa-arrow-right-long"></i>
            </button>
          </div>
          <div className="w-full mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
             {['Jordan', 'Yeezy', 'Dunk', 'Samba'].map(term => (
               <button 
                 key={term}
                 onClick={() => handleSearch(term)}
                 className="bg-white/5 border border-white/10 p-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 hover:text-white hover:border-red-700 transition-all italic"
               >
                 {term}
               </button>
             ))}
          </div>
        </div>
      </div>
    );
  };

  const CartSidebar = () => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return (
      <>
        <div className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${isCartSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartSidebarOpen(false)} />
        <div className={`fixed right-0 top-0 h-screen w-full max-w-md bg-white z-[70] transition-transform duration-500 transform ${isCartSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="flex flex-col h-full shadow-2xl">
            <div className="p-8 bg-black text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter italic font-heading">Vault Bag <span className="text-[10px] text-red-600 ml-2">[{cart.length} ITEMS]</span></h2>
              <button onClick={() => setIsCartSidebarOpen(false)} className="hover:rotate-90 transition-transform"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex space-x-6 border-b border-gray-50 pb-6 animate-in slide-in-from-right-4">
                  <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-xl p-2 shrink-0"><img src={item.image} className="w-full h-full object-contain" alt={item.name} /></div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[11px] font-black uppercase tracking-tight leading-tight">{item.name}</h4>
                      <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-600 transition-colors"><i className="fa-solid fa-trash-can text-sm"></i></button>
                    </div>
                    <p className="text-[10px] text-red-600 font-black mb-4 italic">SIZE Index: {item.selectedSize}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center border border-gray-100 rounded-lg bg-gray-50 overflow-hidden h-8">
                        <button onClick={() => {
                           const n = [...cart];
                           n[idx].quantity = Math.max(1, n[idx].quantity - 1);
                           setCart(n);
                        }} className="px-3 hover:bg-white">-</button>
                        <span className="px-2 font-black text-xs">{item.quantity}</span>
                        <button onClick={() => {
                           const n = [...cart];
                           n[idx].quantity += 1;
                           setCart(n);
                        }} className="px-3 hover:bg-white">+</button>
                      </div>
                      <p className="text-xs font-black italic text-black">{(item.price * item.quantity).toLocaleString()}৳</p>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                   <i className="fa-solid fa-bag-shopping text-gray-100 text-7xl mb-6"></i>
                   <p className="text-gray-400 font-bold uppercase tracking-widest italic">Vault bag is empty</p>
                </div>
              )}
            </div>
            <div className="p-8 bg-white border-t border-gray-100">
               <div className="flex justify-between mb-2"><span className="text-[10px] font-black uppercase text-gray-400">Inventory Value</span><span className="text-sm font-black italic">{total.toLocaleString()}৳</span></div>
               <div className="flex justify-between mb-6 pt-2 border-t border-gray-50"><span className="text-sm font-black uppercase">Final Settlement</span><span className="text-2xl font-black text-red-700">{total.toLocaleString()}৳</span></div>
               <button 
                 disabled={cart.length === 0}
                 onClick={() => { setCurrentView('checkout'); setIsCartSidebarOpen(false); }} 
                 className="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-30"
               >
                 Initialize Checkout
               </button>
            </div>
           </div>
        </div>
      </>
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} onSearch={handleSearch} />;
      case 'shop': return <Shop sneakers={sneakers} onSelectProduct={handleSelectProduct} searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} />;
      case 'pdp': return selectedProduct ? <ProductDetail sneaker={selectedProduct} onAddToCart={handleAddToCart} onBack={() => setCurrentView('shop')} onToggleWishlist={toggleWishlist} isInWishlist={wishlist.some(s => s.id === selectedProduct.id)} onSelectProduct={handleSelectProduct} /> : <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} onSearch={handleSearch} />;
      case 'admin-login': return <Login supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onLoginSuccess={() => { setIsAdminAuthenticated(true); setCurrentView('admin'); }} />;
      case 'admin': return <Dashboard sneakers={sneakers} orders={orders} brands={brands} categories={categories} paymentMethods={paymentMethods} slides={slides} navItems={navItems} shippingOptions={shippingOptions} footerConfig={footerConfig} onRefresh={() => { fetchOrders(); fetchSneakers(); fetchShippingOptions(); fetchFooterConfig(); fetchBrands(); fetchCategories(); fetchPaymentMethods(); fetchSlides(); fetchNavItems(); }} onUpdateOrderStatus={handleUpdateOrderStatus} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} onSaveShipping={handleSaveShippingOption} onDeleteShipping={handleDeleteShippingOption} onSavePaymentMethod={handleSavePaymentMethod} onDeletePaymentMethod={handleDeletePaymentMethod} onSaveFooterConfig={handleSaveFooterConfig} onSaveBrand={handleSaveBrand} onDeleteBrand={handleDeleteBrand} onSaveCategory={handleSaveCategory} onDeleteCategory={handleDeleteCategory} onSaveSlide={handleSaveSlide} onDeleteSlide={handleDeleteSlide} onSaveNavItem={handleSaveNavItem} onDeleteNavItem={handleDeleteNavItem} isRefreshing={isFetchingOrders || isFetchingSneakers} onLogout={handleLogout} />;
      case 'checkout': return (
        <div className="max-w-6xl mx-auto px-4 py-16 animate-in fade-in duration-500">
          <div className="flex flex-col items-center mb-12 text-center">
            <h1 className="text-4xl font-black uppercase font-heading italic mb-4">Checkout Registry</h1>
            <div className="w-16 h-1 bg-red-600 mb-2"></div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Finalizing secured transaction protocols</p>
          </div>

          {checkoutError && (
            <div className="max-w-4xl mx-auto mb-10 bg-red-600 text-white p-6 rounded-2xl flex items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500 shadow-2xl">
              <i className="fa-solid fa-triangle-exclamation text-2xl animate-pulse"></i>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">{checkoutError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 border border-gray-100 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black uppercase italic mb-8 border-b pb-4 tracking-widest">Subject Coordinates</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 px-1">First Name*</label>
                    <input type="text" placeholder="GIVEN NAME" value={checkoutForm.firstName} onChange={e => { setCheckoutForm({...checkoutForm, firstName: e.target.value}); setCheckoutError(null); }} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 px-1">Last Name</label>
                    <input type="text" placeholder="SURNAME" value={checkoutForm.lastName} onChange={e => setCheckoutForm({...checkoutForm, lastName: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 px-1">Mobile Access*</label>
                    <input type="tel" placeholder="+880" value={checkoutForm.mobileNumber} onChange={e => { setCheckoutForm({...checkoutForm, mobileNumber: e.target.value}); setCheckoutError(null); }} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 px-1">Email Archive</label>
                    <input type="email" placeholder="OPERATOR@MAIL.COM" value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xs outline-none focus:ring-2 ring-black/5" />
                  </div>
                </div>
                <div className="mt-6 space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 px-1">Sector/Address*</label>
                  <input type="text" placeholder="STREET, BLOCK, AREA" value={checkoutForm.address} onChange={e => { setCheckoutForm({...checkoutForm, address: e.target.value}); setCheckoutError(null); }} className="w-full bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs focus:ring-2 ring-black/5" />
                </div>
              </div>

              <div className="bg-white p-10 border border-gray-100 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black uppercase italic mb-8 border-b pb-4 tracking-widest">Logistics Hub</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shippingOptions.map(o => (
                    <div 
                      key={o.id} 
                      onClick={() => { setSelectedShipping(o); setCheckoutError(null); }} 
                      className={`p-6 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-all duration-300 ${selectedShipping?.id === o.id ? 'border-black bg-black text-white shadow-xl scale-[1.02]' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-black text-[10px] uppercase tracking-widest mb-1">{o.name}</span>
                        <span className={`text-[9px] font-bold ${selectedShipping?.id === o.id ? 'text-gray-400' : 'text-gray-400'} uppercase`}>Transit Protocol</span>
                      </div>
                      <span className="font-black italic text-sm">{o.rate}৳</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 border border-gray-100 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black uppercase italic mb-8 border-b pb-4 tracking-widest">Payment Gateway Matrix</h3>
                <div className="space-y-4">
                  {paymentMethods.map(pm => (
                    <div 
                      key={pm.id}
                      onClick={() => { setSelectedPayment(pm); setCheckoutError(null); }}
                      className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${selectedPayment?.id === pm.id ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-black text-xs uppercase tracking-widest">{pm.name}</span>
                         {selectedPayment?.id === pm.id && <i className="fa-solid fa-circle-check text-red-600"></i>}
                      </div>
                      {pm.details && (
                        <p className="text-[10px] text-gray-500 font-medium italic leading-relaxed whitespace-pre-line">{pm.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-black text-white p-10 rounded-3xl h-fit shadow-2xl sticky top-24">
              <h3 className="text-xl font-black uppercase italic border-b border-white/10 pb-6 mb-8 tracking-tighter font-heading">Settlement Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Subtotal Value</span>
                  <span>{cart.reduce((a,c)=>a+(c.price*c.quantity),0).toLocaleString()}৳</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Logistics Fee</span>
                  <span>{selectedShipping?.rate || 0}৳</span>
                </div>
                <div className="flex justify-between items-end pt-6 border-t border-white/10">
                  <span className="text-xs font-black uppercase tracking-[0.2em] italic">Final Settlement</span>
                  <span className="text-3xl font-black text-red-600">{(cart.reduce((a,c)=>a+(c.price*c.quantity),0) + (selectedShipping?.rate||0)).toLocaleString()}৳</span>
                </div>
              </div>
              <button 
                onClick={handlePlaceOrder} 
                disabled={isPlacingOrder || cart.length === 0} 
                className="w-full bg-red-700 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-white hover:text-black transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isPlacingOrder ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-lock text-sm"></i> Commit Order Protocol</>}
              </button>
            </div>
          </div>
        </div>
      );
      case 'order-success': return (
        <div className="max-w-4xl mx-auto py-24 px-4 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 text-white text-4xl shadow-2xl animate-bounce">
              <i className="fa-solid fa-check-double"></i>
            </div>
            <h1 className="text-5xl font-black italic uppercase font-heading mb-4 tracking-tighter">Vault Secured!</h1>
            <p className="text-gray-400 mb-2 uppercase font-black text-[10px] tracking-[0.5em] italic">Protocol Successfully Completed</p>
            <div className="bg-gray-50 px-6 py-2 rounded-full border border-gray-100 inline-block mt-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-black">Registry Order ID: <span className="text-red-600">{lastOrder?.id}</span></p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl max-w-2xl mx-auto">
            <div className="bg-black p-8 text-white flex justify-between items-center">
              <h3 className="text-sm font-black uppercase italic tracking-widest font-heading">Order Manifest</h3>
              <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Secured Archive</span>
            </div>
            
            <div className="p-8 space-y-6">
              {lastOrder?.items?.map((item, idx) => (
                <div key={idx} className="flex gap-6 items-center border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 shrink-0 border border-gray-100">
                    <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-[11px] uppercase tracking-tight mb-1">{item.name}</h4>
                    <p className="text-[9px] text-red-600 font-black italic uppercase tracking-widest">Size Index: {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black italic">{(item.price * item.quantity).toLocaleString()}৳</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-8 border-t border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Subtotal Protocol</span>
                  <span>{lastOrder?.items?.reduce((a,c)=>a+(c.price*c.quantity),0).toLocaleString()}৳</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Logistics Fee ({lastOrder?.shipping_name})</span>
                  <span>{lastOrder?.shipping_rate?.toLocaleString()}৳</span>
                </div>
                <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-200">
                  <span className="text-xs font-black uppercase tracking-widest italic">Final Settlement</span>
                  <span className="text-3xl font-black text-red-700">{lastOrder?.total?.toLocaleString()}৳</span>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-white grid grid-cols-2 gap-8">
               <div className="space-y-2">
                 <h5 className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">Shipping Coordinates</h5>
                 <p className="text-[10px] font-bold text-black uppercase leading-relaxed">
                   {lastOrder?.first_name} {lastOrder?.last_name}<br/>
                   {lastOrder?.street_address}<br/>
                   {lastOrder?.city}, {lastOrder?.zip_code}
                 </p>
               </div>
               <div className="space-y-2">
                 <h5 className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">Payment Matrix</h5>
                 <p className="text-[10px] font-bold text-black uppercase">{lastOrder?.payment_method}</p>
                 <div className="inline-block px-2 py-1 bg-green-50 text-green-700 border border-green-100 text-[8px] font-black uppercase rounded mt-2">
                   Secured & Confirmed
                 </div>
               </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <button onClick={() => setCurrentView('shop')} className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-red-700 transition-all active:scale-95">
              Continue Exploration
            </button>
          </div>
        </div>
      );
      default: return <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={setCurrentView} onSearch={handleSearch} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {currentView !== 'admin' && (
        <Navigation 
          onNavigate={(v) => v === 'admin' ? navigateToAdmin() : setCurrentView(v as View)} 
          cartCount={cart.reduce((a,c) => a + c.quantity, 0)} 
          wishlistCount={wishlist.length} 
          currentView={currentView} 
          onOpenCart={() => setIsCartSidebarOpen(true)} 
          onOpenSearch={() => setIsSearchOpen(true)}
          navItems={navItems}
        />
      )}
      <div className="flex-1">{renderView()}</div>
      <SearchOverlay />
      <CartSidebar />
      {currentView !== 'admin' && currentView !== 'admin-login' && <Footer config={footerConfig} onNavigate={setCurrentView} />}
    </div>
  );
};

export default App;
