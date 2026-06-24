import { createClient } from "@supabase/supabase-js";

// Service Roleキーを使うSupabaseクライアント。
// RLSをバイパスするため、Webhookなど「ログインユーザーがいない」場面でのみ使う。
// サーバー専用（このキーは絶対にクライアントへ露出させない）。
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
