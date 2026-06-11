"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Stars from "../components/Stars";
import {
  majorArcana,
  spreadTypes,
  type TarotCard,
  type CardOrientation,
} from "../data/cards";

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

const PRESET_QUESTIONS = [
  "心の中の問いの答えは？　Yes / No",
  "今日のアドバイス",
  "いい出会いはある？",
  "気になる人は私のことをどう思ってる？",
  "仕事は上手くいく？",
];

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

// ── Share helper ──────────────────────────────────────────────────────────────
function buildShareText(question: string, cards: DrawnCard[]): string {
  const lines = ["✦ タロット占いの結果 ✦", ""];
  if (question) lines.push(`【問い】${question}`, "");
  cards.forEach((d) => {
    lines.push(`${d.position}：${d.card.name}（${d.orientation === "upright" ? "正位置" : "逆位置"}）`);
  });
  lines.push("", "🔮 ミスティカル 愛葉（AIha）運命のタロット");
  return lines.join("\n");
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
  const [activeTheme, setActiveTheme] = useState<"love" | "work" | "general">("general");

  const selectedSpread = spreadTypes.find((s) => s.id === spreadId)!;
  const allFlipped = drawnCards.length > 0 && drawnCards.every((d) => d.flipped);

  const handleStartShuffle = useCallback(() => {
    setShuffledDeck(shuffleArray(majorArcana));
    setDrawnCards([]);
    setStep("shuffle");
  }, []);

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
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    }
  };

  const handleReset = () => {
    setStep("spread");
    setQuestion("");
    setDrawnCards([]);
    setShuffledDeck([]);
    setActiveCardIndex(null);
    setShareState("idle");
  };

  // Result card sizes: larger for 1-card
  const resultCardW = drawnCards.length === 1 ? 190 : 140;
  const resultCardH = drawnCards.length === 1 ? 330 : 243;

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
        </div>

        {/* ── SPREAD ──────────────────────────────────────────── */}
        {step === "spread" && (
          <div className="step-in">
            <p className="text-center text-sm tracking-widest mb-8" style={{ color: "#c9a84c" }}>スプレッドを選んでください</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {spreadTypes.map((spread) => (
                <button key={spread.id} onClick={() => { setSpreadId(spread.id); setStep("question"); }}
                  className="p-6 rounded-2xl text-left transition-all duration-300 hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.3)" }}>
                  <div className="flex gap-2 mb-5">
                    {Array.from({ length: spread.cardCount }).map((_, i) => (
                      <div key={i} style={{ width: 22, height: 38, borderRadius: 3, overflow: "hidden", border: "1px solid rgba(201,168,76,0.55)" }}>
                        <CardBackFace small />
                      </div>
                    ))}
                  </div>
                  <div className="text-xl font-bold mb-1 tracking-wider" style={{ color: "#c9a84c" }}>{spread.name}</div>
                  <div className="text-sm" style={{ color: "#f0e5d0", opacity: 0.65 }}>{spread.description}</div>
                </button>
              ))}
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
                      key={q}
                      onClick={() => setQuestion(q)}
                      className="px-5 py-4 rounded-xl text-sm tracking-wide text-left transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        background: question === q ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                        border: question === q ? "1.5px solid rgba(201,168,76,0.75)" : "1px solid rgba(201,168,76,0.25)",
                        color: question === q ? "#c9a84c" : "#f0e5d0",
                        boxShadow: question === q ? "0 0 14px rgba(201,168,76,0.18)" : "none",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* 3枚引き：フリーテキスト */
              <>
                <p className="text-base leading-relaxed mb-8" style={{ color: "#f0e5d0", opacity: 0.8 }}>
                  心の中で問いを思い浮かべてください。<br />または、テキストで入力することもできます。
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
                disabled={spreadId === "one" && !question}
                className="px-8 py-3 rounded-full text-sm tracking-wider font-medium transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #7c4f00 0%, #c9a84c 50%, #7c4f00 100%)", color: "#0a0414", border: "1px solid #c9a84c", boxShadow: "0 0 15px rgba(201,168,76,0.3)" }}>
                カードを引く
              </button>
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

            {/* Cards row */}
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
                  <div className="mt-5">
                    <p className="text-xs tracking-widest mb-3" style={{ color: isReversed ? "#f87171" : "#c9a84c", opacity: 0.7 }}>テーマ別の解釈</p>
                    <div className="flex gap-2 mb-3">
                      {(["love", "work", "general"] as const).map((theme) => {
                        const label = theme === "love" ? "恋愛" : theme === "work" ? "仕事" : "全般";
                        const isActive = activeTheme === theme;
                        return (
                          <button key={theme} onClick={() => setActiveTheme(theme)}
                            className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                            style={{
                              background: isActive ? (isReversed ? "rgba(180,40,40,0.2)" : "rgba(201,168,76,0.15)") : "transparent",
                              border: isActive
                                ? `1px solid ${isReversed ? "rgba(180,40,40,0.6)" : "rgba(201,168,76,0.6)"}`
                                : `1px solid ${isReversed ? "rgba(180,40,40,0.2)" : "rgba(201,168,76,0.2)"}`,
                              color: isActive ? (isReversed ? "#f87171" : "#c9a84c") : "#f0e5d0",
                            }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-sm leading-loose" style={{ color: "#f0e5d0", opacity: 0.85 }}>{reading.themes[activeTheme]}</p>
                  </div>

                  {/* Numerology */}
                  <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs tracking-widest mb-1" style={{ color: isReversed ? "#f87171" : "#c9a84c", opacity: 0.45 }}>数字の意味</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#f0e5d0", opacity: 0.45 }}>{drawn.card.numerology}</p>
                  </div>

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

            {/* All revealed — completion banner + share */}
            {allFlipped && (
              <div className="fade-in-up mb-6 space-y-3">
                <div className="text-center rounded-xl py-4"
                  style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.18)" }}>
                  <p className="text-sm tracking-widest" style={{ color: "#c9a84c" }}>
                    ✦ &nbsp; すべてのカードが開かれました &nbsp; ✦
                  </p>
                </div>

                <button onClick={handleShare}
                  className="w-full py-3 rounded-xl text-sm tracking-wider transition-all hover:opacity-80 flex items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c" }}>
                  {shareState === "copied" ? (
                    <><span>✓</span><span>コピーしました</span></>
                  ) : (
                    <><span>↗</span><span>結果をシェアする</span></>
                  )}
                </button>
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
