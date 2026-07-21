import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Stars from "../components/Stars";
import { majorArcana } from "@/app/data/cards";

// 大アルカナ22枚の一覧ページ。各カードの解説ページへの入口。

export const metadata: Metadata = {
  title: "タロットカード大アルカナ22枚の意味一覧 | ミスティカル 愛葉（AIha）運命のタロット",
  description:
    "タロットの大アルカナ22枚それぞれの正位置・逆位置の意味とキーワードを解説。愚者から世界まで、気になるカードの意味を無料でチェックできます。",
  alternates: { canonical: "/cards" },
  openGraph: {
    title: "タロットカード大アルカナ22枚の意味一覧",
    description: "大アルカナ22枚の正位置・逆位置の意味をやさしく解説。",
    url: "/cards",
  },
};

export default function CardsIndexPage() {
  return (
    <main className="relative min-h-screen px-4 py-12 overflow-hidden">
      <Stars />

      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 15%, rgba(249,168,212,0.05) 0%, rgba(107,33,168,0.12) 40%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <nav className="mb-8 text-sm tracking-wider" style={{ color: "#c9a84c", opacity: 0.7 }}>
          <Link href="/" className="hover:opacity-70 transition-opacity">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span style={{ color: "#f0e5d0", opacity: 0.6 }}>カード一覧</span>
        </nav>

        <header className="text-center mb-10">
          <h1
            className="shimmer-text text-3xl sm:text-4xl font-bold tracking-widest mb-3"
            style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}
          >
            タロットカードの意味
          </h1>
          <p className="text-sm tracking-widest" style={{ color: "#f9c8d8", opacity: 0.75 }}>
            ✦ &nbsp; 大アルカナ 22枚 &nbsp; ✦
          </p>
          <p
            className="mt-4 text-sm leading-loose max-w-lg mx-auto"
            style={{ color: "#f0e5d0", opacity: 0.7 }}
          >
            気になるカードを選んで、正位置・逆位置それぞれの意味を確かめてみましょう。
          </p>
        </header>

        <hr className="divider mb-10" />

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {majorArcana.map((card) => (
            <li key={card.id}>
              <Link
                href={`/cards/${card.id}`}
                className="card-hover block text-center"
                aria-label={`${card.name}の意味を見る`}
              >
                <div
                  className="rounded-lg overflow-hidden mx-auto mb-3"
                  style={{ border: "1px solid rgba(201,168,76,0.4)", maxWidth: 150 }}
                >
                  <Image
                    src={card.imagePath}
                    alt={`${card.name}（${card.nameEn}）`}
                    width={150}
                    height={255}
                    style={{ objectFit: "cover", width: "100%", height: "auto" }}
                  />
                </div>
                <div
                  className="text-sm font-bold tracking-wide"
                  style={{
                    color: "#f0e5d0",
                    fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif",
                  }}
                >
                  {card.name}
                </div>
                <div className="text-xs tracking-wider" style={{ color: "#c9a84c", opacity: 0.6 }}>
                  {card.nameEn}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="text-center mt-12">
          <Link
            href="/reading"
            className="inline-block px-10 py-4 text-lg tracking-widest font-medium rounded-full transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #7c4f00 0%, #c9a84c 50%, #7c4f00 100%)",
              color: "#0a0414",
              border: "1px solid #c9a84c",
              boxShadow: "0 0 20px rgba(201,168,76,0.4)",
            }}
          >
            占いを始める
          </Link>
        </div>
      </div>
    </main>
  );
}
