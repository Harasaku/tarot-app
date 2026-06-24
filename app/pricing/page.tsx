"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Stars from "../components/Stars";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "guest" | "free" | "paid";

const PLAN_FEATURES = {
  free: [
    "1日 4回まで占える",
    "1枚引き・3枚引き",
    "大アルカナ22枚の解説",
  ],
  paid: [
    "1日 6回まで占える",
    "全スプレッド（ペンタグラム5枚引きを含む）",
    "愛葉からのAI総合リーディング",
    "大アルカナ22枚の解説",
  ],
};

export default function PricingPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [notice, setNotice] = useState<"success" | "canceled" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 決済からの戻り（クエリ）を表示
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setNotice("success");
    else if (params.get("canceled")) setNotice("canceled");

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setStatus("paid");
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setStatus("guest");
        return;
      }
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setStatus(data.role === "paid" ? "paid" : "free");
      } else {
        setStatus("free");
      }
    });
  }, []);

  const handleUpgrade = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "エラーが発生しました");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setBusy(false);
    }
  };

  const handleManage = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "エラーが発生しました");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setBusy(false);
    }
  };

  const goldButton =
    "w-full py-4 rounded-full text-sm tracking-wider font-medium transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed";
  const goldStyle = {
    background: "linear-gradient(135deg, #7c4f00 0%, #c9a84c 50%, #7c4f00 100%)",
    color: "#0a0414",
    border: "1px solid #c9a84c",
    boxShadow: "0 0 15px rgba(201,168,76,0.3)",
  } as React.CSSProperties;

  return (
    <main className="relative min-h-screen flex flex-col items-center px-4 py-10 overflow-hidden">
      <Stars />
      <div
        className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(107,33,168,0.12) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/reading" className="text-sm tracking-widest transition-opacity hover:opacity-70" style={{ color: "#c9a84c" }}>
            ← リーディングへ戻る
          </Link>
          <h2 className="shimmer-text text-3xl font-bold tracking-widest mt-4" style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}>
            プランのご案内
          </h2>
          <hr className="divider mt-4 mx-auto w-32" />
          <p className="text-sm leading-relaxed mt-5" style={{ color: "#f0e5d0", opacity: 0.7 }}>
            有料会員になると、すべてのスプレッドと<br />愛葉からのAI総合リーディングをお楽しみいただけます。
          </p>
        </div>

        {/* 戻りメッセージ */}
        {notice === "success" && (
          <div className="mb-8 px-6 py-4 rounded-2xl text-center"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.4)", color: "#c9a84c" }}>
            ✦ ご登録ありがとうございます。有料会員としてすべての機能がご利用いただけます。
          </div>
        )}
        {notice === "canceled" && (
          <div className="mb-8 px-6 py-4 rounded-2xl text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)", color: "#f0e5d0", opacity: 0.8 }}>
            お手続きはキャンセルされました。いつでもお試しいただけます。
          </div>
        )}

        {/* プラン比較 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Free */}
          <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <p className="text-lg font-bold tracking-wider mb-1" style={{ color: "#f0e5d0" }}>無料会員</p>
            <p className="text-2xl font-bold mb-4" style={{ color: "#f0e5d0" }}>¥0<span className="text-sm font-normal opacity-50"> / 月</span></p>
            <ul className="space-y-2">
              {PLAN_FEATURES.free.map((f) => (
                <li key={f} className="text-sm flex items-start gap-2" style={{ color: "#f0e5d0", opacity: 0.75 }}>
                  <span style={{ color: "#c9a84c" }}>·</span>{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Paid */}
          <div className="p-6 rounded-2xl relative" style={{ background: "linear-gradient(135deg, rgba(107,33,168,0.18), rgba(45,27,105,0.25))", border: "1px solid rgba(201,168,76,0.5)", boxShadow: "0 0 30px rgba(107,33,168,0.2)" }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full tracking-wider"
              style={{ background: "linear-gradient(135deg, #7c4f00, #c9a84c)", color: "#0a0414" }}>おすすめ</span>
            <p className="text-lg font-bold tracking-wider mb-1" style={{ color: "#c9a84c" }}>有料会員</p>
            <p className="text-2xl font-bold mb-4" style={{ color: "#c9a84c" }}>¥300<span className="text-sm font-normal opacity-60"> / 月</span></p>
            <ul className="space-y-2">
              {PLAN_FEATURES.paid.map((f) => (
                <li key={f} className="text-sm flex items-start gap-2" style={{ color: "#f0e5d0", opacity: 0.9 }}>
                  <span style={{ color: "#c9a84c" }}>✦</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-sm mx-auto">
          {status === "loading" && (
            <p className="text-center text-sm" style={{ color: "#f0e5d0", opacity: 0.5 }}>読み込み中...</p>
          )}

          {status === "guest" && (
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: "#f0e5d0", opacity: 0.7 }}>
                有料会員登録にはログインが必要です。
              </p>
              <Link href="/auth" className={goldButton} style={{ ...goldStyle, display: "inline-block" }}>
                ログイン・新規登録
              </Link>
            </div>
          )}

          {status === "free" && (
            <button onClick={handleUpgrade} disabled={busy} className={goldButton} style={goldStyle}>
              {busy ? "決済ページへ移動中..." : "有料会員になる（月額300円）"}
            </button>
          )}

          {status === "paid" && (
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: "#c9a84c" }}>
                ✦ 現在、有料会員です ✦
              </p>
              <button onClick={handleManage} disabled={busy}
                className="w-full py-3 rounded-full text-sm tracking-wider transition-all hover:opacity-80 disabled:opacity-40"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}>
                {busy ? "移動中..." : "プランを管理・解約する"}
              </button>
            </div>
          )}

          {error && (
            <p className="text-center text-xs mt-4" style={{ color: "#f87171" }}>{error}</p>
          )}
        </div>

        <p className="text-center text-xs mt-10 leading-relaxed" style={{ color: "#f0e5d0", opacity: 0.4 }}>
          お支払いはStripeを通じて安全に処理されます。<br />
          いつでも解約でき、解約後も期間終了まではご利用いただけます。
        </p>
      </div>
    </main>
  );
}
