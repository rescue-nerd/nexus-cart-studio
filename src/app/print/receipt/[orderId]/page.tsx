'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { orders as allOrders, products as allProducts, stores, type Order, type Product } from '@/lib/placeholder-data';

// Dummy function to get products for an order
const getOrderProducts = (orderId: string): { product: Product, quantity: number }[] => {
    // This is placeholder logic. In a real app, this would come from the order data itself.
    if (orderId.endsWith('1')) return [{ product: allProducts.find(p => p.id === 'prod_002')!, quantity: 1 }];
    if (orderId.endsWith('2')) return [{ product: allProducts.find(p => p.id === 'prod_001')!, quantity: 1 }];
    if (orderId.endsWith('3')) return [{ product: allProducts.find(p => p.id === 'prod_003')!, quantity: 2 }];
    if (orderId.endsWith('4')) return [{ product: allProducts.find(p => p.id === 'prod_004')!, quantity: 1 }];
    return [{ product: allProducts.find(p => p.id === 'prod_005')!, quantity: 1 }];
};

export default function ReceiptPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const order = allOrders.find(o => o.id === orderId);

  useEffect(() => {
    if (order) {
      setTimeout(() => {
        window.print();
        // You might want to enable window.close() in a production environment
        // after confirming the print dialog has been handled.
        // window.close(); 
      }, 500); // Small delay to ensure content is fully rendered before printing
    }
  }, [order]);

  if (!order) {
    return <div>Order not found. Check the order ID and try again.</div>;
  }

  const store = stores.find(s => s.id === order.storeId);
  const orderProducts = getOrderProducts(order.id);

  return (
    <div style={{ width: '80mm', fontFamily: 'monospace', fontSize: '10px', padding: '5mm', color: '#000' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '14px', margin: '0 0 5px 0', fontWeight: 'bold' }}>{store?.name}</h1>
        <p style={{ margin: '2px 0' }}>Receipt for Order #{order.id}</p>
        <p style={{ margin: '2px 0' }}>{new Date(order.date).toLocaleString()}</p>
      </div>
      
      <hr style={{ border: 0, borderTop: '1px dashed black', margin: '10px 0' }} />

      <div style={{ marginBottom: '10px' }}>
        <p><strong>Customer:</strong> {order.customerName}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '2px 0', borderBottom: '1px solid black' }}>Item</th>
            <th style={{ textAlign: 'center', padding: '2px 0', borderBottom: '1px solid black' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '2px 0', borderBottom: '1px solid black' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {orderProducts.map(({ product, quantity }) => (
            <tr key={product.id}>
              <td style={{ padding: '2px 0' }}>{product.name}</td>
              <td style={{ textAlign: 'center', padding: '2px 0' }}>{quantity}</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>Rs{product.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ border: 0, borderTop: '1px dashed black', margin: '10px 0' }} />

      <div style={{ textAlign: 'right' }}>
        <p style={{ margin: '2px 0', fontWeight: 'bold' }}><strong>Total:</strong> Rs{order.total.toFixed(2)}</p>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Thank you for your purchase!</p>
      </div>
    </div>
  );
}
