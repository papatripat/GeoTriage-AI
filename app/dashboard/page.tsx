"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled — Leaflet requires the `window` object
const MapDashboard = dynamic(() => import("@/components/MapDashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="text-center">
        <div className="spinner !h-10 !w-10 text-emerald-400 mx-auto mb-4" />
        <p className="text-gray-400">Memuat peta interaktif...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Dashboard Bencana</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Peta real-time laporan bencana dari seluruh Indonesia
          </p>
        </div>

        {/* Map Component */}
        <MapDashboard />
      </div>
    </div>
  );
}
