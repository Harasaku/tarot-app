"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Stars from "../components/Stars";
import { createClient } from "@/lib/supabase/client";
import {
  majorArcana,
  spreadTypes,
  type TarotCard,
  type CardOrientation,
} from "../data/cards";
import { encodeShareParams } from "@/lib/share";

type Step = "spread" | "question" | "shuffle" | "pick" | "result";

interface DrawnCard {
  card: TarotCard;
  orientation: CardOrientation;
  position: string;
  flipped: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ROMAN = ["0","Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ","Ⅵ","Ⅶ","Ⅷ","Ⅸ","Ⅹ","Ⅺ","Ⅻ","ⅩⅢ","ⅩⅣ","ⅩⅤ","ⅩⅥ","ⅩⅦ","ⅩⅧ","ⅩⅨ","ⅩⅩ","ⅩⅩⅠ"];
function getRoman(cardId: string) {
  const n = parseInt(cardId.replace("maj_", ""));
  return ROMAN[n] ?? "";
}

// Pentagram layout — 5 card slots (left/top in px) within a 360×400 container
// Card size: 72×125px. Star SVG connects card centers: (180,95)→(256,330)→(56,185)→(304,185)→(104,330)
// slot.top = card_center_y - CH/2 - 20(label), slot.left = card_center_x - CW/2
const PENTA_SLOTS = [
  { left: 144, top: 12  },  // 本質  (top)
  { left: 268, top: 102 },  // 行動  (upper-right)
  { left: 220, top: 247 },  // 現実  (lower-right)
  { left: 68,  top: 247 },  // 感情  (lower-left)
  { left: 20,  top: 102 },  // 導き  (upper-left)
] as const;
const PENTA_CW = 72;
const PENTA_CH = 125;

// ── ティア設定 ────────────────────────────────────────────────────────────────
const TIER_CONFIG = {
  guest: { maxUses: 3, spreads: ["one", "three"], aiReading: false, label: "ゲスト" },
  free:  { maxUses: 5, spreads: ["one", "three", "pentagram"], aiReading: false, label: "会員" },
  paid:  { maxUses: 5, spreads: ["one", "three", "pentagram"], aiReading: false, label: "会員" },
} as const;

type Tier = keyof typeof TIER_CONFIG;

function getJSTDateString(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
}

function getGuestUsage(): number {
  if (typeof window === "undefined") return 0;
  try {
    const s = localStorage.getItem("tarot_guest_usage");
    if (!s) return 0;
    const d = JSON.parse(s);
    return d.date === getJSTDateString() ? (d.count ?? 0) : 0;
  } catch { return 0; }
}

function setGuestUsage(count: number): void {
  localStorage.setItem(
    "tarot_guest_usage",
    JSON.stringify({ date: getJSTDateString(), count })
  );
}

type Theme = "yesno" | "general" | "love" | "work" | "money" | "interpersonal";

const PRESET_QUESTIONS: { theme: Theme; label: string }[] = [
  { theme: "yesno", label: "Yes/No / 心の中の問いの答えは？ Yes/No" },
  { theme: "general", label: "全般 / 今日のアドバイス" },
  { theme: "love", label: "恋愛 / いい出会いはある？" },
  { theme: "love", label: "恋愛 / 気になる人は私のことをどう思ってる？" },
  { theme: "work", label: "仕事 / 仕事はうまくいく？" },
  { theme: "money", label: "お金 / 今日の金運アップアクションは？" },
  { theme: "interpersonal", label: "対人 / わたしの周囲からの印象は？" },
];

const THEME_LABELS: Record<Theme, string> = {
  yesno: "Yes/No",
  general: "全般",
  love: "恋愛",
  work: "仕事",
  money: "お金",
  interpersonal: "対人",
};

const THREE_CARD_THEMES: Theme[] = ["yesno", "general", "love", "work", "money", "interpersonal"];

// ── Card back face (decorative) ───────────────────────────────────────────────
function CardBackFace({ small = false }: { small?: boolean }) {
  const pad = small ? 6 : 10;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg, #1a0533 0%, #2d1b69 50%, #170430 100%)",
      }}
    >
      <div style={{ position: "absolute", inset: `${pad}px`, border: "0.5px solid rgba(201,168,76,0.35)", borderRadius: small ? 4 : 6, pointerEvents: "none" }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -52%)",
        width: small ? 20 : 34, height: small ? 20 : 34,
        borderRadius: "50%",
        background: "rgba(201,168,76,0.18)",
        boxShadow: `inset ${small ? -5 : -9}px 0 0 rgba(23,4,48,0.95), 0 0 ${small ? 6 : 14}px rgba(201,168,76,0.25)`,
      }} />
      {[["18%","18%"],["78%","16%"],["14%","76%"],["80%","78%"]].map(([t,l], i) => (
        <div key={i} style={{
          position: "absolute", top: t, left: l,
          width: small ? 2 : 3, height: small ? 2 : 3,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.55)",
          boxShadow: "0 0 4px rgba(201,168,76,0.4)",
        }} />
      ))}
      {!small && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 52, height: 52,
          borderRadius: "50%",
          border: "0.5px solid rgba(201,168,76,0.18)",
        }} />
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, transparent 38%, rgba(201,168,76,0.05) 50%, transparent 62%)",
      }} />
    </div>
  );
}

