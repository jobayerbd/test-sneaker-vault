
import { Order, OrderStatus, Sneaker, BrandEntity, Category, PaymentMethod, HomeSlide, NavItem, CheckoutField, ShippingOption, Customer } from '../types.ts';

const SUPABASE_URL = 'https://vwbctddmakbnvfxzrjeo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8WhV41Km5aj8Dhvu6tUbvA_JnyPoVxu';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

export const vaultApi = {
  fetchSneakers: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/sneakers?select=*&order=created_at.desc`, { headers });
    return resp.ok ? await resp.json() : [];
  },
  
  saveProduct: async (product: Partial<Sneaker>) => {
    const isNew = !product.id;
    const url = isNew ? `${SUPABASE_URL}/rest/v1/sneakers` : `${SUPABASE_URL}/rest/v1/sneakers?id=eq.${product.id}`;
    const method = isNew ? 'POST' : 'PATCH';
    
    const resp = await fetch(url, {
      method,
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(product)
    });
    return resp.ok;
  },

  deleteProduct: async (id: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/sneakers?id=eq.${id}`, {
      method: 'DELETE',
      headers
    });
    return resp.ok;
  },

  fetchOrders: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*,timeline:order_timeline(status,note,timestamp)&order=created_at.desc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    });
    return resp.ok;
  },

  fetchCustomers: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=*&order=created_at.desc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  createCustomer: async (customerData: any) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(customerData)
    });
    if (!resp.ok) {
      const errorMsg = await resp.text();
      console.error("VAULT API ERROR [createCustomer]:", errorMsg);
      return null;
    }
    const data = await resp.json();
    return data[0];
  },

  fetchBrands: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/brands?select=*&order=name.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  saveBrand: async (brand: Partial<BrandEntity>) => {
    const isNew = !brand.id;
    const url = isNew ? `${SUPABASE_URL}/rest/v1/brands` : `${SUPABASE_URL}/rest/v1/brands?id=eq.${brand.id}`;
    const method = isNew ? 'POST' : 'PATCH';
    const resp = await fetch(url, { method, headers, body: JSON.stringify(brand) });
    return resp.ok;
  },

  deleteBrand: async (id: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/brands?id=eq.${id}`, { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchCategories: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  saveCategory: async (category: Partial<Category>) => {
    const isNew = !category.id;
    const url = isNew ? `${SUPABASE_URL}/rest/v1/categories` : `${SUPABASE_URL}/rest/v1/categories?id=eq.${category.id}`;
    const method = isNew ? 'POST' : 'PATCH';
    const resp = await fetch(url, { method, headers, body: JSON.stringify(category) });
    return resp.ok;
  },

  deleteCategory: async (id: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchPaymentMethods: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/payment_methods?select=*&order=name.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  savePaymentMethod: async (method: Partial<PaymentMethod>) => {
    const isNew = !method.id;
    const url = isNew ? `${SUPABASE_URL}/rest/v1/payment_methods` : `${SUPABASE_URL}/rest/v1/payment_methods?id=eq.${method.id}`;
    const resp = await fetch(url, { 
      method: isNew ? 'POST' : 'PATCH', 
      headers, 
      body: JSON.stringify(method) 
    });
    return resp.ok;
  },

  deletePaymentMethod: async (id: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/payment_methods?id=eq.${id}`, { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchSlides: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/home_slides?select=*&order=order.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  saveSlide: async (slide: Partial<HomeSlide>) => {
    const isNew = !slide.id;
    const url = isNew ? `${SUPABASE_URL}/rest/v1/home_slides` : `${SUPABASE_URL}/rest/v1/home_slides?id=eq.${slide.id}`;
    const resp = await fetch(url, { 
      method: isNew ? 'POST' : 'PATCH', 
      headers, 
      body: JSON.stringify(slide) 
    });
    return resp.ok;
  },

  deleteSlide: async (id: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/home_slides?id=eq.${id}`, { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchNavItems: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/site_navigation?select=*&order=order.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  saveNavItem: async (item: Partial<NavItem>) => {
    const isNew = !item.id;
    const url = isNew ? `${SUPABASE_URL}/rest/v1/site_navigation` : `${SUPABASE_URL}/rest/v1/site_navigation?id=eq.${item.id}`;
    const resp = await fetch(url, { 
      method: isNew ? 'POST' : 'PATCH', 
      headers, 
      body: JSON.stringify(item) 
    });
    return resp.ok;
  },

  deleteNavItem: async (id: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/site_navigation?id=eq.${id}`, { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchCheckoutFields: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/checkout_fields?select=*&order=order.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  saveCheckoutField: async (field: Partial<CheckoutField>) => {
    const isNew = !field.id;
    const url = isNew ? `${SUPABASE_URL}/rest/v1/checkout_fields` : `${SUPABASE_URL}/rest/v1/checkout_fields?id=eq.${field.id}`;
    const method = isNew ? 'POST' : 'PATCH';
    
    const resp = await fetch(url, {
      method,
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(field)
    });
    return resp.ok;
  },

  deleteCheckoutField: async (id: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/checkout_fields?id=eq.${id}`, {
      method: 'DELETE',
      headers
    });
    return resp.ok;
  },

  fetchShippingOptions: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/shipping_options?select=*&order=rate.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  saveShippingOption: async (option: Partial<ShippingOption>) => {
    const isNew = !option.id;
    const url = isNew ? `${SUPABASE_URL}/rest/v1/shipping_options` : `${SUPABASE_URL}/rest/v1/shipping_options?id=eq.${option.id}`;
    const resp = await fetch(url, { method: isNew ? 'POST' : 'PATCH', headers, body: JSON.stringify(option) });
    return resp.ok;
  },

  deleteShippingOption: async (id: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/shipping_options?id=eq.${id}`, { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchSiteSettings: async (key: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.${key}&select=data`, { headers });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data[0]?.data || null;
  },

  saveSiteSettings: async (key: string, data: any) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.${key}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ data })
    });
    return resp.ok;
  },

  updateCustomer: async (id: string, updates: Partial<Customer>) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates)
    });
    return resp.ok;
  },

  createOrder: async (orderData: any) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(orderData)
    });
    
    if (!resp.ok) {
      const errorMsg = await resp.text();
      console.error("VAULT API ERROR [createOrder]:", errorMsg);
      console.error("Payload causing error:", JSON.stringify(orderData, null, 2));
      return null;
    }
    
    const data = await resp.json();
    return data[0];
  },

  createTimelineEvent: async (orderId: string, status: OrderStatus, note: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/order_timeline`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ order_id: orderId, status, note })
    });
    if (!resp.ok) {
      const errorMsg = await resp.text();
      console.error("VAULT API ERROR [createTimelineEvent]:", errorMsg);
    }
    return resp.ok;
  }
};
