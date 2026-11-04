import { api } from "./api";

export interface ProductDetailsPayload {
  id?: string;
  productId?: string;
  ids?: string[];
  productIds?: string[];
  categoryId?: string;
  search?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  limit?: number;
  page?: number;
  [key: string]: any;
}

// In-flight request deduplication to prevent redundant parallel HTTP calls
const inflightProducts = new Map<string, Promise<any>>();

export const productService = {
  // Single unified API to fetch product details via payload
  getDetails: (payload: ProductDetailsPayload = {}) =>
    api.post("/products/details", payload),

  getAll: async (categoryId?: string, forceRefresh = false) => {
    const key = categoryId || "__all__";

    // Deduplicate simultaneous in-flight calls (e.g., StrictMode double mounting)
    if (!forceRefresh && inflightProducts.has(key)) {
      return inflightProducts.get(key)!;
    }

    const promise = api
      .get("/products", { params: { categoryId } })
      .then((res) => {
        inflightProducts.delete(key);
        return res;
      })
      .catch((err) => {
        inflightProducts.delete(key);
        throw err;
      });

    inflightProducts.set(key, promise);
    return promise;
  },

  getById: (id: string) => api.get(`/products/${id}`),

  create: async (data: FormData | any) => {
    return api.post("/products", data);
  },

  update: async (id: string, data: FormData | any) => {
    return api.put(`/products/${id}`, data);
  },

  remove: async (id: string) => {
    return api.delete(`/products/${id}`);
  },

  getReviews: (id: string) => api.get(`/products/${id}/reviews`),
  canReview: (id: string) => api.get(`/products/${id}/can-review`),
  submitReview: (id: string, data: { rating: number; title?: string; comment: string; images?: string[] }) => {
    return api.post(`/products/${id}/reviews`, data);
  },

  clearCache: () => {
    // No-op: product state stored strictly in Redux
  },
};
