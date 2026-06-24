import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripeからの通知（Webhook）を受け取り、profiles の会員状態を更新する。
// ログインユーザーがいないため、Service Roleクライアント（RLSバイパス）でDBを更新する。

// サブスクリプションの期間終了日時（unix秒）を安全に取り出す
function getPeriodEnd(sub: Stripe.Subscription): number | null {
  const top = (sub as unknown as { current_period_end?: number })
    .current_period_end;
  if (typeof top === "number") return top;
  const item = sub.items?.data?.[0] as unknown as {
    current_period_end?: number;
  };
  return typeof item?.current_period_end === "number"
    ? item.current_period_end
    : null;
}

// アクティブな状態かどうか（有料会員とみなす）
function isActiveStatus(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing";
}

function toISO(unixSeconds: number | null): string | null {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Webhook is not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  // 署名検証には「生のリクエストボディ」が必要
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        // サブスクリプション本体を取得し、状態と期間終了日もまとめて保存する。
        // （subscription.created通知との競合で取りこぼさないよう、ここで確定させる）
        let status = "active";
        let periodEnd: string | null = null;
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await getStripe().subscriptions.retrieve(subId);
          status = sub.status;
          periodEnd = toISO(getPeriodEnd(sub));
        }

        if (userId) {
          await supabase
            .from("profiles")
            .update({
              role: isActiveStatus(status as Stripe.Subscription.Status)
                ? "paid"
                : "free",
              stripe_customer_id: customerId,
              subscription_status: status,
              current_period_end: periodEnd,
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const active = isActiveStatus(sub.status);

        await supabase
          .from("profiles")
          .update({
            role: active ? "paid" : "free",
            subscription_status: sub.status,
            current_period_end: toISO(getPeriodEnd(sub)),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        await supabase
          .from("profiles")
          .update({
            role: "free",
            subscription_status: "canceled",
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      default:
        // 他のイベントは無視
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return new Response(`Webhook handler error: ${message}`, { status: 500 });
  }

  return Response.json({ received: true });
}
