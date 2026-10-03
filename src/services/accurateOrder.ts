import { fetchAccurateAPI } from './accurate';

// Dibuat konfigurabel via env agar tidak menumpuk di satu pelanggan demo.
// Fallback tetap ke nilai lama supaya demo yang sudah jalan tidak rusak.
const ACCURATE_CUSTOMER_NO = process.env.ACCURATE_CUSTOMER_NO || 'C.00001'; // default lama: Budi Vape
const ACCURATE_BANK_NO = process.env.ACCURATE_BANK_NO || '110104'; // default lama: Kas Midtrans

export async function createSalesOrder(branchId: number, items: {accurate_item_id: string, qty: number, price: number}[]) {
  const payload = {
    branchId: branchId,
    customerNo: ACCURATE_CUSTOMER_NO,
    detailItem: items.map(i => ({
      itemNo: i.accurate_item_id,
      quantity: i.qty,
      unitPrice: i.price
    }))
  };
  return await fetchAccurateAPI('/sales-order/save.do', 'POST', payload);
}

// OPSI B: Buat Faktur Penjualan langsung (Memotong stok fisik gudang)
export async function createSalesInvoice(branchId: number, items: {accurate_item_id: string, qty: number, price: number, warehouseId?: number}[]) {
  const payload = {
    branchId: branchId,
    customerNo: ACCURATE_CUSTOMER_NO,
    detailItem: items.map(i => ({
      itemNo: i.accurate_item_id,
      quantity: i.qty,
      unitPrice: i.price,
      warehouseId: i.warehouseId
    }))
  };
  return await fetchAccurateAPI('/sales-invoice/save.do', 'POST', payload);
}

// OPSI B: Buat Penerimaan Penjualan (Melunasi Faktur Penjualan)
// CATATAN: field detail HARUS bernama `detailInvoice` (bukan `detailItem`).
// Terbukti via uji langsung 2026-10-03: `detailItem` ditolak Accurate dengan
// "Detail dari transaksi belum diisi!", sedangkan `detailInvoice` sukses
// (receipt 110104.2026.10.00001 untuk faktur 650).
export async function createSalesReceipt(branchId: number, invoiceId: number, totalAmount: number) {
  const payload = {
    branchId: branchId,
    customerNo: ACCURATE_CUSTOMER_NO,
    bankNo: ACCURATE_BANK_NO, // Akun Kas Midtrans sesuai setup di Accurate
    chequeAmount: totalAmount,
    detailInvoice: [
      {
        invoiceId: invoiceId,
        paymentAmount: totalAmount
      }
    ]
  };
  return await fetchAccurateAPI('/sales-receipt/save.do', 'POST', payload);
}
