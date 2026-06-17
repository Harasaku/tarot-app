"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Stars from "../components/Stars";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setMessage("");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("確認メールを送信しました。メール内のリンクをクリックしてください。");
      }
    }
    setLoading(false);
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(201,168,76,0.25)",
    color: "#f0e5d0",
  } as React.CSSProperties;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <Stars />
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(107,33,168,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-sm tracking-widest transition-opacity hover:opacity-70"
            style={{ color: "#c9a84c" }}
          >
            ← トップへ戻る
          </Link>
          <h2
            className="shimmer-text text-2xl font-bold tracking-widest mt-4"
            style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}
          >
            {mode === "login" ? "ログイン" : "新規登録"}
          </h2>
          <hr className="divider mt-3 mx-auto w-24" />
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          {/* Mode toggle */}
          <div className="flex gap-2 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 py-2 rounded-full text-sm tracking-wider transition-all"
                style={{
                  background:
                    mode === m ? "rgba(201,168,76,0.12)" : "transparent",
                  border: `1px solid ${mode === m ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.2)"}`,
                  color: mode === m ? "#c9a84c" : "#f0e5d0",
                }}
              >
                {m === "login" ? "ログイン" : "新規登録"}
              </button>
            ))}
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(201,168,76,0.65)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(201,168,76,0.25)";
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード（8文字以上）"
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(201,168,76,0.65)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(201,168,76,0.25)";
              }}
            />

            {error && (
              <p className="text-xs text-center" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-center leading-relaxed" style={{ color: "#c9a84c" }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-sm tracking-wider font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, #7c4f00 0%, #c9a84c 50%, #7c4f00 100%)",
                color: "#0a0414",
                border: "1px solid #c9a84c",
                boxShadow: "0 0 15px rgba(201,168,76,0.3)",
              }}
            >
              {loading ? "..." : mode === "login" ? "ログイン" : "登録する"}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}
