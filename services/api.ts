
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
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/sneakers?select=*&order=name.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },
  
  fetchOrders: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*,timeline:order_timeline(status,note,timestamp)&order=created_at.desc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  fetchCustomers: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=*&order=created_at.desc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  fetchBrands: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/brands?select=*&order=name.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  fetchCategories: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  fetchPaymentMethods: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/payment_methods?select=*&order=name.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  fetchSlides: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/home_slides?select=*&order=order.asc`, { headers });
    return resp.ok ? await resp.json() : [];
  },

  fetchNavItems: async () => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/site_navigation?select=*&order=order.asc`, { headers });
    return resp.ok ? await resp.json() : [];
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

  fetchSiteSettings: async (key: string) => {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.${key}&select=data`, { headers });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data[0]?.data || null;
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
    return resp.ok ? (await resp.json())[0] : null;
  },

  createTimelineEvent: async (orderId: string, status: OrderStatus, note: string) => {
    return await fetch(`${SUPABASE_URL}/rest/v1/order_timeline`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ order_id: orderId, status, note })
    });
  }
};
