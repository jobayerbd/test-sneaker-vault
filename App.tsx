
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
    
    // Check sessions for protected routes
    const isAdmin = localStorage.getItem('sv_admin_session') === 'active';
    const isCustomer = !!localStorage.getItem('sv_customer_session');
    
    if (viewParam === 'admin' && !isAdmin) return 'admin-login';
    if (viewParam === 'customer' && !isCustomer) return 'customer-login';
    
    return viewParam || 'home';
  };

  const [currentView, setCurrentView] = useState<View>(getInitialView);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => localStorage.getItem('sv_admin_session') === 'active');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Sneaker | null>(null);
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
  const isAdminPanel = currentView === 'admin' || currentView === 'admin-login';

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
      try {
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
      } catch (e) {
        console.error("Session parse error", e);
        localStorage.removeItem('sv_customer_session');
      }
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
    
    // Auth redirect logic for handleNavigate
    let targetView = view;
    const isAdmin = localStorage.getItem('sv_admin_session') === 'active';
    const isCustomer = !!localStorage.getItem('sv_customer_session');

    if (view === 'admin' && !isAdmin) targetView = 'admin-login';
    if (view === 'customer' && !isCustomer) targetView = 'customer-login';

    setCurrentView(targetView);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', targetView);
      if (targetView === 'home') { url.searchParams.delete('product'); url.searchParams.delete('category'); }
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

  // Cart Functions
  const handleAddToCart = (item: CartItem, shouldCheckout: boolean = false) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedSize === item.selectedSize);
      if (existing) {
        return prev.map(i => i.id === item.id && i.selectedSize === item.selectedSize 
          ? { ...i, quantity: i.quantity + item.quantity } 
          : i
        );
      }
      return [...prev, item];
    });

    if (shouldCheckout) {
      handleNavigate('checkout');
    } else {
      setIsCartSidebarOpen(true);
    }
  };

  const handleUpdateCartQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, idx) => idx === index 
      ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
      : item
    ));
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const handlePlaceOrder = async () => {
    const missing = checkoutFields
      .filter(f => f.enabled && f.required)
      .find(f => !checkoutForm[f.field_key]);

    if (missing) {
      setCheckoutError(`PROTOCOL FAILURE: [${missing.label.toUpperCase()}] IS MANDATORY`);
      return;
    }

    if (createAccount && !accountPassword) {
      setCheckoutError("SECURITY FAILURE: ACCOUNT PASSWORD IS REQUIRED");
      return;
    }

    setIsPlacingOrder(true);
    setCheckoutError(null);

    try {
      let customerId = currentCustomer?.id;

      // Handle Account Creation
      if (createAccount && !currentCustomer) {
        const newCustomer = await vaultApi.createCustomer({
          email: checkoutForm.email,
          password: accountPassword,
          first_name: checkoutForm.first_name,
          last_name: checkoutForm.last_name,
          mobile_number: checkoutForm.mobile_number,
          street_address: checkoutForm.street_address,
          city: checkoutForm.city || '',
          zip_code: checkoutForm.zip_code || '',
          created_at: new Date().toISOString()
        });

        if (newCustomer) {
          customerId = newCustomer.id;
          localStorage.setItem('sv_customer_session', JSON.stringify(newCustomer));
          setCurrentCustomer(newCustomer);
        } else {
          setCheckoutError("SECURITY PROTOCOL ERROR: FAILED TO CREATE IDENTITY. EMAIL MAY ALREADY BE REGISTERED.");
          setIsPlacingOrder(false);
          return;
        }
      }

      const orderId = generateOrderId();
      const orderData = {
        id: orderId,
        customer_id: customerId,
        first_name: checkoutForm.first_name || '',
        last_name: checkoutForm.last_name || '',
        email: checkoutForm.email || '',
        mobile_number: checkoutForm.mobile_number || '',
        street_address: checkoutForm.street_address || '',
        city: checkoutForm.city || '', 
        zip_code: checkoutForm.zip_code || '', 
        status: OrderStatus.PLACED,
        total: cart.reduce((a, b) => a + (b.price * b.quantity), 0) + (selectedShipping?.rate || 0),
        items: cart.map(i => ({
          sneakerId: i.id,
          name: i.name,
          image: i.image,
          size: i.selectedSize,
          quantity: i.quantity,
          price: i.price
        })),
        shipping_name: selectedShipping?.name,
        shipping_rate: selectedShipping?.rate,
        payment_method: selectedPayment?.name,
        created_at: new Date().toISOString()
      };

      const result = await vaultApi.createOrder(orderData);
      if (result) {
        await vaultApi.createTimelineEvent(orderId, OrderStatus.PLACED, 'Order protocol initiated and secured.');
        setLastOrder(orderData);
        setCart([]);
        
        // Refresh all data so the new customer and order appear in Admin/Customer panels
        await fetchData();
        
        handleNavigate('order-success');
      } else {
        setCheckoutError("VAULT OFFLINE: FAILED TO PERSIST ORDER DATA");
      }
    } catch (err) {
      setCheckoutError("SYSTEM ERROR: AN UNEXPECTED EXCEPTION OCCURRED DURING CHECKOUT");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleUpdateCustomerProfile = async (updates: Partial<Customer>) => {
    if (!currentCustomer) return false;
    const success = await vaultApi.updateCustomer(currentCustomer.id, updates);
    if (success) {
      const updated = { ...currentCustomer, ...updates };
      setCurrentCustomer(updated);
      localStorage.setItem('sv_customer_session', JSON.stringify(updated));
      await fetchData();
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      {!isAdminPanel && (
        <Navigation siteIdentity={siteIdentity} onNavigate={handleNavigate} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} wishlistCount={wishlist.length} currentView={currentView} onOpenCart={() => setIsCartSidebarOpen(true)} onOpenSearch={() => setIsSearchOpen(true)} navItems={navItems} isLoggedIn={!!currentCustomer} />
      )}
      <main className="flex-1">
        {currentView === 'home' && <Home isLoading={isFetchingSneakers} sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); }} />}
        {currentView === 'shop' && <Shop isLoading={isFetchingSneakers} sneakers={sneakers} onSelectProduct={handleSelectProduct} searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} categoryFilter={selectedCategory} onCategoryChange={handleCategoryChange} />}
        {currentView === 'pdp' && <ProductDetail isLoading={isFetchingSneakers} sneaker={selectedProduct} sneakers={sneakers} onAddToCart={handleAddToCart} onBack={() => handleNavigate('shop')} onToggleWishlist={() => {}} isInWishlist={false} onSelectProduct={handleSelectProduct} />}
        {currentView === 'checkout' && <CheckoutPage cart={cart} checkoutFields={checkoutFields} shippingOptions={shippingOptions} paymentMethods={paymentMethods} selectedShipping={selectedShipping} selectedPayment={selectedPayment} checkoutForm={checkoutForm} checkoutError={checkoutError} isPlacingOrder={isPlacingOrder} createAccount={createAccount} accountPassword={accountPassword} currentCustomer={currentCustomer} onFormChange={(k, v) => setCheckoutForm({...checkoutForm, [k]: v})} onShippingChange={setSelectedShipping} onPaymentChange={setSelectedPayment} onToggleCreateAccount={setCreateAccount} onPasswordChange={setAccountPassword} onUpdateCartQuantity={handleUpdateCartQuantity} onRemoveFromCart={handleRemoveFromCart} onPlaceOrder={handlePlaceOrder} onNavigate={handleNavigate} />}
        {currentView === 'order-success' && <OrderSuccess lastOrder={lastOrder} onNavigate={handleNavigate} />}
        
        {/* Customer Route Logic */}
        {currentView === 'customer' && (
          currentCustomer ? (
            <CustomerPortal customer={currentCustomer} orders={orders} onLogout={() => { localStorage.removeItem('sv_customer_session'); setCurrentCustomer(null); handleNavigate('home'); }} onUpdateProfile={handleUpdateCustomerProfile} onSelectOrder={() => {}} />
          ) : (
            <UnifiedLogin supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(cust) => { setCurrentCustomer(cust); handleNavigate('customer'); }} onBack={() => handleNavigate('home')} />
          )
        )}

        {/* Admin Route Logic */}
        {currentView === 'admin' && (
          isAdminAuthenticated ? (
            <Dashboard orders={orders} sneakers={sneakers} customers={customers} brands={brands} categories={categories} paymentMethods={paymentMethods} slides={slides} navItems={navItems} checkoutFields={checkoutFields} shippingOptions={shippingOptions} footerConfig={footerConfig} siteIdentity={siteIdentity} onUpdateOrderStatus={async (id, s) => { 
              const ok = await vaultApi.updateOrderStatus(id, s); 
              if(ok) {
                // Securely log the status change in the timeline archive
                await vaultApi.createTimelineEvent(id, s, `Protocol Status updated to ${s.toUpperCase()} by Administrator.`);
                await fetchData(); 
              }
              return ok; 
            }} onSaveProduct={async (p) => { const ok = await vaultApi.saveProduct(p); if(ok) await fetchData(); return ok; }} onDeleteProduct={async (id) => { const ok = await vaultApi.deleteProduct(id); if(ok) await fetchData(); return ok; }} onSaveShipping={async (s) => { const ok = await vaultApi.saveShippingOption(s); if(ok) await fetchData(); return ok; }} onDeleteShipping={async (id) => { const ok = await vaultApi.deleteShippingOption(id); if(ok) await fetchData(); return ok; }} onSavePaymentMethod={async (p) => { const ok = await vaultApi.savePaymentMethod(p); if(ok) await fetchData(); return ok; }} onDeletePaymentMethod={async (id) => { const ok = await vaultApi.deletePaymentMethod(id); if(ok) await fetchData(); return ok; }} onSaveFooterConfig={async (f) => { const ok = await vaultApi.saveSiteSettings('footer', f); if(ok) await fetchData(); return ok; }} onSaveIdentity={async (i) => { const ok = await vaultApi.saveSiteSettings('identity', i); if(ok) await fetchData(); return ok; }} onSaveBrand={async (b) => { const ok = await vaultApi.saveBrand(b); if(ok) await fetchData(); return ok; }} onDeleteBrand={async (id) => { const ok = await vaultApi.deleteBrand(id); if(ok) await fetchData(); return ok; }} onSaveCategory={async (c) => { const ok = await vaultApi.saveCategory(c); if(ok) await fetchData(); return ok; }} onDeleteCategory={async (id) => { const ok = await vaultApi.deleteCategory(id); if(ok) await fetchData(); return ok; }} onSaveSlide={async (s) => { const ok = await vaultApi.saveSlide(s); if(ok) await fetchData(); return ok; }} onDeleteSlide={async (id) => { const ok = await vaultApi.deleteSlide(id); if(ok) await fetchData(); return ok; }} onSaveNavItem={async (n) => { const ok = await vaultApi.saveNavItem(n); if(ok) await fetchData(); return ok; }} onDeleteNavItem={async (id) => { const ok = await vaultApi.deleteNavItem(id); if(ok) await fetchData(); return ok; }} onSaveCheckoutField={async (f) => { const ok = await vaultApi.saveCheckoutField(f); if(ok) await fetchData(); return ok; }} onDeleteCheckoutField={async (id) => { const ok = await vaultApi.deleteCheckoutField(id); if(ok) await fetchData(); return ok; }} onLogout={() => { localStorage.removeItem('sv_admin_session'); setIsAdminAuthenticated(false); handleNavigate('home'); }} onVisitSite={() => handleNavigate('home')} />
          ) : (
            <UnifiedLogin supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(cust) => { setCurrentCustomer(cust); handleNavigate('customer'); }} onBack={() => handleNavigate('home')} />
          )
        )}

        {(currentView === 'admin-login' || currentView === 'customer-login') && (
          <UnifiedLogin supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(cust) => { setCurrentCustomer(cust); handleNavigate('customer'); }} onBack={() => handleNavigate('home')} />
        )}
      </main>
      {!isAdminPanel && <Footer config={footerConfig} onNavigate={handleNavigate} />}
      {!isAdminPanel && <CartOverlay isOpen={isCartSidebarOpen} onClose={() => setIsCartSidebarOpen(false)} cart={cart} onUpdateQuantity={handleUpdateCartQuantity} onRemove={handleRemoveFromCart} onCheckout={() => handleNavigate('checkout')} />}
      {!isAdminPanel && <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={(q) => { setSearchQuery(q); setIsSearchOpen(false); handleNavigate('shop'); }} />}
    </div>
  );
};

export default App;
