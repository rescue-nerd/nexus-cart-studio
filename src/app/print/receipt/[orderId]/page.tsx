'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { orders as allOrders, products as allProducts, stores, type Order, type Product } from '@/lib/placeholder-data';

// Helper to get nested keys like 'nav.dashboard'
const getNestedValue = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

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
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const lang = (searchParams.get('lang') || 'en') as 'en' | 'ne';

  const order = allOrders.find(o => o.id === orderId);

  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const module = await import(`@/locales/${lang}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Could not load translations for language: ${lang}`, error);
        try {
            const module = await import(`@/locales/en.json`);
            setTranslations(module.default);
        } catch (fallbackError) {
            console.error("Could not load fallback English translations.", fallbackError);
        }
      }
    };
    loadTranslations();
  }, [lang]);

  const t = useCallback((key: string, params?: { [key: string]: string | number }): string => {
    let translation = getNestedValue(translations, key);
    if (!translation) return key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation!.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [translations]);

  useEffect(() => {
    if (order && Object.keys(translations).length > 0) {
      setTimeout(() => {
        window.print();
      }, 500); 
    }
  }, [order, translations]);

  if (!order || Object.keys(translations).length === 0) {
    return <div>Loading receipt...</div>;
  }

  const store = stores.find(s => s.id === order.storeId);
  const orderProducts = getOrderProducts(order.id);

  return (
    <div style={{ width: '80mm', fontFamily: 'monospace', fontSize: '10px', padding: '5mm', color: '#000' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '14px', margin: '0 0 5px 0', fontWeight: 'bold' }}>{store?.name}</h1>
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
          {orderProducts.map(({ product, quantity }) => (
            <tr key={product.id}>
              <td style={{ padding: '2px 0' }}>{product.name}</td>
              <td style={{ textAlign: 'center', padding: '2px 0' }}>{quantity}</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{t('print.currencySymbol')}{product.price.toFixed(2)}</td>
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
