
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { getReceiptData } from './actions';
import type { Order, Store } from '@/lib/types';

export default function ReceiptPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { t } = useTranslation();

  const [order, setOrder] = useState<Order | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReceiptData() {
      if (!orderId) return;
      setIsLoading(true);
      const { order: fetchedOrder, store: fetchedStore } = await getReceiptData(orderId);
      setOrder(fetchedOrder);
      setStore(fetchedStore);
      setIsLoading(false);
    }
    fetchReceiptData();
  }, [orderId]);

  useEffect(() => {
    if (order && store && !isLoading) {
      setTimeout(() => {
        window.print();
      }, 500); 
    }
  }, [order, store, isLoading]);

  if (isLoading || !order || !store) {
    return <div>Loading receipt...</div>;
  }

  return (
    <div style={{ width: '80mm', fontFamily: 'monospace', fontSize: '10px', padding: '5mm', color: '#000' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '14px', margin: '0 0 5px 0', fontWeight: 'bold' }}>{store.name}</h1>
        <p style={{ margin: '2px 0' }}>{t('print.receiptForOrder', { orderId: order.id })}</p>
        <p style={{ margin: '2px 0' }}>{new Date(order.date).toLocaleString()}</p>
      </div>
      
      <hr style={{ border: 0, borderTop: '1px dashed black', margin: '10px 0' }} />

      <div style={{ marginBottom: '10px' }}>
        <p><strong>{t('print.customer')}:</strong> {order.customerName}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '2px 0', borderBottom: '1px solid black' }}>{t('print.item')}</th>
            <th style={{ textAlign: 'center', padding: '2px 0', borderBottom: '1px solid black' }}>{t('print.qty')}</th>
            <th style={{ textAlign: 'right', padding: '2px 0', borderBottom: '1px solid black' }}>{t('print.price')}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.productId}>
              <td style={{ padding: '2px 0' }}>{item.productName}</td>
              <td style={{ textAlign: 'center', padding: '2px 0' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{t('print.currencySymbol')}{item.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ border: 0, borderTop: '1px dashed black', margin: '10px 0' }} />

      <div style={{ textAlign: 'right' }}>
        <p style={{ margin: '2px 0', fontWeight: 'bold' }}><strong>{t('print.total')}:</strong> {t('print.currencySymbol')}{order.total.toFixed(2)}</p>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>{t('print.thankYou')}</p>
      </div>
    </div>
  );
}
