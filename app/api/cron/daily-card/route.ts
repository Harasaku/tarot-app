import crypto from "node:crypto";
import { majorArcana, type CardOrientation } from "@/app/data/cards";
import { postTweet } from "@/lib/x";

// 「今日の一枚」を Aiha の X アカウントへ毎朝自動投稿する。
// Vercel Cron から毎日1回呼ばれる（vercel.json の crons 参照）。
// カードは日付（JST）から決定的に選ぶ: 同日に再実行されても文面が同一になり、
// X 側の重複投稿拒否と合わせて二重投稿を防げる。
// 投稿にはシェアページの URL を載せ、OGP でカード画像を表示させる（メディアアップロード不要）。

const SITE_URL = "https://www.tarot-aiha.com";

function jstDateString(): string {
  // sv-SE ロケールは YYYY-MM-DD 形式を返す
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
    new Date()
  );
}

function composeDailyPost(dateStr: string): string {
  // 連続する日付は文字列がほぼ同じため、単純なハッシュだとカードが連番になってしまう。
  // SHA-256 なら1文字の違いで全ビットが変わり、日ごとの分布が均一になる。
  const digest = crypto.createHash("sha256").update(dateStr).digest();
  const card = majorArcana[digest.readUInt32BE(0) % majorArcana.length];
  const orientation: CardOrientation = digest[4] % 2 === 0 ? "upright" : "reversed";
  const face = card[orientation];
  const label = orientation === "upright" ? "正位置" : "逆位置";
  const firstSentence = face.meaning.split("。")[0] + "。";

  const cardNum = parseInt(card.id.replace("maj_", ""), 10);
  const shareUrl = `${SITE_URL}/share?s=one&c=${cardNum}${orientation === "upright" ? "u" : "r"}`;

  return [
    "おはようございます、愛葉です🔮",
    "",
    `今日の一枚は「${card.name}（${label}）」`,
    firstSentence,
    "",
    "カードの詳しい意味はこちらから✦",
    shareUrl,
    "",
    "#タロット占い #今日の一枚 #愛葉タロット",
  ].join("\n");
}

export async function GET(request: Request) {
  // CRON_SECRET が設定されていれば、Vercel Cron 以外からの呼び出しを拒否する
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dateStr = jstDateString();
  const text = composeDailyPost(dateStr);

  // ?dry=1 なら投稿せず文面だけ返す（動作確認用）
  const { searchParams } = new URL(request.url);
  if (searchParams.get("dry") === "1") {
    return Response.json({ ok: true, dry: true, date: dateStr, text });
  }

  try {
    const { id } = await postTweet(text);
    return Response.json({ ok: true, date: dateStr, tweetId: id });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
