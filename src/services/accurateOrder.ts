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
