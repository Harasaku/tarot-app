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

  const handleOAuth = async (provider: "google" | "apple") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
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

          {/* Divider */}
          <div className="relative mb-5">
            <hr
              style={{
                border: "none",
                borderTop: "1px solid rgba(201,168,76,0.15)",
              }}
            />
            <span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs"
              style={{ background: "#140b24", color: "#f0e5d0", opacity: 0.4 }}
            >
              または
            </span>
          </div>

          {/* Social login */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuth("google")}
              className="w-full py-3 rounded-xl text-sm tracking-wide transition-all hover:opacity-80 flex items-center justify-center gap-3"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "#f0e5d0",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google でログイン
            </button>

            <button
              onClick={() => handleOAuth("apple")}
              className="w-full py-3 rounded-xl text-sm tracking-wide transition-all hover:opacity-80 flex items-center justify-center gap-3"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "#f0e5d0",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple でログイン
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
