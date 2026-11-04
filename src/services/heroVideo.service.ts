import { api } from "./api";

export interface HeroVideo {
  id: string;
  title: string;
  subtitle?: string;
  video_url: string;
  video_url_720p?: string;
  video_url_360p?: string;
  poster_url?: string;
  link_url?: string;
  display_order: number;
  is_active: number | boolean;
  created_at?: string;
}

export const heroVideoService = {
  // Get active hero videos for homepage
  getActive: async (): Promise<{ success: boolean; data: HeroVideo[] }> => {
    const res = await api.get("/hero-videos");
    return res.data;
  },

  // Admin: Get all hero videos
  getAllAdmin: async (): Promise<{ success: boolean; data: HeroVideo[] }> => {
    const res = await api.get("/admin/hero-videos");
    return res.data;
  },

  // Admin: Create a new hero video entry
  create: async (data: Partial<HeroVideo>): Promise<{ success: boolean; data: HeroVideo }> => {
    const res = await api.post("/admin/hero-videos", data);
    return res.data;
  },

  // Admin: Update a hero video entry
  update: async (id: string, data: Partial<HeroVideo>): Promise<{ success: boolean; data: HeroVideo }> => {
    const res = await api.put(`/admin/hero-videos/${id}`, data);
    return res.data;
  },

  // Admin: Delete a hero video entry
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/admin/hero-videos/${id}`);
    return res.data;
  },
};
