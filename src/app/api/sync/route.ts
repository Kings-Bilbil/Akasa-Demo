import { NextResponse } from 'next/server';
import { fetchAccurateAPI } from '@/services/accurate';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
  try {
    // 0. Keamanan: Hanya admin@azuraya.com yang diizinkan menjalankan sinkronisasi
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || user.email !== 'admin@azuraya.com') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya admin yang dapat menjalankan sinkronisasi.' },
        { status: 403 }
      );
    }

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

    // 3. Poin 25 FIX: Ambil SELURUH data barang dari Accurate dengan paginasi loop
    // (mengantisipasi jika katalog produk memiliki lebih dari 100 item di Accurate)
    type AccurateItem = {
      id: number;
      no: string;
      name?: string;
      modifierName?: string;
      unitPrice?: number;
      itemCategory?: { name?: string };
    };

    const allItems: AccurateItem[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const pageResponse = await fetchAccurateAPI(
        `/item/list.do?fields=id,no,name,unitPrice,itemCategory&sp.page=${page}&sp.pageSize=100`
      );
      const pageList = (pageResponse?.d as AccurateItem[]) || [];
      allItems.push(...pageList);

      const pageCount = pageResponse?.sp?.pageCount || 1;
      if (page >= pageCount || pageList.length === 0) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // 4. Simpan barang ke Supabase (Upsert)
    let syncedItemsCount = 0;
    for (const item of allItems) {
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
      allItems.map((i) => String(i?.no ?? '')).filter(Boolean)
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
          if (usedBranchSet.has(b.id)) continue;
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
