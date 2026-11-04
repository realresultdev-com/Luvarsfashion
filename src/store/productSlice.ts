import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "../services/product.service";
import { categoryService } from "../services/category.service";
import type { Product, Category } from "../types/product.types";

interface ProductState {
  products: Product[];
  categories: Category[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetched: number | null;
}

const initialState: ProductState = {
  products: [],
  categories: [],
  status: "idle",
  error: null,
  lastFetched: null,
};

// Async Thunk to fetch all products and categories once into Redux
export const fetchCatalog = createAsyncThunk(
  "catalog/fetchCatalog",
  async (forceRefresh: boolean | void = false, { getState }) => {
    const state = (getState() as { catalog: ProductState }).catalog;
    const now = Date.now();
    // Use cached in-memory data in Redux if fetched within 3 minutes
    if (!forceRefresh && state.lastFetched && now - state.lastFetched < 3 * 60 * 1000 && state.products.length > 0) {
      return { products: state.products, categories: state.categories };
    }

    const [prodRes, catRes] = await Promise.all([
      productService.getAll(undefined, Boolean(forceRefresh)),
      categoryService.getAll(Boolean(forceRefresh)),
    ]);

    return {
      products: Array.isArray(prodRes?.data) ? prodRes.data : [],
      categories: Array.isArray(catRes?.data) ? catRes.data : [],
    };
  }
);

export const productSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = Array.isArray(action.payload) ? action.payload : [];
    },
    clearCatalogCache: (state) => {
      state.products = [];
      state.categories = [];
      state.lastFetched = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        if (state.products.length === 0) {
          state.status = "loading";
        }
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = Array.isArray(action.payload?.products) ? action.payload.products : [];
        state.categories = Array.isArray(action.payload?.categories) ? action.payload.categories : [];
        state.lastFetched = Date.now();
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load catalog";
      });
  },
});

export const { setProducts, clearCatalogCache } = productSlice.actions;
export default productSlice.reducer;
