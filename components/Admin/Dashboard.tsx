
import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus, Sneaker, BrandEntity, Category, ShippingOption, FooterConfig, PaymentMethod, HomeSlide, NavItem, CheckoutField, AdminSubView, SiteIdentity, Customer } from '../../types.ts';

import AdminSidebar from './AdminSidebar.tsx';
import AdminOverview from './AdminOverview.tsx';
import AdminInventory from './AdminInventory.tsx';
import AdminOrders from './AdminOrders.tsx';
import AdminOrderDetail from './AdminOrderDetail.tsx';
import AdminProductForm from './AdminProductForm.tsx';
import AdminSettings from './AdminSettings.tsx';
import AdminBrands from './AdminBrands.tsx';
import AdminCategories from './AdminCategories.tsx';
import AdminSlider from './AdminSlider.tsx';
import AdminMenuManagement from './AdminMenuManagement.tsx';
import AdminCheckoutManager from './AdminCheckoutManager.tsx';
import AdminHomeManagement from './AdminHomeManagement.tsx';
import AdminIdentity from './AdminIdentity.tsx';
import AdminCustomers from './AdminCustomers.tsx';

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
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const activeOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, startDate, endDate]);

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
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
      const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
      const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           fullName.includes(searchQuery.toLowerCase()) || 
                           o.email.toLowerCase().includes(searchQuery.toLowerCase());
                           
      return matchesStatus && matchesDate && matchesSearch;
    });
    return result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [orders, statusFilter, searchQuery, startDate, endDate]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredOrders, currentPage]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setSubView('order-detail');
  };

  const handleEditProduct = (sneaker: Sneaker) => {
    setEditingProduct(sneaker);
    setSubView('product-form');
  };

  const handleAddProduct = () => {
    setEditingProduct({ 
      name: '', brand: '', category: '', categories: [], price: 0, image: '', gallery: [], variants: [], 
      description: '', colorway: '', is_drop: false, trending: false 
    });
    setSubView('product-form');
  };

  const renderContent = () => {
    switch(subView) {
      case 'overview': 
        return <AdminOverview orders={orders} sneakers={sneakers} isRefreshing={isRefreshing} onRefresh={onRefresh} />;
      case 'inventory': 
        return <AdminInventory sneakers={sneakers} onEditProduct={handleEditProduct} onAddProduct={handleAddProduct} onDeleteProduct={onDeleteProduct} />;
      case 'customers':
        return <AdminCustomers customers={customers} orders={orders} isRefreshing={isRefreshing} />;
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
      case 'orders': 
        return (
          <AdminOrders 
            orders={paginatedOrders} 
            statusFilter={statusFilter} 
            onStatusFilterChange={setStatusFilter} 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            onSelectOrder={handleSelectOrder}
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
        return activeOrder ? <AdminOrderDetail order={activeOrder} onBack={() => setSubView('orders')} onUpdateStatus={onUpdateOrderStatus} /> : null;
      case 'home-layout':
        return <AdminHomeManagement sneakers={sneakers} onUpdateProduct={onSaveProduct} />;
      case 'brands':
        return <AdminBrands brands={brands} onSave={onSaveBrand} onDelete={onDeleteBrand} />;
      case 'categories':
        return <AdminCategories categories={categories} onSave={onSaveCategory} onDelete={onDeleteCategory} />;
      case 'slider':
        return <AdminSlider slides={slides} onSave={onSaveSlide} onDelete={onDeleteSlide} />;
      case 'menu':
        return <AdminMenuManagement navItems={navItems} onSave={onSaveNavItem} onDelete={onDeleteNavItem} />;
      case 'checkout-config':
        return <AdminCheckoutManager fields={checkoutFields} onSave={onSaveCheckoutField} onDelete={onDeleteCheckoutField} />;
      case 'identity':
        return <AdminIdentity identity={siteIdentity} onSave={onSaveIdentity} />;
      case 'settings':
        return <AdminSettings shippingOptions={shippingOptions} paymentMethods={paymentMethods} footerConfig={footerConfig} onSaveShipping={onSaveShipping} onDeleteShipping={onDeleteShipping} onSavePaymentMethod={onSavePaymentMethod} onDeletePaymentMethod={onDeletePaymentMethod} onSaveFooterConfig={onSaveFooterConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-[#fafafa] min-h-screen">
      <AdminSidebar currentView={subView} onNavigate={setSubView} onLogout={onLogout} onVisitSite={onVisitSite} siteIdentity={siteIdentity} />
      <main className="flex-1 p-14 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
