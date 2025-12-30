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

export interface SneakerVariant {
  size: string;
  stock: number;
}

export interface Sneaker {
  id: string;
  name: string;
  brand: Brand;
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
  street_address: string;
  city: string;
  zip_code: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  created_at?: string;
}

export interface CartItem extends Sneaker {
  selectedSize: string;
  quantity: number;
}