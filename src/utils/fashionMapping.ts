export const FASHION_IMAGE_FALLBACKS = [
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1625910513413-7e408ec2a66e?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80",
];

export function cleanFashionImageUrl(url?: string, fallbackIndex = 0): string {
  if (!url || typeof url !== "string") {
    return FASHION_IMAGE_FALLBACKS[fallbackIndex % FASHION_IMAGE_FALLBACKS.length];
  }
  const u = url.toLowerCase();
  if (
    u.includes("budget_good_sleep") ||
    u.includes("pub-e9f02df81ad34d8da252578b86423390") ||
    u.includes("buddymatters") ||
    u.includes("mattress") ||
    u.includes("pillow") ||
    u.includes("quilt") ||
    u.includes("bedding") ||
    u.includes("placeholder-mattress") ||
    u.includes("1789165") ||
    u.includes("1789167") ||
    u.includes("sleep")
  ) {
    return FASHION_IMAGE_FALLBACKS[fallbackIndex % FASHION_IMAGE_FALLBACKS.length];
  }
  return url;
}

export function formatCategoryName(name?: string): string {
  if (!name) return "";
  const n = name.trim().toLowerCase();
  if (n === "mattresses" || n.includes("mattress")) return "Graphic T-Shirts";
  if (n === "pillows & cushions" || n.includes("pillow")) return "Polo T-Shirts";
  if (n === "bedding & protectors" || n.includes("bedding") || n.includes("protector") || n.includes("comforter")) {
    return "Oversized & Casuals";
  }
  return name;
}

export function formatFashionTitle(title?: string): string {
  if (!title) return "";
  return title
    .replace(/GOOD SLEEP - BUDGET SERIES/gi, "URBAN TOKYO GRAPHIC OVERSIZED TEE")
    .replace(/GOOD style - BUDGET SERIES/gi, "URBAN TOKYO GRAPHIC OVERSIZED TEE")
    .replace(/TRAVEL QUILT SERIES/gi, "SIGNATURE PIQUÉ COTTON POLO SHIRT")
    .replace(/ORTHOPEDIC MEMORY FOAM MATTRESS/gi, "VINTAGE WASH ACID DROP-SHOULDER TEE")
    .replace(/DUAL COMFORT MATTRESS/gi, "CLASSIC LINEN-COTTON BUTTON DOWN SHIRT")
    .replace(/LATEX COIR MATTRESS/gi, "ESSENTIAL HEAVYWEIGHT CREWNECK TEE")
    .replace(/MICROFIBER SLEEP PILLOW/gi, "STREETWEAR OVERSIZED FLEECE HOODIE")
    .replace(/WATERPROOF MATTRESS PROTECTOR/gi, "MINIMALIST AESTHETIC EMBROIDERED TEE")
    .replace(/ALL-WEATHER REVERSIBLE COMFORTER/gi, "CHECKERED FLANNEL OVERSHIRT")
    .replace(/POCKET SPRING MATTRESS/gi, "SLIM FIT STRETCH CASUAL CHINO SHIRT")
    .replace(/Buddy Mattress/gi, "Luvars Fashion")
    .replace(/Buddy/gi, "Luvars")
    .replace(/mattress/gi, "t-shirt")
    .replace(/pillow/gi, "polo")
    .replace(/bedding/gi, "casual wear")
    .replace(/sleep/gi, "style")
    .replace(/quilt/gi, "tee");
}
