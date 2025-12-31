
import { Brand, Sneaker, OrderStatus, Order } from './types.ts';

export const MOCK_SNEAKERS: Sneaker[] = [
  {
    id: '1',
    name: 'Air Jordan 1 Retro High OG "Chicago"',
    brand: Brand.JORDAN,
    price: 180,
    original_price: 180,
    image: 'https://picsum.photos/seed/jordan1/800/800',
    gallery: [
      'https://picsum.photos/seed/jordan1-1/800/800',
      'https://picsum.photos/seed/jordan1-2/800/800',
      'https://picsum.photos/seed/jordan1-3/800/800'
    ],
    description: 'The shoe that started it all. The Air Jordan 1 High "Chicago" returns in its original glory.',
    release_date: '2024-12-01',
    is_drop: true,
    colorway: 'Red/White/Black',
    variants: [
      { size: '8', stock: 5 },
      { size: '9', stock: 2 },
      { size: '10', stock: 12 },
      { size: '11', stock: 0 }
    ],
    fit_score: 'True to Size',
    trending: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Yeezy Boost 350 V2 "Zebra"',
    brand: Brand.YEEZY,
    price: 230,
    image: 'https://picsum.photos/seed/yeezy/800/800',
    gallery: ['https://picsum.photos/seed/yeezy-1/800/800'],
    description: 'Iconic Zebra pattern on a primeknit upper with responsive Boost cushioning.',
    release_date: '2024-11-20',
    is_drop: false,
    colorway: 'White/Black/Red',
    variants: [
      { size: '9', stock: 10 },
      { size: '10', stock: 5 }
    ],
    fit_score: 'Runs Small (Order 0.5 size up)',
    trending: true,
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Nike Dunk Low "Panda"',
    brand: Brand.NIKE,
    price: 110,
    image: 'https://picsum.photos/seed/dunk/800/800',
    gallery: ['https://picsum.photos/seed/dunk-1/800/800'],
    description: 'The versatile daily driver. Classic monochrome leather construction.',
    release_date: '2024-10-15',
    is_drop: false,
    colorway: 'White/Black',
    variants: [
      { size: '8', stock: 20 },
      { size: '12', stock: 15 }
    ],
    fit_score: 'True to Size',
    trending: true,
    created_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    name: 'New Balance 2002R "Protection Pack"',
    brand: Brand.NEW_BALANCE,
    price: 160,
    image: 'https://picsum.photos/seed/nb2002/800/800',
    gallery: ['https://picsum.photos/seed/nb2002-1/800/800'],
    description: 'Deconstructed aesthetics meet modern comfort. Rain Cloud colorway.',
    release_date: '2025-01-10',
    is_drop: true,
    colorway: 'Rain Cloud',
    variants: [
      { size: '10', stock: 4 }
    ],
    fit_score: 'True to Size',
    trending: false,
    created_at: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    name: 'Adidas Samba OG',
    brand: Brand.ADIDAS,
    price: 100,
    image: 'https://picsum.photos/seed/samba/800/800',
    gallery: ['https://picsum.photos/seed/samba-1/800/800'],
    description: 'The terrace classic reborn. Timeless style for every wardrobe.',
    release_date: '2024-05-10',
    is_drop: false,
    colorway: 'Core Black/Cloud White',
    variants: [
      { size: '9', stock: 30 },
      { size: '10', stock: 25 }
    ],
    fit_score: 'True to Size',
    trending: true,
    created_at: '2024-01-05T00:00:00Z'
  }
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', first_name: 'John', last_name: 'Doe', email: 'john@example.com', created_at: '2024-10-25', status: OrderStatus.DELIVERED, total: 360, street_address: '123 Sneaker St', city: 'NY', zip_code: '10001', items: [], timeline: [] },
  { id: 'ORD-002', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', created_at: '2024-11-01', status: OrderStatus.SHIPPED, total: 110, street_address: '456 Hype Ave', city: 'LA', zip_code: '90001', items: [], timeline: [] },
  { id: 'ORD-003', first_name: 'Mike', last_name: 'Hype', email: 'mike@hype.com', created_at: '2024-11-05', status: OrderStatus.PROCESSING, total: 540, street_address: '789 Vault Blvd', city: 'CHI', zip_code: '60601', items: [], timeline: [] },
  { id: 'ORD-004', first_name: 'Sarah', last_name: 'Collector', email: 'sarah@sneakers.com', created_at: '2024-11-07', status: OrderStatus.PLACED, total: 230, street_address: '101 Grail Way', city: 'MIA', zip_code: '33101', items: [], timeline: [] }
];
