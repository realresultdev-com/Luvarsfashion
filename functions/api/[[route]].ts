/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { cors } from "hono/cors";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";

import { DEFAULT_FIREBASE_SERVICE_ACCOUNT } from "./firebase-config";

export type Env = {
  DB: D1Database;
  BUCKET?: R2Bucket;
  R2_PUBLIC_URL?: string;
  JWT_SECRET?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  FIREBASE_SERVICE_ACCOUNT?: string | Record<string, any>;
};

type UserPayload = {
  userId: string;
  role: string;
  exp: number;
  name?: string;
  email?: string;
};

const app = new Hono<{ Bindings: Env; Variables: { user?: UserPayload } }>().basePath("/api");

// Enable CORS and JSON error handling
app.use("*", cors());

app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ error: err.message || "Internal Server Error" }, 500);
});

// Helper for JWT Secret
const getJwtSecret = (env: Env) => env.JWT_SECRET || "supersecret_jwt_key_cf_ecommerce_2024";

// URL Security & ID Encryption / Decryption Helper
const SECRET_KEY = "Buddy_Mattress_Secure_Salt_Key_2024";

const encryptId = (rawId: string | undefined): string => {
  if (!rawId || typeof rawId !== "string") return "";
  if (rawId.startsWith("enc_")) return rawId;

  const keyChars = SECRET_KEY.split("").map((c) => c.charCodeAt(0));
  const bytes: number[] = [];

  for (let i = 0; i < rawId.length; i++) {
    const charCode = rawId.charCodeAt(i);
    const keyByte = keyChars[i % keyChars.length];
    bytes.push(charCode ^ keyByte);
  }

  let checksum = 0;
  for (let i = 0; i < rawId.length; i++) {
    checksum = (checksum + rawId.charCodeAt(i) * (i + 1)) % 256;
  }
  bytes.push(checksum);

  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `enc_${hex}`;
};

const decryptId = (cipherText: string | undefined): string => {
  if (!cipherText || typeof cipherText !== "string") return "";
  if (!cipherText.startsWith("enc_")) {
    return cipherText;
  }

  const hex = cipherText.slice(4);
  if (hex.length < 4 || hex.length % 2 !== 0) {
    return cipherText;
  }

  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }

  const checksum = bytes.pop();
  const keyChars = SECRET_KEY.split("").map((c) => c.charCodeAt(0));
  let decrypted = "";

  for (let i = 0; i < bytes.length; i++) {
    const keyByte = keyChars[i % keyChars.length];
    decrypted += String.fromCharCode(bytes[i] ^ keyByte);
  }

  let expectedChecksum = 0;
  for (let i = 0; i < decrypted.length; i++) {
    expectedChecksum = (expectedChecksum + decrypted.charCodeAt(i) * (i + 1)) % 256;
  }

  if (checksum !== expectedChecksum) {
    return cipherText;
  }

  return decrypted;
};

// Middleware: Authentication
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized: Missing token" }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = (await verify(token, getJwtSecret(c.env), "HS256")) as unknown as UserPayload;
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ message: "Unauthorized: Invalid or expired token" }, 401);
  }
};

// Middleware: Optional Authentication (allows guests or attached user)
const optionalAuthMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const payload = (await verify(token, getJwtSecret(c.env), "HS256")) as unknown as UserPayload;
      c.set("user", payload);
    } catch {}
  }
  await next();
};

// Middleware: Admin Role (Dynamic from D1 database)
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get("user") as UserPayload | undefined;
  if (!user?.userId) {
    return c.json({ message: "Forbidden: Admin access required" }, 403);
  }

  // Always query database directly to ensure role is dynamically managed in D1
  const dbUser: any = await c.env.DB.prepare(
    "SELECT role FROM users WHERE id = ?"
  ).bind(user.userId).first();

  if (!dbUser || dbUser.role !== "ADMIN") {
    return c.json({ message: "Forbidden: Admin access required" }, 403);
  }

  await next();
};

/* ==========================================================================
   1. AUTHENTICATION
   ========================================================================== */

app.post("/auth/register", async (c) => {
  const { name, email, password } = await c.req.json();
  if (!name || !email || !password) {
    return c.json({ message: "Name, email, and password are required" }, 400);
  }

  // Check if user exists
  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
  if (existing) {
    return c.json({ message: "Email is already registered" }, 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `usr-${crypto.randomUUID()}`;
  const role = "USER";

  await c.env.DB.prepare(
    "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)"
  ).bind(userId, name, email.toLowerCase(), hashedPassword, role).run();

  const token = await sign(
    { userId, role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    getJwtSecret(c.env)
  );

  return c.json(
    {
      user: { id: userId, name, email: email.toLowerCase(), role },
      token,
    },
    201
  );
});

app.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ message: "Email and password are required" }, 400);
  }

  const user: any = await c.env.DB.prepare(
    "SELECT id, name, email, password, role, avatar_url FROM users WHERE email = ?"
  ).bind(email.toLowerCase()).first();

  if (!user) {
    return c.json({ message: "Invalid email or password" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return c.json({ message: "Invalid email or password" }, 401);
  }

  const token = await sign(
    { userId: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    getJwtSecret(c.env)
  );

  return c.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url },
    token,
  });
});

app.post("/auth/google", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const credential = body.credential || body.id_token;
  const accessToken = body.access_token || body.accessToken;

  if (!credential && !accessToken) {
    return c.json({ message: "Google credential token or access token is required" }, 400);
  }

  let googleUser: any;
  try {
    if (credential) {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (res.ok) {
        googleUser = await res.json();
      }
    }
    if (!googleUser && accessToken) {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        googleUser = await res.json();
      }
    }
    if (!googleUser) {
      throw new Error("Failed to verify Google token with Google authorization servers");
    }
  } catch (err: any) {
    return c.json({ message: err.message || "Failed to verify Google token" }, 401);
  }

  const email = (googleUser.email || "").toLowerCase();
  const name = googleUser.name || googleUser.given_name || "Google User";
  const picture = googleUser.picture || "";
  if (!email) {
    return c.json({ message: "Email not provided by Google account" }, 400);
  }

  // Look up existing user in D1
  let user: any = await c.env.DB.prepare(
    "SELECT id, name, email, role, avatar_url FROM users WHERE email = ?"
  ).bind(email).first();

  if (!user) {
    const userId = `usr-google-${googleUser.sub || crypto.randomUUID().slice(0, 8)}`;
    const role = "USER";
    const dummyPassword = await bcrypt.hash(crypto.randomUUID(), 10);

    await c.env.DB.prepare(
      "INSERT INTO users (id, name, email, password, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(userId, name, email, dummyPassword, role, picture).run();

    user = { id: userId, name, email, role, avatar_url: picture };
  } else if (picture && user.avatar_url !== picture) {
    // Dynamically store/update Google profile picture in D1 database
    await c.env.DB.prepare(
      "UPDATE users SET avatar_url = ? WHERE id = ?"
    ).bind(picture, user.id).run();
    user.avatar_url = picture;
  }

  const token = await sign(
    { userId: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    getJwtSecret(c.env)
  );

  return c.json({ user, token });
});

app.get("/auth/me", authMiddleware, async (c) => {
  const userPayload = c.get("user")!;
  const user: any = await c.env.DB.prepare(
    "SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?"
  ).bind(userPayload.userId).first();

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  return c.json({ ...user, user });
});

/* ==========================================================================
   USER SEARCH HISTORY (PERSISTED ON DB)
   ========================================================================== */

app.get("/user/searches", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const { results } = await c.env.DB.prepare(
    "SELECT id, query, created_at FROM user_searches WHERE user_id = ? ORDER BY created_at DESC LIMIT 8"
  ).bind(user.userId).all();
  return c.json(results || []);
});

// Dynamic Popular Searches (Aggregated from real user searches and active categories)
app.get("/searches/popular", async (c) => {
  try {
    // 1. Get most frequently searched terms across all users
    const { results: topSearches } = await c.env.DB.prepare(`
      SELECT query, COUNT(*) as frequency 
      FROM user_searches 
      GROUP BY LOWER(query) 
      ORDER BY frequency DESC, MAX(created_at) DESC 
      LIMIT 6
    `).all();

    const popularTerms: string[] = (topSearches || []).map((r: any) => r.query);

    // 2. If fewer than 5 queries exist, supplement with active D1 store categories
    if (popularTerms.length < 5) {
      const { results: categories } = await c.env.DB.prepare(
        "SELECT name FROM categories ORDER BY name ASC LIMIT 6"
      ).all();

      for (const cat of categories || []) {
        if (!popularTerms.some((t) => t.toLowerCase() === (cat as any).name.toLowerCase())) {
          popularTerms.push((cat as any).name);
        }
        if (popularTerms.length >= 6) break;
      }
    }

    return c.json(popularTerms);
  } catch (err: any) {
    console.error("Failed to load popular searches:", err);
    return c.json(["Orthopedic", "Memory Foam", "Dual Comfort", "Pillow", "Mattress Protector"]);
  }
});

