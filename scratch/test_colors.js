// Scratch script to test pixel color quantization algorithms
const fs = require('fs');

function quantizeRgbToHex(pixels) {
  // pixels is an array of {r, g, b}
  const buckets = {};
  
  for (const { r, g, b } of pixels) {
    // Skip transparent, near white (r,g,b > 240) or near black (r,g,b < 20)
    if (r > 240 && g > 240 && b > 240) continue;
    if (r < 20 && g < 20 && b < 20) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chrom = max - min;
    
    // Calculate HSL Hue
    let hue = 0;
    if (chrom >= 15) {
      if (max === r) hue = (g - b) / chrom + (g < b ? 6 : 0);
      else if (max === g) hue = (b - r) / chrom + 2;
      else hue = (r - g) / chrom + 4;
      hue = Math.round(hue * 60) % 360;
    }

    // Bin into 32x32x32 RGB quantiles
    const qr = Math.floor(r / 24) * 24 + 12;
    const qg = Math.floor(g / 24) * 24 + 12;
    const qb = Math.floor(b / 24) * 24 + 12;
    const key = `${qr},${qg},${qb}`;

    if (!buckets[key]) {
      buckets[key] = { rSum: 0, gSum: 0, bSum: 0, count: 0, chrom };
    }

    // Weight colorful pixels 4x higher than dull/monochrome pixels
    const weight = chrom >= 20 ? 4 : 1;
    buckets[key].rSum += r * weight;
    buckets[key].gSum += g * weight;
    buckets[key].bSum += b * weight;
    buckets[key].count += weight;
  }

  let maxWeight = 0;
  let bestKey = null;
  for (const k in buckets) {
    if (buckets[k].count > maxWeight) {
      maxWeight = buckets[k].count;
      bestKey = k;
    }
  }

  if (bestKey && buckets[bestKey].count > 0) {
    const b = buckets[bestKey];
    const avgR = Math.round(b.rSum / b.count);
    const avgG = Math.round(b.gSum / b.count);
    const avgB = Math.round(b.bSum / b.count);
    const toHex = (c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0');
    return `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`;
  }

  return "#5a6f87";
}

console.log("Quantizer module ready.");
