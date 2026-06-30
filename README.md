# 🚨 GeoTriage AI

> Smart Disaster Reporting System Powered by AI Vision

A full-stack application that enables citizens to report disasters in real-time using their **smartphone camera** and **GPS**. Disaster photos are automatically analyzed by **Google Gemini Vision AI** to identify the disaster type, severity level, and impact details — then visualized on an **interactive map** for stakeholders.

## ✨ Key Features

- 📸 **Real-Time Reporting** — Capture photos via rear camera + auto-detect GPS coordinates
- 🤖 **AI Analysis** — Google Gemini Vision identifies disaster type & severity
- 🗺️ **Map Dashboard** — Leaflet map with Critical (red) & Alert (yellow) markers
- 🌙 **Dark Mode UI** — Modern glassmorphism design, mobile-first
- ☁️ **Cloud Storage** — Photos stored in Supabase Storage

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database & Storage | Supabase |
| AI Vision | Google Gemini API |
| Map | Leaflet + React-Leaflet |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/USERNAME/geotriage.git
cd geotriage
npm install
```

### 2. Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → run the contents of `database.sql`
3. Open **Storage** → create a bucket named `bencana_images` (check **Public**)
4. Add Storage policies for INSERT & SELECT (role: `anon`)

### 3. Setup Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSy...
```

### 4. Run

```bash
npm run dev
```

- 📸 Reporting: [http://localhost:3000](http://localhost:3000)
- 🗺️ Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 📁 Project Structure

```
geotriage/
├── database.sql              # SQL table + RLS policies
├── lib/supabaseClient.ts     # Supabase client initialization
├── app/
│   ├── globals.css           # Dark theme + glassmorphism styles
│   ├── layout.tsx            # Root layout + navigation
│   ├── page.tsx              # Reporting page (camera + GPS)
│   ├── dashboard/page.tsx    # Interactive map dashboard
│   └── api/analyze/route.ts  # API: Gemini Vision + DB insert
└── components/
    └── MapDashboard.tsx      # Leaflet map + markers + popups
```

## 📄 License

MIT
