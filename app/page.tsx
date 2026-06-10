import Link from "next/link";
import Stars from "./components/Stars";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <Stars />

      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(107,33,168,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center max-w-xl mx-auto">
        <div className="float mb-8 inline-block">
          <div
            className="w-24 h-24 mx-auto rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #fff8e1, #c9a84c 60%, #7c4f00)",
              boxShadow:
                "0 0 40px rgba(201,168,76,0.4), 0 0 80px rgba(201,168,76,0.15)",
            }}
          />
        </div>

        <h1
          className="shimmer-text text-4xl sm:text-5xl md:text-6xl font-bold tracking-widest mb-3 whitespace-nowrap"
          style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}
        >
          神秘のタロット
        </h1>

        <p
          className="text-lg tracking-widest mb-2"
          style={{ color: "#c9a84c", opacity: 0.8 }}
        >
          ✦ &nbsp; MYSTIC TAROT &nbsp; ✦
        </p>

        <hr className="divider my-8 mx-auto w-48" />

        <p
          className="text-base leading-relaxed mb-10"
          style={{ color: "#e8d5b7", opacity: 0.85 }}
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
      </div>
    </main>
  );
}
