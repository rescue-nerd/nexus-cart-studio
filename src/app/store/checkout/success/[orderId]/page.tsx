import { notFound } from 'next/navigation';

export default function OrderSuccessPage() {
  // This page is no longer used as the "Order on WhatsApp" flow
  // does not create an order ID in the system.
  notFound();
}
