import crypto from "node:crypto";
import { majorArcana, type CardOrientation } from "@/app/data/cards";
import { postTweet, uploadMedia } from "@/lib/x";

// 「今日の一枚」を Aiha の X アカウントへ毎朝自動投稿する。
// Vercel Cron から毎日1回呼ばれる（vercel.json の crons 参照）。
// カードは日付（JST）から決定的に選ぶ: 同日に再実行されても文面が同一になり、
// X 側の重複投稿拒否と合わせて二重投稿を防げる。
// URL入り投稿はPPU料金が13倍（$0.20/件）のため文面にURLは入れず、
// カード画像（/api/og の生成画像）をメディアとして直接添付する。
// サイトへの誘導はプロフィールのリンクに任せる。

const SITE_URL = "https://www.tarot-aiha.com";

function jstDateString(): string {
  // sv-SE ロケールは YYYY-MM-DD 形式を返す
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
    new Date()
  );
}

function composeDailyPost(dateStr: string): { text: string; ogPath: string } {
  // 連続する日付は文字列がほぼ同じため、単純なハッシュだとカードが連番になってしまう。
  // SHA-256 なら1文字の違いで全ビットが変わり、日ごとの分布が均一になる。
  const digest = crypto.createHash("sha256").update(dateStr).digest();
  const card = majorArcana[digest.readUInt32BE(0) % majorArcana.length];
  const orientation: CardOrientation = digest[4] % 2 === 0 ? "upright" : "reversed";
  const face = card[orientation];
  const label = orientation === "upright" ? "正位置" : "逆位置";
  const firstSentence = face.meaning.split("。")[0] + "。";

  const cardNum = parseInt(card.id.replace("maj_", ""), 10);
  const ogPath = `/api/og?s=one&c=${cardNum}${orientation === "upright" ? "u" : "r"}`;

  const text = [
    "おはようございます、愛葉です🔮",
    "",
    `今日の一枚は「${card.name}（${label}）」`,
    firstSentence,
    "",
    "詳しい意味はプロフィールのリンクから✦",
    "",
    "#タロット占い #今日の一枚 #愛葉タロット",
  ].join("\n");

  return { text, ogPath };
}

export async function GET(request: Request) {
  // CRON_SECRET が設定されていれば、Vercel Cron 以外からの呼び出しを拒否する
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dateStr = jstDateString();
  const { text, ogPath } = composeDailyPost(dateStr);

  // ?dry=1 なら投稿せず文面だけ返す（動作確認用）
  const { searchParams } = new URL(request.url);
  if (searchParams.get("dry") === "1") {
    return Response.json({ ok: true, dry: true, date: dateStr, text, ogPath });
  }

  try {
    const imgRes = await fetch(`${SITE_URL}${ogPath}`);
    if (!imgRes.ok) {
      throw new Error(`OG image fetch failed: ${imgRes.status}`);
    }
    const mediaId = await uploadMedia(await imgRes.arrayBuffer(), "image/png");
    const { id } = await postTweet(text, mediaId);
    return Response.json({ ok: true, date: dateStr, tweetId: id });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
