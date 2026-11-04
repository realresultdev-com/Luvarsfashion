import axios from "axios";
import { Capacitor } from "@capacitor/core";

// When running inside Android/iOS native app, point to the live Cloudflare production API.
// When running in a browser, use the environment variable or default to same-origin /api.
const getBaseURL = () => {
  if (Capacitor.isNativePlatform()) {
    return "https://luvarsfashion.pages.dev/api";
  }
  return import.meta.env.VITE_API_URL || "/api";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
