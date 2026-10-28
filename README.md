# AdScene Studio Pro 🎬✨
### AI Commercial Ad & Cinematic Video Scene Engine

> Transform ONE product photo into an omnichannel suite of photorealistic advertising scenes with production-ready video motion prompts for **Veo, Runway, Kling, Luma, Sora, and Higgsfield**.

---

## 🌟 Core Features

1. **Precision Product Fidelity Guarantee**
   - Ingests a single product image and performs deep computer vision inspection (`product_name`, `category`, `materials`, `colors`, `shape`, `key_features`, `brand_text_visible`, `do_not_change[]`).
   - Locks visual identity: preserves original geometries, caps, nozzles, typography, and logos without hallucination or morphing.
   - Automated vision-based **Fidelity Check** compares generated scenes to original reference with automatic 2x retry on drift.

2. **Omnichannel Scene Synthesis (12 Studio Templates)**
   - **Clean Studio Hero Shot** (seamless cyclorama, 3-point softbox)
   - **Luxury Dark Premium** (obsidian black, gold rim lighting, reflections)
   - **Lifestyle In-Use Environment** (interior architecture tailored to target market)
   - **Flat-Lay / Top-Down Arrangement** (90° knolling with complementary organic props)
   - **Dynamic Splash & Levitation** (high-speed frozen motion, fluid droplets, suspended silk)
   - **Outdoor Golden Hour** (warm 3200K sun, natural textured sandstone, soft flare)
   - **Macro Detail Close-Up** (focus stacking on craftsmanship, textures, and debossed logos)
   - **Geometric Podium & Arch** (travertine podium, minimal architectural shadows)
   - **Hands-Holding / Model In-Use** (manicured hands or commercial model demographics)
   - **Seasonal & Cultural Celebration** (Ramadan crescent/lanterns, Eid elegance, Black Friday)
   - **Minimalist Brand Color Pop** (high-key pop lighting with brand color blocking)
   - **Problem-Solution / Benefit Metaphor** (dramatic conceptual visual storytelling)

3. **Cinematic Image-to-Video Prompts**
   - Every single generated scene comes with a tailored, tested **Video Motion Prompt**.
   - Built specifically for image-to-video engines (Google Veo, Runway Gen-3 Alpha, Kling AI, Luma Dream Machine, OpenAI Sora).
   - Enforces motion safety: camera motion trajectories (dolly push-in, orbital glide, crane down, rack-focus) while strictly prohibiting product deformation or text morphing.

4. **Bilingual UI (Arabic Default + English)**
   - Complete Arabic localization (`dir="rtl"`) as default, with seamless one-click switch to English (`dir="ltr"`).
   - Culturally tailored creative copy, slogans, and voiceovers for Egypt/MENA and GCC markets.

5. **Studio Tools & Storyboard Pack Export**
   - Interactive side-by-side comparison slider with the original product.
   - Per-scene tools: **Regenerate**, **Variation**, **Edit with Text Instruction** (*"make background warmer"*), and **4K Upscale**.
   - One-click copy buttons for Image Prompts, Video Prompts, Negative Prompts, and Voiceover copy.
   - Export Storyboard Pack:
     - **ZIP Archive** of high-res images organized by aspect ratio (`9:16`, `1:1`, `4:5`, `16:9`).
     - **JSON Metadata** for production pipelines.
     - **Print-ready / PDF Storyboard view** ready for client presentations.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript + React 18
- **Styling**: Tailwind CSS + Custom Dark Studio Theme + RTL support
- **Icons**: Lucide React
- **Database**: SQLite via Prisma ORM (`Project`, `Asset`, `Analysis`, `Scene`, `Generation`, `Job`)
- **Validation**: Zod (Strict schema validation for all LLM inputs & outputs)
- **Pluggable Providers Layer (`/lib/providers`)**:
  - **Vision / LLM**: Gemini 1.5/2.0 Flash (`GeminiVisionProvider`), OpenAI GPT-4o (`OpenAIVisionProvider`), or Mock (`MockVisionProvider`).
  - **Image Generation**: Gemini Imagen 3 (`GeminiImageProvider`), OpenAI DALL-E 3 (`OpenAIImageProvider`), Replicate Flux.1 (`ReplicateFluxProvider`), or Studio Mock Engine (`MockImageProvider`).
  - **Storage**: Local Filesystem (`/public/uploads/`) with pluggable S3/Supabase adapter.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 22 LTS)
