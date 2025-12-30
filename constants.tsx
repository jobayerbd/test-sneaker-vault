
import { Brand, Sneaker, OrderStatus, Order } from './types';

export const MOCK_SNEAKERS: Sneaker[] = [
  {
    id: '1',
    name: 'Air Jordan 1 Retro High OG "Chicago"',
    brand: Brand.JORDAN,
    price: 180,
    originalPrice: 180,
    image: 'https://picsum.photos/seed/jordan1/800/800',
    gallery: [
      'https://picsum.photos/seed/jordan1-1/800/800',
      'https://picsum.photos/seed/jordan1-2/800/800',
      'https://picsum.photos/seed/jordan1-3/800/800'
    ],
    description: 'The shoe that started it all. The Air Jordan 1 High "Chicago" returns in its original glory.',
    releaseDate: '2024-12-01',
    isDrop: true,
    colorway: 'Red/White/Black',
    variants: [
      { size: '8', stock: 5 },
      { size: '9', stock: 2 },
      { size: '10', stock: 12 },
      { size: '11', stock: 0 }
    ],
    fitScore: 'True to Size',
    trending: true
  },
  {
    id: '2',
    name: 'Yeezy Boost 350 V2 "Zebra"',
    brand: Brand.YEEZY,
    price: 230,
    image: 'https://picsum.photos/seed/yeezy/800/800',
    gallery: ['https://picsum.photos/seed/yeezy-1/800/800'],
    description: 'Iconic Zebra pattern on a primeknit upper with responsive Boost cushioning.',
    releaseDate: '2024-11-20',
    isDrop: false,
    colorway: 'White/Black/Red',
    variants: [
      { size: '9', stock: 10 },
      { size: '10', stock: 5 }
    ],
    fitScore: 'Runs Small (Order 0.5 size up)',
    trending: true
  },
  {
    id: '3',
    name: 'Nike Dunk Low "Panda"',
    brand: Brand.NIKE,
    price: 110,
    image: 'https://picsum.photos/seed/dunk/800/800',
    gallery: ['https://picsum.photos/seed/dunk-1/800/800'],
    description: 'The versatile daily driver. Classic monochrome leather construction.',
    releaseDate: '2024-10-15',
    isDrop: false,
    colorway: 'White/Black',
    variants: [
      { size: '8', stock: 20 },
      { size: '12', stock: 15 }
    ],
    fitScore: 'True to Size',
    trending: true
  },
  {
    id: '4',
    name: 'New Balance 2002R "Protection Pack"',
    brand: Brand.NEW_BALANCE,
    price: 160,
    image: 'https://picsum.photos/seed/nb2002/800/800',
    gallery: ['https://picsum.photos/seed/nb2002-1/800/800'],
    description: 'Deconstructed aesthetics meet modern comfort. Rain Cloud colorway.',
    releaseDate: '2025-01-10',
    isDrop: true,
    colorway: 'Rain Cloud',
    variants: [
      { size: '10', stock: 4 }
    ],
    fitScore: 'True to Size',
    trending: false
  },
  {
    id: '5',
    name: 'Adidas Samba OG',
    brand: Brand.ADIDAS,
    price: 100,
    image: 'https://picsum.photos/seed/samba/800/800',
    gallery: ['https://picsum.photos/seed/samba-1/800/800'],
    description: 'The terrace classic reborn. Timeless style for every wardrobe.',
    releaseDate: '2024-05-10',
    isDrop: false,
    colorway: 'Core Black/Cloud White',
    variants: [
      { size: '9', stock: 30 },
      { size: '10', stock: 25 }
    ],
    fitScore: 'True to Size',
    trending: true
  }
];

export const MOCK_ORDERS: Order[] = [
  // Fix: Replaced customerName and address with first_name, last_name, street_address, city, and zip_code to match Order interface
  { id: 'ORD-001', first_name: 'John', last_name: 'Doe', email: 'john@example.com', date: '2024-10-25', status: OrderStatus.DELIVERED, total: 360, street_address: '123 Sneaker St', city: 'NY', zip_code: '10001', items: [] },
  { id: 'ORD-002', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', date: '2024-11-01', status: OrderStatus.SHIPPED, total: 110, street_address: '456 Hype Ave', city: 'LA', zip_code: '90001', items: [] },
  { id: 'ORD-003', first_name: 'Mike', last_name: 'Hype', email: 'mike@hype.com', date: '2024-11-05', status: OrderStatus.PROCESSING, total: 540, street_address: '789 Vault Blvd', city: 'CHI', zip_code: '60601', items: [] },
  { id: 'ORD-004', first_name: 'Sarah', last_name: 'Collector', email: 'sarah@sneakers.com', date: '2024-11-07', status: OrderStatus.PLACED, total: 230, street_address: '101 Grail Way', city: 'MIA', zip_code: '33101', items: [] }
];
