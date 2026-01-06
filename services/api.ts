
import { Order, OrderStatus, Sneaker, BrandEntity, Category, PaymentMethod, HomeSlide, NavItem, CheckoutField, ShippingOption, Customer } from '../types.ts';

const SUPABASE_URL = 'https://vwbctddmakbnvfxzrjeo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8WhV41Km5aj8Dhvu6tUbvA_JnyPoVxu';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const getUrl = (path: string) => {
  const separator = path.includes('?') ? '&' : '?';
  return `${SUPABASE_URL}/rest/v1/${path}${separator}apikey=${SUPABASE_KEY}`;
};

export const vaultApi = {
  fetchSneakers: async () => {
    try {
      const resp = await fetch(getUrl('sneakers?select=*&order=created_at.desc'), { headers });
      return resp.ok ? await resp.json() : [];
    } catch (err) {
      console.error("VAULT FETCH ERROR [sneakers]:", err);
      return [];
    }
  },
  
  saveProduct: async (product: Partial<Sneaker>) => {
    const isNew = !product.id;
    const path = isNew ? 'sneakers' : `sneakers?id=eq.${product.id}`;
    const method = isNew ? 'POST' : 'PATCH';
    
    const resp = await fetch(getUrl(path), {
      method,
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(product)
    });
    return resp.ok;
  },

  deleteProduct: async (id: string) => {
    const resp = await fetch(getUrl(`sneakers?id=eq.${id}`), {
      method: 'DELETE',
      headers
    });
    return resp.ok;
  },

  fetchOrders: async () => {
    // STRATEGY 1: Standard Sorted Fetch
    // Attempts to get orders sorted by created_at. This is preferred.
    try {
      console.log("VAULT: Attempting Strategy 1 (Sorted Fetch)...");
      const path = `orders?select=*&order=created_at.desc`;
      // Use cache: 'no-store' to bypass browser caching instead of query param
      const resp = await fetch(getUrl(path), { 
        headers,
        cache: 'no-store' 
      });
      
      if (resp.ok) {
        const data = await resp.json();
        console.log(`VAULT: Strategy 1 Success. Found ${data.length} records.`);
        return Array.isArray(data) ? data : [];
      } else {
        console.warn("VAULT: Strategy 1 Failed (API Error). Trying fallback...");
      }
    } catch (e) {
      console.warn("VAULT: Strategy 1 Failed (Network). Trying fallback...", e);
    }

    // STRATEGY 2: Raw Fallback Fetch
    // If Strategy 1 failed (e.g. created_at column missing), try getting raw data without sorting.
    try {
      console.log("VAULT: Attempting Strategy 2 (Raw Fallback)...");
      const rawPath = `orders?select=*`;
      const resp = await fetch(getUrl(rawPath), { 
        headers,
        cache: 'no-store'
      });
      
      if (resp.ok) {
        const data = await resp.json();
        console.log(`VAULT: Strategy 2 Success. Found ${data.length} records.`);
        return Array.isArray(data) ? data : [];
      } else {
        const errText = await resp.text();
        console.error(`VAULT: Strategy 2 Failed. Status: ${resp.status}`, errText);
      }
    } catch (e) {
      console.error("VAULT: All Fetch Strategies Failed.", e);
    }

    return [];
  },

  fetchOrderById: async (orderId: string) => {
    try {
      const safeId = encodeURIComponent(orderId);
      const path = `orders?id=eq.${safeId}&select=*`;
      const resp = await fetch(getUrl(path), { headers });
      if (!resp.ok) return null;
      const data = await resp.json();
      
      if (data && data.length > 0) {
        return data[0];
      }
      return null;
    } catch (err) {
      console.error("VAULT FETCH ERROR [orderById]:", err);
      return null;
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const safeId = encodeURIComponent(orderId);
    const resp = await fetch(getUrl(`orders?id=eq.${safeId}`), {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    });
    return resp.ok;
  },

  deleteOrder: async (orderId: string) => {
    const safeId = encodeURIComponent(orderId);
    console.log(`[VAULT] Hiding Order Protocol: ${orderId}`);

    try {
      // STRICTLY update is_hidden to true. No hard deletes.
      // We use Prefer: return=minimal to avoid issues with RLS policies that allow update but block select.
      const resp = await fetch(getUrl(`orders?id=eq.${safeId}`), {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=minimal' }, 
        body: JSON.stringify({ is_hidden: true })
      });

      if (resp.ok) {
        console.log(`[VAULT] Order ${orderId} successfully marked as hidden.`);
        return true;
      } else {
        const errText = await resp.text();
        console.error(`[VAULT] Hide Operation Failed (${resp.status}):`, errText);
        return false;
      }
    } catch (err) {
      console.error("[VAULT] System Error during Hide Operation:", err);
      return false;
    }
  },

  fetchCustomers: async () => {
    try {
      const resp = await fetch(getUrl('customers?select=*&order=created_at.desc'), { headers });
      return resp.ok ? await resp.json() : [];
    } catch (err) {
      return [];
    }
  },

  createCustomer: async (customerData: any) => {
    const resp = await fetch(getUrl('customers'), {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(customerData)
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data[0];
  },

  fetchBrands: async () => {
    try {
      const resp = await fetch(getUrl('brands?select=*&order=name.asc'), { headers });
      return resp.ok ? await resp.json() : [];
    } catch (err) {
      return [];
    }
  },

  saveBrand: async (brand: Partial<BrandEntity>) => {
    const isNew = !brand.id;
    const path = isNew ? 'brands' : `brands?id=eq.${brand.id}`;
    const resp = await fetch(getUrl(path), { 
      method: isNew ? 'POST' : 'PATCH', 
      headers, 
      body: JSON.stringify(brand) 
    });
    return resp.ok;
  },

  deleteBrand: async (id: string) => {
    const resp = await fetch(getUrl(`brands?id=eq.${id}`), { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchCategories: async () => {
    try {
      const resp = await fetch(getUrl('categories?select=*&order=name.asc'), { headers });
      return resp.ok ? await resp.json() : [];
    } catch (err) {
      return [];
    }
  },

  saveCategory: async (category: Partial<Category>) => {
    const isNew = !category.id;
    const path = isNew ? 'categories' : `categories?id=eq.${category.id}`;
    const resp = await fetch(getUrl(path), { 
      method: isNew ? 'POST' : 'PATCH', 
      headers, 
      body: JSON.stringify(category) 
    });
    return resp.ok;
  },

  deleteCategory: async (id: string) => {
    const resp = await fetch(getUrl(`categories?id=eq.${id}`), { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchPaymentMethods: async () => {
    try {
      const resp = await fetch(getUrl('payment_methods?select=*&order=name.asc'), { headers });
      return resp.ok ? await resp.json() : [];
    } catch (err) {
      return [];
    }
  },

  savePaymentMethod: async (method: Partial<PaymentMethod>) => {
    const isNew = !method.id;
    const path = isNew ? 'payment_methods' : `payment_methods?id=eq.${method.id}`;
    const resp = await fetch(getUrl(path), { 
      method: isNew ? 'POST' : 'PATCH', 
      headers, 
      body: JSON.stringify(method) 
    });
    return resp.ok;
  },

  deletePaymentMethod: async (id: string) => {
    const resp = await fetch(getUrl(`payment_methods?id=eq.${id}`), { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchSlides: async () => {
    try {
      const resp = await fetch(getUrl('home_slides?select=*&order=order.asc'), { headers });
      return resp.ok ? await resp.json() : [];
    } catch (err) {
      return [];
    }
  },

  saveSlide: async (slide: Partial<HomeSlide>) => {
    const isNew = !slide.id;
    const path = isNew ? 'home_slides' : `home_slides?id=eq.${slide.id}`;
    const resp = await fetch(getUrl(path), { 
      method: isNew ? 'POST' : 'PATCH', 
      headers, 
      body: JSON.stringify(slide) 
    });
    return resp.ok;
  },

  deleteSlide: async (id: string) => {
    const resp = await fetch(getUrl(`home_slides?id=eq.${id}`), { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchNavItems: async () => {
    try {
      const resp = await fetch(getUrl('site_navigation?select=*&order=order.asc'), { headers });
      return resp.ok ? await resp.json() : [];
    } catch (err) {
      return [];
    }
  },

  saveNavItem: async (item: Partial<NavItem>) => {
    const isNew = !item.id;
    const path = isNew ? 'site_navigation' : `site_navigation?id=eq.${item.id}`;
    const resp = await fetch(getUrl(path), { 
      method: isNew ? 'POST' : 'PATCH', 
      headers, 
      body: JSON.stringify(item) 
    });
    return resp.ok;
  },

  deleteNavItem: async (id: string) => {
    const resp = await fetch(getUrl(`site_navigation?id=eq.${id}`), { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchCheckoutFields: async () => {
    try {
      const resp = await fetch(getUrl('checkout_fields?select=*&order=order.asc'), { headers });
      return resp.ok ? await resp.json() : [];
    } catch (err) {
      return [];
    }
  },

  saveCheckoutField: async (field: Partial<CheckoutField>) => {
    const isNew = !field.id;
    const path = isNew ? 'checkout_fields' : `checkout_fields?id=eq.${field.id}`;
    const resp = await fetch(getUrl(path), {
      method: isNew ? 'POST' : 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(field)
    });
    return resp.ok;
  },

  deleteCheckoutField: async (id: string) => {
    const resp = await fetch(getUrl(`checkout_fields?id=eq.${id}`), {
      method: 'DELETE',
      headers
    });
    return resp.ok;
  },

  fetchShippingOptions: async () => {
    try {
      const resp = await fetch(getUrl('shipping_options?select=*&order=rate.asc'), { headers });
      return resp.ok ? await resp.json() : [];
    } catch (err) {
      return [];
    }
  },

  saveShippingOption: async (option: Partial<ShippingOption>) => {
    const isNew = !option.id;
    const path = isNew ? 'shipping_options' : `shipping_options?id=eq.${option.id}`;
    const resp = await fetch(getUrl(path), { method: isNew ? 'POST' : 'PATCH', headers, body: JSON.stringify(option) });
    return resp.ok;
  },

  deleteShippingOption: async (id: string) => {
    const resp = await fetch(getUrl(`shipping_options?id=eq.${id}`), { method: 'DELETE', headers });
    return resp.ok;
  },

  fetchSiteSettings: async (key: string) => {
    try {
      const path = `site_settings?key=eq.${key}&select=data`;
      const resp = await fetch(getUrl(path), { headers });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data[0]?.data || null;
    } catch (err) {
      return null;
    }
  },

  saveSiteSettings: async (key: string, data: any) => {
    const resp = await fetch(getUrl(`site_settings?key=eq.${key}`), {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ data })
    });
    return resp.ok;
  },

  updateCustomer: async (id: string, updates: Partial<Customer>) => {
    const resp = await fetch(getUrl(`customers?id=eq.${id}`), {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates)
    });
    return resp.ok;
  },

  createOrder: async (orderData: any) => {
    const resp = await fetch(getUrl('orders'), {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(orderData)
    });
    
    if (!resp.ok) {
      const errorMsg = await resp.text();
      console.error("VAULT API ERROR [createOrder]:", errorMsg);
      return null;
    }
    
    const data = await resp.json();
    return data[0];
  },

  createTimelineEvent: async (orderId: string, status: OrderStatus, note: string) => {
    try {
        const resp = await fetch(getUrl('order_timeline'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ order_id: orderId, status, note })
        });
        return resp.ok;
    } catch (e) {
        return false;
    }
  }
};
