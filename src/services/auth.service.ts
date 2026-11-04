import { api } from "./api";

export const authService = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),
  googleLogin: (credential: string) =>
    api.post("/auth/google", { credential }),
  googleAccessTokenLogin: (accessToken: string) =>
    api.post("/auth/google", { access_token: accessToken }),
  me: () => api.get("/auth/me"),
};
