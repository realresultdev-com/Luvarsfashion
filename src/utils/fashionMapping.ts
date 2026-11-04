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
    .replace(/Buddy Mattress/gi, "Luvars Fashion")
    .replace(/Buddy/gi, "Luvars")
    .replace(/mattress/gi, "t-shirt")
    .replace(/pillow/gi, "polo")
    .replace(/bedding/gi, "casual wear")
    .replace(/sleep/gi, "style")
    .replace(/quilt/gi, "tee")
    .replace(/Travel Quilt Series/gi, "Urban Graphic Tee Series");
}

