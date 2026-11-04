import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { SocialLogin } from "@capgo/capacitor-social-login";

declare global {
  interface Window {
    google?: any;
  }
}

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "1081442493959-80so9v205tjto6n4j1geaaj8k85mri2n.apps.googleusercontent.com";

interface GoogleLoginButtonProps {
  onSuccess?: (user?: any) => void;
  onError?: (msg: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  theme?: "outline" | "filled_black" | "filled_blue";
  shape?: "pill" | "rectangular";
  width?: number;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  onLoadingChange,
  shape = "pill",
  width = 300,
}: GoogleLoginButtonProps) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [gisRendered, setGisRendered] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isNative = Capacitor.isNativePlatform();

  // Listen for OAuth completion from popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_SUCCESS" && event.data?.user && event.data?.token) {
        login(event.data.user, event.data.token);
        setIsVerifying(false);
        onLoadingChange?.(false);
        if (onSuccess) {
          onSuccess(event.data.user);
        } else {
          window.location.replace("/");
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [login, onSuccess, navigate, onLoadingChange]);

  const handleCredentialResponse = async (response: any) => {
    try {
      setIsVerifying(true);
      onLoadingChange?.(true);
      const res = await authService.googleLogin(response.credential);
      login(res.data.user, res.data.token);
      setIsVerifying(false);
      onLoadingChange?.(false);
      if (onSuccess) {
        onSuccess(res.data.user);
      } else {
        window.location.replace("/");
      }
    } catch (err: any) {
      setIsVerifying(false);
      onLoadingChange?.(false);
      const msg =
        err.response?.data?.message || err.message || "Google authentication failed";
      if (onError) onError(msg);
    }
  };

  const handleTokenResponse = async (tokenResponse: any) => {
    try {
      if (!tokenResponse?.access_token) {
        throw new Error("No access token returned by Google");
      }
      setIsVerifying(true);
      onLoadingChange?.(true);
      const res = await authService.googleAccessTokenLogin(tokenResponse.access_token);
      login(res.data.user, res.data.token);
      setIsVerifying(false);
      onLoadingChange?.(false);
      if (onSuccess) {
        onSuccess(res.data.user);
      } else {
        window.location.replace("/");
      }
    } catch (err: any) {
      setIsVerifying(false);
      onLoadingChange?.(false);
      const msg =
        err.response?.data?.message || err.message || "Google authentication failed";
      if (onError) onError(msg);
    }
  };

  // Only render official GIS iframe on Web (not inside native WebViews)
  useEffect(() => {
    if (isNative) return;

    let checkCount = 0;
    const interval = setInterval(() => {
      checkCount++;
      if (window.google?.accounts?.id && btnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
          });
          window.google.accounts.id.renderButton(btnRef.current, {
            theme: "outline",
            size: "large",
            shape,
            width,
            text: "continue_with",
          });
          setGisRendered(true);
          clearInterval(interval);
        } catch (e) {
          console.warn("GIS renderButton failed:", e);
        }
      }
      if (checkCount > 40) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [shape, width, isNative]);

  // Click trigger (Handles Native Android Credential Manager, Custom Tabs, and Web OAuth)
  const handleCustomButtonClick = async () => {
    if (isVerifying) return;

    // 1. Native Android / iOS Flow
    if (isNative) {
      setIsVerifying(true);
      onLoadingChange?.(true);

      // A. Attempt Native Android Credential Manager (Instant 1-Tap bottom sheet without browser)
      try {
        await SocialLogin.initialize({
          google: {
            webClientId: GOOGLE_CLIENT_ID,
            mode: "online",
          },
        });

        const res = await SocialLogin.login({
          provider: "google",
          options: {
            scopes: ["profile", "email"],
            style: "bottom",
          },
        });

        const resultAny = res.result as any;
        const idToken = resultAny?.idToken;
        const accessToken =
          typeof resultAny?.accessToken === "string"
            ? resultAny.accessToken
            : resultAny?.accessToken?.token;

        if (idToken || accessToken) {
          const authRes = idToken
            ? await authService.googleLogin(idToken)
            : await authService.googleAccessTokenLogin(accessToken!);

          login(authRes.data.user, authRes.data.token);
          setIsVerifying(false);
          onLoadingChange?.(false);
          if (onSuccess) {
            onSuccess(authRes.data.user);
          } else {
            window.location.replace("/");
          }
          return;
        }
      } catch (nativeErr: any) {
        console.warn("Native SocialLogin attempt:", nativeErr);
        if (
          nativeErr?.code === "USER_CANCELLED" ||
          nativeErr?.message?.toLowerCase().includes("cancel")
        ) {
          setIsVerifying(false);
          onLoadingChange?.(false);
          return;
        }
      }

      // B. Fallback to Chrome Custom Tabs with device account picker
      try {
        const redirectUri = "https://luvarsfashion.pages.dev/login";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          GOOGLE_CLIENT_ID
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=token%20id_token&scope=openid%20profile%20email&prompt=select_account&nonce=${Math.random().toString(36).substring(2)}`;

        Browser.addListener("browserFinished", () => {
          setIsVerifying(false);
          onLoadingChange?.(false);
        });

        await Browser.open({
          url: authUrl,
          presentationStyle: "popover",
          toolbarColor: "#0f172a",
        });
      } catch (err: any) {
        setIsVerifying(false);
        onLoadingChange?.(false);
        onError?.(err?.message || "Failed to open Google sign in");
      }
      return;
    }

    // 2. Web: Use Google Identity Services Token Client if available
    try {
      if (window.google?.accounts?.oauth2) {
        setIsVerifying(true);
        onLoadingChange?.(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid profile email",
          callback: (res: any) => {
            if (res.error) {
              setIsVerifying(false);
              onLoadingChange?.(false);
              onError?.(res.error_description || res.error || "Google sign in cancelled");
            } else {
              handleTokenResponse(res);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: "consent" });
        return;
      }

      // 3. Web: One Tap fallback
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            openGoogleOAuthUrl();
          }
        });
        return;
      }

      // 4. Web: Direct OAuth URL fallback
      openGoogleOAuthUrl();
    } catch (e: any) {
      console.error("Google login trigger error:", e);
      openGoogleOAuthUrl();
    }
  };

  const openGoogleOAuthUrl = () => {
    const redirectUri = window.location.origin + "/login";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      GOOGLE_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=openid%20profile%20email&prompt=select_account&nonce=${Math.random().toString(36).substring(2)}`;

    window.open(googleAuthUrl, "_blank");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-1 relative">
      {isVerifying && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-xs rounded-full z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Loader2 className="w-4 h-4 animate-spin text-[#0ea9df]" />
            <span>Connecting with Google...</span>
          </div>
        </div>
      )}

      {/* Hidden/Mounted official GIS container */}
      <div
        ref={btnRef}
        className={`min-h-[44px] flex items-center justify-center ${
          gisRendered ? "block" : "hidden"
        }`}
      />

      {/* Always-ready fallback Google Button (Displays instantly if GIS is not rendered yet) */}
      {!gisRendered && (
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={isVerifying}
          className="w-full max-w-[300px] h-[44px] px-4 rounded-full border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer select-none text-slate-700 font-medium text-xs sm:text-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
}
