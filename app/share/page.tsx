import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stars from "../components/Stars";
import { decodeShareParams } from "@/lib/share";

// 占い結果のシェアページ。結果はURLパラメータのみで復元し、
// 閲覧にログイン・Supabase接続を必要としない（バイラル導線を塞がない）

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const s = first(sp.s);
  const c = first(sp.c);
  const reading = decodeShareParams(s, c);
  if (!reading) {
    return { title: "タロット占いの結果 | 神秘のタロット占い" };
  }
  const cardNames = reading.cards.map((d) => d.card.name).join("・");
  const title = `「${cardNames}」タロット占いの結果`;
  const description = `${reading.spread.name}で出たカードをチェック。あなたも無料・登録不要で占えます。🔮 ミスティカル 愛葉（AIha）運命のタロット`;
  const ogUrl = `/api/og?s=${s}&c=${c}`;
  return {
    title: `${title} | 神秘のタロット占い`,
    description,
    // シェアURLは組み合わせが無限にあるため検索インデックスには載せない
    robots: { index: false },
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const sp = await searchParams;
  const reading = decodeShareParams(first(sp.s), first(sp.c));
  if (!reading) notFound();

  const count = reading.cards.length;
  const cardW = count === 1 ? 190 : count === 3 ? 140 : 110;
  const cardH = Math.round(cardW * (400 / 266));

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
          <h2
            className="shimmer-text text-3xl font-bold tracking-widest"
            style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}
          >
            タロット占いの結果
          </h2>
          <hr className="divider mt-4 mx-auto w-32" />
          <p className="text-xs tracking-widest mt-4" style={{ color: "#c9a84c", opacity: 0.7 }}>
            {reading.spread.name} ・ シェアされたリーディング
          </p>
        </div>

        {/* Cards */}
        <div className="flex justify-center gap-4 sm:gap-8 flex-wrap mb-10">
          {reading.cards.map((drawn) => {
            const isReversed = drawn.orientation === "reversed";
            return (
              <div key={drawn.card.id} className="flex flex-col items-center">
                <p className="text-xs tracking-widest mb-3" style={{ color: "#c9a84c", opacity: 0.65 }}>
                  {drawn.position}
                </p>
                <div
                  style={{
                    width: cardW,
                    height: cardH,
                    borderRadius: 12,
                    overflow: "hidden",
                    position: "relative",
                    border: `1px solid ${isReversed ? "rgba(180,40,40,0.5)" : "rgba(201,168,76,0.55)"}`,
                    boxShadow: isReversed
                      ? "0 0 28px rgba(180,40,40,0.35)"
                      : "0 0 30px rgba(201,168,76,0.35)",
                    transform: isReversed ? "rotate(180deg)" : "none",
                  }}
                >
                  <Image
                    src={drawn.card.imagePath}
                    alt={drawn.card.name}
                    fill
                    className="object-contain"
                    sizes={`${cardW}px`}
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium tracking-wider" style={{ color: "#c9a84c" }}>
                    {drawn.card.name}
                  </p>
                  {isReversed ? (
                    <span
                      className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(180,40,40,0.2)", border: "1px solid rgba(180,40,40,0.5)", color: "#f87171" }}
                    >
                      逆位置
                    </span>
                  ) : (
                    <p className="text-xs mt-0.5" style={{ color: "#f0e5d0", opacity: 0.45 }}>
                      正位置
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interpretations */}
        <div className="space-y-4 mb-12">
          {reading.cards.map((drawn) => {
            const isReversed = drawn.orientation === "reversed";
            const readingData = isReversed ? drawn.card.reversed : drawn.card.upright;
            return (
              <div
                key={drawn.card.id}
                className="rounded-2xl p-6"
                style={{
                  background: isReversed
                    ? "linear-gradient(135deg, rgba(50,10,10,0.85), rgba(80,20,20,0.3))"
                    : "linear-gradient(135deg, rgba(26,5,51,0.85), rgba(45,27,105,0.35))",
                  border: `1px solid ${isReversed ? "rgba(180,40,40,0.3)" : "rgba(201,168,76,0.28)"}`,
                }}
              >
                <h3
                  className="text-xl font-bold tracking-wider mb-1"
                  style={{
                    color: isReversed ? "#f87171" : "#c9a84c",
                    fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif",
                  }}
                >
                  {drawn.card.name}
                </h3>
                <p className="text-xs tracking-widest mb-3" style={{ color: "#f0e5d0", opacity: 0.42 }}>
                  {drawn.card.nameEn}&nbsp;·&nbsp;{drawn.position}&nbsp;·&nbsp;
                  {isReversed ? <span style={{ color: "#f87171" }}>逆位置</span> : "正位置"}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {readingData.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{
                        background: isReversed ? "rgba(180,40,40,0.1)" : "rgba(201,168,76,0.1)",
                        border: `1px solid ${isReversed ? "rgba(180,40,40,0.35)" : "rgba(201,168,76,0.3)"}`,
                        color: isReversed ? "#f87171" : "#c9a84c",
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-loose" style={{ color: "#f0e5d0", opacity: 0.88 }}>
                  {readingData.meaning}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm tracking-widest mb-5" style={{ color: "#f0e5d0", opacity: 0.7 }}>
            ✦ &nbsp;あなたのカードは何を語るでしょうか&nbsp; ✦
          </p>
          <Link
            href="/reading"
            className="inline-block px-10 py-4 rounded-full text-sm tracking-wider font-medium transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #7c4f00 0%, #c9a84c 50%, #7c4f00 100%)",
              color: "#0a0414",
              border: "1px solid #c9a84c",
              boxShadow: "0 0 15px rgba(201,168,76,0.3)",
            }}
          >
            無料で占ってみる（登録不要）
          </Link>
          <p className="mt-6">
            <Link
              href="/"
              className="text-xs tracking-widest transition-opacity hover:opacity-70"
              style={{ color: "#c9a84c", opacity: 0.6 }}
            >
              🔮 ミスティカル 愛葉（AIha）運命のタロット
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
