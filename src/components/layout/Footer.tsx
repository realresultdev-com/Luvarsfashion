import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe, MapPin, PhoneCall, Mail, ArrowUp } from "lucide-react";
import LuvarsLogo from "../common/LuvarsLogo";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 120);
    };
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-gray-900 text-gray-400 text-xs border-t border-gray-800 select-none">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link to="/" onClick={scrollToTop} className="inline-block">
              <LuvarsLogo />
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              Direct-from-manufacturer fashion brand. Crafted with premium fabrics and vibrant prints for everyday style.
            </p>
            <div className="pt-1 text-xs text-gray-300 font-medium">
              Free Delivery • 15-Day Easy Returns
            </div>
          </div>

          {/* Col 2: Legal & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Legal & Policies
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/terms" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Refund & Return Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/grievance" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Grievance Redressal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation & Options */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/shop" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Shop All T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={scrollToTop} className="hover:text-white transition-colors">
                  About Luvars Fashion
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>

            <div className="pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                className="inline-flex items-center gap-2 hover:text-white cursor-pointer text-xs transition-colors py-1"
              >
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span>Language: {language === "ta" ? "தமிழ்" : "English"}</span>
              </button>
            </div>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Registered Office & Support
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <address className="not-italic leading-relaxed text-gray-400">
                  <strong className="text-gray-200">Luvars Fashion</strong><br />
                  Near RTO Office, Paramathi, Paramathi Velur,<br />
                  Namakkal District, Tamil Nadu - 637207
                </address>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <PhoneCall className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <a href="tel:+919443300000" className="text-gray-200 hover:text-white font-semibold transition-colors">
                  +91 94433 00000
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <a href="mailto:support@LuvarsFashion.in" className="hover:text-white transition-colors">
                  support@LuvarsFashion.in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs">
          <div>
            <p>© {new Date().getFullYear()} Luvars Fashion. All rights reserved.</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Country of Origin: India | Designed & Sold by Luvars Fashion.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button: Displayed on top of all screens in bottom-right corner */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-16 right-4 sm:bottom-20 sm:right-6 md:bottom-6 md:right-6 z-50 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-900/95 hover:bg-gray-800 text-gray-200 hover:text-white text-xs font-semibold shadow-2xl border border-gray-700/80 backdrop-blur-md transition-all duration-300 cursor-pointer ${
          showScrollTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <span>Back to top</span>
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
    </footer>
  );
}
