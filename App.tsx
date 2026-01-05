
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

/**
 * Generates a clean, primarily numeric Order ID with an 'SV' prefix.
 * Example: SV123456
 */
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
    
    if (viewParam === 'admin' && localStorage.getItem('sv_admin_session') !== 'active') {
      return 'admin-login';
    }

    if (viewParam === 'customer-account' && !localStorage.getItem('sv_customer_session')) {
      return 'admin-login';
    }
    
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

  // Hide common layout elements for admin panel
  const isAdminPanel = currentView === 'admin';

  useEffect(() => {
    if (!footerConfig.fb_pixel_id) return;

    if (!window.fbq) {
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      
      window.fbq('init', footerConfig.fb_pixel_id);
    }
    
    window.fbq('track', 'PageView');
  }, [footerConfig.fb_pixel_id, currentView]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

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

  useEffect(() => {
    updateBrowserIdentity(siteIdentity);
  }, [siteIdentity]);

  // Handle initialization of selected product when sneakers array is loaded or URL changes
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

  const syncViewFromUrl = useCallback(() => {
    if (isNavigatingRef.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as View;

    if (viewParam) {
      setCurrentView(viewParam);
    }

    const productParam = params.get('product');
    if (productParam && sneakers.length > 0) {
      const prod = sneakers.find(s => s.id === productParam);
      if (prod) {
        setSelectedProduct(prod);
        setCurrentView('pdp');
      }
    }

    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [sneakers]);

  useEffect(() => {
    window.addEventListener('popstate', syncViewFromUrl);
    return () => window.removeEventListener('popstate', syncViewFromUrl);
  }, [syncViewFromUrl]);

  const handleNavigate = (view: View, params?: Record<string, string>) => {
    isNavigatingRef.current = true;
    setCurrentView(view);
    
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      
      // Clean up previous context-specific params if navigating to a top-level view
      if (view === 'home') {
        url.searchParams.delete('product');
        url.searchParams.delete('category');
      }

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v === null || v === undefined) url.searchParams.delete(k);
          else url.searchParams.set(k, v);
        });
      }
      
      if (!window.location.href.startsWith('blob:')) {
        window.history.pushState({}, '', url.toString());
      } else {
        window.history.pushState({}, '', url.search);
      }
    } catch (err) {
      console.warn("SneakerVault: Navigation state could not be pushed to history.", err);
    }
    
    setTimeout(() => { isNavigatingRef.current = false; }, 100);
  };

  const handleSelectProduct = (s: Sneaker) => {
    setSelectedProduct(s);
    handleNavigate('pdp', { product: s.id });
  };

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    handleNavigate('shop', { category: cat || '' });
    if (!cat) {
      const url = new URL(window.location.href);
      url.searchParams.delete('category');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleAddToCart = (item: CartItem, shouldCheckout?: boolean) => {
    setCart(prev => {
      const existing = prev.findIndex(i => i.id === item.id && i.selectedSize === item.selectedSize);
      if (existing > -1) {
        const updated = [...prev];
        updated[existing].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    if (shouldCheckout) handleNavigate('checkout');
    else setIsCartSidebarOpen(true);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setCheckoutError(null);

    const activeFields = checkoutFields.filter(f => f.enabled);
    const missingFields = activeFields
      .filter(f => f.required)
      .filter(f => !String(checkoutForm[f.field_key] || '').trim());

    if (missingFields.length > 0) {
      setCheckoutError(`Required info missing: ${missingFields.map(f => f.label).join(', ')}`);
      setIsPlacingOrder(false);
      return;
    }

    // STRICT DATABASE MAPPING
    const orderData = {
      id: generateOrderId(), // Use numeric SV-prefixed ID
      first_name: checkoutForm['first_name'] || currentCustomer?.first_name || 'GUEST',
      last_name: checkoutForm['last_name'] || currentCustomer?.last_name || 'USER',
      email: checkoutForm['email'] || currentCustomer?.email || 'N/A',
      mobile_number: checkoutForm['mobile_number'] || currentCustomer?.mobile_number || '',
      street_address: checkoutForm['street_address'] || currentCustomer?.street_address || '',
      city: checkoutForm['city'] || currentCustomer?.city || '',
      zip_code: checkoutForm['zip_code'] || currentCustomer?.zip_code || '',
      status: OrderStatus.PLACED,
      total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) + (selectedShipping?.rate || 0),
      items: cart.map(item => ({
        sneakerId: item.id,
        name: item.name,
        image: item.image,
        size: item.selectedSize,
        quantity: item.quantity,
        price: item.price
      })),
      shipping_name: selectedShipping?.name || 'Standard',
      shipping_rate: selectedShipping?.rate || 0,
      payment_method: selectedPayment?.name || 'COD',
      customer_id: currentCustomer?.id?.startsWith('demo-') ? null : (currentCustomer?.id || null),
      created_at: new Date().toISOString()
    };

    const newOrder = await vaultApi.createOrder(orderData);
    if (newOrder) {
      await vaultApi.createTimelineEvent(newOrder.id, OrderStatus.PLACED, "Protocol initiated.");
      setLastOrder(newOrder);
      setCart([]);
      handleNavigate('order-success');
    } else {
      setCheckoutError("VAULT ERROR: Protocol rejected. Database sync failed.");
    }
    setIsPlacingOrder(false);
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    const success = await vaultApi.updateOrderStatus(id, status);
    if (success) {
      await vaultApi.createTimelineEvent(id, status, `Manual update to ${status}.`);
      fetchData();
    }
    return success;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      {!isAdminPanel && (
        <Navigation 
          siteIdentity={siteIdentity}
          onNavigate={handleNavigate}
          cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
          wishlistCount={wishlist.length}
          currentView={currentView}
          onOpenCart={() => setIsCartSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          navItems={navItems}
          isLoggedIn={!!currentCustomer}
        />
      )}

      <main className="flex-1">
        {currentView === 'home' && <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); }} />}
        {currentView === 'shop' && <Shop sneakers={sneakers} onSelectProduct={handleSelectProduct} searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} categoryFilter={selectedCategory} onCategoryChange={handleCategoryChange} />}
        {currentView === 'pdp' && (selectedProduct ? <ProductDetail sneaker={selectedProduct} sneakers={sneakers} onAddToCart={handleAddToCart} onBack={() => handleNavigate('shop')} onToggleWishlist={(s) => {}} isInWishlist={false} onSelectProduct={handleSelectProduct} /> : <div className="flex items-center justify-center min-h-[60vh]"><i className="fa-solid fa-circle-notch animate-spin text-red-600 text-3xl"></i></div>)}
        {currentView === 'checkout' && <CheckoutPage cart={cart} checkoutFields={checkoutFields} shippingOptions={shippingOptions} paymentMethods={paymentMethods} selectedShipping={selectedShipping} selectedPayment={selectedPayment} checkoutForm={checkoutForm} checkoutError={checkoutError} isPlacingOrder={isPlacingOrder} createAccount={createAccount} accountPassword={accountPassword} currentCustomer={currentCustomer} onFormChange={(k, v) => setCheckoutForm({...checkoutForm, [k]: v})} onShippingChange={setSelectedShipping} onPaymentChange={setSelectedPayment} onToggleCreateAccount={setCreateAccount} onPasswordChange={setAccountPassword} onUpdateCartQuantity={(idx, d) => {
          const updated = [...cart];
          updated[idx].quantity = Math.max(1, updated[idx].quantity + d);
          setCart(updated);
        }} onRemoveFromCart={(idx) => setCart(cart.filter((_, i) => i !== idx))} onPlaceOrder={handlePlaceOrder} onNavigate={handleNavigate} />}
        {currentView === 'order-success' && <OrderSuccess lastOrder={lastOrder} onNavigate={handleNavigate} />}
        {currentView === 'customer' && (currentCustomer ? <CustomerPortal customer={currentCustomer} orders={orders} onLogout={() => { localStorage.removeItem('sv_customer_session'); setCurrentCustomer(null); handleNavigate('home'); }} onUpdateProfile={async (u) => { const s = await vaultApi.updateCustomer(currentCustomer!.id, u); if(s) fetchData(); return s; }} onSelectOrder={(o) => { setViewingOrder(o); handleNavigate('order-details-view'); }} /> : <UnifiedLogin supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(c) => { setCurrentCustomer(c); handleNavigate('customer'); }} onBack={() => handleNavigate('home')} />)}
        {currentView === 'admin' && isAdminAuthenticated && <Dashboard orders={orders} sneakers={sneakers} customers={customers} brands={brands} categories={categories} paymentMethods={paymentMethods} slides={slides} navItems={navItems} checkoutFields={checkoutFields} shippingOptions={shippingOptions} footerConfig={footerConfig} siteIdentity={siteIdentity} onRefresh={fetchData} onRefreshOrders={fetchData} onUpdateOrderStatus={handleUpdateOrderStatus} onSaveProduct={async (p) => { const s = await vaultApi.saveProduct(p); if(s) fetchData(); return s; }} onDeleteProduct={async (id) => { const s = await vaultApi.deleteProduct(id); if(s) fetchData(); return s; }} onSaveShipping={async (o) => { const s = await vaultApi.saveShippingOption(o); if(s) fetchData(); return s; }} onDeleteShipping={async (id) => { const s = await vaultApi.deleteShippingOption(id); if(s) fetchData(); return s; }} onSavePaymentMethod={async (m) => { const s = await vaultApi.savePaymentMethod(m); if(s) fetchData(); return s; }} onDeletePaymentMethod={async (id) => { const s = await vaultApi.deletePaymentMethod(id); if(s) fetchData(); return s; }} onSaveFooterConfig={async (f) => { const s = await vaultApi.saveSiteSettings('footer', f); if(s) fetchData(); return s; }} onSaveIdentity={async (i) => { const s = await vaultApi.saveSiteSettings('identity', i); if(s) fetchData(); return s; }} onSaveBrand={async (b) => { const s = await vaultApi.saveBrand(b); if(s) fetchData(); return s; }} onDeleteBrand={async (id) => { const s = await vaultApi.deleteBrand(id); if(s) fetchData(); return s; }} onSaveCategory={async (c) => { const s = await vaultApi.saveCategory(c); if(s) fetchData(); return s; }} onDeleteCategory={async (id) => { const s = await vaultApi.deleteCategory(id); if(s) fetchData(); return s; }} onSaveSlide={async (sl) => { const s = await vaultApi.saveSlide(sl); if(s) fetchData(); return s; }} onDeleteSlide={async (id) => { const s = await vaultApi.deleteSlide(id); if(s) fetchData(); return s; }} onSaveNavItem={async (i) => { const s = await vaultApi.saveNavItem(i); if(s) fetchData(); return s; }} onDeleteNavItem={async (id) => { const s = await vaultApi.deleteNavItem(id); if(s) fetchData(); return s; }} onSaveCheckoutField={async (f) => { const s = await vaultApi.saveCheckoutField(f); if(s) fetchData(); return s; }} onDeleteCheckoutField={async (id) => { const s = await vaultApi.deleteCheckoutField(id); if(s) fetchData(); return s; }} onLogout={() => { localStorage.removeItem('sv_admin_session'); setIsAdminAuthenticated(false); handleNavigate('home'); }} onVisitSite={() => handleNavigate('home')} />}
        {(currentView === 'admin-login' || currentView === 'customer-login') && <UnifiedLogin supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(c) => { setCurrentCustomer(c); handleNavigate('customer'); }} onBack={() => handleNavigate('home')} />}
      </main>

      {!isAdminPanel && <Footer config={footerConfig} onNavigate={handleNavigate} />}
      
      {!isAdminPanel && (
        <CartOverlay 
          isOpen={isCartSidebarOpen} 
          onClose={() => setIsCartSidebarOpen(false)} 
          cart={cart}
          onUpdateQuantity={(idx, d) => {
            const updated = [...cart];
            updated[idx].quantity = Math.max(1, updated[idx].quantity + d);
            setCart(updated);
          }}
          onRemove={(idx) => setCart(cart.filter((_, i) => i !== idx))}
          onCheckout={() => handleNavigate('checkout')}
        />
      )}

      {!isAdminPanel && (
        <SearchOverlay 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onSearch={(q) => { setSearchQuery(q); setIsSearchOpen(false); handleNavigate('shop'); }}
        />
      )}
    </div>
  );
};

export default App;
