import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoTriage AI — Sistem Pelaporan Bencana Cerdas",
  description:
    "Laporkan bencana secara real-time dengan AI Vision. Foto, GPS, dan analisis otomatis untuk penanganan darurat yang lebih cepat.",
  keywords: ["bencana", "pelaporan", "AI", "gemini", "peta", "real-time"],
  authors: [{ name: "GeoTriage AI Team" }],
  openGraph: {
    title: "GeoTriage AI",
    description: "Sistem Pelaporan Bencana Berbasis AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="GeoTriage Logo" className="h-10 w-10 rounded-xl bg-white p-1 object-cover" />
              <span className="text-lg font-bold tracking-tight">
                <span className="gradient-text">Geo</span>
                <span className="text-gray-300">Triage</span>
                <span className="ml-1 text-xs font-medium text-emerald-400/80">
                  AI
                </span>
              </span>
            </a>
            <div className="flex items-center gap-1">
              <a
                href="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
              >
                <span className="mr-1.5">📸</span>
                Lapor
              </a>
              <a
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
              >
                <span className="mr-1.5">🗺️</span>
                Dashboard
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
