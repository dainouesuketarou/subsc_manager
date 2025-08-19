import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数の確認
console.log('Supabase client: URL exists:', !!supabaseUrl);
console.log('Supabase client: Anon key exists:', !!supabaseAnonKey);

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.trim() === '' ||
  supabaseAnonKey.trim() === ''
) {
  console.error('Supabase client: Missing or invalid environment variables');
  throw new Error('Invalid URL');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Supabase認証レスポンス用の型定義
export interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: SupabaseUser | null;
  session: unknown | null;
  error?: string;
}
