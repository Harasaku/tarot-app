import crypto from "node:crypto";

// X API v2 (POST /2/tweets) への投稿。OAuth 1.0a User Context で署名する。
// OAuth 2.0 と違いアクセストークンが無期限のため、リフレッシュ処理が要らず cron 向き。
// 必要な環境変数: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET

const TWEET_ENDPOINT = "https://api.x.com/2/tweets";

// RFC 3986 準拠のエンコード（encodeURIComponent が素通しする ! ' ( ) * も変換）
function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

export async function postTweet(text: string): Promise<{ id: string }> {
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

  // 署名対象は OAuth パラメータのみ（JSON ボディは署名に含めない仕様）
  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join("&");
  const baseString = [
    "POST",
    percentEncode(TWEET_ENDPOINT),
    percentEncode(paramString),
  ].join("&");
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessTokenSecret)}`;
  oauthParams.oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  const authHeader =
    "OAuth " +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(", ");

  const res = await fetch(TWEET_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`X API error ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { id: string } };
  return { id: json.data.id };
}
