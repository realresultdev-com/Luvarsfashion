import { api } from "./api";

export interface SearchRecord {
  id: string;
  query: string;
  created_at?: string;
}

const LOCAL_STORAGE_KEY = "buddy_recent_searches";

export const searchService = {
  // Get recent searches (from backend DB if logged in, otherwise localStorage)
  getRecentSearches: async (isLoggedIn = false): Promise<SearchRecord[]> => {
    if (isLoggedIn) {
      try {
        const res = await api.get("/user/searches");
        if (Array.isArray(res.data)) {
          // Sync to localStorage as offline cache
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.data));
          } catch {}
          return res.data;
        }
      } catch (err) {
        console.warn("Could not fetch DB searches, falling back to local storage", err);
      }
    }

    // Fallback: localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    return [];
  },

  // Save recent search
  saveRecentSearch: async (query: string, isLoggedIn = false): Promise<void> => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // 1. Update localStorage immediately
    try {
      const current = await searchService.getRecentSearches(false);
      const filtered = current.filter(
        (item) => item.query.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [
        { id: `local-${Date.now()}`, query: trimmed, created_at: new Date().toISOString() },
        ...filtered,
      ].slice(0, 10);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // 2. If logged in, persist to database table `user_searches`
    if (isLoggedIn) {
      try {
        await api.post("/user/searches", { query: trimmed });
      } catch (err) {
        console.warn("Failed to persist user search to DB:", err);
      }
    }
  },

  // Remove single search item
  removeRecentSearch: async (id: string, query: string, isLoggedIn = false): Promise<void> => {
    try {
      const current = await searchService.getRecentSearches(false);
      const updated = current.filter(
        (item) => item.id !== id && item.query.toLowerCase() !== query.toLowerCase()
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (isLoggedIn && !id.startsWith("local-")) {
      try {
        await api.delete(`/user/searches/${id}`);
      } catch (err) {
        console.warn("Failed to delete user search from DB:", err);
      }
    }
  },

  // Clear all recent searches
  clearAll: async (isLoggedIn = false): Promise<void> => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}

    if (isLoggedIn) {
      try {
        await api.delete("/user/searches/all");
      } catch (err) {
        console.warn("Failed to clear user searches on DB:", err);
      }
    }
  },
};
