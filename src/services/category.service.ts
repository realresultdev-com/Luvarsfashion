import { api } from "./api";

let inflightPromise: Promise<any> | null = null;

export const categoryService = {
  getAll: async (forceRefresh = false) => {
    // Deduplicate simultaneous in-flight calls (e.g., Navbar and Home mounting together)
    if (!forceRefresh && inflightPromise) {
      return inflightPromise;
    }

    inflightPromise = api
      .get("/categories")
      .then((res) => {
        inflightPromise = null;
        return res;
      })
      .catch((err) => {
        inflightPromise = null;
        throw err;
      });

    return inflightPromise;
  },

  create: async (data: string | { name: string; offer_badge_prefix?: string; offer_badge_value?: string }) => {
    const payload = typeof data === "string" ? { name: data } : data;
    return api.post("/categories", payload);
  },

  update: async (id: string, data: { name?: string; offer_badge_prefix?: string; offer_badge_value?: string }) => {
    return api.put(`/categories/${id}`, data);
  },

  remove: async (id: string) => {
    return api.delete(`/categories/${id}`);
  },

  clearCache: () => {
    // No-op: category state stored strictly in Redux
  },
};
