import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { decodeShareParams } from "@/lib/share";

export const runtime = "nodejs";

const GOLD = "#c9a84c";
const CREAM = "#f0e5d0";
const RED = "#f87171";

// Google Fontsのtext=指定で表示に必要なグリフだけのサブセットを取得する
// （UAなしのfetchにはTTF/OTF形式が返るためSatoriでそのまま使える）
async function loadJapaneseFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@600&text=${encodeURIComponent(text)}`;
    const css = await fetch(cssUrl).then((res) => res.text());
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!match) return null;
    return await fetch(match[1]).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

async function loadCardImage(origin: string, imagePath: string): Promise<string | null> {
  try {
    const buf = await fetch(`${origin}${imagePath}`).then((res) => {
      if (!res.ok) throw new Error(`${res.status}`);
      return res.arrayBuffer();
    });
    return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const reading = decodeShareParams(
    searchParams.get("s") ?? undefined,
    searchParams.get("c") ?? undefined
  );
  if (!reading) {
    return new Response("Not found", { status: 404 });
  }

  const count = reading.cards.length;
  const cardH = count === 1 ? 400 : count === 3 ? 360 : 290;
  const cardW = Math.round(cardH * 0.665);
  const nameSize = count === 5 ? 22 : 26;

  const title = "タロット占いの結果";
  const brand = "ミスティカル 愛葉（AIha）運命のタロット";
  const fontText =
    title +
    brand +
    reading.spread.name +
    "tarot-aiha.com・正位置逆" +
    reading.cards.map((c) => c.card.name + c.position).join("");

  const [font, ...images] = await Promise.all([
    loadJapaneseFont(fontText),
    ...reading.cards.map((c) => loadCardImage(origin, c.card.imagePath)),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "36px 40px 28px",
          background: "linear-gradient(160deg, #0a0414 0%, #1a0533 45%, #2d1b69 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ color: GOLD, fontSize: 34, letterSpacing: "0.2em" }}>{title}</div>
          <div
            style={{
              color: CREAM,
              opacity: 0.6,
              fontSize: 24,
              letterSpacing: "0.1em",
            }}
          >
            {reading.spread.name}
          </div>
        </div>

        <div style={{ display: "flex", gap: count === 5 ? 22 : 44, alignItems: "flex-start" }}>
          {reading.cards.map((drawn, i) => {
            const reversed = drawn.orientation === "reversed";
            return (
              <div
                key={drawn.card.id}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
              >
                {images[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[i]}
                    width={cardW}
                    height={cardH}
                    alt=""
                    style={{
                      borderRadius: 12,
                      border: `2px solid ${reversed ? "rgba(180,40,40,0.7)" : "rgba(201,168,76,0.7)"}`,
                      ...(reversed ? { transform: "rotate(180deg)" } : {}),
                      boxShadow: reversed
                        ? "0 0 28px rgba(180,40,40,0.45)"
                        : "0 0 30px rgba(201,168,76,0.45)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: cardW,
                      height: cardH,
                      borderRadius: 12,
                      border: `2px solid rgba(201,168,76,0.7)`,
                      background: "linear-gradient(160deg, #1a0533 0%, #2d1b69 50%, #170430 100%)",
                    }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ color: GOLD, fontSize: nameSize }}>
                    {count > 1 ? `${drawn.position}：${drawn.card.name}` : drawn.card.name}
                  </div>
                  <div
                    style={{
                      color: reversed ? RED : CREAM,
                      opacity: reversed ? 1 : 0.6,
                      fontSize: nameSize - 6,
                    }}
                  >
                    {reversed ? "逆位置" : "正位置"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ color: GOLD, fontSize: 24, letterSpacing: "0.08em" }}>{`🔮 ${brand}`}</div>
          <div style={{ color: CREAM, opacity: 0.5, fontSize: 22 }}>tarot-aiha.com</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: font
        ? [{ name: "Noto Serif JP", data: font, weight: 600 as const, style: "normal" as const }]
        : undefined,
      headers: {
        // 同じ結果URLは常に同じ画像なので長期キャッシュしてよい
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
