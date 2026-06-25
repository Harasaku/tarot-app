import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

// 有料プラン停止に伴い、新規の有料会員登録（決済）を受け付けない。
const CHECKOUT_ENABLED = false;

// 有料会員登録のための Stripe Checkout セッションを作成する
export async function POST() {
  if (!CHECKOUT_ENABLED) {
    return Response.json({ error: "現在、新規の有料会員登録は受け付けておりません" }, { status: 403 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return Response.json({ error: "決済が設定されていません" }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // 既存のプロフィール（role と Stripe顧客ID）を取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.role === "paid") {
    return Response.json({ error: "すでに有料会員です" }, { status: 400 });
  }

  const stripe = getStripe();

  // Stripe顧客がまだ無ければ作成し、DBに保存する
  let customerId = profile?.stripe_customer_id as string | null | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    // Webhookでもユーザーを特定できるようにIDを載せる
    subscription_data: { metadata: { supabase_user_id: user.id } },
    success_url: `${siteUrl}/pricing?success=1`,
    cancel_url: `${siteUrl}/pricing?canceled=1`,
    locale: "ja",
  });

  return Response.json({ url: session.url });
}