app.post("/user/searches", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const { query } = await c.req.json();
  if (!query || typeof query !== "string" || !query.trim()) {
    return c.json({ message: "Query is required" }, 400);
  }

  const trimmed = query.trim().slice(0, 80);
  // Delete any existing duplicate query for this user to bump to top
  await c.env.DB.prepare(
    "DELETE FROM user_searches WHERE user_id = ? AND LOWER(query) = LOWER(?)"
  ).bind(user.userId, trimmed).run();

  const id = `srch-${crypto.randomUUID()}`;
  await c.env.DB.prepare(
    "INSERT INTO user_searches (id, user_id, query) VALUES (?, ?, ?)"
  ).bind(id, user.userId, trimmed).run();

  // Keep only latest 15 searches per user
  await c.env.DB.prepare(`
    DELETE FROM user_searches 
    WHERE user_id = ? AND id NOT IN (
      SELECT id FROM user_searches WHERE user_id = ? ORDER BY created_at DESC LIMIT 15
    )
  `).bind(user.userId, user.userId).run();

  return c.json({ id, query: trimmed, success: true }, 201);
});

app.delete("/user/searches/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");
  if (id === "all") {
    await c.env.DB.prepare("DELETE FROM user_searches WHERE user_id = ?").bind(user.userId).run();
    return c.json({ success: true });
  }
  await c.env.DB.prepare("DELETE FROM user_searches WHERE id = ? AND user_id = ?").bind(id, user.userId).run();
  return c.json({ success: true });
});

/* ==========================================================================
   2. CATEGORIES
   ========================================================================== */

app.get("/categories", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM categories ORDER BY name ASC").all();
  c.header("Cache-Control", "no-cache, no-store, must-revalidate");
  return c.json(results);
});

app.post("/categories", authMiddleware, adminMiddleware, async (c) => {
  const { name, offer_badge_prefix, offer_badge_value } = await c.req.json();
  if (!name) return c.json({ message: "Name is required" }, 400);

  const id = `cat-${crypto.randomUUID()}`;
  const prefix = offer_badge_prefix !== undefined ? offer_badge_prefix : "Starting";
  const value = offer_badge_value !== undefined ? offer_badge_value : "";
  await c.env.DB.prepare(
    "INSERT INTO categories (id, name, offer_badge_prefix, offer_badge_value) VALUES (?, ?, ?, ?)"
  ).bind(id, name, prefix, value).run();

  return c.json({ id, name, offer_badge_prefix: prefix, offer_badge_value: value }, 201);
});

app.put("/categories/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const { name, offer_badge_prefix, offer_badge_value } = await c.req.json();

  const existing: any = await c.env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ message: "Category not found" }, 404);

  const updatedName = name !== undefined ? name : existing.name;
  const updatedPrefix = offer_badge_prefix !== undefined ? offer_badge_prefix : (existing.offer_badge_prefix ?? "Starting");
  const updatedValue = offer_badge_value !== undefined ? offer_badge_value : (existing.offer_badge_value ?? "");

  await c.env.DB.prepare(
    "UPDATE categories SET name = ?, offer_badge_prefix = ?, offer_badge_value = ? WHERE id = ?"
  ).bind(updatedName, updatedPrefix, updatedValue, id).run();

  return c.json({ id, name: updatedName, offer_badge_prefix: updatedPrefix, offer_badge_value: updatedValue });
});

app.delete("/categories/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

/* ==========================================================================
   3. PRODUCTS & PRODUCT IMAGES
   ========================================================================== */

async function getProductImagesMap(db: any, productIds: string[]) {
  if (!productIds || productIds.length === 0) return {};
  try {
    const placeholders = productIds.map(() => "?").join(",");
    const { results } = await db.prepare(`
      SELECT id, product_id, image_url, color_name, color_hex, is_primary, sort_order, created_at
      FROM product_images
      WHERE product_id IN (${placeholders})
      ORDER BY sort_order ASC, created_at ASC
    `).bind(...productIds).all();

    const map: Record<string, any[]> = {};
    for (const img of (results || [])) {
      if (!map[img.product_id]) map[img.product_id] = [];
      map[img.product_id].push({
        id: img.id,
        productId: img.product_id,
        imageUrl: img.image_url,
        colorName: img.color_name || null,
        colorHex: img.color_hex || null,
        isPrimary: Boolean(img.is_primary),
        sortOrder: img.sort_order,
        createdAt: img.created_at,
      });
    }
    return map;
  } catch (err) {
    console.error("Failed to query product_images:", err);
    return {};
  }
}

async function syncProductImages(db: any, productId: string, images: string[], colorVariants: any[]) {
  try {
    await db.prepare("DELETE FROM product_images WHERE product_id = ?").bind(productId).run();

    let sortOrder = 0;
    // 1. General images
    if (Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const url = images[i];
        if (!url || typeof url !== "string") continue;
        const imgId = `img-${crypto.randomUUID().slice(0, 12)}`;
        await db.prepare(
          "INSERT INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES (?, ?, ?, NULL, NULL, ?, ?)"
        ).bind(imgId, productId, url, sortOrder === 0 ? 1 : 0, sortOrder++).run();
      }
    }

    // 2. Color-specific images
    if (Array.isArray(colorVariants)) {
      for (let i = 0; i < colorVariants.length; i++) {
        const cv = colorVariants[i];
        if (cv && cv.image) {
          const imgId = `img-${crypto.randomUUID().slice(0, 12)}`;
          await db.prepare(
            "INSERT INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES (?, ?, ?, ?, ?, 0, ?)"
          ).bind(imgId, productId, cv.image, cv.name || null, cv.color || null, sortOrder++).run();
        }
      }
    }
  } catch (err) {
    console.error("Failed to sync product_images:", err);
  }
}

app.get("/products", async (c) => {
  const categoryId = c.req.query("categoryId");
  const trending = c.req.query("trending");
  let query = `
    SELECT p.id, p.name, p.description, p.price, p.stock, p.images, p.category_id as categoryId, p.is_trending, p.about,
           p.offer_badge_prefix, p.offer_badge_value, p.original_price, p.discount_percent, p.color_variants,
           c.id as cat_id, c.name as cat_name, c.offer_badge_prefix as cat_offer_badge_prefix, c.offer_badge_value as cat_offer_badge_value,
           p.created_at as createdAt,
           (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
           (SELECT COUNT(r.id) FROM reviews r WHERE r.product_id = p.id) as review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `;
  const whereClauses: string[] = [];
  const params: any[] = [];
  if (categoryId) {
    whereClauses.push("p.category_id = ?");
    params.push(categoryId);
  }
  if (trending !== undefined) {
    whereClauses.push("p.is_trending = ?");
    params.push(trending === "true" || trending === "1" ? 1 : 0);
  }
  if (whereClauses.length > 0) {
    query += ` WHERE ` + whereClauses.join(" AND ");
  }
  query += ` ORDER BY p.created_at DESC`;

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  const productIds = results.map((r: any) => r.id);
  const imagesMap = await getProductImagesMap(c.env.DB, productIds);

  const formatted = results.map((row: any) => {
    const productImages = imagesMap[row.id] || [];

    let images: string[] = [];
    try {
      images = typeof row.images === "string" ? JSON.parse(row.images) : row.images || [];
    } catch {
      images = row.images ? [row.images] : [];
    }
    if (images.length === 0 && productImages.length > 0) {
      images = productImages.map((pi: any) => pi.imageUrl);
    }

    let about: any[] = [];
    try {
      about = typeof row.about === "string" ? JSON.parse(row.about) : row.about || [];
    } catch {
      about = [];
    }
    const origPrice = row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : null;
    const discPercent = row.discount_percent !== null && row.discount_percent !== undefined ? Number(row.discount_percent) : (origPrice && origPrice > row.price ? Math.round(((origPrice - row.price) / origPrice) * 100) : null);

    let colorVariants: any[] = [];
    try {
      colorVariants = typeof row.color_variants === "string" ? JSON.parse(row.color_variants) : row.color_variants || [];
    } catch {
      colorVariants = [];
    }
    if (colorVariants.length === 0 && productImages.length > 0) {
      const colorImages = productImages.filter((pi: any) => pi.colorHex);
      if (colorImages.length > 0) {
        colorVariants = colorImages.map((ci: any) => ({
          name: ci.colorName || "Color",
          color: ci.colorHex,
          image: ci.imageUrl,
        }));
      }
    }

    return {
      id: encryptId(row.id),
      name: row.name,
      description: row.description,
      price: row.price,
      original_price: origPrice,
      originalMRP: origPrice,
      discount_percent: discPercent,
      discountPercent: discPercent,
      stock: row.stock,
      images,
      color_variants: Array.isArray(colorVariants) ? colorVariants : [],
      product_images: productImages,
      categoryId: row.categoryId,
      category: {
        id: row.cat_id,
        name: row.cat_name,
        offer_badge_prefix: row.cat_offer_badge_prefix || null,
        offer_badge_value: row.cat_offer_badge_value || null,
      },
      offer_badge_prefix: row.offer_badge_prefix || null,
      offer_badge_value: row.offer_badge_value || null,
      is_trending: Boolean(row.is_trending),
      rating: row.avg_rating !== null && row.avg_rating !== undefined ? Number(row.avg_rating) : null,
      review_count: row.review_count !== null && row.review_count !== undefined ? Number(row.review_count) : 0,
      about: Array.isArray(about) ? about : [],
      createdAt: row.createdAt,
    };
  });

  c.header("Cache-Control", "no-cache, no-store, must-revalidate");
  return c.json(formatted);
});

