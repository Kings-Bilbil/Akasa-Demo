import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (email.toLowerCase() === 'admin@azuraya.com') {
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent("Email ini tidak dapat didaftarkan melalui form web.")}`, request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  
  if (error) {
    console.error("Register error:", error);
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(error.message)}`, request.url));
  }
  
  if (data.user) {
    const admin = createAdminClient();
    await admin.from('customers').insert({
      id: data.user.id,
      full_name: name,
      email: email,
    });
  }
  
  return NextResponse.redirect(new URL('/login', request.url));
}
