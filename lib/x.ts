import crypto from "node:crypto";

// X API v2（メディアアップロード＋投稿）。OAuth 1.0a User Context で署名する。
// OAuth 2.0 と違いアクセストークンが無期限のため、リフレッシュ処理が要らず cron 向き。
// 必要な環境変数: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
// 料金メモ: URL入り投稿は $0.20/件と通常投稿（$0.015）の13倍のため、
// 投稿文にはURLを入れず、カード画像はメディアとして直接添付する。

const TWEET_ENDPOINT = "https://api.x.com/2/tweets";
const MEDIA_ENDPOINT = "https://api.x.com/2/media/upload";

// RFC 3986 準拠のエンコード（encodeURIComponent が素通しする ! ' ( ) * も変換）
function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

// OAuth 1.0a の Authorization ヘッダを作る。
// JSON・multipart ボディは署名対象に含めない仕様のため、署名対象は OAuth パラメータのみ。
function buildOAuthHeader(method: "POST", url: string): string {
  const consumerKey = process.env.X_API_KEY;
  const consumerSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;
  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    throw new Error(
      "X API credentials are not configured (X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET)"
    );
  }

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join("&");
  const baseString = [method, percentEncode(url), percentEncode(paramString)].join("&");
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessTokenSecret)}`;
  oauthParams.oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  return (
    "OAuth " +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(", ")
  );
}

// 画像をアップロードして media id を返す（5MB以下の画像向けシンプルアップロード）
export async function uploadMedia(
  image: ArrayBuffer,
  mimeType: string
): Promise<string> {
  const form = new FormData();
  form.append("media", new Blob([image], { type: mimeType }), "card.png");
  form.append("media_category", "tweet_image");

  const res = await fetch(MEDIA_ENDPOINT, {
    method: "POST",
    // Content-Type は fetch が boundary 付きで自動設定するため指定しない
    headers: { Authorization: buildOAuthHeader("POST", MEDIA_ENDPOINT) },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`X media upload error ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { id: string } };
  return json.data.id;
}

export async function postTweet(
  text: string,
  mediaId?: string
): Promise<{ id: string }> {
  const body: { text: string; media?: { media_ids: string[] } } = { text };
  if (mediaId) {
    body.media = { media_ids: [mediaId] };
  }

  const res = await fetch(TWEET_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: buildOAuthHeader("POST", TWEET_ENDPOINT),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`X API error ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { id: string } };
  return { id: json.data.id };
}