app.get("/products/:id", async (c) => {
  const rawId = c.req.param("id");
  const id = decryptId(rawId);
  const row: any = await c.env.DB.prepare(`
    SELECT p.id, p.name, p.description, p.price, p.stock, p.images, p.category_id as categoryId, p.is_trending, p.about,
           p.offer_badge_prefix, p.offer_badge_value, p.original_price, p.discount_percent, p.color_variants,
           c.id as cat_id, c.name as cat_name, c.offer_badge_prefix as cat_offer_badge_prefix, c.offer_badge_value as cat_offer_badge_value,
           p.created_at as createdAt,
           (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
           (SELECT COUNT(r.id) FROM reviews r WHERE r.product_id = p.id) as review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).bind(id).first();

  if (!row) {
    return c.json({ message: "Product not found" }, 404);
  }

  const imagesMap = await getProductImagesMap(c.env.DB, [row.id]);
  const productImages = imagesMap[row.id] || [];

  let images: string[] = [];
  try {
    images = typeof row.images === "string" ? JSON.parse(row.images) : row.images || [];
  } catch {
    images = row.images ? [row.images] : [];
  }
  if (images.length === 0 && productImages.length > 0) {
    images = productImages.map((pi: any) => pi.imageUrl);
  }

  let about: any[] = [];
  try {
    about = typeof row.about === "string" ? JSON.parse(row.about) : row.about || [];
  } catch {
    about = [];
  }

  const origPrice = row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : null;
  const discPercent = row.discount_percent !== null && row.discount_percent !== undefined ? Number(row.discount_percent) : (origPrice && origPrice > row.price ? Math.round(((origPrice - row.price) / origPrice) * 100) : null);

  let colorVariants: any[] = [];
  try {
    colorVariants = typeof row.color_variants === "string" ? JSON.parse(row.color_variants) : row.color_variants || [];
  } catch {
    colorVariants = [];
  }
  if (colorVariants.length === 0 && productImages.length > 0) {
    const colorImages = productImages.filter((pi: any) => pi.colorHex);
    if (colorImages.length > 0) {
      colorVariants = colorImages.map((ci: any) => ({
        name: ci.colorName || "Color",
        color: ci.colorHex,
        image: ci.imageUrl,
      }));
    }
  }

  c.header("Cache-Control", "no-cache, no-store, must-revalidate");
  return c.json({
    id: encryptId(row.id),
    name: row.name,
    description: row.description,
    price: row.price,
    original_price: origPrice,
    originalMRP: origPrice,
    discount_percent: discPercent,
    discountPercent: discPercent,
    stock: row.stock,
    images,
    color_variants: Array.isArray(colorVariants) ? colorVariants : [],
    product_images: productImages,
    categoryId: row.categoryId,
    category: {
      id: row.cat_id,
      name: row.cat_name,
      offer_badge_prefix: row.cat_offer_badge_prefix || null,
      offer_badge_value: row.cat_offer_badge_value || null,
    },
    offer_badge_prefix: row.offer_badge_prefix || null,
    offer_badge_value: row.offer_badge_value || null,
    is_trending: Boolean(row.is_trending),
    rating: row.avg_rating !== null && row.avg_rating !== undefined ? Number(row.avg_rating) : null,
    review_count: row.review_count !== null && row.review_count !== undefined ? Number(row.review_count) : 0,
    about: Array.isArray(about) ? about : [],
    createdAt: row.createdAt,
  });
});

// Reviews API
app.get("/products/:id/reviews", async (c) => {
  const rawId = c.req.param("id");
  const id = decryptId(rawId);
  const { results } = await c.env.DB.prepare(`
    SELECT r.id, r.product_id, r.user_id, r.rating, r.title, r.comment, r.images, r.is_verified_purchase, r.created_at,
           u.name as user_name, u.avatar_url as user_avatar
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `).bind(id).all();

  const formatted = results.map((row: any) => {
    let images: string[] = [];
    try {
      images = typeof row.images === "string" ? JSON.parse(row.images) : row.images || [];
    } catch {
      images = row.images ? [row.images] : [];
    }
    return {
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      userName: row.user_name || "Verified Customer",
      userAvatar: row.user_avatar || null,
      rating: Number(row.rating),
      title: row.title || "",
      comment: row.comment,
      images,
      isVerifiedPurchase: Boolean(row.is_verified_purchase),
      createdAt: row.created_at,
    };
  });

  return c.json(formatted);
});

// Check if current user can review (must have purchased the product)
app.get("/products/:id/can-review", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user?.userId) {
    return c.json({ canReview: false, alreadyReviewed: false, isPurchased: false, reason: "Login required" }, 401);
  }
  const rawId = c.req.param("id");
  const id = decryptId(rawId);

  // Check if user has an order with this product
  const purchased: any = await c.env.DB.prepare(`
    SELECT oi.id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'CANCELLED'
    LIMIT 1
  `).bind(user.userId, id).first();

  // Check if user already reviewed
  const existingReview: any = await c.env.DB.prepare(`
    SELECT id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1
  `).bind(user.userId, id).first();

  const canReview = Boolean(purchased) || user.role === "ADMIN";
  const alreadyReviewed = Boolean(existingReview);

  return c.json({
    canReview,
    alreadyReviewed,
    isPurchased: Boolean(purchased),
    reason: !canReview
      ? "Only verified purchasers of this item can leave a review."
      : alreadyReviewed
      ? "You have already reviewed this product."
      : null,
  });
});

// Post a review (Only verified buyers or admins)
app.post("/products/:id/reviews", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const rawId = c.req.param("id");
  const id = decryptId(rawId);
  const body = await c.req.json();

  const rating = Number(body.rating);
  if (!rating || rating < 1 || rating > 5) {
    return c.json({ error: "Rating must be between 1 and 5 stars" }, 400);
  }

  const comment = (body.comment || "").trim();
  if (!comment) {
    return c.json({ error: "Review comment is required" }, 400);
  }

  // Check verified purchase
  const purchased: any = await c.env.DB.prepare(`
    SELECT oi.id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'CANCELLED'
    LIMIT 1
  `).bind(user.userId, id).first();

  if (!purchased && user.role !== "ADMIN") {
    return c.json({
      error: "Only verified buyers who purchased this product can submit a review.",
    }, 403);
  }

  // Check if already reviewed
  const existingReview: any = await c.env.DB.prepare(`
    SELECT id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1
  `).bind(user.userId, id).first();

  if (existingReview) {
    return c.json({ error: "You have already reviewed this product." }, 400);
  }

  // Retrieve user name & avatar from database
  const dbUser: any = await c.env.DB.prepare(
    "SELECT id, name, avatar_url FROM users WHERE id = ?"
  ).bind(user.userId).first();

  const images = Array.isArray(body.images) ? JSON.stringify(body.images) : "[]";
  const title = (body.title || "").trim();
  const reviewId = `rev-${crypto.randomUUID().slice(0, 12)}`;

  await c.env.DB.prepare(`
    INSERT INTO reviews (id, product_id, user_id, rating, title, comment, images, is_verified_purchase)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(reviewId, id, user.userId, rating, title, comment, images).run();

  return c.json({
    success: true,
    message: "Review submitted successfully!",
    review: {
      id: reviewId,
      productId: id,
      userId: user.userId,
      userName: dbUser?.name || "Customer",
      userAvatar: dbUser?.avatar_url || null,
      rating,
      title,
      comment,
      images: Array.isArray(body.images) ? body.images : [],
      isVerifiedPurchase: true,
      createdAt: new Date().toISOString(),
    },
  });
});

/* ==========================================================================
   UNIFIED PRODUCT DETAILS API (PAYLOAD BASED)
   Future-ready: Supports JSON body payload for single product, batch IDs,
   category, search, pricing, and stock filtering. In the future, this payload
   can be encrypted/hidden over the network and decrypted seamlessly.
   ========================================================================== */
const handleProductDetailsQuery = async (c: any) => {
  let payload: any = {};
  try {
    payload = await c.req.json();
  } catch {
    payload = {};
  }

  // [FUTURE ENCRYPTION / DECRYPTION HOOK]
  // When payload encryption is activated in the future, decrypt payload here:
  // if (payload.data && typeof payload.data === "string") {
  //   payload = decryptPayload(payload.data, c.env.PAYLOAD_SECRET);
  // }

  const rawTargetId = payload.id || payload.productId;
  const targetId = rawTargetId ? decryptId(rawTargetId) : undefined;

  const rawTargetIds = payload.ids || payload.productIds;
  const targetIds = Array.isArray(rawTargetIds)
    ? rawTargetIds.map((item: string) => decryptId(item))
    : undefined;

  const rawCategoryId = payload.categoryId;
  const categoryId = rawCategoryId ? decryptId(rawCategoryId) : undefined;
  const search = payload.search || payload.query;
  const minPrice = payload.minPrice !== undefined ? Number(payload.minPrice) : undefined;
  const maxPrice = payload.maxPrice !== undefined ? Number(payload.maxPrice) : undefined;
  const inStockOnly = Boolean(payload.inStockOnly);
  const sort = payload.sort || "newest";
  const limit = payload.limit ? Number(payload.limit) : undefined;
  const offset = payload.page && limit ? (Number(payload.page) - 1) * limit : undefined;

  let query = `
    SELECT p.id, p.name, p.description, p.price, p.stock, p.images, p.category_id as categoryId, p.is_trending, p.about,
           p.offer_badge_prefix, p.offer_badge_value, p.original_price, p.discount_percent, p.color_variants,
           c.id as cat_id, c.name as cat_name, c.offer_badge_prefix as cat_offer_badge_prefix, c.offer_badge_value as cat_offer_badge_value,
           p.created_at as createdAt,
           (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
           (SELECT COUNT(r.id) FROM reviews r WHERE r.product_id = p.id) as review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const binds: any[] = [];

  // 1. Filter by Single ID
  if (targetId) {
    query += ` AND p.id = ?`;
    binds.push(targetId);
  }

  // 2. Filter by Multiple IDs (Batch)
  if (Array.isArray(targetIds) && targetIds.length > 0) {
    const placeholders = targetIds.map(() => "?").join(",");
    query += ` AND p.id IN (${placeholders})`;
    binds.push(...targetIds);
  }

  // 3. Filter by Category (ID or Name)
  if (categoryId && categoryId !== "All") {
    query += ` AND (p.category_id = ? OR c.name = ?)`;
    binds.push(categoryId, categoryId);
  }

  // 4. Keyword Search in name or description
  if (search) {
    query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
    binds.push(`%${search}%`, `%${search}%`);
  }

  // 5. Filter by Min Price
  if (minPrice !== undefined) {
    query += ` AND p.price >= ?`;
    binds.push(minPrice);
  }

  // 6. Filter by Max Price
  if (maxPrice !== undefined) {
    query += ` AND p.price <= ?`;
    binds.push(maxPrice);
  }

  // 7. Filter In Stock
  if (inStockOnly) {
    query += ` AND p.stock > 0`;
  }

  // 8. Sorting
  if (sort === "price-low") {
    query += ` ORDER BY p.price ASC`;
  } else if (sort === "price-high") {
    query += ` ORDER BY p.price DESC`;
  } else if (sort === "rating") {
    query += ` ORDER BY avg_rating DESC NULLS LAST`;
  } else {
    // Default newest
    query += ` ORDER BY p.created_at DESC`;
  }

  // 9. Pagination
  if (limit) {
    query += ` LIMIT ?`;
    binds.push(limit);
    if (offset !== undefined) {
      query += ` OFFSET ?`;
      binds.push(offset);
    }
  }

  const { results } = await c.env.DB.prepare(query).bind(...binds).all();
  const productIds = results.map((r: any) => r.id);
  const imagesMap = await getProductImagesMap(c.env.DB, productIds);

  const formatProduct = (row: any) => {
    const productImages = imagesMap[row.id] || [];

    let images: string[] = [];
    try {
      images = typeof row.images === "string" ? JSON.parse(row.images) : row.images || [];
    } catch {
      images = row.images ? [row.images] : [];
    }
    if (images.length === 0 && productImages.length > 0) {
      images = productImages.map((pi: any) => pi.imageUrl);
    }

    const originalMRP = row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : null;
    const discountPercent = row.discount_percent !== null && row.discount_percent !== undefined ? Number(row.discount_percent) : (originalMRP && originalMRP > row.price ? Math.round(((originalMRP - row.price) / originalMRP) * 100) : null);
    let about: any[] = [];
    try {
      about = typeof row.about === "string" ? JSON.parse(row.about) : row.about || [];
    } catch {
      about = [];
    }

    let colorVariants: any[] = [];
    try {
      colorVariants = typeof row.color_variants === "string" ? JSON.parse(row.color_variants) : row.color_variants || [];
    } catch {
      colorVariants = [];
    }
    if (colorVariants.length === 0 && productImages.length > 0) {
      const colorImages = productImages.filter((pi: any) => pi.colorHex);
      if (colorImages.length > 0) {
        colorVariants = colorImages.map((ci: any) => ({
          name: ci.colorName || "Color",
          color: ci.colorHex,
          image: ci.imageUrl,
        }));
      }
    }

    return {
      id: encryptId(row.id),
      name: row.name,
      description: row.description,
      price: row.price,
      original_price: originalMRP,
      originalMRP,
      discount_percent: discountPercent,
      discountPercent,
      stock: row.stock,
      inStock: row.stock > 0,
      images,
      color_variants: Array.isArray(colorVariants) ? colorVariants : [],
      product_images: productImages,
      thumbnail: images[0] || (productImages[0]?.imageUrl) || "/logo-transparent.png",
      categoryId: row.categoryId,
      category: {
        id: row.cat_id,
        name: row.cat_name,
        offer_badge_prefix: row.cat_offer_badge_prefix || null,
        offer_badge_value: row.cat_offer_badge_value || null,
      },
      offer_badge_prefix: row.offer_badge_prefix || null,
      offer_badge_value: row.offer_badge_value || null,
      rating: row.avg_rating !== null && row.avg_rating !== undefined ? Number(row.avg_rating) : null,
      reviewsCount: row.review_count !== null && row.review_count !== undefined ? Number(row.review_count) : 0,
      review_count: row.review_count !== null && row.review_count !== undefined ? Number(row.review_count) : 0,
      about: Array.isArray(about) ? about : [],
      createdAt: row.createdAt,
    };
  };

  const formatted = results.map(formatProduct);

  // If a single product was requested by ID
  if (targetId) {
    if (formatted.length === 0) {
      return c.json({ success: false, message: "Product not found", data: null }, 404);
    }
    const product = formatted[0];

    // Fetch related products in the same category
    const { results: related } = await c.env.DB.prepare(`
      SELECT p.id, p.name, p.description, p.price, p.stock, p.images, p.category_id as categoryId, p.is_trending,
             p.offer_badge_prefix, p.offer_badge_value,
             c.id as cat_id, c.name as cat_name, c.offer_badge_prefix as cat_offer_badge_prefix, c.offer_badge_value as cat_offer_badge_value,
             p.created_at as createdAt
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ?
      ORDER BY p.created_at DESC
      LIMIT 4
    `).bind(product.categoryId, product.id).all();

    return c.json({
      success: true,
      data: product,
      product: product,
      relatedProducts: related.map(formatProduct),
    });
  }

  return c.json({
    success: true,
    total: formatted.length,
    data: formatted,
    products: formatted,
  });
};

app.post("/products/details", handleProductDetailsQuery);
app.post("/products/query", handleProductDetailsQuery);

app.post("/products", authMiddleware, adminMiddleware, async (c) => {
  let body: any = {};
  const contentType = c.req.header("content-type") || "";

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await c.req.parseBody();
    body = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      original_price: formData.original_price !== undefined && formData.original_price !== "" ? Number(formData.original_price) : null,
      discount_percent: formData.discount_percent !== undefined && formData.discount_percent !== "" ? Number(formData.discount_percent) : null,
      stock: Number(formData.stock || 0),
      categoryId: formData.categoryId,
      is_trending: String(formData.is_trending) === "true" || String(formData.is_trending) === "1",
      offer_badge_prefix: formData.offer_badge_prefix || "",
      offer_badge_value: formData.offer_badge_value || "",
      images: formData.images ? (Array.isArray(formData.images) ? formData.images : [formData.images]) : [],
    };
  } else {
    body = await c.req.json();
  }

  // Auto-generate next 4-digit numeric ID (1001, 1002, 1003...)
  const { results: existingProducts } = await c.env.DB.prepare("SELECT id FROM products").all();
  const numericIds = (existingProducts || [])
    .map((p: any) => parseInt(p.id, 10))
    .filter((n: number) => !isNaN(n) && n >= 1000);
  const id = String(numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1001);

  const imagesJson = JSON.stringify(Array.isArray(body.images) ? body.images : [body.images || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]);
  const isTrending = body.is_trending ? 1 : 0;
  const aboutJson = JSON.stringify(Array.isArray(body.about) ? body.about : []);
  const offerBadgePrefix = body.offer_badge_prefix || "";
  const offerBadgeValue = body.offer_badge_value || "";
  const originalPrice = body.original_price !== undefined && body.original_price !== null && body.original_price !== "" ? Number(body.original_price) : null;
  const discountPercent = body.discount_percent !== undefined && body.discount_percent !== null && body.discount_percent !== "" ? Number(body.discount_percent) : (originalPrice && originalPrice > Number(body.price) ? Math.round(((originalPrice - Number(body.price)) / originalPrice) * 100) : null);
  const colorVariantsJson = JSON.stringify(Array.isArray(body.color_variants) ? body.color_variants : []);

  await c.env.DB.prepare(
    "INSERT INTO products (id, name, description, price, stock, images, category_id, is_trending, about, offer_badge_prefix, offer_badge_value, original_price, discount_percent, color_variants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, body.name, body.description, Number(body.price), Number(body.stock || 0), imagesJson, body.categoryId, isTrending, aboutJson, offerBadgePrefix, offerBadgeValue, originalPrice, discountPercent, colorVariantsJson).run();

  const parsedImages = JSON.parse(imagesJson);
  const parsedColorVariants = JSON.parse(colorVariantsJson);
  await syncProductImages(c.env.DB, id, parsedImages, parsedColorVariants);
  const imagesMap = await getProductImagesMap(c.env.DB, [id]);
  const productImages = imagesMap[id] || [];

  return c.json({
    id: encryptId(id),
    ...body,
    original_price: originalPrice,
    originalMRP: originalPrice,
    discount_percent: discountPercent,
    discountPercent: discountPercent,
    color_variants: parsedColorVariants,
    product_images: productImages,
    is_trending: Boolean(isTrending),
    offer_badge_prefix: offerBadgePrefix,
    offer_badge_value: offerBadgeValue,
    images: parsedImages,
    about: JSON.parse(aboutJson),
  }, 201);
});

app.put("/products/:id", authMiddleware, adminMiddleware, async (c) => {
  const rawId = c.req.param("id");
  const id = decryptId(rawId);
  let body: any = {};
  const contentType = c.req.header("content-type") || "";

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await c.req.parseBody();
    body = {
      name: formData.name,
      description: formData.description,
      price: formData.price !== undefined ? Number(formData.price) : undefined,
      original_price: formData.original_price !== undefined && formData.original_price !== "" ? Number(formData.original_price) : undefined,
      discount_percent: formData.discount_percent !== undefined && formData.discount_percent !== "" ? Number(formData.discount_percent) : undefined,
      stock: formData.stock !== undefined ? Number(formData.stock) : undefined,
      categoryId: formData.categoryId,
      is_trending: formData.is_trending !== undefined ? String(formData.is_trending) === "true" || String(formData.is_trending) === "1" : undefined,
      offer_badge_prefix: formData.offer_badge_prefix,
      offer_badge_value: formData.offer_badge_value,
      images: formData.images ? (Array.isArray(formData.images) ? formData.images : [formData.images]) : undefined,
    };
  } else {
    body = await c.req.json();
  }

  const existing: any = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  if (!existing) {
    return c.json({ message: "Product not found" }, 404);
  }

  const name = body.name ?? existing.name;
  const description = body.description ?? existing.description;
  const price = body.price !== undefined ? Number(body.price) : existing.price;
  const stock = body.stock !== undefined ? Number(body.stock) : existing.stock;
  const categoryId = body.categoryId ?? existing.category_id;
  const isTrending = body.is_trending !== undefined ? (body.is_trending ? 1 : 0) : existing.is_trending;
  const offerBadgePrefix = body.offer_badge_prefix ?? existing.offer_badge_prefix;
  const offerBadgeValue = body.offer_badge_value ?? existing.offer_badge_value;
  const originalPrice = body.original_price !== undefined ? (body.original_price ? Number(body.original_price) : null) : existing.original_price;
  const discountPercent = body.discount_percent !== undefined ? (body.discount_percent !== null && body.discount_percent !== "" ? Number(body.discount_percent) : null) : existing.discount_percent;
  const about = body.about !== undefined ? JSON.stringify(body.about) : existing.about;
  const colorVariants = body.color_variants !== undefined ? JSON.stringify(body.color_variants) : existing.color_variants;

  let images = existing.images;
  if (body.images) {
    images = JSON.stringify(Array.isArray(body.images) ? body.images : [body.images]);
  }

  await c.env.DB.prepare(
    "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, images = ?, is_trending = ?, about = ?, offer_badge_prefix = ?, offer_badge_value = ?, original_price = ?, discount_percent = ?, color_variants = ? WHERE id = ?"
  ).bind(name, description, price, stock, categoryId, images, isTrending, about, offerBadgePrefix, offerBadgeValue, originalPrice, discountPercent, colorVariants, id).run();

  let parsedAbout: any[] = [];
  try {
    parsedAbout = JSON.parse(about);
  } catch {
    parsedAbout = [];
  }

  let parsedColors: any[] = [];
  try {
    parsedColors = JSON.parse(colorVariants);
  } catch {
    parsedColors = [];
  }

  let parsedImgs: any[] = [];
  try {
    parsedImgs = JSON.parse(images);
  } catch {
    parsedImgs = [];
  }

  await syncProductImages(c.env.DB, id, parsedImgs, parsedColors);
  const imagesMap = await getProductImagesMap(c.env.DB, [id]);
  const productImages = imagesMap[id] || [];

  return c.json({
    id: encryptId(id),
    name,
    description,
    price,
    original_price: originalPrice,
    originalMRP: originalPrice,
    discount_percent: discountPercent,
    discountPercent: discountPercent,
    color_variants: parsedColors,
    product_images: productImages,
    stock,
    categoryId,
    is_trending: Boolean(isTrending),
    offer_badge_prefix: offerBadgePrefix,
    offer_badge_value: offerBadgeValue,
    images: parsedImgs,
    about: parsedAbout,
  });
});

app.delete("/products/:id", authMiddleware, adminMiddleware, async (c) => {
  const rawId = c.req.param("id");
  const id = decryptId(rawId);
  await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

/* ==========================================================================
   PRODUCT IMAGES DEDICATED API
   ========================================================================== */

app.get("/products/:id/images", async (c) => {
  const rawId = c.req.param("id");
  const id = decryptId(rawId);
  const imagesMap = await getProductImagesMap(c.env.DB, [id]);
  return c.json(imagesMap[id] || []);
});

app.post("/products/:id/images", authMiddleware, adminMiddleware, async (c) => {
  const rawId = c.req.param("id");
  const id = decryptId(rawId);
  const body = await c.req.json();
  const { imageUrl, colorName, colorHex, isPrimary, sortOrder } = body;
  if (!imageUrl) {
    return c.json({ error: "imageUrl is required" }, 400);
  }

  const imgId = `img-${crypto.randomUUID().slice(0, 12)}`;
  await c.env.DB.prepare(`
    INSERT INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    imgId,
    id,
    imageUrl,
    colorName || null,
    colorHex || null,
    isPrimary ? 1 : 0,
    sortOrder || 0
  ).run();

  return c.json({
    id: imgId,
    productId: id,
    imageUrl,
    colorName: colorName || null,
    colorHex: colorHex || null,
    isPrimary: Boolean(isPrimary),
    sortOrder: sortOrder || 0,
    createdAt: new Date().toISOString(),
  }, 201);
});

