
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

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const App: React.FC = () => {
  const getInitialView = (): View => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('product')) return 'pdp';
    if (params.get('category')) return 'shop';
    const viewParam = params.get('view') as View;
    
    if (viewParam === 'admin' && localStorage.getItem('sv_admin_session') !== 'active') {
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

  const syncViewFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as View;

    if (viewParam === 'admin') {
      if (!isAdminAuthenticated && localStorage.getItem('sv_admin_session') !== 'active') {
        setCurrentView('admin-login');
      } else {
        setCurrentView('admin');
      }
      return;
    }

    if (viewParam) { 
      setCurrentView(viewParam); 
      return; 
    }
    
    if (!window.location.search || window.location.search === '?') {
       setCurrentView('home'); 
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    syncViewFromUrl();
    window.addEventListener('popstate', syncViewFromUrl);
    return () => window.removeEventListener('popstate', syncViewFromUrl);
  }, [syncViewFromUrl]);

  const handleNavigate = (view: View, params: string = '') => {
    if (view === 'admin' && !isAdminAuthenticated && localStorage.getItem('sv_admin_session') !== 'active') {
      setCurrentView('admin-login');
      return;
    }
    
    setCurrentView(view);
    
    // Safety wrap for pushState which can fail in sandboxed/blob environments
    try {
      const queryString = view === 'home' ? '' : `?view=${view}${params ? '&' + params : ''}`;
      window.history.pushState({ view }, '', window.location.pathname + queryString);
    } catch (err) {
      console.warn("SneakerVault: Navigation history suppressed due to environment security policy.", err);
    }
  };

  const handleSelectProduct = (sneaker: Sneaker) => {
    setSelectedProduct(sneaker);
    handleNavigate('pdp', `product=${sneaker.slug || sneaker.id}`);
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
    
    // Safety check for dynamic field validation
    const activeFields = checkoutFields.filter(f => f.enabled);
    for (const field of activeFields) {
      const val = String(checkoutForm[field.field_key] || '').trim();
      if (field.required && !val) {
        setCheckoutError(`ERROR: [${field.label.toUpperCase()}] IS CRITICAL FOR PROTOCOL INITIATION`);
        return;
      }
    }

    if (!selectedShipping || !selectedPayment) { 
      setCheckoutError("ERROR: SHIPPING OR PAYMENT NOT SELECTED"); 
      return; 
    }

    setIsPlacingOrder(true);
    
    try {
      // Robust order ID generation
      const freshOrders = await vaultApi.fetchOrders();
      const lastNumericId = (freshOrders || []).reduce((max: number, order: Order) => {
        const idNum = parseInt(order.id, 10);
        return isNaN(idNum) ? max : Math.max(max, idNum);
      }, 0);
      
      const orderId = String(lastNumericId + 1).padStart(6, '0');
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const total = subtotal + (selectedShipping.rate || 0);

      const newOrder = {
        id: orderId,
        customer_id: currentCustomer?.id?.startsWith('demo-') ? null : (currentCustomer?.id || null),
        first_name: String(checkoutForm.first_name || '').trim(), 
        last_name: String(checkoutForm.last_name || '').trim(), 
        email: String(checkoutForm.email || '').toLowerCase().trim(), 
        mobile_number: String(checkoutForm.mobile_number || '').trim(), 
        street_address: String(checkoutForm.street_address || '').trim(), 
        city: String(checkoutForm.city || '').trim(), 
        zip_code: String(checkoutForm.zip_code || '').trim(), 
        total, 
        status: OrderStatus.PLACED, 
        shipping_name: selectedShipping.name, 
        shipping_rate: selectedShipping.rate, 
        payment_method: selectedPayment.name, 
        items: cart.map(item => ({ 
          sneakerId: item.id, 
          name: item.name, 
          image: item.image, 
          size: item.selectedSize, 
          quantity: item.quantity, 
          price: item.price 
        }))
      };

      const saved = await vaultApi.createOrder(newOrder);
      if (saved) {
        if (window.fbq) window.fbq('track', 'Purchase', { value: total, currency: 'BDT' });
        await vaultApi.createTimelineEvent(saved.id, OrderStatus.PLACED, 'Order has been placed successfully.');
        setLastOrder(saved); 
        setCart([]); 
        handleNavigate('order-success');
      } else {
        setCheckoutError("SERVER ERROR: VAULT REJECTED ORDER.");
      }
    } catch (err) {
      setCheckoutError("NETWORK ERROR: FAILED TO CONNECT TO VAULT.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); }} />;
      case 'shop': return <Shop sneakers={sneakers} onSelectProduct={handleSelectProduct} searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} categoryFilter={selectedCategory} onCategoryChange={setSelectedCategory} />;
      case 'pdp': return selectedProduct ? <ProductDetail sneaker={selectedProduct} sneakers={sneakers} onAddToCart={handleAddToCart} onBack={() => handleNavigate('shop')} onToggleWishlist={(s) => setWishlist(p => p.find(x => x.id === s.id) ? p.filter(x => x.id !== s.id) : [...p, s])} isInWishlist={wishlist.some(s => s.id === selectedProduct.id)} onSelectProduct={handleSelectProduct} /> : <div className="min-h-screen flex items-center justify-center font-black">LOADING...</div>;
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
          onFormChange={(f, v) => setCheckoutForm(prev => ({ ...prev, [f]: v }))}
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
      case 'admin-login': return <UnifiedLogin supabaseUrl={'https://vwbctddmakbnvfxzrjeo.supabase.co'} supabaseKey={'sb_publishable_8WhV41Km5aj8Dhvu6tUbvA_JnyPoVxu'} onAdminLogin={() => { setIsAdminAuthenticated(true); handleNavigate('admin'); }} onCustomerLogin={(c) => { setCurrentCustomer(c); handleNavigate('customer-account'); }} onBack={() => handleNavigate('home')} />;
      case 'admin': 
        return <Dashboard sneakers={sneakers} orders={orders} customers={customers} brands={brands} categories={categories} paymentMethods={paymentMethods} slides={slides} navItems={navItems} checkoutFields={checkoutFields} shippingOptions={shippingOptions} footerConfig={footerConfig} siteIdentity={siteIdentity} onRefresh={fetchData} onRefreshOrders={fetchData} onUpdateOrderStatus={async (id, s) => { const success = await vaultApi.updateOrderStatus(id, s); if(success) fetchData(); return success; }} onSaveProduct={async (d) => { const s = await vaultApi.saveProduct(d); if(s) fetchData(); return s; }} onDeleteProduct={async (id) => { const s = await vaultApi.deleteProduct(id); if(s) fetchData(); return s; }} onSaveShipping={async (o) => { const s = await vaultApi.saveShippingOption(o); if(s) fetchData(); return s; }} onDeleteShipping={async (id) => { const s = await vaultApi.deleteShippingOption(id); if(s) fetchData(); return s; }} onSavePaymentMethod={async (m) => { const s = await vaultApi.savePaymentMethod(m); if(s) fetchData(); return s; }} onDeletePaymentMethod={async (id) => { const s = await vaultApi.deletePaymentMethod(id); if(s) fetchData(); return s; }} onSaveFooterConfig={async (c) => { const s = await vaultApi.saveSiteSettings('footer', c); if(s) fetchData(); return s; }} onSaveIdentity={async (i) => { const s = await vaultApi.saveSiteSettings('identity', i); if(s) fetchData(); return s; }} onSaveBrand={async (b) => { const s = await vaultApi.saveBrand(b); if(s) fetchData(); return s; }} onDeleteBrand={async (id) => { const s = await vaultApi.deleteBrand(id); if(s) fetchData(); return s; }} onSaveCategory={async (c) => { const s = await vaultApi.saveCategory(c); if(s) fetchData(); return s; }} onDeleteCategory={async (id) => { const s = await vaultApi.deleteCategory(id); if(s) fetchData(); return s; }} onSaveSlide={async (sl) => { const s = await vaultApi.saveSlide(sl); if(s) fetchData(); return s; }} onDeleteSlide={async (id) => { const s = await vaultApi.deleteSlide(id); if(s) fetchData(); return s; }} onSaveNavItem={async (n) => { const s = await vaultApi.saveNavItem(n); if(s) fetchData(); return s; }} onDeleteNavItem={async (id) => { const s = await vaultApi.deleteNavItem(id); if(s) fetchData(); return s; }} onSaveCheckoutField={async (cf) => { const s = await vaultApi.saveCheckoutField(cf); if(s) fetchData(); return s; }} onDeleteCheckoutField={async (id) => { const s = await vaultApi.deleteCheckoutField(id); if(s) fetchData(); return s; }} onLogout={() => { localStorage.removeItem('sv_admin_session'); setIsAdminAuthenticated(false); handleNavigate('home'); }} onVisitSite={() => window.open(window.location.origin, '_blank')} />;
      case 'order-success': return <OrderSuccess lastOrder={lastOrder} onNavigate={handleNavigate} />;
      case 'customer-account': return <CustomerPortal customer={currentCustomer!} orders={orders} onLogout={() => { localStorage.removeItem('sv_customer_session'); setCurrentCustomer(null); handleNavigate('home'); }} onUpdateProfile={async (u) => vaultApi.updateCustomer(currentCustomer!.id, u)} onSelectOrder={(o) => { setViewingOrder(o); handleNavigate('order-details-view' as View); }} />;
      default: return <Home sneakers={sneakers} slides={slides} onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); }} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {currentView !== 'admin' && (
        <Navigation 
          onNavigate={(v) => handleNavigate(v as View)} 
          cartCount={cart.reduce((a,c) => a + c.quantity, 0)} 
          wishlistCount={wishlist.length} 
          currentView={currentView} 
          onOpenCart={() => setIsCartSidebarOpen(true)} 
          onOpenSearch={() => setIsSearchOpen(true)} 
          navItems={navItems} 
          siteIdentity={siteIdentity} 
        />
      )}
      <div className="flex-1">{renderView()}</div>
      {currentView !== 'admin' && <Footer config={footerConfig} onNavigate={handleNavigate} />}
      <CartOverlay isOpen={isCartSidebarOpen} onClose={() => setIsCartSidebarOpen(false)} cart={cart} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onCheckout={() => handleNavigate('checkout')} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={(q) => { setSearchQuery(q); handleNavigate('shop'); setIsSearchOpen(false); }} />
    </div>
  );
};

export default App;
