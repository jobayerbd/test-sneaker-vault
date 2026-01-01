
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from './components/Navigation.tsx';
import Home from './components/Storefront/Home.tsx';
import Shop from './components/Storefront/Shop.tsx';
import ProductDetail from './components/Storefront/ProductDetail.tsx';
import Dashboard from './components/Admin/Dashboard.tsx';
import Footer from './components/Footer.tsx';
import UnifiedLogin from './components/Auth/UnifiedLogin.tsx';
import CustomerPortal from './components/Customer/CustomerPortal.tsx';
import { updateBrowserIdentity } from './services/identityService.ts';
import { Sneaker, CartItem, Order, OrderStatus, ShippingOption, FooterConfig, TimelineEvent, BrandEntity, Category, PaymentMethod, HomeSlide, NavItem, CheckoutField, SiteIdentity, Customer } from './types.ts';

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

const DEFAULT_IDENTITY: SiteIdentity = {
  title: "SneakerVault",
  tagline: "Premium Footwear Protocol",
  logo_url: "",
  favicon_url: ""
};

type View = 'home' | 'shop' | 'admin' | 'cart' | 'pdp' | 'wishlist' | 'checkout' | 'order-success' | 'admin-login' | 'customer-login' | 'customer-account' | 'order-details-view';

const App: React.FC = () => {
  // 1. Initial State Resolution
  const getInitialView = (): View => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('product')) return 'pdp';
    if (params.get('category')) return 'shop';
    return (params.get('view') as View) || 'home';
  };

  const [currentView, setCurrentView] = useState<View>(getInitialView);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => localStorage.getItem('sv_admin_session') === 'active');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Sneaker | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(new URLSearchParams(window.location.search).get('category'));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Sneaker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [brands, setBrands] = useState<BrandEntity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [checkoutFields, setCheckoutFields] = useState<CheckoutField[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER);
  const [siteIdentity, setSiteIdentity] = useState<SiteIdentity>(DEFAULT_IDENTITY);
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isFetchingSneakers, setIsFetchingSneakers] = useState(true);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutForm, setCheckoutForm] = useState<Record<string, any>>({});

  const safePushState = (state: any, title: string, url: string) => {
    try {
      window.history.pushState(state, title, url);
    } catch (e) {
      console.warn('Vault: History state push failed.', e);
    }
  };

  // 2. Data Fetching Protocols
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
    } catch (err) {
      console.error("Vault retrieval error:", err);
    } finally {
      setIsFetchingSneakers(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsFetchingOrders(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*,timeline:order_timeline(status,note,timestamp)&order=created_at.desc`, { 
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } 
      });
      if (response.ok) setOrders(await response.json());
    } finally { setIsFetchingOrders(false); }
  }, []);

  const fetchGlobalConfigs = useCallback(async () => {
    const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };
    try {
      const [brandResp, catResp, payResp, slideResp, navResp, checkResp, shipResp, footerResp, identityResp] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/brands?select=*&order=name.asc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/payment_methods?select=*&order=name.asc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/home_slides?select=*&order=order.asc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/site_navigation?select=*&order=order.asc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/checkout_fields?select=*&order=order.asc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/shipping_options?select=*&order=rate.asc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.footer&select=data`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.identity&select=data`, { headers })
      ]);

      if (brandResp.ok) setBrands(await brandResp.json());
      if (catResp.ok) setCategories(await catResp.json());
      if (payResp.ok) {
        const data = await payResp.json();
        setPaymentMethods(data);
        if (data.length > 0) setSelectedPayment(data[0]);
      }
      if (slideResp.ok) setSlides(await slideResp.json());
      if (navResp.ok) setNavItems(await navResp.json());
      if (checkResp.ok) setCheckoutFields(await checkResp.json());
      if (shipResp.ok) {
        const data = await shipResp.json();
        setShippingOptions(data);
        if (data.length > 0) setSelectedShipping(data[0]);
      }
      if (footerResp.ok) {
        const data = await footerResp.json();
        if (data[0]) setFooterConfig(data[0].data);
      }
      if (identityResp.ok) {
        const data = await identityResp.json();
        if (data[0]) setSiteIdentity(data[0].data);
      }
    } catch (err) {}
  }, []);

  // 3. Lifecycle Protocols
  useEffect(() => {
    fetchSneakers();
    fetchOrders();
    fetchGlobalConfigs();
    
    const stored = localStorage.getItem('sv_customer_session');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCurrentCustomer(parsed);
      setCheckoutForm({
        first_name: parsed.first_name || '', last_name: parsed.last_name || '',
        email: parsed.email || '', mobile_number: parsed.mobile_number || '',
        street_address: parsed.street_address || '', city: parsed.city || '', zip_code: parsed.zip_code || ''
      });
    }
  }, []);

  useEffect(() => {
    updateBrowserIdentity(siteIdentity);
  }, [siteIdentity]);

  // 4. URL Synchronization & Deep Linking Resolve
  const syncViewFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const productSlug = params.get('product');
    const categorySlug = params.get('category');
    const viewParam = params.get('view') as View;

    // A. Admin Security Lock
    if (viewParam === 'admin') {
      const isLogged = localStorage.getItem('sv_admin_session') === 'active';
      if (!isLogged) {
        setCurrentView('admin-login');
        return;
      }
    }

    // B. PDP Resolve Logic
    if (productSlug) {
      if (sneakers.length > 0) {
        const product = sneakers.find(s => 
          s.slug === productSlug || 
          s.id === productSlug || 
          s.name.toLowerCase().replace(/\s+/g, '-') === productSlug.toLowerCase()
        );
        if (product) {
          setSelectedProduct(product);
          setCurrentView('pdp');
        } else if (!isFetchingSneakers) {
          // Only redirect to home if we are SURE it doesn't exist
          setCurrentView('home');
          safePushState({}, '', window.location.pathname);
        }
      }
      return; 
    }

    // C. Category Resolve
    if (categorySlug) {
      setSelectedCategory(categorySlug);
      setCurrentView('shop');
      return;
    }

    // D. Standard View Resolve
    if (viewParam) {
      setCurrentView(viewParam);
      return;
    }

    // E. Default Home
    if (!productSlug && !categorySlug && !viewParam) {
       setCurrentView('home');
    }
  }, [sneakers, isFetchingSneakers]);

  useEffect(() => {
    syncViewFromUrl();
    window.addEventListener('popstate', syncViewFromUrl);
    return () => window.removeEventListener('popstate', syncViewFromUrl);
  }, [syncViewFromUrl]);

  // 5. Navigation Handlers
  const handleNavigate = (view: View, params: string = '') => {
    if (view === 'admin' && !isAdminAuthenticated && localStorage.getItem('sv_admin_session') !== 'active') {
      setCurrentView('admin-login');
      safePushState({ view: 'admin-login' }, '', window.location.pathname + '?view=admin-login');
      return;
    }
    setCurrentView(view);
    const queryString = view === 'home' ? '' : `?view=${view}${params ? '&' + params : ''}`;
    safePushState({ view }, '', window.location.pathname + queryString);
  };

  const handleSelectProduct = (sneaker: Sneaker) => {
    setSelectedProduct(sneaker);
    setCurrentView('pdp');
    setIsCartSidebarOpen(false);
    const slug = sneaker.slug || sneaker.id;
    safePushState({ view: 'pdp', slug }, '', `${window.location.pathname}?view=pdp&product=${slug}`);
  };

  const handleSelectCategory = (slug: string | null) => {
    setSelectedCategory(slug);
    setCurrentView('shop');
    const queryString = slug ? `?view=shop&category=${slug}` : `?view=shop`;
    safePushState({ view: 'shop', category: slug }, '', window.location.pathname + queryString);
  };

  const handleAddToCart = (item: CartItem, shouldCheckout: boolean = false) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedSize === item.selectedSize);
      if (existing) return prev.map(i => (i.id === item.id && i.selectedSize === item.selectedSize) ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...prev, item];
    });
    if (shouldCheckout) { handleNavigate('checkout'); setIsCartSidebarOpen(false); } else { setIsCartSidebarOpen(true); }
  };

  const handleLogout = () => { localStorage.removeItem('sv_admin_session'); setIsAdminAuthenticated(false); handleNavigate('home'); };
  const handleCustomerLogout = () => { localStorage.removeItem('sv_customer_session'); setCurrentCustomer(null); handleNavigate('home'); };

  const renderView = () => {
    const isActuallyAdmin = isAdminAuthenticated || localStorage.getItem('sv_admin_session') === 'active';

    switch (currentView) {
      case 'home': return <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); }} />;
      case 'shop': return <Shop sneakers={sneakers} onSelectProduct={handleSelectProduct} searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} categoryFilter={selectedCategory} onCategoryChange={handleSelectCategory} />;
      case 'pdp': return selectedProduct ? <ProductDetail sneaker={selectedProduct} onAddToCart={handleAddToCart} onBack={() => handleNavigate('shop')} onToggleWishlist={(s) => setWishlist(p => p.find(x => x.id === s.id) ? p.filter(x => x.id !== s.id) : [...p, s])} isInWishlist={wishlist.some(s => s.id === selectedProduct.id)} onSelectProduct={handleSelectProduct} /> : (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white space-y-4">
           <i className="fa-solid fa-vault text-4xl animate-bounce text-red-600"></i>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Decrypting Asset Metadata...</p>
        </div>
      );
      case 'admin-login':
      case 'customer-login': return <UnifiedLogin supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(c) => { setCurrentCustomer(c); localStorage.setItem('sv_customer_session', JSON.stringify(c)); handleNavigate('customer-account'); }} onBack={() => handleNavigate('home')} />;
      case 'customer-account': return currentCustomer ? <CustomerPortal customer={currentCustomer} orders={orders} onLogout={handleCustomerLogout} onUpdateProfile={async (u) => true} onSelectOrder={(o) => { setViewingOrder(o); handleNavigate('order-details-view'); }} /> : <UnifiedLogin supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(c) => { setCurrentCustomer(c); handleNavigate('customer-account'); }} onBack={() => handleNavigate('home')} />;
      case 'admin': 
        if (!isActuallyAdmin) return <UnifiedLogin supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={() => {}} onBack={() => handleNavigate('home')} />;
        return <Dashboard sneakers={sneakers} orders={orders} customers={[]} brands={brands} categories={categories} paymentMethods={paymentMethods} slides={slides} navItems={navItems} checkoutFields={checkoutFields} shippingOptions={shippingOptions} footerConfig={footerConfig} siteIdentity={siteIdentity} onRefresh={() => { fetchOrders(); fetchSneakers(); }} onRefreshOrders={fetchOrders} onUpdateOrderStatus={async (id, s) => true} onSaveProduct={async (d) => true} onDeleteProduct={async (i) => true} onSaveShipping={async (o) => true} onDeleteShipping={async (i) => true} onSavePaymentMethod={async (m) => true} onDeletePaymentMethod={async (i) => true} onSaveFooterConfig={async (c) => true} onSaveIdentity={async (i) => true} onSaveBrand={async (b) => true} onDeleteBrand={async (i) => true} onSaveCategory={async (c) => true} onDeleteCategory={async (i) => true} onSaveSlide={async (s) => true} onDeleteSlide={async (i) => true} onSaveNavItem={async (n) => true} onDeleteNavItem={async (i) => true} onSaveCheckoutField={async (f) => true} onDeleteCheckoutField={async (i) => true} onLogout={handleLogout} onVisitSite={() => window.open(window.location.origin, '_blank')} />;
      case 'checkout': return (
        <div className="max-w-4xl mx-auto py-16 px-4">
           <h2 className="text-3xl font-black uppercase italic font-heading mb-10">Checkout Protocol</h2>
           {cart.length === 0 ? <p className="text-[10px] font-black uppercase text-gray-400">Bag is empty.</p> : (
             <div className="bg-white p-8 border rounded-3xl shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <input type="text" placeholder="FIRST NAME" onChange={e => setCheckoutForm({...checkoutForm, first_name: e.target.value})} className="bg-gray-50 p-4 rounded-xl border-none outline-none font-bold text-xs" />
                   <input type="text" placeholder="MOBILE" onChange={e => setCheckoutForm({...checkoutForm, mobile_number: e.target.value})} className="bg-gray-50 p-4 rounded-xl border-none outline-none font-bold text-xs" />
                </div>
                <div className="pt-6 border-t">
                  <button onClick={async () => { setIsPlacingOrder(true); setTimeout(() => { setCart([]); handleNavigate('order-success'); setIsPlacingOrder(false); }, 1500); }} disabled={isPlacingOrder} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all">
                    {isPlacingOrder ? 'Syncing...' : 'Commit Order'}
                  </button>
                </div>
             </div>
           )}
        </div>
      );
      case 'order-success': return <div className="text-center py-32"><h1 className="text-5xl font-black italic uppercase mb-4">Vault Secured</h1><button onClick={() => handleNavigate('shop')} className="bg-black text-white px-12 py-4 rounded-xl font-black uppercase text-xs">Continue</button></div>;
      default: return <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); }} />;
    }
  };

  const isDeepLinking = (new URLSearchParams(window.location.search).get('product')) || (new URLSearchParams(window.location.search).get('category'));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {currentView !== 'admin' && (
        <Navigation onNavigate={(v) => { if (v === 'admin') handleNavigate('admin'); else if (v === 'customer') handleNavigate('customer-account'); else handleNavigate(v as View); }} cartCount={cart.reduce((a,c) => a + c.quantity, 0)} wishlistCount={wishlist.length} currentView={currentView} onOpenCart={() => setIsCartSidebarOpen(true)} onOpenSearch={() => setIsSearchOpen(true)} navItems={navItems} siteIdentity={siteIdentity} />
      )}
      <div className="flex-1">
        {isFetchingSneakers && isDeepLinking ? (
           <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
              <i className="fa-solid fa-vault text-4xl animate-bounce text-red-600"></i>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] italic animate-pulse">Establishing Vault Connection...</p>
           </div>
        ) : renderView()}
      </div>
      {currentView !== 'admin' && <Footer config={footerConfig} onNavigate={handleNavigate} />}
    </div>
  );
};

export default App;