app.delete("/products/:id/images/:imageId", authMiddleware, adminMiddleware, async (c) => {
  const imageId = c.req.param("imageId");
  await c.env.DB.prepare("DELETE FROM product_images WHERE id = ?").bind(imageId).run();
  return c.json({ success: true, message: "Image deleted successfully" });
});

/* ==========================================================================
   R2 IMAGE STORAGE & UPLOAD
   ========================================================================== */

// Serve image directly from R2 (works even when R2 public development URL is disabled)
app.get("/images/:key{.+}", async (c) => {
  const key = c.req.param("key");
  if (!c.env.BUCKET) {
    return c.text("R2 Storage bucket is not bound", 503);
  }

  const object = await c.env.BUCKET.get(key);
  if (!object) {
    return c.text("Image not found in R2 storage", 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});

// Upload endpoint: accepts multipart/form-data with 'file' or 'files' (Admins or authenticated buyers for reviews)
app.post("/upload", authMiddleware, async (c) => {
  try {
    const formData = await c.req.parseBody({ all: true });
    let files: any = formData["file"] || formData["files"] || formData["image"] || formData["images"];
    if (!files) {
      return c.json({ error: "No image file provided" }, 400);
    }

    if (!Array.isArray(files)) {
      files = [files];
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
      const uniqueKey = `products/${Date.now()}-${cleanName}.${ext}`;

      if (c.env.BUCKET) {
        await c.env.BUCKET.put(uniqueKey, file.stream(), {
          httpMetadata: {
            contentType: file.type || `image/${ext}`,
          },
        });

        const r2PublicUrl = c.env.R2_PUBLIC_URL || "https://pub-e9f02df81ad34d8da252578b86423390.r2.dev";
        const baseUrl = r2PublicUrl.replace(/\/$/, "");
        uploadedUrls.push(`${baseUrl}/${uniqueKey}`);
      } else {
        // Fallback for mock environments
        uploadedUrls.push(`https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800`);
      }
    }

    if (uploadedUrls.length === 0) {
      return c.json({ error: "No valid image files processed" }, 400);
    }

    return c.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (err: any) {
    console.error("R2 Upload Error:", err);
    return c.json({ error: err.message || "Failed to upload file to R2" }, 500);
  }
});

// Admin media list from R2 bucket
app.get("/admin/media", authMiddleware, adminMiddleware, async (c) => {
  if (!c.env.BUCKET) {
    return c.json({ success: true, items: [] });
  }

  try {
    const listed = await c.env.BUCKET.list({ prefix: "products/", limit: 100 });
    const r2PublicUrl = c.env.R2_PUBLIC_URL || "https://pub-e9f02df81ad34d8da252578b86423390.r2.dev";
    const baseUrl = r2PublicUrl.replace(/\/$/, "");
    const items = listed.objects.map((obj: any) => {
      const url = `${baseUrl}/${obj.key}`;
      return {
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        url,
      };
    });

    return c.json({ success: true, items });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to list R2 media" }, 500);
  }
});


/* ==========================================================================
   4. ORDERS
   ========================================================================== */

app.post("/orders", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json<{
    items: { productId: string; quantity: number }[];
    shippingAddress?: {
      fullName?: string;
      email?: string;
      phone?: string;
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  }>().catch(() => ({ items: [], shippingAddress: undefined }));
  const items = body.items || [];
  const shippingAddress = body.shippingAddress;

  if (!items || !items.length) {
    return c.json({ message: "Order must contain at least one item" }, 400);
  }

  // Fetch prices securely from D1 to prevent client tampering
  let totalAmount = 0;
  const pricedItems: { productId: string; quantity: number; price: number; name: string }[] = [];

  for (const item of items) {
    const rawProductId = item.productId;
    const resolvedProductId = decryptId(rawProductId);
    const product: any = await c.env.DB.prepare("SELECT id, name, price, stock FROM products WHERE id = ?")
      .bind(resolvedProductId)
      .first();

    if (!product) {
      return c.json({ message: `Product not found` }, 404);
    }

    const price = product.price;
    totalAmount += price * item.quantity;
    pricedItems.push({
      productId: encryptId(product.id),
      quantity: item.quantity,
      price,
      name: product.name,
    });
  }

  const orderId = `ord-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  // Create order
  await c.env.DB.prepare(
    "INSERT INTO orders (id, user_id, total_amount, status, created_at) VALUES (?, ?, ?, 'PENDING', ?)"
  ).bind(orderId, user.userId, totalAmount, now).run();

  // Insert order items
  for (const item of items) {
    const itemId = `oi-${crypto.randomUUID()}`;
    const resolvedProductId = decryptId(item.productId);
    const product: any = await c.env.DB.prepare("SELECT price FROM products WHERE id = ?").bind(resolvedProductId).first();
    const price = product ? product.price : 0;
    await c.env.DB.prepare(
      "INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)"
    ).bind(itemId, orderId, resolvedProductId, item.quantity, price).run();
  }

  // Trigger real-time Admin & Native App notification for new order
  try {
    const customer: any = await c.env.DB.prepare("SELECT name, email FROM users WHERE id = ?").bind(user.userId).first();
    const customerName = shippingAddress?.fullName || customer?.name || "Customer";
    const customerEmail = shippingAddress?.email || customer?.email || "";
    const customerPhone = shippingAddress?.phone || "";
    const city = shippingAddress?.city || "";
    const addressStr = shippingAddress
      ? `${shippingAddress.street || ""}, ${shippingAddress.city || ""}, ${shippingAddress.state || ""} ${shippingAddress.pincode || ""}`.trim()
      : "";
    const productNames = pricedItems.map((p: any) => p.name).filter(Boolean);
    const productSummary = productNames.length > 0 
      ? productNames.slice(0, 2).join(", ") + (productNames.length > 2 ? ` +${productNames.length - 2} more` : "")
      : "Product";

    const shortOrderId = orderId.slice(-6).toUpperCase();
    const formattedAmount = `₹${Number(totalAmount).toLocaleString("en-IN")}`;
    const notifId = `notif-${crypto.randomUUID()}`;
    const notifTitle = `📦 Order Placed: ${formattedAmount} • #${shortOrderId}`;

    let notifMessage = `${customerName} placed an order for ${productSummary}`;
    if (city) notifMessage += ` • Delivery to ${city}`;

    const notifData = JSON.stringify({
      orderId,
      shortOrderId,
      totalAmount,
      formattedAmount,
      customerName,
      customerEmail,
      customerPhone,
      city,
      shippingAddress: addressStr,
      itemsCount: items.length,
      firstItemName: pricedItems[0]?.name || "Buddy Mattress",
      productSummary,
      type: "ORDER_CREATED",
      createdAt: now,
    });

    await c.env.DB.prepare(
      "INSERT INTO notifications (id, user_id, title, message, type, data, is_read, created_at) VALUES (?, NULL, ?, ?, 'ORDER_CREATED', ?, 0, ?)"
    ).bind(notifId, notifTitle, notifMessage, notifData, now).run();

    // Dispatch real-time remote FCM push notification to all installed native devices and admins
    await sendFcmPushToAllDevices(c.env, notifTitle, notifMessage, {
      orderId,
      shortOrderId,
      type: "ORDER_CREATED",
      totalAmount: String(totalAmount),
      formattedAmount,
      customerName,
      customerPhone,
      city,
      customerAddress: addressStr,
      itemsCount: String(items.length),
      firstItemName: pricedItems[0]?.name || "Buddy Mattress",
      productSummary,
    }).catch((err) => console.error("FCM order push error:", err));
  } catch (notifErr) {
    console.error("Failed to insert order notification:", notifErr);
  }

  return c.json(
    {
      id: orderId,
      userId: user.userId,
      totalAmount,
      status: "PENDING",
      items: pricedItems,
      createdAt: now,
    },
    201
  );
});

app.get("/orders/me", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const { results: orders } = await c.env.DB.prepare(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.userId).all();

  const populated = await Promise.all(
    orders.map(async (order: any) => {
      const { results: items } = await c.env.DB.prepare(`
        SELECT oi.id, oi.product_id as productId, oi.quantity, oi.price, p.name, p.images
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).bind(order.id).all();

      return {
        id: order.id,
        userId: order.user_id,
        totalAmount: order.total_amount,
        status: order.status,
        razorpayOrderId: order.razorpay_order_id,
        paymentId: order.payment_id,
        createdAt: order.created_at,
        items: items.map((i: any) => ({
          ...i,
          productId: encryptId(i.productId),
          images: typeof i.images === "string" ? JSON.parse(i.images) : i.images,
        })),
      };
    })
  );

  return c.json(populated);
});

app.get("/orders", authMiddleware, adminMiddleware, async (c) => {
  const { results: orders } = await c.env.DB.prepare(`
    SELECT o.id, o.user_id as userId, o.total_amount as totalAmount, o.status,
           o.razorpay_order_id as razorpayOrderId, o.payment_id as paymentId,
           o.created_at as createdAt, u.name as userName, u.email as userEmail
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `).all();

  const populated = await Promise.all(
    orders.map(async (order: any) => {
      const { results: items } = await c.env.DB.prepare(`
        SELECT oi.id, oi.product_id as productId, oi.quantity, oi.price, p.name, p.images
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).bind(order.id).all();

      const parsedItems = items.map((it: any) => {
        let parsedImgs = [];
        try {
          if (typeof it.images === "string") parsedImgs = JSON.parse(it.images);
          else if (Array.isArray(it.images)) parsedImgs = it.images;
        } catch {}
        return {
          ...it,
          productId: encryptId(it.productId),
          images: parsedImgs,
          image: parsedImgs[0] || null,
        };
      });

      return {
        ...order,
        items: parsedItems,
      };
    })
  );

  return c.json(populated);
});

app.patch("/orders/:id/status", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json<{ status: string }>();

  const validStatuses = [
    "PENDING",
    "PAID",
    "PACKING",
    "DISPATCHED",
    "SHIPPED",
    "ON_THE_WAY",
    "ARRIVING_TODAY",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(status)) {
    return c.json({ message: "Invalid status value" }, 400);
  }

  await c.env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, id).run();
  const updated = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first();

  return c.json(updated);
});

