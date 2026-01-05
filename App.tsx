
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from './components/Navigation.tsx';
import Home from './components/Storefront/Home.tsx';
import Shop from './components/Storefront/Shop.tsx';
import ProductDetail from './components/Storefront/ProductDetail.tsx';
import Dashboard from './components/Admin/Dashboard.tsx';
import Footer from './components/Footer.tsx';
import UnifiedLogin from './components/Auth/UnifiedLogin.tsx';
import CustomerPortal from './components/Customer/CustomerPortal.tsx';
import CheckoutPage from './components/Storefront/CheckoutPage.tsx';
import OrderSuccess from './components/Storefront/OrderSuccess.tsx';
import CartOverlay from './components/Storefront/CartOverlay.tsx';
import SearchOverlay from './components/Storefront/SearchOverlay.tsx';
import { updateBrowserIdentity } from './services/identityService.ts';
import { vaultApi } from './services/api.ts';
import { Sneaker, CartItem, Order, OrderStatus, ShippingOption, FooterConfig, BrandEntity, Category, PaymentMethod, HomeSlide, NavItem, CheckoutField, SiteIdentity, Customer } from './types.ts';

const SUPABASE_URL = 'https://vwbctddmakbnvfxzrjeo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8WhV41Km5aj8Dhvu6tUbvA_JnyPoVxu';

const DEFAULT_FOOTER: FooterConfig = {
  store_name: "SNEAKERVAULT",
  description: "The ultimate destination for sneaker enthusiasts. High-quality products and a community built on passion.",
  copyright: "© 2024 SNEAKERVAULT. ALL RIGHTS RESERVED.",
  facebook_url: "#",
  instagram_url: "#",
  twitter_url: "#",
  fb_pixel_id: ""
};

const DEFAULT_IDENTITY: SiteIdentity = {
  title: "SneakerVault",
  tagline: "Premium Footwear Store",
  logo_url: "",
  favicon_url: ""
};

