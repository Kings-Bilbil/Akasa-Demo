import { createClient } from '@supabase/supabase-js'

// Klien ini menggunakan Service Role Key untuk melewati (bypass) Row Level Security (RLS)
// HANYA BOLEH DIGUNAKAN DI SERVER (API Routes / Server Actions), jangan pernah dikirim ke browser!
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