/* ==========================================================================
   5. RAZORPAY PAYMENT
   ========================================================================== */

app.post("/payment/create-order", authMiddleware, async (c) => {
  const { amount } = await c.req.json<{ amount: number }>();
  if (!amount || amount <= 0) {
    return c.json({ message: "Valid amount is required" }, 400);
  }

  const keyId = c.env.RAZORPAY_KEY_ID;
  const keySecret = c.env.RAZORPAY_KEY_SECRET;

  // If real Razorpay keys are configured, call Razorpay API directly from Edge
  if (keyId && keySecret && !keyId.includes("mock")) {
    try {
      const resp = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // amount in paise
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Razorpay API error:", errText);
        throw new Error("Razorpay order creation failed");
      }

      const razorpayData = await resp.json();
      return c.json(razorpayData);
    } catch (e: any) {
      console.warn("Razorpay API request error, falling back to mock mode:", e.message);
    }
  }

  // Development / Mock order generation
  const mockOrderId = `order_mock_${crypto.randomUUID().replace(/-/g, "").substring(0, 14)}`;
  return c.json({
    id: mockOrderId,
    entity: "order",
    amount: Math.round(amount * 100),
    amount_paid: 0,
    amount_due: Math.round(amount * 100),
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    status: "created",
  });
});

