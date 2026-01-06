
import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus, Sneaker, BrandEntity, Category, ShippingOption, FooterConfig, PaymentMethod, HomeSlide, NavItem, CheckoutField, AdminSubView, SiteIdentity, Customer } from '../../types.ts';

import AdminSidebar from './AdminSidebar.tsx';
import AdminOverview from './AdminOverview.tsx';
import AdminInventory from './AdminInventory.tsx';
import AdminOrders from './AdminOrders.tsx';
import AdminOrderDetail from './AdminOrderDetail.tsx';
import AdminProductForm from './AdminProductForm.tsx';
import AdminOrderForm from './AdminOrderForm.tsx';
import AdminSettings from './AdminSettings.tsx';
import AdminBrands from './AdminBrands.tsx';
import AdminCategories from './AdminCategories.tsx';
import AdminSlider from './AdminSlider.tsx';
import AdminMenuManagement from './AdminMenuManagement.tsx';
import AdminCheckoutManager from './AdminCheckoutManager.tsx';
import AdminHomeManagement from './AdminHomeManagement.tsx';
import AdminIdentity from './AdminIdentity.tsx';
import AdminCustomers from './AdminCustomers.tsx';
import AdminFooterSettings from './AdminFooterSettings.tsx';
import { vaultApi } from '../../services/api.ts';

interface DashboardProps {
  orders: Order[];
  sneakers: Sneaker[];
  customers: Customer[];
  brands: BrandEntity[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  slides: HomeSlide[];
  navItems: NavItem[];
  checkoutFields: CheckoutField[];
  shippingOptions?: ShippingOption[];
  footerConfig: FooterConfig;
  siteIdentity: SiteIdentity;
  onRefresh?: () => void;
  onRefreshOrders?: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  onSaveProduct: (productData: Partial<Sneaker>) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onSaveShipping: (option: Partial<ShippingOption>) => Promise<boolean>;
  onDeleteShipping: (id: string) => Promise<boolean>;
  onSavePaymentMethod: (method: Partial<PaymentMethod>) => Promise<boolean>;
  onDeletePaymentMethod: (id: string) => Promise<boolean>;
  onSaveFooterConfig: (config: FooterConfig) => Promise<boolean>;
  onSaveIdentity: (config: SiteIdentity) => Promise<boolean>;
  onSaveBrand: (brand: Partial<BrandEntity>) => Promise<boolean>;
  onDeleteBrand: (id: string) => Promise<boolean>;
  onSaveCategory: (category: Partial<Category>) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  onSaveSlide: (slide: Partial<HomeSlide>) => Promise<boolean>;
  onDeleteSlide: (id: string) => Promise<boolean>;
  onSaveNavItem: (item: Partial<NavItem>) => Promise<boolean>;
  onDeleteNavItem: (id: string) => Promise<boolean>;
  onSaveCheckoutField: (field: Partial<CheckoutField>) => Promise<boolean>;
  onDeleteCheckoutField: (id: string) => Promise<boolean>;
  isRefreshing?: boolean;
  onLogout?: () => void;
  onVisitSite?: () => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { 
    orders, sneakers, customers, brands, categories, paymentMethods, slides, navItems, checkoutFields, shippingOptions = [], footerConfig, siteIdentity, onRefresh, onRefreshOrders, onUpdateOrderStatus, 
    onSaveProduct, onDeleteProduct, onSaveShipping, onDeleteShipping, 
    onSavePaymentMethod, onDeletePaymentMethod,
    onSaveFooterConfig, onSaveIdentity,
    onSaveBrand, onDeleteBrand, onSaveCategory, onDeleteCategory,
    onSaveSlide, onDeleteSlide,
    onSaveNavItem, onDeleteNavItem,
    onSaveCheckoutField, onDeleteCheckoutField,
    isRefreshing, onLogout, onVisitSite
  } = props;

  const [subView, setSubView] = useState<AdminSubView>('overview');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Sneaker> | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Robust frontend filtering & safe sorting
  const visibleOrders = useMemo(() => {
    const validOrders = Array.isArray(orders) ? orders : [];
    return validOrders
      .filter(o => o.is_hidden !== true)
      .sort((a, b) => {
        const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tB - tA;
      });
  }, [orders]);

  const activeOrder = useMemo(() => {
    return visibleOrders.find(o => o.id === selectedOrderId) || null;
  }, [visibleOrders, selectedOrderId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, startDate, endDate]);

  const filteredOrders = useMemo(() => {
    let result = visibleOrders.filter(o => {
      if (!o) return false;
      const matchesStatus = statusFilter === 'ALL' || (o.status || '').toLowerCase() === statusFilter.toLowerCase();
      const orderDate = o.created_at ? new Date(o.created_at) : null;
      let matchesDate = true;
      if (orderDate) {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && orderDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && orderDate <= end;
        }
      }
      
      const safeId = (o.id || '').toLowerCase();
      const safeFirst = (o.first_name || '').toLowerCase();
      const safeLast = (o.last_name || '').toLowerCase();
      const safeEmail = (o.email || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = safeId.includes(query) || 
                           safeFirst.includes(query) || 
                           safeLast.includes(query) || 
                           safeEmail.includes(query);
                           
      return matchesStatus && matchesDate && matchesSearch;
    });
    return result;
  }, [visibleOrders, statusFilter, searchQuery, startDate, endDate]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredOrders, currentPage]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setSubView('order-detail');
  };

  const handleAddOrder = () => {
    setSubView('order-form');
  };

