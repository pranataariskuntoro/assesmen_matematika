import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asesmen SMKN 31 Jakarta",
  description: "Platform Ujian Digital SMKN 31 Jakarta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${sora.variable} h-full antialiased bg-gray-50`}
    >
      <body className="min-h-full font-sans text-gray-900">{children}</body>
    </html>
  );
}
