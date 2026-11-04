/**
 * Instagram-Grade Video Cache & Storage Engine
 * Provides persistent offline video caching via CacheStorage API,
 * dynamic blob URL provisioning, automatic LRU storage management,
 * background prefetching, and instant cache clearance.
 */

const CACHE_NAME = "luvars-fashion-videos-v3";
const MAX_CACHED_ITEMS = 15;
const MAX_CACHE_SIZE_BYTES = 80 * 1024 * 1024; // 80 MB threshold

// Keep track of active blob URLs to revoke when clearing
const activeBlobUrls = new Map<string, string>();

class VideoCacheService {
  private isCacheSupported: boolean;

  constructor() {
    this.isCacheSupported = typeof window !== "undefined" && "caches" in window;
    if (this.isCacheSupported) {
      this.purgeOldCaches();
    }
  }

  async purgeOldCaches(): Promise<void> {
    try {
      const keys = await caches.keys();
      for (const k of keys) {
        if (k !== CACHE_NAME) {
          await caches.delete(k);
        }
      }
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves a cached video as a Blob URL, or streams and caches it in background.
   */
  async getVideoUrl(rawUrl: string): Promise<string> {
    if (!rawUrl || rawUrl.startsWith("blob:") || !this.isCacheSupported) {
      return rawUrl;
    }

    // Return already mapped blob URL if exists in memory
    if (activeBlobUrls.has(rawUrl)) {
      return activeBlobUrls.get(rawUrl)!;
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(rawUrl);

      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        const blobUrl = URL.createObjectURL(blob);
        activeBlobUrls.set(rawUrl, blobUrl);
        return blobUrl;
      }

      // If not in cache, start background cache insertion and return original URL
      this.cacheVideoInBackground(rawUrl);
      return rawUrl;
    } catch (err) {
      console.warn("VideoCache get failed, falling back to direct URL:", err);
      return rawUrl;
    }
  }

  /**
   * Caches video in background and prunes oldest entries if over limit
   */
  private async cacheVideoInBackground(url: string) {
    if (!this.isCacheSupported || !url || url.startsWith("blob:")) return;

    try {
      const response = await fetch(url, { mode: "cors", cache: "default" });
      if (!response.ok) return;

      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, response.clone());

      // Create blob URL for subsequent instant reads
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      activeBlobUrls.set(url, blobUrl);

      // Trigger automatic LRU pruning if limit reached
      this.pruneCache();
    } catch (err) {
      // Non-critical background failure (e.g. offline)
    }
  }

  /**
   * Pre-fetches the next upcoming video (Instagram Reels / TikTok technique)
   */
  async prefetchVideo(url: string): Promise<void> {
    if (!this.isCacheSupported || !url || activeBlobUrls.has(url)) return;

    try {
      const cache = await caches.open(CACHE_NAME);
      const isCached = await cache.match(url);
      if (!isCached) {
        this.cacheVideoInBackground(url);
      }
    } catch (e) {
      // Ignore prefetch failures
    }
  }

  /**
   * Evicts oldest items when cache grows beyond thresholds
   */
  private async pruneCache() {
    if (!this.isCacheSupported) return;

    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();

      if (keys.length > MAX_CACHED_ITEMS) {
        const itemsToDelete = keys.slice(0, keys.length - MAX_CACHED_ITEMS);
        for (const req of itemsToDelete) {
          const url = req.url;
          if (activeBlobUrls.has(url)) {
            URL.revokeObjectURL(activeBlobUrls.get(url)!);
            activeBlobUrls.delete(url);
          }
          await cache.delete(req);
        }
      }
    } catch (e) {
      console.warn("Cache pruning warning:", e);
    }
  }

  /**
   * Computes current cache metrics (total videos & size in MB)
   */
  async getCacheStats(): Promise<{ count: number; sizeBytes: number; formattedSize: string }> {
    if (!this.isCacheSupported) {
      return { count: 0, sizeBytes: 0, formattedSize: "0.0 MB" };
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      let totalBytes = 0;

      for (const req of requests) {
        const res = await cache.match(req);
        if (res) {
          const blob = await res.blob();
          totalBytes += blob.size;
        }
      }

      const mb = (totalBytes / (1024 * 1024)).toFixed(1);
      return {
        count: requests.length,
        sizeBytes: totalBytes,
        formattedSize: `${mb} MB`,
      };
    } catch (e) {
      return { count: 0, sizeBytes: 0, formattedSize: "0.0 MB" };
    }
  }

  /**
   * Completely clears stored video cache and revokes all active blob URLs
   */
  async clearVideoCache(): Promise<boolean> {
    if (!this.isCacheSupported) return true;

    try {
      // Revoke all active blob URLs to free memory
      Array.from(activeBlobUrls.values()).forEach((blobUrl) => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      });
      activeBlobUrls.clear();

      // Delete the cache storage bucket
      const success = await caches.delete(CACHE_NAME);

      // Re-create fresh empty cache container
      await caches.open(CACHE_NAME);
      return success;
    } catch (err) {
      console.error("Failed to clear video cache:", err);
      return false;
    }
  }
}

export const videoCacheService = new VideoCacheService();
