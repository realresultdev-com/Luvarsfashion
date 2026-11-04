import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { authService } from "../services/auth.service";
import { useAuth } from "./useAuth";

export function useCapacitorNative() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Only run on native Android/iOS
    if (!Capacitor.isNativePlatform()) return;

    // 1. Configure native Status Bar (prevent overlaying webview, match rich navy theme)
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: "#0f172a" });
      StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) {
      console.warn("StatusBar setup warning:", e);
    }

    // 2. Hide Splash Screen after React has rendered
    try {
      SplashScreen.hide();
    } catch (e) {
      console.warn("SplashScreen hide warning:", e);
    }

    // 3. Android Hardware Back Button listener
    const backListener = App.addListener("backButton", ({ canGoBack }) => {
      // Check if any modal or drawer is open
      const closeBtn = document.querySelector<HTMLButtonElement>(
        "[data-modal-close], button[aria-label='Close']"
      );
      if (closeBtn) {
        closeBtn.click();
        return;
      }

      if (location.pathname !== "/" && location.pathname !== "") {
        navigate(-1);
      } else {
        App.exitApp();
      }
    });

    // 4. App lifecycle handling (Pause media decoders when backgrounded, save battery and CPU)
    const appStateListener = App.addListener("appStateChange", ({ isActive }) => {
      const videos = Array.from(document.querySelectorAll("video"));
      if (!isActive) {
        videos.forEach((v) => {
          if (!v.paused) {
            v.setAttribute("data-was-playing", "true");
            v.pause();
          }
        });
      } else {
        videos.forEach((v) => {
          if (v.getAttribute("data-was-playing") === "true") {
            v.removeAttribute("data-was-playing");
            v.play().catch(() => {});
          }
        });
      }
    });

    // 5. Deep Link & OAuth Redirect Handler (Chrome Custom Tabs callback)
    const appUrlListener = App.addListener("appUrlOpen", async (event) => {
      try {
        // Automatically close Chrome Custom Tabs popover
        await Browser.close().catch(() => {});

        const rawUrl = event.url;
        if (!rawUrl) return;

        // Check for Google OAuth tokens in URL query params or hash fragment
        let accessToken: string | null = null;
        let idToken: string | null = null;

        if (rawUrl.includes("#")) {
          const hashStr = rawUrl.substring(rawUrl.indexOf("#") + 1);
          const params = new URLSearchParams(hashStr);
          accessToken = params.get("access_token") || accessToken;
          idToken = params.get("id_token") || idToken;
        }

        if (rawUrl.includes("?")) {
          const queryStr = rawUrl.substring(rawUrl.indexOf("?") + 1).split("#")[0];
          const params = new URLSearchParams(queryStr);
          accessToken = params.get("access_token") || accessToken;
          idToken = params.get("id_token") || idToken;
        }

        if (accessToken || idToken) {
          try {
            const res = accessToken
              ? await authService.googleAccessTokenLogin(accessToken)
              : await authService.googleLogin(idToken!);
            login(res.data.user, res.data.token);
            window.location.replace("/");
            return;
          } catch (err: any) {
            console.error("Deep Link Google Auth verification error:", err);
          }
        }

        // Generic in-app deep link route
        const sanitized = rawUrl.replace("com.buddymattress.app://", "/");
        if (sanitized && sanitized !== "/" && sanitized !== "/login") {
          navigate(sanitized);
        }
      } catch (err) {
        console.warn("Failed to process appUrlOpen event:", err);
      }
    });

    return () => {
      backListener.then((handle) => handle.remove()).catch(() => {});
      appStateListener.then((handle) => handle.remove()).catch(() => {});
      appUrlListener.then((handle) => handle.remove()).catch(() => {});
    };
  }, [location.pathname, navigate, login]);
}