// ── Line card (grid pick layout) ──────────────────────────────────────────────
const LINE_CARD_W = 62;
const LINE_CARD_H = 108;

function LineCard({
  card, isPicked, onPick,
}: {
  card: TarotCard;
  isPicked: boolean;
  onPick: (card: TarotCard) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => !isPicked && onPick(card)}
      onMouseEnter={() => !isPicked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: LINE_CARD_W,
        height: LINE_CARD_H,
        borderRadius: 8,
        overflow: "hidden",
        cursor: isPicked ? "default" : "pointer",
        opacity: isPicked ? 0.18 : 1,
        border: hovered && !isPicked ? "1.5px solid rgba(201,168,76,0.95)" : "1px solid rgba(201,168,76,0.42)",
        boxShadow: hovered && !isPicked ? "0 0 18px rgba(201,168,76,0.55)" : "0 2px 6px rgba(0,0,0,0.4)",
        transform: hovered && !isPicked ? "translateY(-10px) scale(1.05)" : "none",
        transition: "transform 0.2s ease, border 0.2s, box-shadow 0.2s, opacity 0.2s",
        flexShrink: 0,
      } as React.CSSProperties}
    >
      <CardBackFace small />
    </div>
  );
}

// ── Shuffle animation ─────────────────────────────────────────────────────────
function ShuffleAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 3500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="step-in text-center">
      <p className="text-sm tracking-widest mb-16" style={{ color: "#c9a84c", opacity: 0.8 }}>
        カードをシャッフルしています...
      </p>
      <div className="relative flex items-end justify-center mx-auto" style={{ height: "140px", width: "160px" }}>
        {([-14, 0, 14] as number[]).map((rot, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "68px", height: "118px",
              borderRadius: "8px",
              overflow: "hidden",
              "--base-rot": `${rot}deg`,
              animation: "shuffleCard 1.6s ease-in-out infinite",
              animationDelay: `${i * 0.18}s`,
            } as React.CSSProperties}
          >
            <CardBackFace />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Share helpers ─────────────────────────────────────────────────────────────
function buildShareText(question: string, cards: DrawnCard[]): string {
  const lines = ["✦ タロット占いの結果 ✦", ""];
  if (question) lines.push(`【問い】${question}`, "");
  cards.forEach((d) => {
    lines.push(`${d.position}：${d.card.name}（${d.orientation === "upright" ? "正位置" : "逆位置"}）`);
  });
  lines.push("", "🔮 ミスティカル 愛葉（AIha）運命のタロット");
  return lines.join("\n");
}

// 結果ページのURL。開いた人がカードと解釈を見られる（OGP画像付き）
function buildShareUrl(spreadId: string, cards: DrawnCard[]): string {
  const params = encodeShareParams(
    spreadId,
    cards.map((d) => ({ cardId: d.card.id, orientation: d.orientation }))
  );
  return `${window.location.origin}/share?${params}`;
}

// Xポスト用の短文（問いは含めない。URLのOGP画像がカードを見せてくれる）
function buildPostText(cards: DrawnCard[]): string {
  const names = cards
    .map((d) => `${d.card.name}${d.orientation === "reversed" ? "（逆）" : ""}`)
    .join("・");
  return `タロットを引いたら「${names}」が出ました🔮\n#タロット占い #愛葉タロット`;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReadingPage() {
  const [step, setStep] = useState<Step>("spread");
  const [spreadId, setSpreadId] = useState("one");
  const [question, setQuestion] = useState("");
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [aiReading, setAiReading] = useState("");
  const [aiState, setAiState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [tier, setTier] = useState<Tier>("guest");
  const [usageCount, setUsageCount] = useState(0);
  const [tierLoading, setTierLoading] = useState(true);

  // 認証・ティア・利用回数を読み込む
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Supabase未設定時は全機能解放（開発用）
      setTier("paid");
      setUsageCount(0);
      setTierLoading(false);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setTier("guest");
        setUsageCount(getGuestUsage());
        setTierLoading(false);
        return;
      }
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setTier(data.role === "paid" ? "paid" : "free");
        setUsageCount(data.count);
      }
      setTierLoading(false);
    });
  }, []);

  const selectedSpread = spreadTypes.find((s) => s.id === spreadId)!;
  const allFlipped = drawnCards.length > 0 && drawnCards.every((d) => d.flipped);

  const handleStartShuffle = useCallback(async () => {
    const config = TIER_CONFIG[tier];
    if (usageCount >= config.maxUses) return; // disabled ボタン側でガードするが念のため

    // 利用回数インクリメント
    if (tier === "guest") {
      const next = usageCount + 1;
      setGuestUsage(next);
      setUsageCount(next);
    } else {
      const res = await fetch("/api/usage", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUsageCount(data.count);
      }
    }

    setShuffledDeck(shuffleArray(majorArcana));
    setDrawnCards([]);
    setStep("shuffle");
  }, [tier, usageCount]);

  const handlePickCard = useCallback(
    (card: TarotCard) => {
      if (drawnCards.length >= selectedSpread.cardCount) return;
      if (drawnCards.some((d) => d.card.id === card.id)) return;
      const orientation: CardOrientation = Math.random() > 0.3 ? "upright" : "reversed";
      const position = selectedSpread.positions[drawnCards.length].label;
      setDrawnCards((prev) => [...prev, { card, orientation, position, flipped: false }]);
      if (drawnCards.length + 1 === selectedSpread.cardCount) {
        setTimeout(() => setStep("result"), 350);
      }
    },
    [drawnCards, selectedSpread]
  );

  const handleFlipCard = useCallback((index: number) => {
    setDrawnCards((prev) => prev.map((d, i) => (i === index ? { ...d, flipped: true } : d)));
    setActiveCardIndex(index);
  }, []);

  const handleShare = async () => {
    const text = buildShareText(question, drawnCards);
    const url = buildShareUrl(spreadId, drawnCards);
    if (navigator.share) {
      await navigator.share({ text, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    }
  };

  const handlePostToX = () => {
    const url = buildShareUrl(spreadId, drawnCards);
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildPostText(drawnCards))}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  const handleReset = () => {
    setStep("spread");
    setQuestion("");
    setDrawnCards([]);
    setShuffledDeck([]);
    setActiveCardIndex(null);
    setShareState("idle");
    setSelectedTheme(null);
    setAiReading("");
    setAiState("idle");
  };

  const handleAiReading = async () => {
    setAiState("loading");
    setAiReading("");
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cards: drawnCards.map((d) => ({
            name: d.card.name,
            nameEn: d.card.nameEn,
            position: d.position,
            orientation: d.orientation,
          })),
          question,
          theme: selectedTheme,
        }),
      });
      if (!res.ok || !res.body) throw new Error("API error");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setAiReading(text);
      }
      setAiState(text.trim() ? "done" : "error");
    } catch {
      setAiState("error");
    }
  };

  // Result card sizes
  const resultCardW = spreadId === "pentagram" ? PENTA_CW : drawnCards.length === 1 ? 190 : 140;
  const resultCardH = spreadId === "pentagram" ? PENTA_CH : drawnCards.length === 1 ? 330 : 243;

  return (
    <main className="relative min-h-screen flex flex-col items-center px-4 py-10 overflow-hidden">
      <Stars />
      <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(107,33,168,0.12) 0%, transparent 65%)" }} />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-sm tracking-widest transition-opacity hover:opacity-70" style={{ color: "#c9a84c" }}>
            ← トップへ戻る
          </Link>
          <h2 className="shimmer-text text-3xl font-bold tracking-widest mt-4" style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}>
            タロットリーディング
          </h2>
          <hr className="divider mt-4 mx-auto w-32" />

          {/* ユーザーステータス */}
          {!tierLoading && (
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              <span className="text-xs tracking-widest" style={{ color: "#c9a84c", opacity: 0.7 }}>
                {TIER_CONFIG[tier].label}
              </span>
              <span className="text-xs" style={{ color: "#f0e5d0", opacity: 0.4 }}>·</span>
              <span className="text-xs" style={{ color: "#f0e5d0", opacity: 0.5 }}>
                今日の残り {Math.max(0, TIER_CONFIG[tier].maxUses - usageCount)} 回
              </span>
              {tier === "guest" && (
                <Link href="/auth" className="text-xs tracking-wider transition-opacity hover:opacity-80"
                  style={{ color: "#c9a84c", opacity: 0.6, textDecoration: "underline" }}>
                  ログイン
                </Link>
              )}
              {tier !== "guest" && (
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    setTier("guest");
                    setUsageCount(getGuestUsage());
                  }}
                  className="text-xs tracking-wider transition-opacity hover:opacity-80"
                  style={{ color: "#f0e5d0", opacity: 0.35, textDecoration: "underline" }}
                >
                  ログアウト
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── SPREAD ──────────────────────────────────────────── */}
        {step === "spread" && (
          <div className="step-in">
            <p className="text-center text-sm tracking-widest mb-8" style={{ color: "#c9a84c" }}>スプレッドを選んでください</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {spreadTypes.map((spread) => {
                const allowed = (TIER_CONFIG[tier].spreads as readonly string[]).includes(spread.id);
                // ロックされている場合のバッジ：無料会員で使えるなら「無料登録で解放」、有料会員のみなら「有料」
                const unlockedByFree = (TIER_CONFIG.free.spreads as readonly string[]).includes(spread.id);
                const lockLabel = unlockedByFree ? "無料登録で解放" : "有料";
                // ゲストがロック中のスプレッドを押したら登録ページへ誘導する
                const locksToAuth = !allowed && unlockedByFree && tier === "guest";
                return (
                  <button
                    key={spread.id}
                    onClick={() => {
                      if (allowed) { setSpreadId(spread.id); setStep("question"); }
                      else if (locksToAuth) { window.location.assign("/auth"); }
                    }}
                    disabled={!allowed && !locksToAuth}
                    className={`p-6 rounded-2xl text-left transition-all duration-300 ${allowed ? "hover:scale-105" : locksToAuth ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}`}
                    style={{
                      background: allowed ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
                      border: `1px solid ${allowed ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.1)"}`,
                      opacity: allowed ? 1 : 0.5,
                    }}
                  >
                    <div className="flex gap-2 mb-5 items-center">
                      {Array.from({ length: spread.cardCount }).map((_, i) => (
                        <div key={i} style={{ width: 22, height: 38, borderRadius: 3, overflow: "hidden", border: `1px solid ${allowed ? "rgba(201,168,76,0.55)" : "rgba(201,168,76,0.2)"}` }}>
                          <CardBackFace small />
                        </div>
                      ))}
                      {!allowed && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c" }}>
                          {lockLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-bold mb-1 tracking-wider" style={{ color: allowed ? "#c9a84c" : "#8a7a5a" }}>{spread.name}</div>
                    <div className="text-sm" style={{ color: "#f0e5d0", opacity: allowed ? 0.65 : 0.35 }}>{spread.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── QUESTION ─────────────────────────────────────────── */}
        {step === "question" && (
          <div className="step-in text-center">
            <p className="text-sm tracking-widest mb-4" style={{ color: "#c9a84c" }}>{selectedSpread.name}</p>

            {spreadId === "one" ? (
              /* 1枚引き：プリセット選択肢 */
              <>
                <p className="text-base leading-relaxed mb-6" style={{ color: "#f0e5d0", opacity: 0.8 }}>
                  今日の問いを選んでください
                </p>
                <div className="flex flex-col gap-3 mb-8 text-left">
                  {PRESET_QUESTIONS.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => { setQuestion(q.label); setSelectedTheme(q.theme); }}
                      className="px-5 py-4 rounded-xl text-sm tracking-wide text-left transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        background: question === q.label ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                        border: question === q.label ? "1.5px solid rgba(201,168,76,0.75)" : "1px solid rgba(201,168,76,0.25)",
                        color: question === q.label ? "#c9a84c" : "#f0e5d0",
                        boxShadow: question === q.label ? "0 0 14px rgba(201,168,76,0.18)" : "none",
                      }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* 3枚引き：テーマ選択＋フリーテキスト */
              <>
                <p className="text-base leading-relaxed mb-5" style={{ color: "#f0e5d0", opacity: 0.8 }}>
                  テーマを選んでください
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {THREE_CARD_THEMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTheme(t)}
                      className="px-4 py-2 rounded-full text-sm tracking-wider transition-all duration-200 hover:scale-105"
                      style={{
                        background: selectedTheme === t ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)",
                        border: selectedTheme === t ? "1.5px solid rgba(201,168,76,0.75)" : "1px solid rgba(201,168,76,0.25)",
                        color: selectedTheme === t ? "#c9a84c" : "#f0e5d0",
                        boxShadow: selectedTheme === t ? "0 0 14px rgba(201,168,76,0.18)" : "none",
                      }}
                    >
                      {THEME_LABELS[t]}
                    </button>
                  ))}
                </div>
                <p className="text-sm mb-4" style={{ color: "#f0e5d0", opacity: 0.6 }}>
                  心の中で問いを思い浮かべてください。または、テキストで入力することもできます。
                </p>
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
                  placeholder="例：仕事の方向性について教えてください..."
                  className="w-full p-4 rounded-xl text-sm leading-relaxed resize-none outline-none transition-all duration-300" rows={3}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.3)", color: "#f0e5d0" }}
                  onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(201,168,76,0.7)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(201,168,76,0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(201,168,76,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </>
            )}

            <div className="flex gap-4 justify-center mt-6">
              <button onClick={() => { setStep("spread"); setQuestion(""); }}
                className="px-6 py-3 rounded-full text-sm tracking-wider transition-all hover:opacity-70"
                style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}>戻る</button>
              <button
                onClick={handleStartShuffle}
                disabled={
                  (spreadId === "one" && !question) ||
                  ((spreadId === "three" || spreadId === "pentagram") && !selectedTheme) ||
                  usageCount >= TIER_CONFIG[tier].maxUses
                }
                className="px-8 py-3 rounded-full text-sm tracking-wider font-medium transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #7c4f00 0%, #c9a84c 50%, #7c4f00 100%)", color: "#0a0414", border: "1px solid #c9a84c", boxShadow: "0 0 15px rgba(201,168,76,0.3)" }}>
                カードを引く
              </button>
              {usageCount >= TIER_CONFIG[tier].maxUses && (
                <p className="text-xs text-center mt-2" style={{ color: "#f87171" }}>
                  今日の上限（{TIER_CONFIG[tier].maxUses}回）に達しました。日本時間0時にリセットされます。
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── SHUFFLE ──────────────────────────────────────────── */}
        {step === "shuffle" && <ShuffleAnimation onComplete={() => setStep("pick")} />}

        {/* ── PICK (grid) ───────────────────────────────────────── */}
        {step === "pick" && (
          <div className="step-in flex flex-col items-center">
            <div className="text-center w-full mb-5">
              <span className="text-2xl font-bold tracking-wider" style={{ color: "#c9a84c" }}>{drawnCards.length}</span>
              <span className="text-sm ml-1" style={{ color: "#f0e5d0", opacity: 0.5 }}>/{selectedSpread.cardCount} 枚</span>
              <p className="text-xs mt-1" style={{ color: "#f0e5d0", opacity: 0.45 }}>直感でカードを選んでください</p>
            </div>
            {drawnCards.length > 0 && (
              <div className="flex justify-center gap-3 mb-5">
                {drawnCards.map((d) => (
                  <div key={d.card.id} className="text-center">
                    <p className="text-xs mb-1" style={{ color: "#c9a84c", opacity: 0.7 }}>{d.position}</p>
                    <div style={{ width: 28, height: 49, borderRadius: 4, overflow: "hidden", border: "1px solid #c9a84c", boxShadow: "0 0 10px rgba(201,168,76,0.45)" }}>
                      <CardBackFace small />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2 w-full max-w-lg">
              {shuffledDeck.map((card) => {
                const isPicked = drawnCards.some((d) => d.card.id === card.id);
                return (
                  <LineCard key={card.id} card={card} isPicked={isPicked} onPick={handlePickCard} />
                );
              })}
            </div>
          </div>
        )}

        {/* ── RESULT ───────────────────────────────────────────── */}
        {step === "result" && (
          <div className="step-in">
            {question && (
              <div className="text-center mb-8 px-6 py-4 rounded-2xl mx-auto"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.18)", maxWidth: "420px" }}>
                <p className="text-xs tracking-widest mb-1" style={{ color: "#c9a84c", opacity: 0.55 }}>あなたの問い</p>
                <p className="text-sm leading-relaxed" style={{ color: "#f0e5d0" }}>{question}</p>
              </div>
            )}

            <p className="text-center text-xs tracking-widest mb-8" style={{ color: "#c9a84c", opacity: 0.55 }}>
              ✦ &nbsp;カードをタップして開く&nbsp; ✦
            </p>

            {/* Cards — pentagram or row */}
            {spreadId === "pentagram" ? (
              /* ── Pentagram layout ─────────────────────────────── */
              <div className="relative mx-auto mb-10" style={{ width: 360, height: 400 }}>
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 360 400">
                  <path d="M 180,95 L 256,330 L 56,185 L 304,185 L 104,330 Z" fill="none" stroke="rgba(201,168,76,0.18)" strokeWidth="1.5" />
                </svg>
                {drawnCards.map((drawn, index) => {
                  const slot = PENTA_SLOTS[index];
                  const isReversed = drawn.orientation === "reversed";
                  return (
                    <div key={drawn.card.id} style={{ position: "absolute", left: slot.left, top: slot.top, width: PENTA_CW }}>
                      <p className="text-center mb-1" style={{ fontSize: "10px", color: "#c9a84c", opacity: 0.7, letterSpacing: "0.05em" }}>{drawn.position}</p>
                      <div
                        className={`card-container ${!drawn.flipped ? "pulse-glow" : ""}`}
                        style={{ width: PENTA_CW, height: PENTA_CH, cursor: drawn.flipped ? "default" : "pointer", borderRadius: 8 }}
                        onClick={() => !drawn.flipped && handleFlipCard(index)}
                      >
                        <div className={`card-inner ${drawn.flipped ? "flipped" : ""}`}>
                          <div className="card-face card-back" style={{ overflow: "hidden" }}>
                            <CardBackFace small />
                          </div>
                          <div className="card-face card-front" style={{ boxShadow: drawn.flipped ? (isReversed ? "0 0 16px rgba(180,40,40,0.4)" : "0 0 18px rgba(201,168,76,0.4)") : "none", overflow: "hidden" }}>
                            <div className="w-full h-full relative" style={{ transform: isReversed ? "rotate(180deg)" : "none" }}>
                              <Image src={drawn.card.imagePath} alt={drawn.card.name} fill className="object-contain" sizes={`${PENTA_CW}px`} />
                            </div>
                            {drawn.flipped && (
                              <div style={{ position: "absolute", bottom: 3, right: 4, fontSize: "8px", color: "rgba(201,168,76,0.7)", fontWeight: "bold", textShadow: "0 1px 3px rgba(0,0,0,0.8)", pointerEvents: "none", transform: isReversed ? "rotate(180deg)" : "none" }}>
                                {getRoman(drawn.card.id)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {drawn.flipped && (
                        <div className="mt-1 text-center fade-in-up">
                          <p style={{ fontSize: "10px", color: "#c9a84c", fontWeight: 500 }}>{drawn.card.name}</p>
                          {isReversed && (
                            <span style={{ fontSize: "9px", color: "#f87171", background: "rgba(180,40,40,0.2)", border: "1px solid rgba(180,40,40,0.5)", borderRadius: 9999, padding: "0 4px" }}>逆</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── Standard row layout ──────────────────────────── */
              <div className={`flex justify-center mb-10 ${drawnCards.length === 1 ? "gap-0" : "gap-4 sm:gap-8 flex-wrap sm:flex-nowrap"}`}>
                {drawnCards.map((drawn, index) => {
                  const isReversed = drawn.orientation === "reversed";
                  return (
                    <div key={drawn.card.id} className="flex flex-col items-center">
                      <p className="text-xs tracking-widest mb-3" style={{ color: "#c9a84c", opacity: 0.65 }}>{drawn.position}</p>

                      {/* Card */}
                      <div
                        className={`card-container ${!drawn.flipped ? "pulse-glow" : ""}`}
                        style={{ width: resultCardW, height: resultCardH, cursor: drawn.flipped ? "default" : "pointer", borderRadius: 12 }}
                        onClick={() => !drawn.flipped && handleFlipCard(index)}
                      >
                        <div className={`card-inner ${drawn.flipped ? "flipped" : ""}`}>
                          {/* Back */}
                          <div className="card-face card-back" style={{ overflow: "hidden" }}>
                            <CardBackFace />
                          </div>
                          {/* Front */}
                          <div className="card-face card-front" style={{ boxShadow: drawn.flipped ? (isReversed ? "0 0 28px rgba(180,40,40,0.35)" : "0 0 30px rgba(201,168,76,0.35)") : "none", overflow: "hidden" }}>
                            <div className="w-full h-full relative" style={{ transform: isReversed ? "rotate(180deg)" : "none" }}>
                              <Image src={drawn.card.imagePath} alt={drawn.card.name} fill className="object-contain" sizes={`${resultCardW}px`} />
                            </div>
                            {drawn.flipped && (
                              <div style={{ position: "absolute", bottom: 6, right: 8, fontSize: "10px", color: "rgba(201,168,76,0.7)", fontWeight: "bold", textShadow: "0 1px 3px rgba(0,0,0,0.8)", pointerEvents: "none", transform: isReversed ? "rotate(180deg)" : "none" }}>
                                {getRoman(drawn.card.id)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Label below card */}
                      {drawn.flipped && (
                        <div className="mt-3 text-center fade-in-up">
                          <p className="text-sm font-medium tracking-wider" style={{ color: "#c9a84c" }}>{drawn.card.name}</p>
                          {isReversed ? (
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(180,40,40,0.2)", border: "1px solid rgba(180,40,40,0.5)", color: "#f87171" }}>
                              逆位置
                            </span>
                          ) : (
                            <p className="text-xs mt-0.5" style={{ color: "#f0e5d0", opacity: 0.45 }}>正位置</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Interpretation panel */}
            {activeCardIndex !== null && drawnCards[activeCardIndex]?.flipped && (() => {
              const drawn = drawnCards[activeCardIndex];
              const isReversed = drawn.orientation === "reversed";
              const reading = isReversed ? drawn.card.reversed : drawn.card.upright;
              return (
                <div key={activeCardIndex} className="fade-in-up rounded-2xl p-6 mb-6"
                  style={{
                    background: isReversed
                      ? "linear-gradient(135deg, rgba(50,10,10,0.85), rgba(80,20,20,0.3))"
                      : "linear-gradient(135deg, rgba(26,5,51,0.85), rgba(45,27,105,0.35))",
                    border: `1px solid ${isReversed ? "rgba(180,40,40,0.3)" : "rgba(201,168,76,0.28)"}`,
                    boxShadow: isReversed ? "0 0 40px rgba(120,20,20,0.15)" : "0 0 40px rgba(107,33,168,0.2)",
                  }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold tracking-wider mb-1"
                        style={{ color: isReversed ? "#f87171" : "#c9a84c", fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}>
                        {drawn.card.name}
                        <span className="text-base ml-2 font-normal opacity-50">{getRoman(drawn.card.id)}</span>
                      </h3>
                      <p className="text-xs tracking-widest" style={{ color: "#f0e5d0", opacity: 0.42 }}>
                        {drawn.card.nameEn}&nbsp;·&nbsp;{drawn.position}&nbsp;·&nbsp;
                        {isReversed ? <span style={{ color: "#f87171" }}>逆位置</span> : "正位置"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {reading.keywords.map((kw) => (
                      <span key={kw} className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: isReversed ? "rgba(180,40,40,0.1)" : "rgba(201,168,76,0.1)",
                          border: `1px solid ${isReversed ? "rgba(180,40,40,0.35)" : "rgba(201,168,76,0.3)"}`,
                          color: isReversed ? "#f87171" : "#c9a84c",
                        }}>
                        {kw}
                      </span>
                    ))}
                  </div>

                  <hr className="divider mb-4" style={{ background: `linear-gradient(90deg, transparent, ${isReversed ? "rgba(180,40,40,0.5)" : "#c9a84c"}, transparent)` }} />

                  <p className="text-sm leading-loose" style={{ color: "#f0e5d0", opacity: 0.88 }}>{reading.meaning}</p>

                  {/* Advice */}
                  <div className="mt-5 p-4 rounded-xl"
                    style={{
                      background: isReversed ? "rgba(180,40,40,0.07)" : "rgba(201,168,76,0.07)",
                      border: `1px solid ${isReversed ? "rgba(180,40,40,0.2)" : "rgba(201,168,76,0.18)"}`,
                    }}>
                    <p className="text-xs tracking-widest mb-2" style={{ color: isReversed ? "#f87171" : "#c9a84c", opacity: 0.7 }}>アドバイス</p>
                    <p className="text-sm leading-loose" style={{ color: "#f0e5d0", opacity: 0.88 }}>{reading.advice}</p>
                  </div>

                  {/* Themes */}
                  {selectedTheme && (
                    <div className="mt-5">
                      <p className="text-xs tracking-widest mb-2" style={{ color: isReversed ? "#f87171" : "#c9a84c", opacity: 0.7 }}>
                        {THEME_LABELS[selectedTheme]}の解釈
                      </p>
                      <p className="text-sm leading-loose" style={{ color: "#f0e5d0", opacity: 0.85 }}>{reading.themes[selectedTheme]}</p>
                    </div>
                  )}

                  {drawnCards.length > 1 && (
                    <div className="flex gap-2 mt-5 flex-wrap">
                      {drawnCards.map((d, i) => (
                        <button key={d.card.id} onClick={() => d.flipped && setActiveCardIndex(i)} disabled={!d.flipped}
                          className="text-xs px-4 py-1.5 rounded-full transition-all duration-200"
                          style={{
                            background: i === activeCardIndex ? "rgba(201,168,76,0.15)" : "transparent",
                            border: i === activeCardIndex ? "1px solid rgba(201,168,76,0.6)" : "1px solid rgba(201,168,76,0.15)",
                            color: i === activeCardIndex ? "#c9a84c" : "#f0e5d0",
                            opacity: d.flipped ? 1 : 0.35,
                          }}>
                          {d.position}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* All revealed — AI reading + share */}
            {allFlipped && (
              <div className="fade-in-up mb-6 space-y-3">
                <div className="text-center rounded-xl py-4"
                  style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.18)" }}>
                  <p className="text-sm tracking-widest" style={{ color: "#c9a84c" }}>
                    ✦ &nbsp; すべてのカードが開かれました &nbsp; ✦
                  </p>
                </div>

                {/* AI Reading（愛葉からの総合リーディング）は現在停止中のため非表示 */}

                {aiState === "loading" && (
                  <div className="rounded-2xl p-6"
                    style={{
                      background: "linear-gradient(135deg, rgba(26,5,51,0.85), rgba(45,27,105,0.35))",
                      border: "1px solid rgba(201,168,76,0.28)",
                    }}>
                    <p className="text-xs tracking-widest mb-3" style={{ color: "#c9a84c", opacity: 0.7 }}>
                      ✦ &nbsp; 愛葉がカードを読み解いています... &nbsp; ✦
                    </p>
                    <p className="text-sm leading-loose whitespace-pre-wrap" style={{ color: "#f0e5d0", opacity: 0.88 }}>
                      {aiReading}
                      <span style={{ display: "inline-block", width: "2px", height: "1em", background: "#c9a84c", marginLeft: "2px", animation: "blink 1s step-end infinite", verticalAlign: "text-bottom" }} />
                    </p>
                  </div>
                )}

                {(aiState === "done" || aiState === "error") && (
                  <div className="rounded-2xl p-6"
                    style={{
                      background: aiState === "error"
                        ? "linear-gradient(135deg, rgba(50,10,10,0.85), rgba(80,20,20,0.3))"
                        : "linear-gradient(135deg, rgba(26,5,51,0.85), rgba(45,27,105,0.35))",
                      border: `1px solid ${aiState === "error" ? "rgba(180,40,40,0.3)" : "rgba(201,168,76,0.28)"}`,
                      boxShadow: aiState === "error" ? "none" : "0 0 40px rgba(107,33,168,0.2)",
                    }}>
                    <p className="text-xs tracking-widest mb-3" style={{ color: "#c9a84c", opacity: 0.7 }}>
                      ✦ &nbsp; 愛葉からのメッセージ &nbsp; ✦
                    </p>
                    {aiState === "error" ? (
                      <p className="text-sm" style={{ color: "#f87171" }}>
                        メッセージの取得に失敗しました。もう一度お試しください。
                      </p>
                    ) : (
                      <p className="text-sm leading-loose whitespace-pre-wrap" style={{ color: "#f0e5d0", opacity: 0.9 }}>
                        {aiReading}
                      </p>
                    )}
                    {aiState === "error" && (
                      <button
                        onClick={handleAiReading}
                        className="mt-3 text-xs px-4 py-2 rounded-full transition-all hover:opacity-70"
                        style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}
                      >
                        再試行
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={handlePostToX}
                    className="flex-1 py-3 rounded-xl text-sm tracking-wider transition-all hover:opacity-80 flex items-center justify-center gap-2"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c" }}>
                    <span style={{ fontWeight: 700 }}>𝕏</span><span>ポストする</span>
                  </button>
                  <button onClick={handleShare}
                    className="flex-1 py-3 rounded-xl text-sm tracking-wider transition-all hover:opacity-80 flex items-center justify-center gap-2"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c" }}>
                    {shareState === "copied" ? (
                      <><span>✓</span><span>コピーしました</span></>
                    ) : (
                      <><span>↗</span><span>結果をシェアする</span></>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="text-center">
              <button onClick={handleReset} className="px-8 py-3 rounded-full text-sm tracking-wider transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c4f00 0%, #c9a84c 50%, #7c4f00 100%)", color: "#0a0414", border: "1px solid #c9a84c", boxShadow: "0 0 15px rgba(201,168,76,0.3)" }}>
                もう一度占う
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
