"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Stars from "../../components/Stars";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(201,168,76,0.25)",
    color: "#f0e5d0",
  } as React.CSSProperties;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("パスワードの更新に失敗しました。もう一度お試しください。");
    } else {
      setMessage("パスワードを更新しました。ログインページへ移動します...");
      setTimeout(() => router.push("/auth"), 2000);
    }
    setLoading(false);
  };

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
        <div className="text-center mb-8">
          <h2
            className="shimmer-text text-2xl font-bold tracking-widest mt-4"
            style={{ fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" }}
          >
            新しいパスワードを設定
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="新しいパスワード（8文字以上）"
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
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="パスワードを再入力"
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
              {loading ? "..." : "パスワードを更新する"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
