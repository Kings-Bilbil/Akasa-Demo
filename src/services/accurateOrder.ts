import { fetchAccurateAPI } from './accurate';

export async function createSalesOrder(branchId: number, items: {accurate_item_id: string, qty: number, price: number}[]) {
  const payload = {
    branchId: branchId,
    customerNo: 'C.00001', // ID default pelanggan (Budi Vape)
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
    customerNo: 'C.00001', // ID default pelanggan (Budi Vape)
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
export async function createSalesReceipt(branchId: number, invoiceId: number, totalAmount: number) {
  const payload = {
    branchId: branchId,
    customerNo: 'C.00001',
    bankNo: '110104', // Akun Kas Midtrans sesuai setup di Accurate
    chequeAmount: totalAmount,
    detailItem: [
      {
        invoiceId: invoiceId,
        paymentAmount: totalAmount
      }
    ]
  };
  return await fetchAccurateAPI('/sales-receipt/save.do', 'POST', payload);
}