app.post("/payment/verify", authMiddleware, async (c) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await c.req.json();

  if (!orderId) {
    return c.json({ message: "orderId is required" }, 400);
  }

  const keySecret = c.env.RAZORPAY_KEY_SECRET;
  let isValid = true;

  if (keySecret && !keySecret.includes("mock")) {
    try {
      const data = `${razorpay_order_id}|${razorpay_payment_id}`;
      const enc = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(keySecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
      const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      isValid = expectedSignature === razorpay_signature;
    } catch (err) {
      console.error("Signature verification error:", err);
      isValid = false;
    }
  }

  if (!isValid) {
    return c.json({ message: "Invalid payment signature" }, 400);
  }

  // Update order status in D1
  await c.env.DB.prepare(
    "UPDATE orders SET status = 'PAID', razorpay_order_id = ?, payment_id = ? WHERE id = ?"
  ).bind(razorpay_order_id || null, razorpay_payment_id || null, orderId).run();

  const updatedOrder: any = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();

  return c.json({ success: true, order: updatedOrder });
});

/* ==========================================================================
   6. ADMIN DASHBOARD & USERS
   ========================================================================== */

app.get("/admin/dashboard", authMiddleware, adminMiddleware, async (c) => {
  const productCountResult: any = await c.env.DB.prepare("SELECT count(*) as count FROM products").first();
  const orderCountResult: any = await c.env.DB.prepare("SELECT count(*) as count FROM orders").first();
  const userCountResult: any = await c.env.DB.prepare("SELECT count(*) as count FROM users").first();
  const revenueResult: any = await c.env.DB.prepare(
    "SELECT COALESCE(sum(total_amount), 0) as totalRevenue FROM orders WHERE status NOT IN ('CANCELLED', 'PENDING')"
  ).first();

  return c.json({
    productCount: productCountResult?.count || 0,
    orderCount: orderCountResult?.count || 0,
    userCount: userCountResult?.count || 0,
    totalRevenue: revenueResult?.totalRevenue || 0,
  });
});

