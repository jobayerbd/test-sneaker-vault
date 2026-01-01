
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
import { updateBrowserIdentity } from './services/identityService.ts';
import { vaultApi } from './services/api.ts';
import { Sneaker, CartItem, Order, OrderStatus, ShippingOption, FooterConfig, BrandEntity, Category, PaymentMethod, HomeSlide, NavItem, CheckoutField, SiteIdentity, Customer } from './types.ts';

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

type View = 'home' | 'shop' | 'admin' | 'cart' | 'pdp' | 'wishlist' | 'checkout' | 'order-success' | 'admin-login' | 'customer-login' | 'customer-account' | 'order-details-view';

const App: React.FC = () => {
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
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const safePushState = (state: any, title: string, url: string) => {
    try {
      if (window.location.protocol === 'blob:') return;
      window.history.pushState(state, title, url);
    } catch (e) {
      console.warn('History state push failed.', e);
    }
  };

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
    if (pm && pm.length > 0) setSelectedPayment(pm[0]);
    setSlides(sl || []);
    setNavItems(ni || []);
    setCheckoutFields(cf || []);
    setShippingOptions(sh || []);
    if (sh && sh.length > 0) setSelectedShipping(sh[0]);
    if (f) setFooterConfig(f);
    if (id) setSiteIdentity(id);
    setIsFetchingSneakers(false);
  }, []);

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

  const syncViewFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const productSlug = params.get('product');
    const categorySlug = params.get('category');
    const viewParam = params.get('view') as View;

    if (viewParam === 'admin') {
      if (localStorage.getItem('sv_admin_session') !== 'active') {
        setCurrentView('admin-login');
        return;
      }
    }

    if (productSlug) {
      if (sneakers.length > 0) {
        const product = sneakers.find(s => s.slug === productSlug || s.id === productSlug || s.name.toLowerCase().replace(/\s+/g, '-') === productSlug.toLowerCase());
        if (product) {
          setSelectedProduct(product);
          setCurrentView('pdp');
        } else if (!isFetchingSneakers) {
          setCurrentView('home');
          safePushState({}, '', window.location.pathname);
        }
      }
      return; 
    }

    if (categorySlug) { setSelectedCategory(categorySlug); setCurrentView('shop'); return; }
    if (viewParam) { setCurrentView(viewParam); return; }
    if (!productSlug && !categorySlug && !viewParam) { setCurrentView('home'); }
  }, [sneakers, isFetchingSneakers]);

  useEffect(() => {
    syncViewFromUrl();
    window.addEventListener('popstate', syncViewFromUrl);
    return () => window.removeEventListener('popstate', syncViewFromUrl);
  }, [syncViewFromUrl]);

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
    if (shouldCheckout) { 
      handleNavigate('checkout'); 
      setIsCartSidebarOpen(false); 
    } else { 
      setIsCartSidebarOpen(true); 
    }
  };

  const updateCartQuantity = (idx: number, delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart[idx].quantity = Math.max(1, newCart[idx].quantity + delta);
      return newCart;
    });
  };

  const removeFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);
    if (!checkoutForm.first_name) {
      setCheckoutError("ERROR: [FIRST NAME] IS CRITICAL FOR PROTOCOL INITIATION");
      return;
    }
    const activeFields = checkoutFields.filter(f => f.enabled);
    for (const field of activeFields) {
      if (field.required && !checkoutForm[field.field_key]) {
        setCheckoutError(`ERROR: [${field.label.toUpperCase()}] IS REQUIRED PER VAULT SETTINGS`);
        return;
      }
    }
    if (!selectedShipping || !selectedPayment) { 
      setCheckoutError("ERROR: SHIPPING OR PAYMENT NOT SELECTED"); 
      return; 
    }
    setIsPlacingOrder(true);
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + (selectedShipping?.rate || 0);
    const validCustomerId = currentCustomer?.id?.startsWith('demo-') ? null : (currentCustomer?.id || null);
    const orderId = crypto.randomUUID?.() || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = {
      id: orderId,
      customer_id: validCustomerId,
      first_name: String(checkoutForm.first_name || '').trim(), 
      last_name: String(checkoutForm.last_name || '').trim(), 
      email: String(checkoutForm.email || '').toLowerCase().trim(), 
      mobile_number: String(checkoutForm.mobile_number || '').trim(), 
      street_address: String(checkoutForm.street_address || '').trim(), 
      city: String(checkoutForm.city || '').trim(), 
      zip_code: String(checkoutForm.zip_code || '').trim(), 
      total, 
      status: OrderStatus.PLACED, 
      shipping_name: selectedShipping.name || 'Standard', 
      shipping_rate: selectedShipping.rate || 0, 
      payment_method: selectedPayment.name || 'COD', 
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
      const saved = await vaultApi.createOrder(newOrder);
      if (saved) {
        await vaultApi.createTimelineEvent(saved.id, OrderStatus.PLACED, 'Order has been placed successfully.');
        setLastOrder(saved); 
        setCart([]); 
        handleNavigate('order-success');
      } else {
        setCheckoutError("SERVER ERROR: VAULT REJECTED ORDER. CHECK ADMIN SETTINGS FOR FIELD CONSTRAINTS.");
      }
    } catch (err) {
      console.error("Order Placement Exception:", err);
      setCheckoutError("NETWORK ERROR: FAILED TO CONNECT TO VAULT.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem('sv_admin_session'); setIsAdminAuthenticated(false); handleNavigate('home'); };
  const handleCustomerLogout = () => { localStorage.removeItem('sv_customer_session'); setCurrentCustomer(null); handleNavigate('home'); };

  const handleSaveCheckoutField = async (field: Partial<CheckoutField>) => {
    const success = await vaultApi.saveCheckoutField(field);
    if (success) {
      const updatedFields = await vaultApi.fetchCheckoutFields();
      setCheckoutFields(updatedFields);
      return true;
    }
    return false;
  };

  const handleDeleteCheckoutField = async (id: string) => {
    const success = await vaultApi.deleteCheckoutField(id);
    if (success) {
      setCheckoutFields(prev => prev.filter(f => f.id !== id));
      return true;
    }
    return false;
  };

  const renderView = () => {
    const isActuallyAdmin = isAdminAuthenticated || localStorage.getItem('sv_admin_session') === 'active';

    switch (currentView) {
      case 'home': return <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); }} />;
      case 'shop': return <Shop sneakers={sneakers} onSelectProduct={handleSelectProduct} searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} categoryFilter={selectedCategory} onCategoryChange={handleSelectCategory} />;
      case 'pdp': return selectedProduct ? <ProductDetail sneaker={selectedProduct} onAddToCart={handleAddToCart} onBack={() => handleNavigate('shop')} onToggleWishlist={(s) => setWishlist(p => p.find(x => x.id === s.id) ? p.filter(x => x.id !== s.id) : [...p, s])} isInWishlist={wishlist.some(s => s.id === selectedProduct.id)} onSelectProduct={handleSelectProduct} /> : (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white space-y-4">
           <i className="fa-solid fa-spinner animate-spin text-4xl text-red-600"></i>
           <p className="text-[10px] font-black uppercase tracking-[0.5em]">Loading Product...</p>
        </div>
      );
      case 'admin-login':
      case 'customer-login': return <UnifiedLogin supabaseUrl={'https://vwbctddmakbnvfxzrjeo.supabase.co'} supabaseKey={'sb_publishable_8WhV41Km5aj8Dhvu6tUbvA_JnyPoVxu'} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(c) => { setCurrentCustomer(c); localStorage.setItem('sv_customer_session', JSON.stringify(c)); handleNavigate('customer-account'); }} onBack={() => handleNavigate('home')} />;
      case 'customer-account': return currentCustomer ? <CustomerPortal customer={currentCustomer} orders={orders} onLogout={handleCustomerLogout} onUpdateProfile={async (u) => vaultApi.updateCustomer(currentCustomer.id, u)} onSelectOrder={(o) => { setViewingOrder(o); handleNavigate('order-details-view'); }} /> : <UnifiedLogin supabaseUrl={'https://vwbctddmakbnvfxzrjeo.supabase.co'} supabaseKey={'sb_publishable_8WhV41Km5aj8Dhvu6tUbvA_JnyPoVxu'} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(c) => { setCurrentCustomer(c); handleNavigate('customer-account'); }} onBack={() => handleNavigate('home')} />;
      case 'admin': 
        if (!isActuallyAdmin) return <UnifiedLogin supabaseUrl={'https://vwbctddmakbnvfxzrjeo.supabase.co'} supabaseKey={'sb_publishable_8WhV41Km5aj8Dhvu6tUbvA_JnyPoVxu'} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={() => {}} onBack={() => handleNavigate('home')} />;
        return <Dashboard sneakers={sneakers} orders={orders} customers={customers} brands={brands} categories={categories} paymentMethods={paymentMethods} slides={slides} navItems={navItems} checkoutFields={checkoutFields} shippingOptions={shippingOptions} footerConfig={footerConfig} siteIdentity={siteIdentity} onRefresh={fetchData} onRefreshOrders={fetchData} onUpdateOrderStatus={async (id, s) => true} onSaveProduct={async (d) => true} onDeleteProduct={async (i) => true} onSaveShipping={async (o) => true} onDeleteShipping={async (i) => true} onSavePaymentMethod={async (m) => true} onDeletePaymentMethod={async (i) => true} onSaveFooterConfig={async (c) => true} onSaveIdentity={async (i) => true} onSaveBrand={async (b) => true} onDeleteBrand={async (i) => true} onSaveCategory={async (c) => true} onDeleteCategory={async (i) => true} onSaveSlide={async (s) => true} onDeleteSlide={async (i) => true} onSaveNavItem={async (n) => true} onDeleteNavItem={async (i) => true} onSaveCheckoutField={handleSaveCheckoutField} onDeleteCheckoutField={handleDeleteCheckoutField} onLogout={handleLogout} onVisitSite={() => window.open(window.location.origin, '_blank')} />;
      case 'checkout': return (
        <CheckoutPage 
          cart={cart} 
          checkoutFields={checkoutFields} 
          shippingOptions={shippingOptions} 
          paymentMethods={paymentMethods} 
          selectedShipping={selectedShipping} 
          selectedPayment={selectedPayment} 
          checkoutForm={checkoutForm} 
          checkoutError={checkoutError} 
          isPlacingOrder={isPlacingOrder} 
          createAccount={createAccount} 
          accountPassword={accountPassword} 
          currentCustomer={currentCustomer}
          onFormChange={(f, v) => setCheckoutForm({...checkoutForm, [f]: v})}
          onShippingChange={setSelectedShipping}
          onPaymentChange={setSelectedPayment}
          onToggleCreateAccount={setCreateAccount}
          onPasswordChange={setAccountPassword}
          onUpdateCartQuantity={updateCartQuantity}
          onRemoveFromCart={removeFromCart}
          onPlaceOrder={handlePlaceOrder}
          onNavigate={handleNavigate}
        />
      );
      case 'order-success': return <OrderSuccess lastOrder={lastOrder} onNavigate={handleNavigate} />;
      default: return <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); }} />;
    }
  };

  const isDeepLinking = (new URLSearchParams(window.location.search).get('product')) || (new URLSearchParams(window.location.search).get('category'));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {currentView !== 'admin' && (
        <Navigation 
          onNavigate={(v) => { if (v === 'admin') handleNavigate('admin'); else if (v === 'customer') handleNavigate('customer-account'); else handleNavigate(v as View); }} 
          cartCount={cart.reduce((a,c) => a + c.quantity, 0)} 
          wishlistCount={wishlist.length} 
          currentView={currentView} 
          onOpenCart={() => setIsCartSidebarOpen(true)} 
          onOpenSearch={() => setIsSearchOpen(true)} 
          navItems={navItems} 
          siteIdentity={siteIdentity} 
        />
      )}
      
      <div className="flex-1">
        {isFetchingSneakers && isDeepLinking ? (
           <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
              <i className="fa-solid fa-spinner animate-spin text-4xl text-red-600"></i>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Connecting to Store...</p>
           </div>
        ) : renderView()}
      </div>

      {currentView !== 'admin' && <Footer config={footerConfig} onNavigate={handleNavigate} />}

      <CartOverlay 
        isOpen={isCartSidebarOpen} 
        onClose={() => setIsCartSidebarOpen(false)} 
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={() => handleNavigate('checkout')}
      />
    </div>
  );
};

export default App;
