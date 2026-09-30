import { NextResponse } from 'next/server';
import { fetchAccurateAPI } from '@/services/accurate';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST() {
  try {
    const supabase = createAdminClient();

    // 1. Ambil data cabang dari Accurate
    const branchesResponse = await fetchAccurateAPI('/branch/list.do?fields=id,name');
    const branches = branchesResponse.d || [];

    // 2. Simpan cabang ke Supabase (Upsert)
    for (const branch of branches) {
      const { error } = await supabase.from('branches_cache').upsert({
        accurate_branch_id: branch.id.toString(),
        name: branch.name,
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'accurate_branch_id' });
      
      if (error) console.error("Error upsert branch:", error);
    }

    // 3. Ambil data barang dari Accurate (INV)
    // Tambahkan field yang berisi data gambar, misalnya 'upcNo', 'charField1', atau jika ada default field dari attachment seperti 'imageUrl'.
    // Sementara kita tambahkan 'upcNo' dan 'charField1' sebagai contoh jika URL disimpan di custom field, 
    // atau jika Accurate mengembalikan URL gambar secara langsung di field tertentu.
    const itemsResponse = await fetchAccurateAPI('/item/list.do?fields=id,no,name,unitPrice,upcNo,charField1');
    const items = itemsResponse.d || [];

    // 4. Simpan barang ke Supabase (Upsert)
    let syncedItemsCount = 0;
    for (const item of items) {
      // Ambil URL gambar dari response Accurate. 
      // CATATAN: Field pasti dari Accurate API untuk attachment bisa bervariasi. 
      // Kita perlu mengecek JSON response aslinya untuk mengetahui nama field yang tepat.
      const imageUrl = item.imageUrl || item.upcNo || item.charField1 || null;

      // Kita asumsikan semua barang yang ditarik adalah barang yang akan dijual (bisa difilter lebih lanjut jika perlu)
      const { error } = await supabase.from('products_cache').upsert({
        accurate_item_id: item.no, // Gunakan Nomor Barang (misal: VP001) bukan ID database
        name: item.name || item.modifierName,
        price: item.unitPrice || 0,
        image_url: imageUrl, // <-- Menambahkan kolom image_url
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'accurate_item_id' });
      
      if (error) {
        console.error("Error upsert item:", error);
      } else {
        syncedItemsCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil sinkronisasi ${branches.length} cabang dan ${syncedItemsCount} barang.` 
    });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
