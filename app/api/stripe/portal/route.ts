import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

// 解約・支払い方法変更のための Stripe Customer Portal セッションを作成する
export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "決済が設定されていません" }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const customerId = profile?.stripe_customer_id as string | null | undefined;
  if (!customerId) {
    return Response.json({ error: "顧客情報が見つかりません" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl}/pricing`,
  });

  return Response.json({ url: session.url });
}
