import { createAdminClient } from "@/lib/supabase/admin";

// Supabase無料プランの自動休止（1週間非アクセス）を防ぐための定期ping。
// 匿名訪問者はSupabaseに接続しない構成のため、アクセス数に関わらずここで叩く。
// Vercel Cron から毎日1回呼ばれる（vercel.json の crons 参照）。
export async function GET(request: Request) {
  // CRON_SECRET が設定されていれば、Vercel Cron 以外からの呼び出しを拒否する
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