app.get("/admin/users", authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, email, role, avatar_url, created_at as createdAt FROM users ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

app.patch("/admin/users/:id/role", authMiddleware, adminMiddleware, async (c) => {
  const targetUserId = c.req.param("id");
  const { role } = await c.req.json();
  if (!["USER", "ADMIN"].includes(role)) {
    return c.json({ message: "Invalid role. Must be 'USER' or 'ADMIN'" }, 400);
  }
  await c.env.DB.prepare("UPDATE users SET role = ? WHERE id = ?").bind(role, targetUserId).run();
  return c.json({ success: true, message: `User role updated to ${role}` });
});

/* ==========================================================================
   7. HERO VIDEO BANNERS
   ========================================================================== */

// Public endpoint: Fetch active hero videos for homepage ordered by display_order priority
app.get("/hero-videos", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM hero_videos WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC"
    ).all();

    const sanitizedResults = (results || []).map((v: any) => {
      let vUrl = v.video_url || "";
      if (vUrl.includes("mixkit-woman-relaxing-in-a-comfortable-bed-41556-large.mp4")) {
        vUrl = "https://assets.mixkit.co/videos/31411/31411-720.mp4";
      }
      return {
        ...v,
        video_url: vUrl,
        video_url_720p: v.video_url_720p || (vUrl.startsWith("https://assets.mixkit.co") ? vUrl : null),
        video_url_360p: v.video_url_360p || (vUrl.startsWith("https://assets.mixkit.co") ? vUrl.replace("-720.mp4", "-360.mp4") : null),
      };
    });

    return c.json({ success: true, data: sanitizedResults });
  } catch (err: any) {
    console.error("Failed to fetch active hero videos:", err);
    return c.json({ success: true, data: [] });
  }
});

// Admin endpoint: List all hero videos (active and inactive)
app.get("/admin/hero-videos", authMiddleware, adminMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM hero_videos ORDER BY display_order ASC, created_at DESC"
    ).all();
    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    console.error("Failed to fetch admin hero videos:", err);
    return c.json({ success: false, message: err.message || "Failed to fetch hero videos" }, 500);
  }
});

// Admin endpoint: Create a new hero video
app.post("/admin/hero-videos", authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { title, subtitle, video_url, video_url_720p, video_url_360p, poster_url, link_url, display_order, is_active } = body;

    if (!video_url) {
      return c.json({ message: "video_url is required" }, 400);
    }

    const id = `hv_${crypto.randomUUID().replace(/-/g, "").substring(0, 10)}`;
    const orderNum = typeof display_order === "number" ? display_order : parseInt(display_order) || 1;
    const activeState = is_active === false || is_active === 0 ? 0 : 1;

    await c.env.DB.prepare(
      `INSERT INTO hero_videos (id, title, subtitle, video_url, video_url_720p, video_url_360p, poster_url, link_url, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      title || "",
      subtitle || "",
      video_url,
      video_url_720p || null,
      video_url_360p || null,
      poster_url || "",
      link_url || "/shop",
      orderNum,
      activeState
    ).run();

    const created = await c.env.DB.prepare("SELECT * FROM hero_videos WHERE id = ?").bind(id).first();
    return c.json({ success: true, data: created }, 201);
  } catch (err: any) {
    console.error("Error creating hero video:", err);
    return c.json({ message: err.message || "Failed to create hero video" }, 500);
  }
});

// Admin endpoint: Update a hero video
app.put("/admin/hero-videos/:id", authMiddleware, adminMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { title, subtitle, video_url, video_url_720p, video_url_360p, poster_url, link_url, display_order, is_active } = body;

    const orderNum = typeof display_order === "number" ? display_order : parseInt(display_order) || 1;
    const activeState = is_active === false || is_active === 0 || is_active === "0" ? 0 : 1;

    await c.env.DB.prepare(
      `UPDATE hero_videos 
       SET title = ?, subtitle = ?, video_url = ?, video_url_720p = ?, video_url_360p = ?, poster_url = ?, link_url = ?, display_order = ?, is_active = ?
       WHERE id = ?`
    ).bind(
      title || "",
      subtitle || "",
      video_url,
      video_url_720p || null,
      video_url_360p || null,
      poster_url || "",
      link_url || "/shop",
      orderNum,
      activeState,
      id
    ).run();

    const updated = await c.env.DB.prepare("SELECT * FROM hero_videos WHERE id = ?").bind(id).first();
    return c.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Error updating hero video:", err);
    return c.json({ message: err.message || "Failed to update hero video" }, 500);
  }
});

// Admin endpoint: Delete a hero video
app.delete("/admin/hero-videos/:id", authMiddleware, adminMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("DELETE FROM hero_videos WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: "Hero video deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting hero video:", err);
    return c.json({ message: err.message || "Failed to delete hero video" }, 500);
  }
});

/* ==========================================================================
   8. PUSH & IN-APP NOTIFICATIONS (MNC / HIGH-END REAL-TIME)
   ========================================================================== */

// GET /notifications - Fetch notifications for admin or user
app.get("/notifications", optionalAuthMiddleware, async (c) => {
  const user = c.get("user") as UserPayload | undefined;
  const since = c.req.query("since"); // optional timestamp filter

  let notifs: any[] = [];
  if (since) {
    const res = await c.env.DB.prepare(
      user?.userId
        ? "SELECT * FROM notifications WHERE (user_id IS NULL OR user_id = ?) AND created_at > ? ORDER BY created_at DESC LIMIT 50"
        : "SELECT * FROM notifications WHERE user_id IS NULL AND created_at > ? ORDER BY created_at DESC LIMIT 50"
    ).bind(...(user?.userId ? [user.userId, since] : [since])).all();
    notifs = res.results || [];
  } else {
    const res = await c.env.DB.prepare(
      user?.userId
        ? "SELECT * FROM notifications WHERE (user_id IS NULL OR user_id = ?) ORDER BY created_at DESC LIMIT 50"
        : "SELECT * FROM notifications WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 50"
    ).bind(...(user?.userId ? [user.userId] : [])).all();
    notifs = res.results || [];
  }

  // Count unread
  let unreadCount = 0;
  if (user?.userId) {
    const unreadCountResult: any = await c.env.DB.prepare(
      "SELECT count(*) as count FROM notifications WHERE (user_id IS NULL OR user_id = ?) AND is_read = 0"
    ).bind(user.userId).first();
    unreadCount = unreadCountResult?.count || 0;
  } else {
    const unreadCountResult: any = await c.env.DB.prepare(
      "SELECT count(*) as count FROM notifications WHERE user_id IS NULL AND is_read = 0"
    ).first();
    unreadCount = unreadCountResult?.count || 0;
  }

  return c.json({
    success: true,
    notifications: notifs,
    unreadCount,
  });
});

// PATCH /notifications/:id/read - Mark single notification as read
app.patch("/notifications/:id/read", optionalAuthMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// POST /notifications/mark-all-read - Mark all notifications as read
app.post("/notifications/mark-all-read", optionalAuthMiddleware, async (c) => {
  const user = c.get("user") as UserPayload | undefined;
  if (user?.userId) {
    await c.env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id IS NULL OR user_id = ?").bind(user.userId).run();
  } else {
    await c.env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id IS NULL").run();
  }

  return c.json({ success: true });
});

// POST /admin/notifications/test - Trigger an instantaneous test order notification for push notification verification
app.post("/admin/notifications/test", authMiddleware, adminMiddleware, async (c) => {
  const user = c.get("user") as UserPayload | undefined;
  const currentUser: any = user?.userId
    ? await c.env.DB.prepare("SELECT name, email FROM users WHERE id = ?").bind(user.userId).first()
    : null;

  // 1. Dynamic original order query from database
  const latestOrder: any = await c.env.DB.prepare(
    `SELECT o.*, u.name as customer_name, u.email as customer_email 
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     ORDER BY o.created_at DESC LIMIT 1`
  ).first();

  let targetOrderId: string;
  let shortOrderId: string;
  let totalAmount: number;
  let customerName: string;
  let customerEmail: string;
  let productSummary: string;
  let firstItemName: string;
  let itemsCount: number;

  if (latestOrder) {
    targetOrderId = latestOrder.id;
    shortOrderId = latestOrder.id.slice(-6).toUpperCase();
    totalAmount = Number(latestOrder.total_amount) || 18999;
    customerName = latestOrder.customer_name || currentUser?.name || "Customer";
    customerEmail = latestOrder.customer_email || currentUser?.email || "";

    const orderItemsRes: any = await c.env.DB.prepare(
      `SELECT oi.*, p.name as product_name 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`
    ).bind(latestOrder.id).all();
    const orderItems = orderItemsRes?.results || [];

    itemsCount = orderItems.length || 1;
    firstItemName = orderItems[0]?.product_name || "Buddy Mattress";
    const pNames = orderItems.map((i: any) => i.product_name).filter(Boolean);
    productSummary = pNames.length > 0 
      ? pNames.slice(0, 2).join(", ") + (pNames.length > 2 ? ` +${pNames.length - 2} more` : "")
      : firstItemName;
  } else {
    // If no order in DB yet, query real products and current user dynamically
    const prodRes: any = await c.env.DB.prepare("SELECT name, price FROM products LIMIT 2").all();
    const prods = prodRes?.results || [];
    const prod = prods[0] || { name: "Buddy Royal Pocket Spring Mattress", price: 18999 };
    
    targetOrderId = `ord-${crypto.randomUUID()}`;
    shortOrderId = targetOrderId.slice(-6).toUpperCase();
    totalAmount = Number(prod.price) || 18999;
    customerName = currentUser?.name || "Verified Customer";
    customerEmail = currentUser?.email || "";
    itemsCount = 1;
    firstItemName = prod.name;
    productSummary = prod.name;
  }

  const formattedAmount = `₹${totalAmount.toLocaleString("en-IN")}`;
  const now = new Date().toISOString();
  const notifId = `notif-${crypto.randomUUID()}`;
  const title = `📦 Order Placed: ${formattedAmount} • #${shortOrderId}`;
  const message = `${customerName} placed an order for ${productSummary} • Order #${shortOrderId}`;

  const data = JSON.stringify({
    orderId: targetOrderId,
    shortOrderId,
    totalAmount,
    formattedAmount,
    customerName,
    customerEmail,
    itemsCount,
    firstItemName,
    productSummary,
    type: "ORDER_CREATED",
    isTest: false,
    createdAt: now,
  });

  await c.env.DB.prepare(
    "INSERT INTO notifications (id, user_id, title, message, type, data, is_read, created_at) VALUES (?, NULL, ?, ?, 'ORDER_CREATED', ?, 0, ?)"
  ).bind(notifId, title, message, data, now).run();

  const createdNotif = await c.env.DB.prepare("SELECT * FROM notifications WHERE id = ?").bind(notifId).first();

  // Dispatch real-time remote FCM push notification to all installed native app devices and admins
  const fcmDiagnostics = await sendFcmPushToAllDevices(c.env, title, message, {
    orderId: targetOrderId,
    shortOrderId,
    type: "ORDER_CREATED",
    totalAmount: String(totalAmount),
    formattedAmount,
    customerName,
    customerEmail,
    itemsCount: String(itemsCount),
    firstItemName,
    productSummary,
  }).catch((err: any) => ({ error: err.message || String(err) }));

  return c.json({
    success: true,
    message: "Test push notification processed",
    fcmDiagnostics,
    notification: createdNotif,
  });
});

