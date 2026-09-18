'use client';
import { useEffect, useState } from 'react';
import Popup from './Popup';

export default function MidtransSuccessHandler({ orderId }: { orderId: string }) {
  const [popupData, setPopupData] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetch('/api/checkout/success', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    }).then(res => {
      if (res.ok) {
        setPopupData({ message: "Sales Order berhasil terbuat di Accurate!", type: 'success' });
      }
    });
  }, [orderId]);

  if (!popupData) return null;
  return <Popup message={popupData.message} type={popupData.type} onClose={() => setPopupData(null)} />;
}
