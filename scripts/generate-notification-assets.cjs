const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const resDir = path.resolve(__dirname, '../android/app/src/main/res');

// 1. VectorDrawable for modern Android (API 21+)
const vectorDrawableXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <!-- Box Top Face -->
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M11.6,2.5 L3.8,6.5 L11.6,10.4 L11.6,2.5 Z M12.4,2.5 L12.4,10.4 L20.2,6.5 L12.4,2.5 Z" />
    <!-- Box Left Face -->
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M3.8,7.6 L11.2,11.3 L11.2,20.5 L3.8,16.8 Z" />
    <!-- Box Right Face (with cutout for check badge) -->
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M12.8,11.3 L20.2,7.6 L20.2,12.5 C19.3,12.2 18.2,12.0 17.0,12.0 C14.3,12.0 12.1,14.1 11.9,16.7 L12.8,11.3 Z" />
    <!-- Amazon Order Placed Checkmark Badge -->
    <path
        android:fillColor="#FFFFFFFF"
        android:fillType="evenOdd"
        android:pathData="M17,12.5 C14.51,12.5 12.5,14.51 12.5,17 C12.5,19.49 14.51,21.5 17,21.5 C19.49,21.5 21.5,19.49 21.5,17 C21.5,14.51 19.49,12.5 17,12.5 Z M16.3,18.8 L14.5,17.0 L15.2,16.3 L16.3,17.4 L18.8,14.9 L19.5,15.6 L16.3,18.8 Z" />
</vector>
`;

// 2. High-res SVG for small notification icon (Pure white on transparent background)
const smallIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256">
  <defs>
    <mask id="boxMask">
      <rect width="24" height="24" fill="#ffffff" />
      <circle cx="17" cy="17" r="5.2" fill="#000000" />
      <line x1="12" y1="2.5" x2="12" y2="10.5" stroke="#000000" stroke-width="0.8" />
    </mask>
    <mask id="badgeMask">
      <circle cx="17" cy="17" r="4.2" fill="#ffffff" />
      <polyline points="14.8,17 16.4,18.6 19.4,15.2" fill="none" stroke="#000000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </mask>
  </defs>

  <g mask="url(#boxMask)">
    <polygon points="12,2.5 20.2,6.5 12,10.5 3.8,6.5" fill="#ffffff" />
    <polygon points="3.8,7.6 11.2,11.3 11.2,20.5 3.8,16.8" fill="#ffffff" />
    <polygon points="12.8,11.3 20.2,7.6 20.2,16.8 12.8,20.5" fill="#ffffff" />
  </g>

  <rect x="11" y="11" width="12" height="12" fill="#ffffff" mask="url(#badgeMask)" />
</svg>
`;

// 3. Amazon-Style Rich Large Notification Icon (Package with Amazon amber/gold background and verified badge)
const largeIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9900" />
      <stop offset="100%" stop-color="#E68000" />
    </linearGradient>
    <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFF3E0" />
    </linearGradient>
    <linearGradient id="boxLeft" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5F5F7" />
      <stop offset="100%" stop-color="#E5E7EB" />
    </linearGradient>
    <linearGradient id="boxRight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E5E7EB" />
      <stop offset="100%" stop-color="#D1D5DB" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Circular Badge Background -->
  <circle cx="96" cy="96" r="92" fill="url(#bgGrad)" />
  <circle cx="96" cy="96" r="91" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" />

  <!-- 3D Package Box -->
  <g filter="url(#shadow)">
    <!-- Box Top Face -->
    <polygon points="96,44 146,67 96,90 46,67" fill="url(#boxTop)" />
    <!-- Tape along top seam -->
    <polygon points="92,46 100,46 100,88 92,88" fill="#FF9900" />

    <!-- Box Left Face -->
    <polygon points="46,72 92,93 92,142 46,121" fill="url(#boxLeft)" />

    <!-- Box Right Face -->
    <polygon points="100,93 146,72 146,121 100,142" fill="url(#boxRight)" />
    <!-- Tape on right face -->
    <polygon points="100,93 100,142 108,138 108,89" fill="#E68000" opacity="0.6" />
  </g>

  <!-- Amazon-style Order Placed Checkmark Badge on bottom right -->
  <g filter="url(#shadow)">
    <circle cx="138" cy="138" r="28" fill="#10B981" stroke="#FFFFFF" stroke-width="4" />
    <polyline points="126,138 134,146 150,130" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>
`;

async function run() {
  // Ensure directories exist
  const drawableDir = path.join(resDir, 'drawable');
  if (!fs.existsSync(drawableDir)) fs.mkdirSync(drawableDir, { recursive: true });

  // Write VectorDrawables
  fs.writeFileSync(path.join(drawableDir, 'ic_stat_order_placed.xml'), vectorDrawableXml, 'utf8');
  fs.writeFileSync(path.join(drawableDir, 'ic_stat_order.xml'), vectorDrawableXml, 'utf8');
  console.log('VectorDrawables written to drawable/');

  // Densities for small icon (24, 36, 48, 72, 96)
  const smallDensities = [
    { dir: 'drawable-mdpi', size: 24 },
    { dir: 'drawable-hdpi', size: 36 },
    { dir: 'drawable-xhdpi', size: 48 },
    { dir: 'drawable-xxhdpi', size: 72 },
    { dir: 'drawable-xxxhdpi', size: 96 },
  ];

  for (const { dir, size } of smallDensities) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const buf = await sharp(Buffer.from(smallIconSvg))
      .resize(size, size)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(targetDir, 'ic_stat_order_placed.png'), buf);
    fs.writeFileSync(path.join(targetDir, 'ic_stat_order.png'), buf);
    console.log(`Small icon generated for ${dir} (${size}x${size})`);
  }

  // Densities for large icon (48, 72, 96, 144, 192)
  const largeDensities = [
    { dir: 'drawable-mdpi', size: 48 },
    { dir: 'drawable-hdpi', size: 72 },
    { dir: 'drawable-xhdpi', size: 96 },
    { dir: 'drawable-xxhdpi', size: 144 },
    { dir: 'drawable-xxxhdpi', size: 192 },
  ];

  for (const { dir, size } of largeDensities) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const buf = await sharp(Buffer.from(largeIconSvg))
      .resize(size, size)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(targetDir, 'ic_order_large.png'), buf);
    console.log(`Large icon generated for ${dir} (${size}x${size})`);
  }

  console.log('All Android notification icons generated successfully!');
}

run().catch(err => {
  console.error('Asset generation error:', err);
  process.exit(1);
});