// POST /notifications/fcm-token - Register device FCM token for all app installations (guests & logged-in users)
app.post("/notifications/fcm-token", optionalAuthMiddleware, async (c) => {
  const user = c.get("user") as UserPayload | undefined;
  const body = await c.req.json().catch(() => ({}));
  const token = body.token;
  const platform = body.platform || "android";

  if (!token || typeof token !== "string") {
    return c.json({ message: "FCM token is required" }, 400);
  }

  const tokenId = `fcm-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const userId = user?.userId || null;

  // Remove existing entry for this token to prevent duplicates
  await c.env.DB.prepare("DELETE FROM user_fcm_tokens WHERE token = ?").bind(token).run();

  // Save token for user or guest device
  await c.env.DB.prepare(
    "INSERT INTO user_fcm_tokens (id, user_id, token, platform, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(tokenId, userId, token, platform, now, now).run();

  return c.json({ success: true, message: "FCM device token registered", registered: true });
});

// DELETE /notifications/fcm-token - Unbind device FCM token on logout without breaking device notifications
app.delete("/notifications/fcm-token", optionalAuthMiddleware, async (c) => {
  const user = c.get("user") as UserPayload | undefined;
  const body = await c.req.json().catch(() => ({}));
  const token = body.token;

  if (token) {
    await c.env.DB.prepare("DELETE FROM user_fcm_tokens WHERE token = ?").bind(token).run();
  } else if (user?.userId) {
    await c.env.DB.prepare("UPDATE user_fcm_tokens SET user_id = NULL WHERE user_id = ?").bind(user.userId).run();
  }

  return c.json({ success: true, message: "FCM token updated" });
});

// GET /app/latest - Get latest APK release info from D1 database
app.get("/app/latest", async (c) => {
  const release: any = await c.env.DB.prepare(
    "SELECT * FROM app_releases WHERE is_latest = 1 ORDER BY created_at DESC LIMIT 1"
  ).first();

  if (!release) {
    return c.json({ message: "No release found" }, 404);
  }

  if (c.req.query("download") === "true") {
    return c.redirect(release.download_url, 302);
  }

  return c.json(release);
});

// GET /downloads/buddy-mattress.apk - Seamless 302 redirect directly to R2 bucket object
app.get("/downloads/buddy-mattress.apk", async (c) => {
  const release: any = await c.env.DB.prepare(
    "SELECT download_url FROM app_releases WHERE is_latest = 1 ORDER BY created_at DESC LIMIT 1"
  ).first();
  const targetUrl = release?.download_url || "https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/apk/buddy-mattress.apk";
  return c.redirect(targetUrl, 302);
});

/* ==========================================================================
   9. FIREBASE CLOUD MESSAGING (FCM) v1 DISPATCH HELPER
   ========================================================================== */

function pemToBinary(pem: string): ArrayBuffer {
  const cleanPem = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "")
    .replace(/\s+/g, "");
  const binaryString = atob(cleanPem);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64UrlEncode(data: string | Uint8Array): string {
  let base64: string;
  if (typeof data === "string") {
    base64 = btoa(data);
  } else {
    let binary = "";
    const bytes = new Uint8Array(data);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binary);
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let cachedGoogleAccessToken: { token: string; expiresAt: number } | null = null;

async function getGoogleAccessToken(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  if (cachedGoogleAccessToken && cachedGoogleAccessToken.expiresAt > nowSec + 60) {
    return cachedGoogleAccessToken.token;
  }

  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: nowSec + 3600,
    iat: nowSec,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const unsignedToken = `${encodedHeader}.${encodedClaimSet}`;

  const binaryKey = pemToBinary(serviceAccount.private_key);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signedJwt = `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Failed to exchange Google OAuth2 token: ${errText}`);
  }

  const tokenData: any = await tokenRes.json();
  cachedGoogleAccessToken = {
    token: tokenData.access_token,
    expiresAt: nowSec + (tokenData.expires_in || 3600),
  };
  return cachedGoogleAccessToken.token;
}

async function sendFcmPushToAllDevices(
  env: any,
  title: string,
  body: string,
  dataPayload: Record<string, string> = {}
): Promise<{ success: boolean; tokensCount: number; deliveredCount: number; errors: any[] }> {
  const summary = { success: false, tokensCount: 0, deliveredCount: 0, errors: [] as any[] };
  try {
    // Select all registered devices (admins and users who installed native app)
    const tokensRes: any = await env.DB.prepare(
      `SELECT DISTINCT id, token FROM user_fcm_tokens WHERE token IS NOT NULL AND LENGTH(token) > 10`
    ).all();

    const tokens: { id: string; token: string }[] = tokensRes?.results || [];
    summary.tokensCount = tokens.length;
    if (tokens.length === 0) {
      console.log("[FCM] No registered device tokens found in database");
      return summary;
    }

    let serviceAccount: any = null;
    if (env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = typeof env.FIREBASE_SERVICE_ACCOUNT === "string"
          ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
          : env.FIREBASE_SERVICE_ACCOUNT;
      } catch (err) {
        console.error("[FCM] Failed to parse env.FIREBASE_SERVICE_ACCOUNT:", err);
      }
    }

    if (!serviceAccount) {
      serviceAccount = DEFAULT_FIREBASE_SERVICE_ACCOUNT;
    }

    if (!serviceAccount || !serviceAccount.private_key) {
      console.warn("[FCM] FIREBASE_SERVICE_ACCOUNT not configured. Remote push notification skipped.");
      summary.errors.push("FIREBASE_SERVICE_ACCOUNT secret missing");
      return summary;
    }

    const projectId = serviceAccount.project_id || "buddy-matters";
    const accessToken = await getGoogleAccessToken(serviceAccount);

    // FCM v1 strictly requires ALL data payload values to be strings
    const sanitizedData: Record<string, string> = {};
    for (const [k, v] of Object.entries(dataPayload)) {
      sanitizedData[k] = typeof v === "string" ? v : String(v ?? "");
    }
    sanitizedData.title = sanitizedData.title || title;
    sanitizedData.body = sanitizedData.body || body;

    // Send in parallel to all registered devices for instant delivery
    const promises = tokens.map(async (item) => {
      try {
        const payload = {
          message: {
            token: item.token,
            notification: {
              title,
              body,
            },
            data: sanitizedData,
            android: {
              priority: "HIGH",
              notification: {
                channel_id: "orders_channel",
                sound: "default",
                default_sound: true,
                default_vibrate_timings: true,
                notification_priority: "PRIORITY_MAX",
                visibility: "PUBLIC",
                icon: "ic_stat_order_placed",
                color: "#FF9900",
                tag: sanitizedData.orderId || undefined,
              },
            },
          },
        };

        const fcmRes = await fetch(
          `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!fcmRes.ok) {
          const resErr = await fcmRes.json().catch(() => ({}));
          console.error(`[FCM] Send error for token ${item.token.slice(0, 10)}...:`, resErr);
          summary.errors.push({ tokenPrefix: item.token.slice(0, 10), error: resErr });
          if (fcmRes.status === 404 || fcmRes.status === 410) {
            await env.DB.prepare("DELETE FROM user_fcm_tokens WHERE id = ?").bind(item.id).run();
          }
        } else {
          summary.deliveredCount++;
          summary.success = true;
          console.log(`[FCM] Successfully delivered push notification to device!`);
        }
      } catch (sendErr: any) {
        summary.errors.push({ error: sendErr.message || String(sendErr) });
        console.error("[FCM] Failed to send push notification to token:", sendErr);
      }
    });

    await Promise.allSettled(promises);
  } catch (err: any) {
    summary.errors.push({ executionError: err.message || String(err) });
    console.error("[FCM] sendFcmPushToAllDevices execution error:", err);
  }
  return summary;
}

export const onRequest = handle(app);
export default app;

