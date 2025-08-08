import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import { QueryProvider } from "@/providers/query-provider";
import { TokenMonitorProvider } from "@/providers/token-monitor-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 챗봇 플랫폼",
  description: "캐릭터별 AI 대화와 채팅을 즐길 수 있는 플랫폼입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <TokenMonitorProvider>{children}</TokenMonitorProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
          <SonnerToaster richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
