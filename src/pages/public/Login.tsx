import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import GoogleLoginButton from "../../components/common/GoogleLoginButton";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successUser, setSuccessUser] = useState<any>(null);
  const [oauthHandoffUrl, setOauthHandoffUrl] = useState<string | null>(null);

  // Email / Password states
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract destination cleanly, guarding against loop back to login
  const fromState = (location.state as any)?.from?.pathname;
  const fromQuery = new URLSearchParams(location.search).get("redirect");
  let redirectPath = fromState || fromQuery || "/";
  if (redirectPath === "/login" || redirectPath === "/register") {
    redirectPath = "/";
  }

  // Auto redirect if already logged in
  useEffect(() => {
    if (user && !loading && !isVerifying) {
      if (window.location.hash && (window.location.hash.includes("access_token") || window.location.hash.includes("id_token"))) {
        try {
          window.history.replaceState(null, "", window.location.pathname);
        } catch (_) {}
      }
      window.location.replace(redirectPath);
    }
  }, [user, loading, isVerifying, redirectPath]);

  // Check URL hash / search for OAuth redirect token
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const hasTokens =
      (hash && (hash.includes("access_token=") || hash.includes("id_token="))) ||
      (search && (search.includes("access_token=") || search.includes("id_token=")));

    if (hasTokens) {
      const rawHash = hash ? hash.substring(1) : "";
      const queryStr = rawHash ? `?${rawHash}` : search;
      const androidIntent = `intent://login${queryStr}#Intent;scheme=com.luvarsfashion.app;package=com.luvarsfashion.app;end`;
      const customScheme = `com.luvarsfashion.app://login${queryStr}`;

      // 1. If running in external browser / Chrome Custom Tab on mobile, trigger app deep link
      try {
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
        if (isMobile && !(window as any).Capacitor?.isNativePlatform?.()) {
          setOauthHandoffUrl(androidIntent);
          try {
            window.location.replace(androidIntent);
          } catch (_) {
            window.location.replace(customScheme);
          }
        }
      } catch (_) {}

      // 2. Also authenticate directly in the current web context
      const hashParams = new URLSearchParams(rawHash);
      const searchParams = new URLSearchParams(search);
      const accessToken =
        hashParams.get("access_token") || searchParams.get("access_token");
      const idToken = hashParams.get("id_token") || searchParams.get("id_token");

      if (accessToken) {
        setIsVerifying(true);
        authService
          .googleAccessTokenLogin(accessToken)
          .then((res) => {
            login(res.data.user, res.data.token);
            handleSuccess(res.data.user);
          })
          .catch((err) => {
            setIsVerifying(false);
            setError(err.response?.data?.message || "Google authentication failed");
          });
      } else if (idToken) {
        setIsVerifying(true);
        authService
          .googleLogin(idToken)
          .then((res) => {
            login(res.data.user, res.data.token);
            handleSuccess(res.data.user);
          })
          .catch((err) => {
            setIsVerifying(false);
            setError(err.response?.data?.message || "Google authentication failed");
          });
      }
    }
  }, []);

  const handleSuccess = (loggedInUser: any) => {
    setError(null);
    setSuccessUser(loggedInUser);
    setIsVerifying(false);
    setOauthHandoffUrl(null);

    // Save user object immediately in localStorage
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    // Clear hash tokens from browser bar
    try {
      if (window.location.hash && (window.location.hash.includes("access_token") || window.location.hash.includes("id_token"))) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch (_) {}

    // 1. If opened in a popup window (window.opener), post message to parent
    if (window.opener && window.opener !== window) {
      try {
        window.opener.postMessage(
          {
            type: "OAUTH_SUCCESS",
            user: loggedInUser,
            token: localStorage.getItem("token"),
          },
          "*"
        );
      } catch (_) {}
      try {
        window.close();
      } catch (_) {}
    }

    // 2. If opened in Capacitor Browser, attempt to close
    try {
      import("@capacitor/browser").then(({ Browser }) => {
        Browser.close().catch(() => {});
      }).catch(() => {});
    } catch (_) {}

    // 3. Immediately redirect to home page or target destination
    setTimeout(() => {
      window.location.replace(redirectPath);
    }, 150);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setEmailLoading(true);
      setError(null);
      const res = await authService.login(email.trim(), password);
      login(res.data.user, res.data.token);
      handleSuccess(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between items-center px-4 py-8 select-none font-sans relative">
      {oauthHandoffUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10 animate-pulse">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Google Sign-in Successful!</h2>
          <p className="text-sm text-slate-400 max-w-xs mb-6">
            Returning to the Luvars Fashion app...
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <a
              href={oauthHandoffUrl}
              onClick={() => {
                setTimeout(() => setOauthHandoffUrl(null), 800);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0ea9df] hover:bg-[#0c96c7] text-white font-bold text-sm shadow-lg shadow-[#0ea9df]/25 active:scale-95 transition-all text-center block"
            >
              Continue to App
            </a>
            <button
              type="button"
              onClick={() => {
                setOauthHandoffUrl(null);
                navigate(redirectPath, { replace: true });
              }}
              className="text-xs text-slate-400 hover:text-white underline py-1 cursor-pointer"
            >
              Close this window
            </button>
          </div>
        </div>
      )}

      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {/* Modern Floating Card */}
        <div className="w-full max-w-[370px] bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-black/[0.05] text-center space-y-5 transition-all duration-300">
          {/* Product Logo & Header */}
          <div className="space-y-2">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <img
                src="/logo-transparent.png"
                alt="Luvars Fashion"
                className="h-10 w-auto mx-auto object-contain"
              />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                {successUser ? "Welcome!" : "Sign In"}
              </h1>
              <p className="text-xs text-[#86868b] mt-0.5">
                {successUser
                  ? `Signed in as ${successUser.name || "User"}`
                  : "to continue to Luvars Fashion"}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50/80 border border-red-200/80 rounded-2xl text-red-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Dynamic Content: Success State vs Buttons */}
          {successUser ? (
            <div className="py-5 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0ea9df]" />
                <span>Redirecting...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary Google Login Button */}
              <div className="pt-1 flex justify-center">
                <GoogleLoginButton
                  onSuccess={handleSuccess}
                  onError={(msg) => {
                    setIsVerifying(false);
                    setError(msg);
                  }}
                  onLoadingChange={setIsVerifying}
                  theme="outline"
                  shape="pill"
                  width={290}
                />
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-2 text-[11px] text-gray-400 uppercase tracking-wider shrink-0">
                  or
                </span>
              </div>

              {/* Email Login Form / Toggle */}
              {!showEmailLogin ? (
                <button
                  type="button"
                  onClick={() => setShowEmailLogin(true)}
                  className="w-full py-2.5 px-4 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>Sign in with Email & Password</span>
                </button>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-3 text-left">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:border-[#0ea9df] focus:ring-1 focus:ring-[#0ea9df] outline-none"
                      />
                      <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:border-[#0ea9df] focus:ring-1 focus:ring-[#0ea9df] outline-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="w-full py-2.5 rounded-xl bg-[#0ea9df] hover:bg-[#0c93c4] active:bg-[#0a7fa8] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {emailLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{emailLoading ? "Signing in..." : "Sign In with Email"}</span>
                  </button>
                </form>
              )}

              {/* Create account link */}
              <div className="pt-1 text-xs text-gray-600">
                New to Luvars Fashion?{" "}
                <Link
                  to={fromQuery ? `/register?redirect=${encodeURIComponent(fromQuery)}` : "/register"}
                  className="text-[#0ea9df] hover:underline font-semibold"
                >
                  Create an account
                </Link>
              </div>
            </div>
          )}

          {/* Mandatory DPDP & IT Act Consent */}
          <p className="text-[11px] text-[#86868b] leading-relaxed pt-1">
            By continuing, you agree to Luvars Fashion&apos;s{" "}
            <Link to="/terms" className="text-[#0ea9df] hover:underline font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-[#0ea9df] hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="text-center text-[11px] text-[#86868b] space-y-1 pt-6">
        <div className="flex justify-center gap-4 text-[#86868b]">
          <Link to="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/grievance" className="hover:underline">
            Customer Support & Grievance
          </Link>
        </div>
        <p className="text-[#a1a1a6]">
          © {new Date().getFullYear()} Luvars Fashion. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