- npm or pnpm

### 2. Installation
```bash
git clone <repo-url>
cd adscene-studio
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="file:./dev.db"
STORAGE_DRIVER="local"

# Provider selection: gemini | openai | replicate | mock
VISION_PROVIDER="gemini"
IMAGE_PROVIDER="gemini"

# API Keys (Keep server-side only)
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"
REPLICATE_API_TOKEN="your-replicate-token"
```

> 💡 **Zero-Config Instant Demo Mode**:
> If you launch without setting API keys, the app automatically switches to the built-in intelligent **Studio Mock Engine**. You can test the entire pipeline, try the demo products, run inspections, generate scenes, compare side-by-side, and export Storyboards with zero external dependencies!

### 4. Setup Database & Seed Demo Data
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Unit Tests
Unit tests verify the core prompt engineering logic, template selection, fidelity directives, and safety evaluation:
```bash
npm test
```

---

## 📁 Architecture & File Structure

```
adscene-studio/
├── app/
│   ├── api/
│   │   ├── upload/route.ts        # Image upload & dimension check
│   │   ├── analyze/route.ts       # Vision product inspection (POST/PUT)
│   │   ├── generate/route.ts      # Multi-scene generation & auto-retry
│   │   ├── scene/action/route.ts  # Regenerate, variation, text edits
│   │   ├── projects/route.ts      # Project history list
│   │   ├── projects/[id]/route.ts # Single project details & delete
│   │   └── export/route.ts        # ZIP and JSON Storyboard export
│   ├── projects/page.tsx          # Project history gallery view
│   ├── storyboard/[id]/page.tsx   # Print-ready / PDF Storyboard view
│   ├── layout.tsx                 # Root layout with Arabic RTL & fonts
│   ├── page.tsx                   # Main Stepper page (Steps 1-5)
│   └── globals.css                # Studio dark theme & animations
├── components/
│   ├── LanguageContext.tsx        # Bilingual RTL/LTR state provider
│   ├── Navbar.tsx                 # Studio navigation & language toggle
│   ├── Stepper.tsx                # 5-stage progress indicator
│   ├── StepUpload.tsx             # Step 1: Drag & drop + demo presets
│   ├── StepAnalyze.tsx            # Step 2: Vision scan & editable fields
│   ├── StepBrief.tsx              # Step 3: Target market & platforms
│   ├── StepGenerate.tsx           # Step 4: Real-time generation progress
│   └── StepExport.tsx             # Step 5: Studio tools, compare, export
├── lib/
│   ├── providers/
│   │   ├── types.ts               # IVisionProvider, IImageProvider, IStorageProvider
│   │   ├── vision-provider.ts     # Gemini, OpenAI & Mock vision
│   │   ├── image-provider.ts      # Gemini Imagen, DALL-E, Flux & Mock
│   │   ├── storage-provider.ts    # Local filesystem & S3 adapters
│   │   └── index.ts               # Dynamic provider registry
│   ├── types.ts                   # Zod schemas (Analysis, ScenePrompt, Fidelity)
│   ├── scene-library.ts           # 12 commercial scene templates
│   ├── prompt-builder.ts          # Master image & video prompt synthesis
│   ├── fidelity.ts                # Anti-drift fidelity check & scoring
│   ├── safety.ts                  # Brand safety & in-memory rate limiting
│   ├── i18n.ts                    # Complete Arabic & English dictionary
│   └── db.ts                      # Prisma client singleton
├── prisma/
│   ├── schema.prisma              # SQLite relational schema
│   └── seed.ts                    # Demo perfume project seeder
├── public/
│   ├── demo/                      # Demo product assets (perfume, serum, watch)
│   └── uploads/                   # Local file storage target
└── package.json
```

---

## 🛡️ Brand Safety & Content Protection
- Automated content sanitizer screens against restricted, violent, adult, or copyrighted terms.
- In-memory sliding window rate limiter protects endpoints from excessive requests.
- Strictly locks product geometry and text to prevent brand distortion.

---

## 📄 License
MIT © 2026 AdScene Studio. Commercial advertising rights reserved.
