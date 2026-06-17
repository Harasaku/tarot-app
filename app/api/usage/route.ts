import { createClient } from "@/lib/supabase/server";

// 日本時間(UTC+9)の日付文字列を返す
function getJSTDate(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
}

// 今日の利用回数とロールを返す
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ count: 0, role: "free" });
  }

  const today = getJSTDate();
  const [{ data: profile }, { data: usage }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase
      .from("daily_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .single(),
  ]);

  return Response.json({
    count: usage?.count ?? 0,
    role: profile?.role ?? "free",
  });
}

// 利用回数をインクリメント
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = getJSTDate();
  const { data, error } = await supabase.rpc("increment_usage", {
    p_user_id: user.id,
    p_date: today,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ count: data ?? 1 });
}
