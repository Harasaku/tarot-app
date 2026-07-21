import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stars from "../../components/Stars";
import { majorArcana, type TarotCard } from "@/app/data/cards";

// カード個別解説ページ。自動投稿（X「今日の一枚」）やSNSから来た人が、
// カードの意味を正位置・逆位置ともに読める。SEO目的で1枚1URLの静的ページとして生成する。

interface Props {
  params: Promise<{ id: string }>;
}

function getCard(id: string): TarotCard | undefined {
  return majorArcana.find((c) => c.id === id);
}

// og画像は /api/og?s=one&c=<番号><u|r> の形式（daily-cardと同じ）。正位置を代表画像にする。
function ogCardNumber(card: TarotCard): number {
  return parseInt(card.id.replace("maj_", ""), 10);
}

// 未定義IDは404にする（22枚のみ有効）
export const dynamicParams = false;

export function generateStaticParams() {
  return majorArcana.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = getCard(id);
  if (!card) {
    return { title: "カードが見つかりません | ミスティカル 愛葉（AIha）運命のタロット" };
  }
  const firstUp = card.upright.meaning.split("。")[0] + "。";
  const title = `「${card.name}（${card.nameEn}）」の意味 — 正位置・逆位置`;
  const description = `タロットカード「${card.name}」の正位置・逆位置の意味、キーワード、恋愛・仕事・金運・対人へのアドバイスを解説。${firstUp}`;
  const ogUrl = `/api/og?s=one&c=${ogCardNumber(card)}u`;
  const canonical = `/cards/${card.id}`;
  return {
    title: `${title} | ミスティカル 愛葉（AIha）運命のタロット`,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
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

function KeywordChips({ words }: { words: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {words.map((w) => (
        <span
          key={w}
          className="px-3 py-1 rounded-full text-sm tracking-wide"
          style={{
            background: "rgba(201,168,76,0.1)",
            border: "1px solid rgba(201,168,76,0.35)",
            color: "#f0e5d0",
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );
}

function ThemeGrid({
  themes,
}: {
  themes: TarotCard["upright"]["themes"];
}) {
  const rows: { label: string; value: string }[] = [
    { label: "恋愛", value: themes.love },
    { label: "仕事", value: themes.work },
    { label: "金運", value: themes.money },
    { label: "対人", value: themes.interpersonal },
    { label: "全体運", value: themes.general },
    { label: "Yes / No", value: themes.yesno },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rows.map((r) => (
        <div
          key={r.label}
          className="p-4 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.18)",
          }}
        >
          <div
            className="text-xs font-bold tracking-widest mb-1.5"
            style={{ color: "#c9a84c", opacity: 0.85 }}
          >
            {r.label}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#f0e5d0", opacity: 0.85 }}>
            {r.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function OrientationSection({
  orientation,
  face,
}: {
  orientation: "upright" | "reversed";
  face: TarotCard["upright"];
}) {
  const isUp = orientation === "upright";
  const label = isUp ? "正位置" : "逆位置";
  const accent = isUp ? "#c9a84c" : "#f9c8d8";
  return (
    <section className="mb-12">
      <h2
        className="text-2xl font-bold tracking-widest mb-5 flex items-center gap-3"
        style={{ color: accent, fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}
      >
        <span>{isUp ? "☀" : "☾"}</span>
        {label}
      </h2>

      <div className="mb-5">
        <KeywordChips words={face.keywords} />
      </div>

      <p className="text-base leading-loose mb-6" style={{ color: "#f0e5d0" }}>
        {face.meaning}
      </p>

      <div
        className="p-5 rounded-2xl mb-6"
        style={{
          background: "rgba(201,168,76,0.06)",
          border: "1px solid rgba(201,168,76,0.3)",
        }}
      >
        <div
          className="text-sm font-bold tracking-widest mb-2"
          style={{ color: accent }}
        >
          ✦ 愛葉からのアドバイス
        </div>
        <p className="text-sm leading-loose" style={{ color: "#f0e5d0", opacity: 0.9 }}>
          {face.advice}
        </p>
      </div>

      <ThemeGrid themes={face.themes} />
    </section>
  );
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = getCard(id);
  if (!card) notFound();

  // 構造化データ（検索エンジン向け）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `「${card.name}（${card.nameEn}）」タロットカードの意味`,
    description: `${card.name}の正位置・逆位置の意味とアドバイス`,
    image: `https://www.tarot-aiha.com${card.imagePath}`,
    author: { "@type": "Person", name: "ミスティカル 愛葉（AIha）" },
    publisher: {
      "@type": "Organization",
      name: "運命のタロット",
      url: "https://www.tarot-aiha.com",
    },
  };

  return (
    <main className="relative min-h-screen px-4 py-12 overflow-hidden">
      <Stars />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(249,168,212,0.05) 0%, rgba(107,33,168,0.12) 40%, transparent 70%)",
        }}
      />

      <article className="relative z-10 max-w-2xl mx-auto">
        <nav className="mb-8 text-sm tracking-wider" style={{ color: "#c9a84c", opacity: 0.7 }}>
          <Link href="/" className="hover:opacity-70 transition-opacity">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cards" className="hover:opacity-70 transition-opacity">
            カード一覧
          </Link>
          <span className="mx-2">/</span>
          <span style={{ color: "#f0e5d0", opacity: 0.6 }}>{card.name}</span>
        </nav>

        {/* ヘッダー */}
        <header className="text-center mb-10">
          <div className="float inline-block mb-6">
            <div
              className="rounded-xl overflow-hidden gold-glow"
              style={{ border: "2px solid rgba(201,168,76,0.6)", width: 200, height: 340 }}
            >
              <Image
                src={card.imagePath}
                alt={`${card.name}（${card.nameEn}）のタロットカード`}
                width={200}
                height={340}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                priority
              />
            </div>
          </div>

          <h1
            className="shimmer-text text-3xl sm:text-4xl font-bold tracking-widest mb-1"
            style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}
          >
            {card.name}
          </h1>
          <p className="text-sm tracking-[0.3em] mb-4" style={{ color: "#f9c8d8", opacity: 0.7 }}>
            {card.nameEn}
          </p>
          <p
            className="text-sm leading-loose max-w-md mx-auto"
            style={{ color: "#f0e5d0", opacity: 0.7 }}
          >
            {card.numerology}
          </p>
        </header>

        <hr className="divider mb-10" />

        <OrientationSection orientation="upright" face={card.upright} />
        <OrientationSection orientation="reversed" face={card.reversed} />

        {/* CTA */}
        <div className="text-center mt-4">
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
            愛葉に占ってもらう
          </Link>
          <p className="mt-4 text-sm tracking-wider" style={{ color: "#c9a84c", opacity: 0.5 }}>
            ✦ &nbsp; 登録不要・無料で占えます &nbsp; ✦
          </p>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/cards"
            className="text-sm tracking-widest transition-opacity hover:opacity-70"
            style={{ color: "#c9a84c", opacity: 0.7, textDecoration: "underline" }}
          >
            ← 大アルカナ22枚の一覧へ
          </Link>
        </div>
      </article>
    </main>
  );
}
