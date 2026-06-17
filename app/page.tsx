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

        <Link
          href="/auth"
          className="mt-4 inline-block text-xs tracking-widest transition-opacity hover:opacity-70"
          style={{ color: "#c9a84c", opacity: 0.35 }}
        >
          ログイン / 会員登録
        </Link>
      </div>
    </main>
  );
}
