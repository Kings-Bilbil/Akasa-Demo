import { NextResponse } from 'next/server';
import { fetchAccurateAPI } from '@/services/accurate';

export async function GET() {
  try {
    const data = await fetchAccurateAPI('/item/list.do');
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
