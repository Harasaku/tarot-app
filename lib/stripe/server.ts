import Stripe from "stripe";

// サーバー専用。STRIPE_SECRET_KEY を使う（クライアントに露出させない）。
// ビルド時に環境変数が無くても落ちないよう、初回呼び出し時に遅延生成する。
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      appInfo: { name: "tarot-aiha" },
    });
  }
  return _stripe;
}
