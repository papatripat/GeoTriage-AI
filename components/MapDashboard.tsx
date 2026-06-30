"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabaseClient";

// ========================
// Custom Marker Icons
// ========================

const kritisIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 28px; height: 28px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: 3px solid #fca5a5;
    border-radius: 50%;
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.6), 0 2px 8px rgba(0,0,0,0.3);
    animation: pulse 2s ease-in-out infinite;
  "></div>
  <style>
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.85; }
    }
  </style>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

const siagaIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 24px; height: 24px;
    background: linear-gradient(135deg, #eab308, #ca8a04);
    border: 3px solid #fde047;
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(234, 179, 8, 0.5), 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
});

// ========================
// Map Auto-fit Component
// ========================

function FitBounds({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(
        reports.map((r) => [r.latitude, r.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [reports, map]);

  return null;
}

// ========================
// Types
// ========================

interface Report {
  id: string;
  latitude: number;
  longitude: number;
  image_url: string;
  jenis_bencana: string;
  tingkat_keparahan: string;
  detail_dampak: string;
  created_at: string;
}

// ========================
// Main Component
// ========================

export default function MapDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("laporan_bencana")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const kritisCount = reports.filter(
    (r) => r.tingkat_keparahan === "Kritis"
  ).length;
  const siagaCount = reports.filter(
    (r) => r.tingkat_keparahan === "Siaga"
  ).length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="spinner !h-10 !w-10 text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Memuat data bencana...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card !p-4 text-center">
          <p className="text-3xl font-black text-white">{reports.length}</p>
          <p className="mt-1 text-xs font-medium text-gray-400">
            Total Laporan
          </p>
        </div>
        <div className="glass-card !p-4 text-center border-red-500/20">
          <p className="text-3xl font-black text-red-400">{kritisCount}</p>
          <p className="mt-1 text-xs font-medium text-gray-400">🔴 Kritis</p>
        </div>
        <div className="glass-card !p-4 text-center border-yellow-500/20">
          <p className="text-3xl font-black text-yellow-400">{siagaCount}</p>
          <p className="mt-1 text-xs font-medium text-gray-400">🟡 Siaga</p>
        </div>
      </div>

      {/* Map */}
      <div className="glass-card !p-0 overflow-hidden" style={{ height: "65vh" }}>
        <MapContainer
          center={[-2.5, 118.0]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {reports.length > 0 && <FitBounds reports={reports} />}

          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={
                report.tingkat_keparahan === "Kritis" ? kritisIcon : siagaIcon
              }
            >
              <Popup maxWidth={280} minWidth={240}>
                <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 10px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background:
                          report.tingkat_keparahan === "Kritis"
                            ? "rgba(239,68,68,0.2)"
                            : "rgba(234,179,8,0.2)",
                        color:
                          report.tingkat_keparahan === "Kritis"
                            ? "#f87171"
                            : "#facc15",
                        border: `1px solid ${
                          report.tingkat_keparahan === "Kritis"
                            ? "rgba(239,68,68,0.3)"
                            : "rgba(234,179,8,0.3)"
                        }`,
                      }}
                    >
                      {report.tingkat_keparahan === "Kritis" ? "🔴" : "🟡"}{" "}
                      {report.tingkat_keparahan}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#d1d5db",
                        background: "rgba(255,255,255,0.1)",
                        padding: "2px 10px",
                        borderRadius: "9999px",
                      }}
                    >
                      {report.jenis_bencana}
                    </span>
                  </div>

                  {/* Image */}
                  <img
                    src={report.image_url}
                    alt={`Foto ${report.jenis_bencana}`}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      marginBottom: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />

                  {/* Detail */}
                  <p
                    style={{
                      fontSize: "12px",
                      lineHeight: "1.5",
                      color: "#d1d5db",
                      marginBottom: "6px",
                    }}
                  >
                    {report.detail_dampak}
                  </p>

                  {/* Footer */}
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#6b7280",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      paddingTop: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      📍 {report.latitude.toFixed(4)},{" "}
                      {report.longitude.toFixed(4)}
                    </span>
                    <span>🕐 {formatDate(report.created_at)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Recent Reports List */}
      {reports.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold text-white">
            📋 Laporan Terbaru
          </h2>
          <div className="space-y-2">
            {reports.slice(0, 10).map((report) => (
              <div
                key={report.id}
                className="glass-card !p-3 flex items-center gap-3"
              >
                <img
                  src={report.image_url}
                  alt={report.jenis_bencana}
                  className="h-14 w-14 rounded-lg object-cover border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        report.tingkat_keparahan === "Kritis"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-sm font-semibold text-white truncate">
                      {report.jenis_bencana}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {report.detail_dampak}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {formatDate(report.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    report.tingkat_keparahan === "Kritis"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {report.tingkat_keparahan}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="glass-card text-center py-12">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-gray-400">
            Belum ada laporan bencana.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Mulai laporkan bencana dari halaman utama.
          </p>
        </div>
      )}
    </div>
  );
}
