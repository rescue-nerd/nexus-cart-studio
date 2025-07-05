export type Product = {
  id: string;
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
  customerName: string;
  customerEmail: string;
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
    name: 'Singing Bowl',
    category: 'Handcrafted Art',
    price: 95.00,
    stock: 25,
    sku: 'NBB-SGB-005',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'A hand-hammered seven-metal singing bowl that produces resonant, healing sounds. Perfect for meditation, yoga, and mindfulness practices.'
  },
  {
    id: 'prod_006',
    name: 'Dhaka Topi',
    category: 'Traditional Apparel',
    price: 20.00,
    stock: 200,
    sku: 'NBB-DTP-006',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'The iconic Nepali cap, made from traditional Dhaka fabric with a distinctive pattern. A symbol of national pride and a stylish accessory.'
  },
  {
    id: 'prod_007',
    name: 'Timur Pepper',
    category: 'Nepali Tea & Spices',
    price: 15.00,
    stock: 80,
    sku: 'NBB-SPC-007',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'A unique Szechuan-like pepper from the Nepali Himalayas, known for its tingly, numbing sensation and grapefruit-like aroma.'
  },
  {
    id: 'prod_008',
    name: 'Rudraksha Mala',
    category: 'Handmade Jewelry',
    price: 45.00,
    stock: 60,
    sku: 'NBB-RML-008',
    imageUrl: 'https://placehold.co/400x400.png',
    description: 'A traditional prayer bead necklace made from sacred Rudraksha seeds, believed to offer peace, clarity, and protection to the wearer.'
  },
];

export const orders: Order[] = [
  { id: 'ORD-001', customerName: 'Rohan Shrestha', customerEmail: 'rohan.s@example.com', date: '2023-10-26', status: 'Delivered', total: 85.00 },
  { id: 'ORD-002', customerName: 'Anjali Lama', customerEmail: 'anjali.l@example.com', date: '2023-10-25', status: 'Delivered', total: 150.00 },
  { id: 'ORD-003', customerName: 'Bikram Thapa', customerEmail: 'bikram.t@example.com', date: '2023-10-25', status: 'Shipped', total: 25.00 },
  { id: 'ORD-004', customerName: 'Sunita Gurung', customerEmail: 'sunita.g@example.com', date: '2023-10-24', status: 'Processing', total: 60.00 },
  { id: 'ORD-005', customerName: 'Karma Sherpa', customerEmail: 'karma.s@example.com', date: '2023-10-23', status: 'Pending', total: 95.00 },
];

export const analytics = {
  totalSales: 4850.75,
  totalOrders: 124,
  totalProducts: products.length,
  salesData: [
    { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
  ]
};
