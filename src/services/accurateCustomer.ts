import { fetchAccurateAPI } from './accurate';

// Pelanggan generik lama ("Akasa"). Dipakai sebagai fallback kalau pembuatan
// customer per-user gagal, supaya pesanan yang sudah dibayar tetap terbit
// fakturnya dan tidak menggagalkan fulfillment.
export const FALLBACK_CUSTOMER_NO = process.env.ACCURATE_CUSTOMER_NO || 'C.00001';

type AdminClient = ReturnType<typeof import('@/utils/supabase/admin').createAdminClient>;

type CustomerRow = {
  full_name?: string | null;
  email?: string | null;
  accurate_customer_id?: string | null;
};

/**
 * Pastikan akun demo punya pasangan customer di Accurate, lalu kembalikan
 * nomor customer-nya (kolom `no`, mis. "C.00002").
 *
 * - Kalau `customers.accurate_customer_id` sudah ada -> langsung dipakai
 *   (satu akun demo = satu customer Accurate, tidak dibuat berulang).
 * - Kalau belum -> buat via `/customer/save.do` dengan nama + email akun,
 *   simpan nomornya ke `customers.accurate_customer_id`.
 * - Kalau gagal total -> kembalikan FALLBACK_CUSTOMER_NO ("Akasa") agar
 *   faktur tetap bisa dibuat.
 */
export async function ensureAccurateCustomer(
  supabase: AdminClient,
  customerId: string
): Promise<string> {
  const { data } = await supabase
    .from('customers')
    .select('full_name, email, accurate_customer_id')
    .eq('id', customerId)
    .single();

  const row = data as unknown as CustomerRow | null;
  if (row?.accurate_customer_id) return row.accurate_customer_id;

  const displayName =
    (row?.full_name || '').trim() ||
    (row?.email || '').split('@')[0] ||
    'Pelanggan Azuraya';
  const email = (row?.email || '').trim();

  try {
    const saveRes = await fetchAccurateAPI('/customer/save.do', 'POST', {
      name: displayName,
      ...(email ? { email } : {}),
    });

    let customerNo: string | undefined =
      saveRes?.r?.no || saveRes?.r?.customerNo;

    // Kalau respons save tidak membawa nomor, ambil detail berdasarkan id hasil save.
    const newId = saveRes?.r?.id;
    if (!customerNo && newId !== undefined && newId !== null) {
      try {
        const detailRes = await fetchAccurateAPI(
          `/customer/detail.do?id=${newId}`
        );
        const d = detailRes?.d as { no?: string; customerNo?: string } | undefined;
        customerNo = d?.no || d?.customerNo || detailRes?.r?.no;
      } catch {
        // abaikan, ditangani fallback di bawah
      }
    }

    if (!customerNo) throw new Error('Accurate tidak mengembalikan nomor pelanggan');

    await supabase
      .from('customers')
      .update({ accurate_customer_id: customerNo })
      .eq('id', customerId);

    console.log(`[Accurate] Customer baru "${displayName}": ${customerNo}`);
    return customerNo;
  } catch (err) {
    console.error(
      '[Accurate] Gagal membuat customer per-user, pakai pelanggan generik:',
      err
    );
    return FALLBACK_CUSTOMER_NO;
  }
}
