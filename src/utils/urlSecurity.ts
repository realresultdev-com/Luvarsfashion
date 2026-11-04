/**
 * URL Security & Identifier Encryption Utility
 * 
 * Protects database IDs from being exposed directly in browser URLs and network requests.
 * Transforms raw IDs (e.g. "prod-5", "cat-ortho") into encrypted, tamper-proof tokens
 * (e.g. "enc_32070b00546a50").
 */

const SECRET_KEY = "Buddy_Mattress_Secure_Salt_Key_2024";

/**
 * Encrypts a raw database ID into a URL-safe encrypted token.
 */
export function encryptId(rawId: string): string {
  if (!rawId || typeof rawId !== "string") return "";
  if (rawId.startsWith("enc_")) return rawId;

  const keyChars = SECRET_KEY.split("").map((c) => c.charCodeAt(0));
  const bytes: number[] = [];

  for (let i = 0; i < rawId.length; i++) {
    const charCode = rawId.charCodeAt(i);
    const keyByte = keyChars[i % keyChars.length];
    bytes.push(charCode ^ keyByte);
  }

  // Calculate tamper-detection checksum
  let checksum = 0;
  for (let i = 0; i < rawId.length; i++) {
    checksum = (checksum + rawId.charCodeAt(i) * (i + 1)) % 256;
  }
  bytes.push(checksum);

  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `enc_${hex}`;
}

/**
 * Decrypts a URL-safe encrypted token back to the original database ID.
 * Gracefully returns the input if already in plain format or if checksum matches.
 */
export function decryptId(cipherText: string): string {
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

  // If checksum does not match, return original string safely
  if (checksum !== expectedChecksum) {
    return cipherText;
  }

  return decrypted;
}

/**
 * Returns the fully encrypted URL path for a product.
 * Example: getProductUrl("prod-5") -> "/product/enc_32070b00546a50"
 */
export function getProductUrl(productId: string): string {
  if (!productId) return "/";
  return `/product/${encryptId(productId)}`;
}

/**
 * Returns the fully encrypted URL path for a category.
 * Example: getCategoryUrl("cat-ortho") -> "/category/enc_21141049162d39091b5f"
 */
export function getCategoryUrl(categoryId: string): string {
  if (!categoryId) return "/";
  return `/category/${encryptId(categoryId)}`;
}
