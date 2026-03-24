import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocForge AI",
  description: "Unified AI for PRD and PSD Generation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0f0f11] text-zinc-300 font-sans antialiased h-full overflow-hidden flex flex-col selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}
