import { NextResponse } from 'next/server';
import { fetchAccurateAPI } from '@/services/accurate';

export async function GET() {
  try {
    const data = await fetchAccurateAPI('/item/list.do');
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memanggil API Accurate';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
