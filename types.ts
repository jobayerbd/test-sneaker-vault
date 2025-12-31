
export enum Brand {
  NIKE = 'Nike',
  ADIDAS = 'Adidas',
  YEEZY = 'Yeezy',
  JORDAN = 'Jordan',
  NEW_BALANCE = 'New Balance',
  ASICS = 'Asics'
}

export enum OrderStatus {
  PLACED = 'Placed',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  RETURNED = 'Returned'
}

export interface NavItem {
  id: string;
  label: string;
  target_view: string;
  order: number;
  active: boolean;
}

export interface CheckoutField {
  id: string;
  field_key: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
  enabled: boolean;
  width: 'full' | 'half';
  order: number;
}

export interface TimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface SneakerVariant {
  size: string;
  stock: number;
}

export interface BrandEntity {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  details?: string;
  created_at?: string;
}

export interface Sneaker {
  id: string;
  name: string;
  slug?: string;
  brand?: string;
  category?: string;
  categories?: string[];
  price: number;
  original_price?: number;
  image: string;
  gallery: string[];
  description: string;
  release_date: string;
  is_drop: boolean;
  colorway: string;
  variants: SneakerVariant[];
  fit_score: string;
  trending: boolean;
}

export interface ShippingOption {
  id: string;
  name: string;
  rate: number;
  created_at?: string;
}

export interface HomeSlide {
  id: string;
  image: string;
  headline: string;
  subtext: string;
  button_text: string;
  button_link: string;
  active: boolean;
  order: number;
}

export interface OrderItem {
  sneakerId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number?: string;
  street_address: string;
  city: string;
  zip_code: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  timeline: TimelineEvent[];
  shipping_name?: string;
  shipping_rate?: number;
  payment_method?: string;
  created_at?: string;
}

export interface CartItem extends Sneaker {
  selectedSize: string;
  quantity: number;
}

export interface FooterConfig {
  store_name: string;
  description: string;
  copyright: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  fb_pixel_id?: string;
}
