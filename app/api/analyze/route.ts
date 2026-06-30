import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

interface GeminiAnalysis {
  jenis_bencana: string;
  tingkat_keparahan: string;
  detail_dampak: string;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize clients at request time (not module load) to avoid build errors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const { image_url, latitude, longitude } = await request.json();

    // Validate input
    if (!image_url || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: image_url, latitude, longitude" },
        { status: 400 }
      );
    }

    // Step 1: Fetch the image and convert to base64
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil gambar dari URL yang diberikan." },
        { status: 400 }
      );
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Step 2: Call Gemini Vision API
    const prompt = `Analisis foto bencana ini. Identifikasi:
1. jenis_bencana: salah satu dari [Banjir, Gempa/Runtuh, Longsor, Kebakaran, Lainnya]
2. tingkat_keparahan: salah satu dari [Siaga, Kritis]  
3. detail_dampak: deskripsi singkat dampak yang terlihat di foto (2-3 kalimat)

PENTING: Kembalikan HANYA format JSON murni tanpa markdown atau teks tambahan:
{"jenis_bencana": "...", "tingkat_keparahan": "...", "detail_dampak": "..."}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    const responseText = geminiResponse.text ?? "";

    // Step 3: Parse JSON from Gemini response
    let analysis: GeminiAnalysis;
    try {
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in Gemini response");
      }
      analysis = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (
        !analysis.jenis_bencana ||
        !analysis.tingkat_keparahan ||
        !analysis.detail_dampak
      ) {
        throw new Error("Missing required fields in analysis");
      }
    } catch {
      console.error("Failed to parse Gemini response:", responseText);
      // Fallback analysis
      analysis = {
        jenis_bencana: "Lainnya",
        tingkat_keparahan: "Siaga",
        detail_dampak:
          "AI tidak dapat menganalisis gambar dengan tepat. Diperlukan verifikasi manual oleh petugas.",
      };
    }

    // Step 4: Save to Supabase database
    const { error: insertError } = await supabase
      .from("laporan_bencana")
      .insert({
        latitude,
        longitude,
        image_url,
        jenis_bencana: analysis.jenis_bencana,
        tingkat_keparahan: analysis.tingkat_keparahan,
        detail_dampak: analysis.detail_dampak,
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: `Gagal menyimpan laporan: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Step 5: Return success
    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan server internal.",
      },
      { status: 500 }
    );
  }
}
