import {
  majorArcana,
  spreadTypes,
  type TarotCard,
  type CardOrientation,
} from "@/app/data/cards";

// シェアURLの形式: /share?s=<spreadId>&c=<num><u|r>-<num><u|r>-...
// 例: /share?s=three&c=0u-5r-20u
// 結果はURLだけで完結させ、閲覧者（未ログイン）がSupabaseに接続しない構成を保つ

export interface SharedCard {
  card: TarotCard;
  orientation: CardOrientation;
  position: string;
}

export interface SharedReading {
  spread: (typeof spreadTypes)[number];
  cards: SharedCard[];
}

export function encodeShareParams(
  spreadId: string,
  drawn: { cardId: string; orientation: CardOrientation }[]
): string {
  const c = drawn
    .map((d) => `${parseInt(d.cardId.replace("maj_", ""), 10)}${d.orientation === "upright" ? "u" : "r"}`)
    .join("-");
  return `s=${spreadId}&c=${c}`;
}

export function decodeShareParams(
  s: string | undefined,
  c: string | undefined
): SharedReading | null {
  if (!s || !c) return null;
  const spread = spreadTypes.find((sp) => sp.id === s);
  if (!spread) return null;

  const tokens = c.split("-");
  if (tokens.length !== spread.cardCount) return null;

  const cards: SharedCard[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < tokens.length; i++) {
    const m = tokens[i].match(/^(\d{1,2})(u|r)$/);
    if (!m) return null;
    const id = `maj_${m[1].padStart(2, "0")}`;
    if (seen.has(id)) return null;
    seen.add(id);
    const card = majorArcana.find((card) => card.id === id);
    if (!card) return null;
    cards.push({
      card,
      orientation: m[2] === "u" ? "upright" : "reversed",
      position: spread.positions[i].label,
    });
  }
  return { spread, cards };
}
