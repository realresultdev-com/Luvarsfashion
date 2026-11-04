import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Layers,
  Wind,
  BedDouble,
  Instagram,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Eye,
  Heart,
} from "lucide-react";

interface ReelItem {
  id: string;
  title: string;
  subtitle: string;
  views: string;
  likes: string;
  videoUrl: string;
  posterUrl: string;
  instagramUrl: string;
  badge: string;
}

export default function About() {
  const [playingReelId, setPlayingReelId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const brandPillars = [
    {
      icon: Layers,
      title: "Premium Fabric Quality",
      desc: "Crafted from 100% combed cotton and breathable blends that feel soft on skin all day long.",
    },
    {
      icon: Wind,
      title: "Vibrant Print Technology",
      desc: "High-resolution DTG and screen printing that stays vivid wash after wash without fading.",
    },
    {
      icon: BedDouble,
      title: "Perfect Fit & Sizing",
      desc: "Available in XS to 5XL with consistent sizing across all styles for the perfect fit every time.",
    },
    {
      icon: Award,
      title: "Eco-Friendly Production",
      desc: "Responsibly sourced fabrics with OEKO-TEX certified dyes, safe for skin and the environment.",
    },
  ];

  const brandPromises = [
    {
      icon: RotateCcw,
      title: "15-Day Easy Returns",
      subtitle: "Not happy with your purchase? Return within 15 days for a full refund, no questions asked.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Guarantee",
      subtitle: "Every garment quality-checked for stitching, print, and fabric before it reaches you.",
    },
    {
      icon: Truck,
      title: "Free Express Shipping",
      subtitle: "Fast shipping across India with real-time tracking on every order.",
    },
    {
      icon: Award,
      title: "Direct From Manufacturer",
      subtitle: "We sell direct-to-consumer, cutting out middlemen to bring you premium fashion at fair prices.",
    },
  ];

  const milestones = [
    { value: "1,00,000+", label: "Happy Customers" },
    { value: "99%", label: "Satisfaction Rate" },
    { value: "200+", label: "Cities Delivered" },
    { value: "5+ Years", label: "Of Fashion" },
  ];

  const reelsData: ReelItem[] = [
    {
      id: "reel-motion",
      title: "New Collection Lookbook",
      subtitle: "Explore our latest drop of graphic tees, polos, and casual wear.",
      views: "48K",
      likes: "3.4K",
      videoUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80",
      posterUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80",
      instagramUrl: "https://www.instagram.com/luvarsfashion/reels/",
      badge: "New Drop",
    },
    {
      id: "reel-ortho",
      title: "Styling Tips & Fits",
      subtitle: "How to style your Luvars tees for every occasion.",
      views: "64K",
      likes: "5.1K",
      videoUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
      posterUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
      instagramUrl: "https://www.instagram.com/luvarsfashion/reels/",
      badge: "Style",
    },
    {
      id: "reel-unboxing",
      title: "Unboxing Experience",
      subtitle: "Watch our customers unbox and try on their new Luvars Fashion orders.",
      views: "39K",
      likes: "2.8K",
      videoUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80",
      posterUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80",
      instagramUrl: "https://www.instagram.com/luvarsfashion/reels/",
      badge: "Unboxing",
    },
    {
      id: "reel-factory",
      title: "Behind The Scenes",
      subtitle: "A peek into our design studio and production process.",
      views: "78K",
      likes: "6.7K",
      videoUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80",
      posterUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80",
      instagramUrl: "https://www.instagram.com/luvarsfashion/reels/",
      badge: "Studio",
    },
  ];

  const handleTogglePlay = (reelId: string) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    if (playingReelId === reelId) {
      video.pause();
      setPlayingReelId(null);
    } else {
      Object.entries(videoRefs.current).forEach(([id, vid]) => {
        if (vid && id !== reelId) {
          vid.pause();
        }
      });
      video.play().catch(() => {});
      setPlayingReelId(reelId);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 1. Hero Section - Elegant Human Design */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-8 max-w-4xl mx-auto text-center space-y-6">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          About Luvars Fashion
        </span>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          Bold fashion for every Indian wardrobe.
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We believe every day is an opportunity to express yourself. We design comfortable, stylish t-shirts and casual wear built for Indian tastes, weather, and lifestyles.
        </p>

        <div className="pt-2 flex items-center justify-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-black text-white text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#story"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-gray-200 text-gray-900 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-colors"
          >
            Our Story
          </a>
        </div>
      </section>



      {/* 4. Video Reels Showcase */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 border-t border-gray-100 bg-gray-50/30">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Collections & Lookbooks
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
                See our fashion in action
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-400" /> : <Volume2 className="w-3.5 h-3.5 text-gray-900" />}
                <span>{isMuted ? "Muted" : "Sound On"}</span>
              </button>

              <a
                href="https://www.instagram.com/luvarsfashion/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 hover:underline flex items-center gap-1"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reelsData.map((reel) => {
              const isPlaying = playingReelId === reel.id;

              return (
                <div key={reel.id} className="rounded-lg border border-gray-200 overflow-hidden bg-white flex flex-col">
                  <div className="relative aspect-9/16 bg-black overflow-hidden cursor-pointer">
                    <video
                      ref={(el) => {
                        videoRefs.current[reel.id] = el;
                      }}
                      src={reel.videoUrl}
                      poster={reel.posterUrl}
                      muted={isMuted}
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                      onClick={() => handleTogglePlay(reel.id)}
                    />

                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white">
                        {reel.badge}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-white bg-black/60 px-2 py-0.5 rounded">
                        <Eye className="w-3 h-3" />
                        <span>{reel.views}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePlay(reel.id)}
                      className={`absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center transition-all cursor-pointer z-20 ${
                        isPlaying ? "opacity-0 hover:opacity-100" : "opacity-90 hover:opacity-100"
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                    </button>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">{reel.title}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{reel.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                        <Heart className="w-3 h-3 text-gray-500" />
                        <span>{reel.likes}</span>
                      </div>

                      <a
                        href={reel.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 text-[11px] hover:underline flex items-center gap-1"
                      >
                        <span>Watch</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Craftsmanship Pillars */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Craftsmanship
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Built for style and comfort
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Four pillars behind every Luvars Fashion piece.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {brandPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="p-6 rounded-lg border border-gray-200 space-y-2.5 bg-white">
                  <Icon className="w-5 h-5 text-gray-900" />
                  <h3 className="text-sm font-semibold text-gray-900">{pillar.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* 7. CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Ready to upgrade your wardrobe?
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          Explore our range of t-shirts, polos, and casual wear with free shipping and easy 15-day returns.
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-black text-white text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            <span>Shop Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
