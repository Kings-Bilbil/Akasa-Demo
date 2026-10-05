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

    // 3. Ambil data barang dari Accurate (INV) beserta kategorinya
    const itemsResponse = await fetchAccurateAPI('/item/list.do?fields=id,no,name,unitPrice,itemCategory');
    const items = itemsResponse.d || [];

    // 4. Simpan barang ke Supabase (Upsert)
    let syncedItemsCount = 0;
    for (const item of items) {
      const categoryName = item.itemCategory?.name || 'Uncategorized';

      const { error } = await supabase.from('products_cache').upsert({
        accurate_item_id: item.no,
        name: item.name || item.modifierName,
        price: item.unitPrice || 0,
        category: categoryName,
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'accurate_item_id' });

      if (error) {
        console.error("Error upsert item:", error);
      } else {
        syncedItemsCount++;
      }
    }

    // 5. Hapus produk yang sudah tidak ada di Accurate (mis. dihapus dari Accurate).
    // Hanya dijalankan kalau daftar Accurate tidak kosong (pengaman agar tidak
    // menghapus massal saat API bermasalah). Produk yang sudah punya riwayat
    // pesanan (order_items) dipertahankan agar histori order tidak rusak.
    let deletedProductsCount = 0;
    let keptProductsCount = 0;
    const accurateItemNos = new Set(
      items.map((i: { no?: unknown }) => String(i?.no ?? '')).filter(Boolean)
    );
    if (accurateItemNos.size > 0) {
      const { data: existingProducts } = await supabase
        .from('products_cache')
        .select('id, accurate_item_id');
      const stale = (existingProducts || []).filter(
        (p: { id: string; accurate_item_id: string }) => !accurateItemNos.has(String(p.accurate_item_id))
      );
      if (stale.length > 0) {
        const staleIds = stale.map((p: { id: string }) => p.id);
        const { data: usedItems } = await supabase
          .from('order_items')
          .select('product_id')
          .in('product_id', staleIds);
        const usedSet = new Set((usedItems || []).map((r: { product_id: string }) => r.product_id));
        const deletable = stale.filter((p: { id: string }) => !usedSet.has(p.id));
        keptProductsCount = stale.length - deletable.length;

        for (const p of deletable) {
          // Bersihkan file gambar produk dari Storage (best-effort, gagal = abaikan)
          try {
            const { data: files } = await supabase.storage
              .from('product-images')
              .list(p.id);
            if (files && files.length > 0) {
              await supabase.storage
                .from('product-images')
                .remove(files.map((f: { name: string }) => `${p.id}/${f.name}`));
            }
          } catch (e) {
            console.error('Gagal membersihkan gambar produk:', p.id, e);
          }
          const { error: delError } = await supabase
            .from('products_cache')
            .delete()
            .eq('id', p.id);
          if (delError) {
            console.error('Gagal menghapus produk basi:', p.accurate_item_id, delError);
          } else {
            deletedProductsCount++;
          }
        }
      }
    }

    // 6. Hapus cabang yang sudah tidak ada di Accurate.
    // Cabang yang sudah dipakai order dipertahankan agar histori tidak rusak.
    let deletedBranchesCount = 0;
    const accurateBranchIds = new Set(
      branches.map((b: { id?: unknown }) => String(b?.id ?? '')).filter(Boolean)
    );
    if (accurateBranchIds.size > 0) {
      const { data: existingBranches } = await supabase
        .from('branches_cache')
        .select('id, accurate_branch_id');
      const staleBranches = (existingBranches || []).filter(
        (b: { id: string; accurate_branch_id: string }) => !accurateBranchIds.has(String(b.accurate_branch_id))
      );
      if (staleBranches.length > 0) {
        const staleBranchIds = staleBranches.map((b: { id: string }) => b.id);
        const { data: usedOrders } = await supabase
          .from('orders')
          .select('branch_id')
          .in('branch_id', staleBranchIds);
        const usedBranchSet = new Set((usedOrders || []).map((r: { branch_id: string }) => r.branch_id));
        for (const b of staleBranches) {
          if (usedBranchSet.has(b.id)) continue; // dipakai order -> pertahankan
          const { error: delError } = await supabase
            .from('branches_cache')
            .delete()
            .eq('id', b.id);
          if (delError) {
            console.error('Gagal menghapus cabang basi:', b.accurate_branch_id, delError);
          } else {
            deletedBranchesCount++;
          }
        }
      }
    }

    const extras: string[] = [];
    if (deletedProductsCount > 0) extras.push(`${deletedProductsCount} produk dihapus (sudah tidak ada di Accurate)`);
    if (deletedBranchesCount > 0) extras.push(`${deletedBranchesCount} cabang dihapus (sudah tidak ada di Accurate)`);
    if (keptProductsCount > 0) extras.push(`${keptProductsCount} produk lama dipertahankan karena memiliki riwayat pesanan`);

    return NextResponse.json({
      success: true,
      message: `Berhasil sinkronisasi ${branches.length} cabang dan ${syncedItemsCount} barang.` + (extras.length > 0 ? ' ' + extras.join('. ') + '.' : '')
    });

  } catch (error: unknown) {
    console.error("Sync Error:", error);
    const message = error instanceof Error ? error.message : 'Gagal sinkronisasi';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
