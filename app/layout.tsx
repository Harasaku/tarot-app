import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // OGP画像などの相対URLを本番の絶対URLに解決する（apexはwwwへリダイレクトされるためwwwを正とする）
  metadataBase: new URL("https://www.tarot-aiha.com"),
  title: "神秘のタロット占い",
  description: "タロットカードがあなたの未来を照らします",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
