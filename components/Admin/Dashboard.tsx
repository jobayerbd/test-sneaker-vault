
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, Sneaker, BrandEntity, Category, ShippingOption, FooterConfig, PaymentMethod } from '../../types';

import AdminSidebar from './AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminInventory from './AdminInventory';
import AdminOrders from './AdminOrders';
import AdminOrderDetail from './AdminOrderDetail';
import AdminProductForm from './AdminProductForm';
import AdminSettings from './AdminSettings';
import AdminBrands from './AdminBrands';
import AdminCategories from './AdminCategories';

interface DashboardProps {
  orders: Order[];
  sneakers: Sneaker[];
  brands: BrandEntity[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  shippingOptions?: ShippingOption[];
  footerConfig: FooterConfig;
  onRefresh?: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
  onSaveProduct: (productData: Partial<Sneaker>) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onSaveShipping: (option: Partial<ShippingOption>) => Promise<boolean>;
  onDeleteShipping: (id: string) => Promise<boolean>;
  onSavePaymentMethod: (method: Partial<PaymentMethod>) => Promise<boolean>;
  onDeletePaymentMethod: (id: string) => Promise<boolean>;
  onSaveFooterConfig: (config: FooterConfig) => Promise<boolean>;
  onSaveBrand: (brand: Partial<BrandEntity>) => Promise<boolean>;
  onDeleteBrand: (id: string) => Promise<boolean>;
  onSaveCategory: (category: Partial<Category>) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  isRefreshing?: boolean;
  onLogout?: () => void;
}

type AdminSubView = 'overview' | 'orders' | 'inventory' | 'settings' | 'customers' | 'order-detail' | 'product-form' | 'brands' | 'categories';

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { 
    orders, sneakers, brands, categories, paymentMethods, shippingOptions = [], footerConfig, onRefresh, onUpdateOrderStatus, 
    onSaveProduct, onDeleteProduct, onSaveShipping, onDeleteShipping, 
    onSavePaymentMethod, onDeletePaymentMethod,
    onSaveFooterConfig, 
    onSaveBrand, onDeleteBrand, onSaveCategory, onDeleteCategory,
    isRefreshing, onLogout 
  } = props;

  const [subView, setSubView] = useState<AdminSubView>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Sneaker> | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
      return matchesStatus && (
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        fullName.includes(searchQuery.toLowerCase()) || 
        o.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    return result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [orders, statusFilter, searchQuery]);

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
      name: '', brand: '', category: '', price: 0, image: '', gallery: [], variants: [], 
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
        return <AdminOrders orders={filteredOrders} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} searchQuery={searchQuery} onSearchChange={setSearchQuery} onSelectOrder={handleSelectOrder} />;
      case 'order-detail':
        return selectedOrder ? <AdminOrderDetail order={selectedOrder} onBack={() => setSubView('orders')} onUpdateStatus={onUpdateOrderStatus} /> : null;
      case 'brands':
        return <AdminBrands brands={brands} onSave={onSaveBrand} onDelete={onDeleteBrand} />;
      case 'categories':
        return <AdminCategories categories={categories} onSave={onSaveCategory} onDelete={onDeleteCategory} />;
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