type View = 'home' | 'shop' | 'admin' | 'cart' | 'pdp' | 'wishlist' | 'checkout' | 'order-success' | 'admin-login' | 'customer-login' | 'customer-account' | 'order-details-view' | 'customer';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const generateOrderId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SV${randomNum}`;
};

const App: React.FC = () => {
  const getInitialView = (): View => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('product')) return 'pdp';
    if (params.get('category')) return 'shop';
    const viewParam = params.get('view') as View;
    if (viewParam === 'admin' && localStorage.getItem('sv_admin_session') !== 'active') return 'admin-login';
    if (viewParam === 'customer-account' && !localStorage.getItem('sv_customer_session')) return 'admin-login';
    return viewParam || 'home';
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
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutForm, setCheckoutForm] = useState<Record<string, any>>({});
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

  const isNavigatingRef = useRef(false);
  const isAdminPanel = currentView === 'admin';

  useEffect(() => {
    if (!footerConfig.fb_pixel_id) return;
    if (!window.fbq) {
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', footerConfig.fb_pixel_id);
    }
    window.fbq('track', 'PageView');
  }, [footerConfig.fb_pixel_id, currentView]);

  useEffect(() => { window.scrollTo(0, 0); }, [currentView]);

  const fetchData = useCallback(async () => {
    setIsFetchingSneakers(true);
    const [s, o, cust, b, c, pm, sl, ni, cf, sh, f, id] = await Promise.all([
      vaultApi.fetchSneakers(),
      vaultApi.fetchOrders(),
      vaultApi.fetchCustomers(),
      vaultApi.fetchBrands(),
      vaultApi.fetchCategories(),
      vaultApi.fetchPaymentMethods(),
      vaultApi.fetchSlides(),
      vaultApi.fetchNavItems(),
      vaultApi.fetchCheckoutFields(),
      vaultApi.fetchShippingOptions(),
      vaultApi.fetchSiteSettings('footer'),
      vaultApi.fetchSiteSettings('identity')
    ]);
    setSneakers(s || []);
    setOrders(o || []);
    setCustomers(cust || []);
    setBrands(b || []);
    setCategories(c || []);
    setPaymentMethods(pm || []);
    if (pm && pm.length > 0 && !selectedPayment) setSelectedPayment(pm[0]);
    setSlides(sl || []);
    setNavItems(ni || []);
    setCheckoutFields(cf || []);
    setShippingOptions(sh || []);
    if (sh && sh.length > 0 && !selectedShipping) setSelectedShipping(sh[0]);
    if (f) setFooterConfig(f);
    if (id) setSiteIdentity(id);
    setIsFetchingSneakers(false);
  }, [selectedPayment, selectedShipping]);

  useEffect(() => {
    fetchData();
    const stored = localStorage.getItem('sv_customer_session');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCurrentCustomer(parsed);
      setCheckoutForm({
        first_name: parsed.first_name || '', 
        last_name: parsed.last_name || '',
        email: parsed.email || '', 
        mobile_number: parsed.mobile_number || '',
        street_address: parsed.street_address || '', 
        city: parsed.city || '', 
        zip_code: parsed.zip_code || ''
      });
    }
  }, []);

  useEffect(() => { updateBrowserIdentity(siteIdentity); }, [siteIdentity]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    if (productId && sneakers.length > 0) {
      const prod = sneakers.find(s => s.id === productId);
      if (prod) {
        setSelectedProduct(prod);
        if (currentView !== 'pdp') setCurrentView('pdp');
      }
    }
  }, [sneakers, window.location.search]);

  const handleNavigate = (view: View, params?: Record<string, string>) => {
    isNavigatingRef.current = true;
    setCurrentView(view);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      if (view === 'home') { url.searchParams.delete('product'); url.searchParams.delete('category'); }
      if (params) Object.entries(params).forEach(([k, v]) => { if (v === null) url.searchParams.delete(k); else url.searchParams.set(k, v); });
      window.history.pushState({}, '', url.toString());
    } catch (err) { console.warn("Navigation Error", err); }
    setTimeout(() => { isNavigatingRef.current = false; }, 100);
  };

  const handleSelectProduct = (s: Sneaker) => {
    setSelectedProduct(s);
    handleNavigate('pdp', { product: s.id });
  };

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    handleNavigate('shop', { category: cat || '' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      {!isAdminPanel && (
        <Navigation siteIdentity={siteIdentity} onNavigate={handleNavigate} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} wishlistCount={wishlist.length} currentView={currentView} onOpenCart={() => setIsCartSidebarOpen(true)} onOpenSearch={() => setIsSearchOpen(true)} navItems={navItems} isLoggedIn={!!currentCustomer} />
      )}
      <main className="flex-1">
        {currentView === 'home' && <Home isLoading={isFetchingSneakers} sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); }} />}
        {currentView === 'shop' && <Shop isLoading={isFetchingSneakers} sneakers={sneakers} onSelectProduct={handleSelectProduct} searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} categoryFilter={selectedCategory} onCategoryChange={handleCategoryChange} />}
        {currentView === 'pdp' && <ProductDetail isLoading={isFetchingSneakers} sneaker={selectedProduct} sneakers={sneakers} onAddToCart={(i, c) => {}} onBack={() => handleNavigate('shop')} onToggleWishlist={() => {}} isInWishlist={false} onSelectProduct={handleSelectProduct} />}
        {currentView === 'checkout' && <CheckoutPage cart={cart} checkoutFields={checkoutFields} shippingOptions={shippingOptions} paymentMethods={paymentMethods} selectedShipping={selectedShipping} selectedPayment={selectedPayment} checkoutForm={checkoutForm} checkoutError={checkoutError} isPlacingOrder={isPlacingOrder} createAccount={createAccount} accountPassword={accountPassword} currentCustomer={currentCustomer} onFormChange={(k, v) => setCheckoutForm({...checkoutForm, [k]: v})} onShippingChange={setSelectedShipping} onPaymentChange={setSelectedPayment} onToggleCreateAccount={setCreateAccount} onPasswordChange={setAccountPassword} onUpdateCartQuantity={(idx, d) => {}} onRemoveFromCart={(idx) => {}} onPlaceOrder={() => {}} onNavigate={handleNavigate} />}
        {currentView === 'order-success' && <OrderSuccess lastOrder={lastOrder} onNavigate={handleNavigate} />}
        {currentView === 'customer' && <CustomerPortal customer={currentCustomer!} orders={orders} onLogout={() => {}} onUpdateProfile={async () => true} onSelectOrder={() => {}} />}
        {currentView === 'admin' && isAdminAuthenticated && <Dashboard orders={orders} sneakers={sneakers} customers={customers} brands={brands} categories={categories} paymentMethods={paymentMethods} slides={slides} navItems={navItems} checkoutFields={checkoutFields} shippingOptions={shippingOptions} footerConfig={footerConfig} siteIdentity={siteIdentity} onUpdateOrderStatus={async () => true} onSaveProduct={async () => true} onDeleteProduct={async () => true} onSaveShipping={async () => true} onDeleteShipping={async () => true} onSavePaymentMethod={async () => true} onDeletePaymentMethod={async () => true} onSaveFooterConfig={async () => true} onSaveIdentity={async () => true} onSaveBrand={async () => true} onDeleteBrand={async () => true} onSaveCategory={async () => true} onDeleteCategory={async () => true} onSaveSlide={async () => true} onDeleteSlide={async () => true} onSaveNavItem={async () => true} onDeleteNavItem={async () => true} onSaveCheckoutField={async () => true} onDeleteCheckoutField={async () => true} onLogout={() => {}} onVisitSite={() => handleNavigate('home')} />}
        {(currentView === 'admin-login' || currentView === 'customer-login') && <UnifiedLogin supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onAdminLogin={() => {}} onCustomerLogin={() => {}} onBack={() => handleNavigate('home')} />}
      </main>
      {!isAdminPanel && <Footer config={footerConfig} onNavigate={handleNavigate} />}
      {!isAdminPanel && <CartOverlay isOpen={isCartSidebarOpen} onClose={() => setIsCartSidebarOpen(false)} cart={cart} onUpdateQuantity={() => {}} onRemove={() => {}} onCheckout={() => handleNavigate('checkout')} />}
      {!isAdminPanel && <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={(q) => { setSearchQuery(q); setIsSearchOpen(false); handleNavigate('shop'); }} />}
    </div>
  );
};

export default App;
