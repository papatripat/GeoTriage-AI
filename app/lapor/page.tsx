"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AnalysisResult {
  jenis_bencana: string;
  tingkat_keparahan: string;
  detail_dampak: string;
}

type AppStatus =
  | "idle"
  | "capturing"
  | "uploading"
  | "analyzing"
  | "success"
  | "error";

export default function ReportPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<AppStatus>("idle");
  const [statusText, setStatusText] = useState("Arahkan kamera ke lokasi bencana");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraReady(true);
      }
    } catch {
      setErrorMsg(
        "Gagal mengakses kamera. Pastikan izin kamera sudah diberikan."
      );
      setStatus("error");
    }
  }, []);

  // Get GPS coordinates
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation tidak didukung oleh browser ini.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setErrorMsg("Gagal mendapatkan lokasi GPS. Izinkan akses lokasi.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  useEffect(() => {
    startCamera();
    getLocation();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [startCamera, getLocation]);

  // Capture photo, upload, analyze
  const handleReport = async () => {
    if (!videoRef.current || !canvasRef.current || !coords) {
      setErrorMsg(
        !coords
          ? "Lokasi GPS belum tersedia. Tunggu sebentar..."
          : "Kamera belum siap."
      );
      return;
    }

    setResult(null);
    setErrorMsg("");

    // Step 1: Capture
    setStatus("capturing");
    setStatusText("Mengambil foto...");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);

    // Convert to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const fileName = `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;

    // Step 2: Upload to Supabase Storage
    setStatus("uploading");
    setStatusText("Mengunggah foto ke server...");

    const { error: uploadError } = await supabase.storage
      .from("bencana_images")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        cacheControl: "3600",
      });

    if (uploadError) {
      setErrorMsg(`Gagal mengunggah foto: ${uploadError.message}`);
      setStatus("error");
      return;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("bencana_images").getPublicUrl(fileName);

    // Step 3: Analyze with Gemini
    setStatus("analyzing");
    setStatusText("AI sedang menganalisis bencana...");

    try {
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: publicUrl,
          latitude: coords.lat,
          longitude: coords.lng,
        }),
      });

      if (!analyzeResponse.ok) {
        const errData = await analyzeResponse.json();
        throw new Error(errData.error || "Gagal menganalisis gambar.");
      }

      const data = await analyzeResponse.json();
      setResult(data.analysis);
      setStatus("success");
      setStatusText("Laporan berhasil dikirim!");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Terjadi kesalahan tidak dikenal."
      );
      setStatus("error");
    }
  };

  // Reset to take new photo
  const handleReset = () => {
    setStatus("idle");
    setStatusText("Arahkan kamera ke lokasi bencana");
    setResult(null);
    setCapturedImage(null);
    setErrorMsg("");
    startCamera();
  };

  const isProcessing =
    status === "capturing" || status === "uploading" || status === "analyzing";

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Pelaporan Bencana</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Foto lokasi bencana untuk analisis AI otomatis
          </p>
        </div>

        {/* Camera / Captured Image */}
        <div className="glass-card mb-4 overflow-hidden !p-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
            {/* Live camera feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${
                capturedImage ? "hidden" : "block"
              }`}
            />

            {/* Captured snapshot */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Foto bencana"
                className="h-full w-full object-cover"
              />
            )}

            {/* Viewfinder overlay */}
            {!capturedImage && cameraReady && <div className="viewfinder" />}

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
                <div className="spinner !h-8 !w-8 text-blue-400" />
                <span className="text-sm font-medium text-blue-300 animate-pulse">
                  {statusText}
                </span>
              </div>
            )}

            {/* Camera not ready */}
            {!cameraReady && !capturedImage && status !== "error" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="spinner !h-8 !w-8 text-gray-500 mb-3 mx-auto" />
                  <p className="text-sm text-gray-500">Memuat kamera...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GPS Info */}
        <div className="glass-card mb-4 !p-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                coords
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              📍
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-400">Koordinat GPS</p>
              {coords ? (
                <p className="text-sm font-mono text-gray-200">
                  {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </p>
              ) : (
                <p className="text-sm text-yellow-400 animate-pulse">
                  Mencari lokasi...
                </p>
              )}
            </div>
            {coords && (
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            )}
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">⚠️ {errorMsg}</p>
          </div>
        )}

        {/* Action Button */}
        {status === "idle" && (
          <button
            id="btn-report"
            onClick={handleReport}
            disabled={!cameraReady || !coords}
            className="pulse-glow w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            style={{ animationPlayState: !cameraReady || !coords ? "paused" : "running" }}
          >
            🚨 Informasikan Bencana
          </button>
        )}

        {status === "success" && (
          <button
            id="btn-reset"
            onClick={handleReset}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
          >
            📸 Laporkan Bencana Lain
          </button>
        )}

        {status === "error" && (
          <button
            id="btn-retry"
            onClick={handleReset}
            className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-lg font-bold text-red-300 transition-all hover:bg-red-500/20"
          >
            🔄 Coba Lagi
          </button>
        )}

        {/* Analysis Result */}
        {result && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="mb-3 text-lg font-bold text-white">
              📊 Hasil Analisis AI
            </h2>
            <div className="glass-card space-y-4">
              {/* Severity Badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
                    result.tingkat_keparahan === "Kritis"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {result.tingkat_keparahan === "Kritis" ? "🔴" : "🟡"}{" "}
                  {result.tingkat_keparahan}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-gray-300">
                  {result.jenis_bencana}
                </span>
              </div>

              {/* Detail */}
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Detail Dampak
                </p>
                <p className="text-sm leading-relaxed text-gray-300">
                  {result.detail_dampak}
                </p>
              </div>

              {/* Location */}
              {coords && (
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-gray-500">📍 Lokasi dilaporkan</p>
                  <p className="font-mono text-sm text-gray-300">
                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canvas (hidden, for capture) */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
