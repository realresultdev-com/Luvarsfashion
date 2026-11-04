import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";
import GoogleLoginButton from "../../components/common/GoogleLoginButton";
import { AlertCircle } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromQuery = new URLSearchParams(location.search).get("redirect");
  const redirectPath =
    fromQuery && fromQuery !== "/register" && fromQuery !== "/login"
      ? fromQuery
      : "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(name, email, password);
      login(res.data.user, res.data.token);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-8 px-4 space-y-4">
      {/* Buddy Mattress Logo */}
      <div className="text-center">
        <Link to="/" className="inline-flex flex-col items-center">
          <img
            src="/logo-transparent.png"
            alt="Buddy Mattress"
            className="h-12 w-auto object-contain"
          />
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Register Box */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-medium text-[#0f1111]">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#0f1111] mb-1">Your name</label>
            <input
              type="text"
              required
              placeholder="First and last name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-400 rounded text-xs text-[#0f1111] focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0f1111] mb-1">Mobile number or email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-400 rounded text-xs text-[#0f1111] focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0f1111] mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-400 rounded text-xs text-[#0f1111] focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none"
            />
            <p className="text-[11px] text-gray-500 mt-1">Passwords must be at least 6 characters.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#0ea9df] hover:bg-[#0c93c4] font-bold text-xs text-white shadow-sm transition-colors"
          >
            {loading ? "Creating account..." : "Create Account & Join Sleep Club"}
          </button>
        </form>

        <p className="text-[11px] text-gray-600 leading-normal">
          By creating an account or logging in, you agree to Buddy Mattress&apos;s{" "}
          <Link to="/terms" className="text-[#0ea9df] hover:underline font-semibold">Terms of Service</Link> and{" "}
          <Link to="/privacy" className="text-[#0ea9df] hover:underline font-semibold">Privacy Policy</Link>.
        </p>

        {/* Google OAuth Button */}
        <div className="pt-2 border-t border-gray-200 space-y-2">
          <p className="text-[11px] font-medium text-gray-500 text-center">Or continue with</p>
          <GoogleLoginButton onSuccess={() => navigate(redirectPath, { replace: true })} onError={(msg) => setError(msg)} />
        </div>

        <div className="pt-2 border-t border-gray-200 text-xs text-gray-700">
          Already have an account?{" "}
          <Link
            to={fromQuery ? `/login?redirect=${encodeURIComponent(fromQuery)}` : "/login"}
            className="text-amazon-blue hover:text-amazon-linkHover hover:underline font-bold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
