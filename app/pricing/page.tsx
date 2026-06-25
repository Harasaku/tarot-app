"use client";

import Link from "next/link";
import Stars from "../components/Stars";

// 有料プランは現在停止中。すべての機能を無料でご利用いただける旨を案内する。
export default function PricingPage() {
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
        </div>

        <div className="px-6 py-8 rounded-2xl text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.3)" }}>
          <p className="text-lg font-bold tracking-wider mb-4" style={{ color: "#c9a84c" }}>
            ✦ すべての機能を無料でご利用いただけます ✦
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#f0e5d0", opacity: 0.8 }}>
            現在、有料プランの提供は停止しております。<br />
            1枚引き・3枚引き・ペンタグラム5枚引きを含む<br />
            すべてのスプレッドを無料でお楽しみいただけます。
          </p>
        </div>

        <div className="text-center mt-10">
          <Link href="/reading" className="inline-block py-4 px-10 rounded-full text-sm tracking-wider font-medium transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #7c4f00 0%, #c9a84c 50%, #7c4f00 100%)",
              color: "#0a0414",
              border: "1px solid #c9a84c",
              boxShadow: "0 0 15px rgba(201,168,76,0.3)",
            }}>
            占いを始める
          </Link>
        </div>
      </div>
    </main>
  );
}
