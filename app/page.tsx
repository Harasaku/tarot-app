import Link from "next/link";
import Image from "next/image";
import Stars from "./components/Stars";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <Stars />

      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(249,168,212,0.06) 0%, rgba(107,33,168,0.13) 40%, transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center max-w-xl mx-auto">
        {/* Character image */}
        <div className="float mb-6 inline-block">
          <div
            style={{
              borderRadius: "50%",
              border: "2px solid rgba(201,168,76,0.65)",
              boxShadow:
                "0 0 30px rgba(201,168,76,0.3), 0 0 60px rgba(249,168,212,0.15)",
              overflow: "hidden",
              width: 140,
              height: 140,
              margin: "0 auto",
            }}
          >
            <Image
              src="/character_img.png"
              alt="愛葉（AIha）"
              width={140}
              height={140}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        </div>

        <h1
          className="shimmer-text text-3xl sm:text-4xl font-bold tracking-wider mb-1 leading-snug"
          style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}
        >
          ミスティカル　愛葉（AIha）
        </h1>
        <h2
          className="shimmer-text text-2xl sm:text-3xl font-bold tracking-widest mb-3"
          style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}
        >
          運命のタロット
        </h2>

        <p
          className="text-sm tracking-widest mb-2"
          style={{ color: "#f9c8d8", opacity: 0.75 }}
        >
          ✦ &nbsp; MYSTICAL TAROT &nbsp; ✦
        </p>

        <hr className="divider my-8 mx-auto w-48" />

        <p
          className="text-base leading-relaxed mb-10"
          style={{ color: "#f0e5d0", opacity: 0.85 }}
        >
          カードはあなたの心の奥にある
          <br />
          メッセージを映し出します。
          <br />
          静かに問いを胸に、占いを始めましょう。
        </p>

        <Link
          href="/reading"
          className="inline-block px-10 py-4 text-lg tracking-widest font-medium rounded-full transition-all duration-300 hover:scale-105"
          style={{
            background:
              "linear-gradient(135deg, #7c4f00 0%, #c9a84c 50%, #7c4f00 100%)",
            color: "#0a0414",
            border: "1px solid #c9a84c",
            boxShadow: "0 0 20px rgba(201,168,76,0.4)",
          }}
        >
          占いを始める
        </Link>

        <p
          className="mt-8 text-sm tracking-wider"
          style={{ color: "#c9a84c", opacity: 0.5 }}
        >
          ✦ &nbsp; 大アルカナ 22枚 &nbsp; ✦
        </p>

        {/* プラン比較（ゲスト / 会員） */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            <div
              className="text-sm font-bold tracking-widest mb-3"
              style={{ color: "#c9a84c", opacity: 0.8 }}
            >
              ゲスト
              <span className="ml-2 font-normal text-xs" style={{ color: "#f0e5d0", opacity: 0.5 }}>
                登録不要
              </span>
            </div>
            <ul className="space-y-2 text-sm" style={{ color: "#f0e5d0", opacity: 0.75 }}>
              <li>✦ 1枚引き・3枚引き</li>
              <li>✦ 1日3回まで</li>
            </ul>
          </div>
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "rgba(201,168,76,0.07)",
              border: "1px solid rgba(201,168,76,0.45)",
              boxShadow: "0 0 18px rgba(201,168,76,0.15)",
            }}
          >
            <div
              className="text-sm font-bold tracking-widest mb-3"
              style={{ color: "#c9a84c" }}
            >
              会員
              <span className="ml-2 font-normal text-xs" style={{ color: "#f9c8d8", opacity: 0.8 }}>
                無料登録
              </span>
            </div>
            <ul className="space-y-2 text-sm" style={{ color: "#f0e5d0", opacity: 0.9 }}>
              <li>✦ すべてのスプレッド（ペンタグラム解放）</li>
              <li>✦ 1日5回まで</li>
            </ul>
          </div>
        </div>

        <Link
          href="/auth"
          className="mt-6 inline-block text-sm tracking-widest transition-opacity hover:opacity-70"
          style={{ color: "#c9a84c", opacity: 0.7, textDecoration: "underline" }}
        >
          ログイン / 会員登録（無料）
        </Link>
      </div>
    </main>
  );
}
