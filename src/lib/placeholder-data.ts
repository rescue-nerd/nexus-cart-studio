export type Store = {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  productCount: number;
  orderCount: number;
  domain: string;
};

export const stores: Store[] = [
  {
    id: 'store_001',
    name: 'My Nepali Bazaar',
    ownerName: 'Rohan Shrestha',
    ownerEmail: 'rohan.s@example.com',
    status: 'Active',
    productCount: 4,
    orderCount: 3,
    domain: 'bazaar.nexuscart.com',
  },
  {
    id: 'store_002',
    name: 'Himalayan Crafts',
    ownerName: 'Anjali Lama',
    ownerEmail: 'anjali.l@example.com',
    status: 'Active',
    productCount: 4,
    orderCount: 2,
    domain: 'himalayan.nexuscart.com',
  },
  {
    id: 'store_003',
    name: 'Kathmandu Spices',
    ownerName: 'Bikram Thapa',
    ownerEmail: 'bikram.t@example.com',
    status: 'Inactive',
    productCount: 25,
    orderCount: 10,
    domain: 'spices.nexuscart.com',
  },
    {
    id: 'store_004',
    name: 'Gurung Garments',
    ownerName: 'Sunita Gurung',
    ownerEmail: 'sunita.g@example.com',
    status: 'Suspended',
    productCount: 50,
    orderCount: 120,
    domain: 'gurung.nexuscart.com',
  },
];

export type Product = {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  imageUrl: string;
  description: string;
};

export type Order = {
  id: string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
};

export const categories = [
  { id: 'hancrafted-art', name: 'Handcrafted Art' },
  { id: 'traditional-apparel', name: 'Traditional Apparel' },
  { id: 'nepali-tea-spices', name: 'Nepali Tea & Spices' },
  { id: 'handmade-jewelry', name: 'Handmade Jewelry' },
];

export const products: Product[] = [
  {
    id: 'prod_001',
    storeId: 'store_001',
    name: 'Hand-painted Thangka',
    category: 'Handcrafted Art',
    price: 150.00,
    stock: 15,
    sku: 'NBB-TKA-001',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'A beautiful, intricate Thangka painting depicting traditional Buddhist motifs, hand-painted by skilled artisans in the Kathmandu Valley.'
  },
  {
    id: 'prod_002',
    storeId: 'store_001',
    name: 'Pashmina Shawl',
    category: 'Traditional Apparel',
    price: 85.00,
    stock: 50,
    sku: 'NBB-PWL-002',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Luxuriously soft and warm, this authentic Pashmina shawl is handwoven from the finest Himalayan goat wool, perfect for any season.'
  },
  {
    id: 'prod_003',
    storeId: 'store_001',
    name: 'Himalayan Black Tea',
    category: 'Nepali Tea & Spices',
    price: 25.00,
    stock: 120,
    sku: 'NBB-TEA-003',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'An aromatic and full-bodied black tea from the high-altitude gardens of Ilam, Nepal. Offers a rich, malty flavor with a smooth finish.'
  },
  {
    id: 'prod_004',
    storeId: 'store_001',
    name: 'Silver Filigree Earrings',
    category: 'Handmade Jewelry',
    price: 60.00,
    stock: 30,
    sku: 'NBB-JWL-004',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'Exquisite sterling silver earrings featuring traditional Nepali filigree (tarkashi) work, showcasing delicate and timeless craftsmanship.'
  },
  {
    id: 'prod_005',
    storeId: 'store_002',
    name: 'Singing Bowl',
    category: 'Handcrafted Art',
    price: 95.00,
    stock: 25,
    sku: 'HC-SGB-005',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'A hand-hammered seven-metal singing bowl that produces resonant, healing sounds. Perfect for meditation, yoga, and mindfulness practices.'
  },
  {
    id: 'prod_006',
    storeId: 'store_002',
    name: 'Dhaka Topi',
    category: 'Traditional Apparel',
    price: 20.00,
    stock: 200,
    sku: 'HC-DTP-006',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'The iconic Nepali cap, made from traditional Dhaka fabric with a distinctive pattern. A symbol of national pride and a stylish accessory.'
  },
  {
    id: 'prod_007',
    storeId: 'store_002',
    name: 'Timur Pepper',
    category: 'Nepali Tea & Spices',
    price: 15.00,
    stock: 80,
    sku: 'HC-SPC-007',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'A unique Szechuan-like pepper from the Nepali Himalayas, known for its tingly, numbing sensation and grapefruit-like aroma.'
  },
  {
    id: 'prod_008',
    storeId: 'store_002',
    name: 'Rudraksha Mala',
    category: 'Handmade Jewelry',
    price: 45.00,
    stock: 60,
    sku: 'HC-RML-008',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'A traditional prayer bead necklace made from sacred Rudraksha seeds, believed to offer peace, clarity, and protection to the wearer.'
  },
];

export const orders: Order[] = [
  { id: 'ORD-001', storeId: 'store_001', customerName: 'Rohan Shrestha', customerEmail: 'rohan.s@example.com', customerPhone: '+9779800000001', date: '2023-10-26', status: 'Delivered', total: 85.00 },
  { id: 'ORD-002', storeId: 'store_002', customerName: 'Anjali Lama', customerEmail: 'anjali.l@example.com', customerPhone: '+9779800000002', date: '2023-10-25', status: 'Delivered', total: 150.00 },
  { id: 'ORD-003', storeId: 'store_001', customerName: 'Bikram Thapa', customerEmail: 'bikram.t@example.com', customerPhone: '+9779800000003', date: '2023-10-25', status: 'Shipped', total: 25.00 },
  { id: 'ORD-004', storeId: 'store_002', customerName: 'Sunita Gurung', customerEmail: 'sunita.g@example.com', customerPhone: '+9779800000004', date: '2023-10-24', status: 'Processing', total: 60.00 },
  { id: 'ORD-005', storeId: 'store_001', customerName: 'Karma Sherpa', customerEmail: 'karma.s@example.com', customerPhone: '+9779800000005', date: '2023-10-23', status: 'Pending', total: 95.00 },
];

export const storeConfig = {
  sellerWhatsAppNumber: '+9779860000000', // Replace with the actual seller's WhatsApp number
  name: 'My Nepali Bazaar',
};

export const analytics = {
  totalSales: 4850.75,
  totalOrders: 124,
  totalProducts: products.length,
  salesData: [
    { name: 'Jan', total: 4231 },
    { name: 'Feb', total: 3456 },
    { name: 'Mar', total: 4890 },
    { name: 'Apr', total: 3789 },
    { name: 'May', total: 5123 },
    { name: 'Jun', total: 4567 },
    { name: 'Jul', total: 4987 },
    { name: 'Aug', total: 5342 },
    { name: 'Sep', total: 4890 },
    { name: 'Oct', total: 5567 },
    { name: 'Nov', total: 6123 },
    { name: 'Dec', total: 5890 },
  ]
};
