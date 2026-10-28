export interface SceneTemplate {
  id: string;
  name: string;
  nameAr: string;
  category: "studio" | "luxury" | "lifestyle" | "artistic" | "promotional" | "detail";
  description: string;
  descriptionAr: string;
  defaultMotion: string;
  defaultDuration: number;
  suitableCategories: string[]; // e.g. ["perfume", "cosmetics", "tech", "all"]
  basePromptModifier: string;
  negativePromptAdditions: string;
}

export const SCENE_LIBRARY: SceneTemplate[] = [
  {
    id: "clean_studio_hero",
    name: "Clean Studio Hero Shot",
    nameAr: "لقطة استوديو نظيفة (Hero Shot)",
    category: "studio",
    description: "Seamless curved backdrop, balanced three-point softbox lighting, soft ground contact shadow.",
    descriptionAr: "خلفية ناعمة ومنحنية، إضاءة ثلاثية النقاط مع صندوق إضاءة ناعم، وظلال ملامسة واقعية.",
    defaultMotion: "Slow cinematic push-in (dolly forward) with gentle 5% zoom",
    defaultDuration: 4,
    suitableCategories: ["all"],
    basePromptModifier: "professional commercial studio product photography, seamless neutral minimalist infinity cyclorama background, soft directional key light, subtle fill light, gentle ground contact reflection, crisp edges, razor-sharp focus, Hasselblad 100mm f/4 lens",
    negativePromptAdditions: "busy background, harsh overexposed hotspots, dirty ground, floating artifacts",
  },
  {
    id: "luxury_dark_premium",
    name: "Luxury Dark Premium",
    nameAr: "فخامة داكنة راقية (Luxury Dark)",
    category: "luxury",
    description: "Deep obsidian backdrop, dramatic gold/warm rim lighting, obsidian reflective surface, moody haze.",
    descriptionAr: "خلفية سوداء أوبسيديان عميقة، إضاءة حواف ذهبية درامية، انعكاسات رخامية أو مائية داكنة، وضباب ناعم.",
    defaultMotion: "Slow orbital pan around the product as gold rim light glides across the contour",
    defaultDuration: 5,
    suitableCategories: ["perfume", "fragrance", "watches", "jewelry", "spirits", "premium tech", "luxury"],
    basePromptModifier: "ultra-luxury commercial advertisement, deep black satin matte backdrop, moody dramatic rim lighting highlighting the silhouette, brushed gold accents, glossy obsidian mirror reflection floor, subtle atmospheric haze, 85mm f/1.4 lens, 8k resolution, cinematic lighting",
    negativePromptAdditions: "bright cartoonish colors, overexposed white backgrounds, flat ambient light",
  },
  {
    id: "lifestyle_in_use",
    name: "Lifestyle In-Use Environment",
    nameAr: "بيئة أسلوب حياة واقعية (Lifestyle)",
    category: "lifestyle",
    description: "Authentic, high-end real world setting matched to the target market and cultural aesthetic.",
    descriptionAr: "بيئة واقعية راقية تناسب السوق المستهدف (صالون عصري، رخام حمام فاخر، طاولة مقهى راقية).",
    defaultMotion: "Subtle handheld parallax glide with soft rack-focus from background ambiance onto the product",
    defaultDuration: 5,
    suitableCategories: ["all"],
    basePromptModifier: "authentic premium lifestyle setting, sunlit architectural interior, warm ambient interior light, tastefully decorated modern luxury space, organic textures, natural depth of field, 50mm f/1.8 lens",
    negativePromptAdditions: "cluttered messy room, plastic cheap props, distorted perspectives",
  },
  {
    id: "flat_lay_top_down",
    name: "Flat-Lay / Top-Down Arrangement",
    nameAr: "تنسيق مسطح من الأعلى (Flat-Lay)",
    category: "artistic",
    description: "Artistic overhead bird-eye composition surrounded by curated botanical or artisanal ingredients/props.",
    descriptionAr: "لقطة رأسية فنية بزاوية 90 درجة مع عناصر ومكونات طبيعية مكملة للمنتج مرتبة بدقة.",
    defaultMotion: "Slow descending crane shot looking straight down while subtle dust or light shimmer sweeps across",
    defaultDuration: 4,
    suitableCategories: ["skincare", "cosmetics", "food", "beverages", "stationery", "accessories"],
    basePromptModifier: "knolling flat-lay arrangement shot from 90 degrees directly above, artisanal textured linen or travertine stone background, carefully spaced organic botanicals and raw ingredients, soft even natural morning window light, high architectural balance",
    negativePromptAdditions: "crooked angles, perspective distortion, crowded overlaps, dirty stains",
  },
  {
    id: "dynamic_splash_levitation",
    name: "Dynamic Splash & Levitation",
    nameAr: "حركة سائلة ديناميكية وتطاير (Splash / Levitation)",
    category: "artistic",
    description: "High-speed frozen motion, product hovering with suspended water droplets, powder burst, or silk ribbon.",
    descriptionAr: "لقطة حركة سريعة مجمدة مع تطاير قطرات ماء نقية، أو بودرة حريرية متطايرة حول المنتج بثبات.",
    defaultMotion: "Subtle rotational float of droplets drifting away while the central product remains crisp and stable",
    defaultDuration: 4,
    suitableCategories: ["skincare", "perfume", "beverages", "sports", "footwear", "cosmetics"],
    basePromptModifier: "high-speed frozen motion commercial photography, 1/8000s shutter speed, weightless levitating product surrounded by crystal-clear liquid droplets and micro-splashes catching backlights, volumetric lighting beams, dynamic fluid motion",
    negativePromptAdditions: "blurry motion, messy mud, occluded logo, distorted product shape",
  },
  {
    id: "outdoor_natural_light",
    name: "Outdoor Golden Hour",
    nameAr: "ضوء طبيعي خارجي / الساعة الذهبية",
    category: "lifestyle",
    description: "Warm golden sunlight, sun flares, natural limestone, sand dunes, or lush Mediterranean garden.",
    descriptionAr: "إضاءة شمس الغروب الدافئة، وهج خفيف، أسطح حجر جيري أو كثبان رملية أو طبيعة خضراء أنيقة.",
    defaultMotion: "Slow lateral tracking shot with sun rays piercing through foliage, creating organic lens flare",
    defaultDuration: 6,
    suitableCategories: ["all"],
    basePromptModifier: "breathtaking outdoor commercial shot during magic hour golden hour, warm 3200k low-angle sun rays, gentle optical lens flare, natural textured sandstone pedestal, soft bokeh foliage in background, organic warm atmosphere, 85mm prime lens",
    negativePromptAdditions: "overcast gray sky, rainy dark mud, harsh midday overhead glare",
  },
  {
    id: "macro_detail_closeup",
    name: "Macro Detail Close-Up",
    nameAr: "لقطة ماكرو مقربة للتفاصيل (Macro Detail)",
    category: "detail",
    description: "Extreme close-up showcasing micro-texture, embossed engraving, material craftsmanship, or nozzle/cap.",
    descriptionAr: "لقطة مقربة للغاية توضح ملمس الخامات، النقوش، جودة التصنيع الدقيقة، وزوايا الإضاءة المنعكسة.",
    defaultMotion: "Smooth macro rack-focus shifting from the textured surface edge across to the sharp embossed logo",
    defaultDuration: 4,
    suitableCategories: ["watches", "jewelry", "perfume", "leather", "electronics", "cosmetics"],
    basePromptModifier: "extreme macro commercial photography, 105mm f/2.8 macro lens, exquisite focus stacking, visible fine micro-textures, tactile craftsmanship, precision engineered details, directional fiber-optic spotlight, ultra-high micro-contrast",
    negativePromptAdditions: "digital noise, blurry textures, chromatic aberration, fingerprint smudges",
  },
  {
    id: "podium_pedestal",
    name: "Geometric Podium & Arch",
    nameAr: "منصة هندسية مع أقواس (Podium & Arch)",
    category: "studio",
    description: "Minimalist sculptural podium (travertine, fluted marble, matte terracotta) with modern architectural arches.",
    descriptionAr: "منصة أسطوانية أو رخامية حديثة، أقواس معمارية مائلة بأسلوب تجريدي مع إضاءة حادة وظلال ناعمة.",
    defaultMotion: "Vertical pedestal tilt-up from the base of the podium revealing the product standing proud",
    defaultDuration: 4,
    suitableCategories: ["cosmetics", "skincare", "perfume", "tech", "fashion", "beverages"],
    basePromptModifier: "contemporary minimalist architectural 3D set, tiered geometric cylinder podium made of ribbed matte travertine, softly arched beige limewash backdrop, sharp architectural sunlight casting dramatic clean diagonal shadows, high fashion editorial aesthetic",
    negativePromptAdditions: "messy clutter, irregular crooked geometries, low-res stone textures",
  },
  {
    id: "model_hands_in_use",
    name: "Hands-Holding / Model In-Use",
    nameAr: "إمساك باليد / عارض بشري (In-Use Model)",
    category: "lifestyle",
    description: "Elegant, manicured hands interacting naturally with the product (holding, spraying, unboxing, or wearing).",
    descriptionAr: "أيادٍ أنيقة مشذبة بعناية تتفاعل مع المنتج بنعومة (إمساك، رش، فتح الغطاء) بأسلوب إعلاني فاخر.",
    defaultMotion: "Gentle hand movement presenting the product smoothly towards the camera with soft natural breathing motion",
    defaultDuration: 5,
    suitableCategories: ["all"],
    basePromptModifier: "editorial commercial fashion ad, manicured hands with natural skin texture gently holding the product, soft natural side lighting, blurred boutique background, authentic human interaction, 50mm f/1.8 lens",
    negativePromptAdditions: "distorted fingers, extra limbs, creepy mutant hands, missing knuckles, occluding the logo",
  },
  {
    id: "seasonal_promotional",
    name: "Seasonal / Cultural Celebration",
    nameAr: "موسمي وترويجي (رمضان / الأعياد / الجمعة البيضاء)",
    category: "promotional",
    description: "Festive thematic scene: Ramadan crescent & lanterns, Eid elegance, Black Friday neon, or luxury gift box.",
    descriptionAr: "مشهد احتفالي مميز: هلال رمضان مع فوانيس زجاجية ونقوش مشربية إسلامية، أو هدايا العيد الفاخرة.",
    defaultMotion: "Slow crane-down while warm lantern light shimmers and subtle golden dust particles drift in the background",
    defaultDuration: 5,
    suitableCategories: ["all"],
    basePromptModifier: "prestigious festive seasonal advertising campaign, subtle glowing crescent moon and intricate geometric brass lanterns, warm amber lights, scattered starry bokeh, opulent gift ribbons, celebration mood, culturally authentic luxury, 85mm f/1.4 lens",
    negativePromptAdditions: "cliché cheap decorations, cartoonish cliparts, garish festive kitsch",
  },
  {
    id: "minimal_color_pop",
    name: "Minimalist Brand Color Pop",
    nameAr: "خلفية بلون الهوية المنعش (Color Pop)",
    category: "studio",
    description: "Bold monochromatic or complementary dual-tone background that makes the product explode off the screen.",
    descriptionAr: "خلفية أحادية أو ثنائية الألوان مستوحاة من ألوان العلامة التجارية مع تباين قوي يجعل المنتج يبرز بقوة.",
    defaultMotion: "Dynamic snap punch-in (quick smooth push-in) with a micro camera shake on beat",
    defaultDuration: 3,
    suitableCategories: ["beverages", "tech", "sneakers", "skincare", "youth", "fashion"],
    basePromptModifier: "bold contemporary high-contrast studio shot, vibrant saturated matte colored backdrop complementing the product palette, high-key pop lighting, crisp graphic cast shadows, modern Gen-Z and TikTok ad aesthetic, razor sharp clarity",
    negativePromptAdditions: "dull muddy colors, dirty gradients, over-desaturated tones",
  },
  {
    id: "problem_solution_concept",
    name: "Problem-Solution / Metaphor Concept",
    nameAr: "مفهوم المشكلة والحل (Problem / Solution Concept)",
    category: "artistic",
    description: "Conceptual visual metaphor illustrating the core product benefit (hydration, speed, serenity, protection).",
    descriptionAr: "مشهد مفاهيمي يوضح فائدة المنتج (مثل نصف صحراء جافة ونصف واحة منتعشة، أو درع حماية زجاجي نقي).",
    defaultMotion: "Horizontal tracking slide revealing the transition from contrast elements directly to the pristine product",
    defaultDuration: 5,
    suitableCategories: ["skincare", "tech", "wellness", "supplements", "cleaning", "protective gear"],
    basePromptModifier: "cinematic conceptual advertising metaphor, sophisticated visual contrast between raw organic elements and pristine modern perfection, glowing aura of purity, award-winning Cannes Lions commercial look, immaculate composition",
    negativePromptAdditions: "confusing visual metaphors, chaotic elements obscuring the product",
  },
];

export function selectBestScenesForProduct(category: string, count: 4 | 8 | 12): SceneTemplate[] {
  const catLower = (category || "").toLowerCase();
  
  // Rank templates based on category match
  const scored = SCENE_LIBRARY.map((template) => {
    let score = 5; // default base
    if (template.suitableCategories.includes("all")) score += 3;
    if (template.suitableCategories.some((sc) => catLower.includes(sc))) score += 10;
    
    // Specific bonuses
    if ((catLower.includes("perfume") || catLower.includes("fragrance")) && 
        ["luxury_dark_premium", "dynamic_splash_levitation", "clean_studio_hero", "macro_detail_closeup"].includes(template.id)) {
      score += 15;
    }
    if ((catLower.includes("skin") || catLower.includes("serum") || catLower.includes("cream")) && 
        ["clean_studio_hero", "flat_lay_top_down", "dynamic_splash_levitation", "podium_pedestal"].includes(template.id)) {
      score += 15;
    }
    if ((catLower.includes("watch") || catLower.includes("tech") || catLower.includes("phone")) && 
        ["luxury_dark_premium", "macro_detail_closeup", "clean_studio_hero", "podium_pedestal"].includes(template.id)) {
      score += 15;
    }
    return { template, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.template);
}
