
import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus, Sneaker, BrandEntity, Category, ShippingOption, FooterConfig, PaymentMethod, HomeSlide, NavItem, CheckoutField, AdminSubView, SiteIdentity } from '../../types.ts';

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

interface DashboardProps {
  orders: Order[];
  sneakers: Sneaker[];
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
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { 
    orders, sneakers, brands, categories, paymentMethods, slides, navItems, checkoutFields, shippingOptions = [], footerConfig, siteIdentity, onRefresh, onUpdateOrderStatus, 
    onSaveProduct, onDeleteProduct, onSaveShipping, onDeleteShipping, 
    onSavePaymentMethod, onDeletePaymentMethod,
    onSaveFooterConfig, onSaveIdentity,
    onSaveBrand, onDeleteBrand, onSaveCategory, onDeleteCategory,
    onSaveSlide, onDeleteSlide,
    onSaveNavItem, onDeleteNavItem,
    onSaveCheckoutField, onDeleteCheckoutField,
    isRefreshing, onLogout 
  } = props;

  const [subView, setSubView] = useState<AdminSubView>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Sneaker> | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New States for Filtering & Pagination
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, startDate, endDate]);

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      // Status Filter
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      
      // Date Filter
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

      // Search Filter
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
    setSelectedOrder(order);
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
      case 'product-form':
        return editingProduct ? <AdminProductForm product={editingProduct} brands={brands} categories={categories} onSave={async (data) => { const s = await onSaveProduct(data); if(s) setSubView('inventory'); return s; }} onCancel={() => setSubView('inventory')} /> : null;
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
          />
        );
      case 'order-detail':
        return selectedOrder ? <AdminOrderDetail order={selectedOrder} onBack={() => setSubView('orders')} onUpdateStatus={onUpdateOrderStatus} /> : null;
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
      <AdminSidebar currentView={subView} onNavigate={setSubView} onLogout={onLogout} />
      <main className="flex-1 p-14 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