  const handleDeleteOrder = async (id: string) => {
    const success = await vaultApi.deleteOrder(id);
    if (success) {
      if (onRefreshOrders) {
        await onRefreshOrders();
      }
      setCurrentPage(1);
    }
    return success;
  };

  const handleEditProduct = (sneaker: Sneaker) => {
    setEditingProduct(sneaker);
    setSubView('product-form');
  };

  const handleDuplicateProduct = (sneaker: Sneaker) => {
    const { id, created_at, ...rest } = sneaker;
    setEditingProduct({
      ...rest,
      name: `${rest.name} (Copy)`
    });
    setSubView('product-form');
  };

  const handleAddProduct = () => {
    setEditingProduct({ 
      name: '', brand: '', category: '', categories: [], price: 0, image: '', gallery: [], variants: [], 
      description: '', colorway: '', is_drop: false, trending: false 
    });
    setSubView('product-form');
  };

  const handleNavigate = (view: AdminSubView) => {
    setSubView(view);
    setIsMobileSidebarOpen(false);
  };

  const renderContent = () => {
    switch(subView) {
      case 'overview': 
        return <AdminOverview orders={visibleOrders} sneakers={sneakers} isRefreshing={isRefreshing} onRefresh={onRefresh} />;
      case 'inventory': 
        return <AdminInventory sneakers={sneakers} onEditProduct={handleEditProduct} onDuplicateProduct={handleDuplicateProduct} onAddProduct={handleAddProduct} onDeleteProduct={onDeleteProduct} />;
      case 'customers':
        return <AdminCustomers customers={customers} orders={visibleOrders} isRefreshing={isRefreshing} />;
      case 'product-form':
        return editingProduct ? (
          <AdminProductForm 
            product={editingProduct} 
            brands={brands} 
            categories={categories} 
            onSave={onSaveProduct} 
            onCancel={() => setSubView('inventory')} 
          />
        ) : null;
      case 'order-form':
        return (
          <AdminOrderForm 
            sneakers={sneakers} 
            shippingOptions={shippingOptions} 
            paymentMethods={paymentMethods} 
            onSave={async (order) => { 
              const ok = await vaultApi.createOrder(order); 
              if(ok) {
                await vaultApi.createTimelineEvent(order.id, OrderStatus.PLACED, 'Manual protocol entry initiated by administrator.');
                onRefreshOrders?.(); 
              }
              return !!ok; 
            }} 
            onCancel={() => setSubView('orders')} 
          />
        );
      case 'orders': 
        return (
          <AdminOrders 
            orders={paginatedOrders} 
            statusFilter={statusFilter} 
            onStatusFilterChange={setStatusFilter} 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            onSelectOrder={handleSelectOrder}
            onAddOrder={handleAddOrder}
            onDeleteOrder={handleDeleteOrder}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredOrders.length}
            onRefresh={onRefreshOrders}
            isRefreshing={isRefreshing}
          />
        );
      case 'order-detail':
        return activeOrder ? (
          <AdminOrderDetail 
            order={activeOrder} 
            onBack={() => setSubView('orders')} 
            onUpdateStatus={onUpdateOrderStatus} 
            onDeleteOrder={async (id) => {
              const ok = await handleDeleteOrder(id);
              if (ok) setSubView('orders');
              return ok;
            }}
          />
        ) : null;
      case 'home-layout':
        return <AdminHomeManagement sneakers={sneakers} onUpdateProduct={onSaveProduct} />;
      case 'brands':
        return <AdminBrands brands={brands} onSave={onSaveBrand} onDelete={onDeleteBrand} />;
      case 'categories':
        return <AdminCategories categories={categories} onSave={onSaveCategory} onDelete={onDeleteCategory} />;
      case 'slider':
        return <AdminSlider slides={slides} onSave={onSaveSlide} onDelete={onDeleteSlide} />;
      case 'menu':
        return <AdminMenuManagement navItems={navItems} categories={categories} brands={brands} onSave={onSaveNavItem} onDelete={onDeleteNavItem} />;
      case 'footer-settings':
        return <AdminFooterSettings footerConfig={footerConfig} onSaveFooterConfig={onSaveFooterConfig} />;
      case 'checkout-config':
        return <AdminCheckoutManager fields={checkoutFields} onSave={onSaveCheckoutField} onDelete={onDeleteCheckoutField} />;
      case 'identity':
        return <AdminIdentity identity={siteIdentity} onSave={onSaveIdentity} />;
      case 'settings':
        return <AdminSettings shippingOptions={shippingOptions} paymentMethods={paymentMethods} onSaveShipping={onSaveShipping} onDeleteShipping={onDeleteShipping} onSavePaymentMethod={onSavePaymentMethod} onDeletePaymentMethod={onDeletePaymentMethod} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-[#fafafa] min-h-screen flex-col lg:flex-row relative">
      <div className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
        <button onClick={() => setIsMobileSidebarOpen(true)} className="text-gray-800 p-2">
          <i className="fa-solid fa-bars-staggered text-xl"></i>
        </button>
        <span className="text-lg font-black font-heading italic">ADMIN <span className="text-red-600">VAULT</span></span>
        <button onClick={onVisitSite} className="text-red-600 p-2">
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
        </button>
      </div>

      <AdminSidebar 
        currentView={subView} 
        onNavigate={handleNavigate} 
        onLogout={onLogout} 
        onVisitSite={onVisitSite} 
        siteIdentity={siteIdentity} 
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <main className="flex-1 p-4 md:p-8 lg:p-14 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
