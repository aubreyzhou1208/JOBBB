import type { Metadata } from "next";

import "@/app/globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { AppStateProvider } from "@/components/providers/app-state-provider";

export const metadata: Metadata = {
  title: "求职投递管理台",
  description: "一个为后续 SaaS 扩展预留结构的求职投递管理前端 MVP。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppStateProvider>
          <AppShell>{children}</AppShell>
        </AppStateProvider>
      </body>
    </html>
  );
}
