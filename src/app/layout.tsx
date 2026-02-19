import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NODE_ENV === "production" ? "/tobiraki" : "";

export const metadata: Metadata = {
  title: "トビラキ — 未来の自分を、今、生きる。",
  description: "毎日ランダムに提示される世界のさまざまな場所・シーンを通じて、未来の自分をシミュレーションするツール。",
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "トビラキ",
  },
  icons: {
    apple: `${basePath}/icons/icon-192.png`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FAFAF8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
