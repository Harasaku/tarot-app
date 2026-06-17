import Anthropic from "@anthropic-ai/sdk";

const THEME_LABELS: Record<string, string> = {
  yesno: "Yes/No",
  general: "全般",
  love: "恋愛",
  work: "仕事",
  money: "お金",
  interpersonal: "対人",
};

const VALID_THEMES = new Set(Object.keys(THEME_LABELS));

interface CardInput {
  name: string;
  nameEn: string;
  position: string;
  orientation: "upright" | "reversed";
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("Server configuration error", { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { cards, question, theme } = body as {
    cards?: unknown;
    question?: unknown;
    theme?: unknown;
  };

  if (
    !Array.isArray(cards) ||
    cards.length < 1 ||
    cards.length > 5 ||
    (theme !== undefined && theme !== null && !VALID_THEMES.has(theme as string)) ||
    (typeof question === "string" && question.length > 300)
  ) {
    return new Response("Invalid request", { status: 400 });
  }

  for (const c of cards as CardInput[]) {
    if (
      typeof c.name !== "string" ||
      typeof c.position !== "string" ||
      (c.orientation !== "upright" && c.orientation !== "reversed")
    ) {
      return new Response("Invalid card data", { status: 400 });
    }
  }

  const cardLines = (cards as CardInput[])
    .map(
      (c) =>
        `・${c.position}：${c.name}（${c.orientation === "upright" ? "正位置" : "逆位置"}）`
    )
    .join("\n");

  const themeLabel = theme ? THEME_LABELS[theme as string] : null;
  const questionText =
    typeof question === "string" && question.trim()
      ? question.trim()
      : "（問いは特に指定なし）";

  const userMessage = [
    `【問い】${questionText}`,
    themeLabel ? `【テーマ】${themeLabel}` : "",
    `【引いたカード】\n${cardLines}`,
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `あなたは「愛葉（AIha）」という名の神秘的なタロット占い師です。
和の雰囲気を持ち、温かみのある言葉で語りかけます。
占い師として、引いたカードの組み合わせから深い洞察を与えてください。

以下のルールを守ってください：
- 「愛葉です」「私は愛葉」などの自己紹介は不要です
- 各カードの意味を機械的に羅列するのではなく、カード同士のつながりを読み解いて語ってください
- 問いとテーマに寄り添った、具体的で温かいメッセージを届けてください
- 敬語・丁寧語を使い、神秘的な雰囲気を大切にしてください
- 400〜600文字程度でまとめてください
- 末尾に「✦」などの記号で締めてください`;

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-haiku-4-5",
          max_tokens: 800,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
