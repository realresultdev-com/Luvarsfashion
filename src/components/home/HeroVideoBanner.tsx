import { useState, useEffect, useRef } from "react";
import { Video, Volume2, VolumeX, Sparkles } from "lucide-react";
import { heroVideoService, type HeroVideo } from "../../services/heroVideo.service";
import { getAdaptiveVideoUrl } from "../../utils/videoTranscoder";
import { videoCacheService } from "../../services/videoCache.service";
import { nativeFeedback } from "../../utils/haptics";

const isImageMedia = (url?: string): boolean => {
  if (!url) return false;
  return Boolean(url.match(/\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i));
};

const interleaveMedia = (items: HeroVideo[]): HeroVideo[] => {
  const videos = items.filter((v) => !isImageMedia(v.video_url));
  const images = items.filter((v) => isImageMedia(v.video_url));

  const result: HeroVideo[] = [];
  let vIdx = 0;
  let iIdx = 0;

  // Alternate Video -> Image -> Video -> Image
  while (vIdx < videos.length || iIdx < images.length) {
    if (vIdx < videos.length) {
      result.push(videos[vIdx]);
      vIdx++;
    }
    if (iIdx < images.length) {
      result.push(images[iIdx]);
      iIdx++;
    }
  }

  return result;
};

export default function HeroVideoBanner() {
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>([]);
  const [cachedSources, setCachedSources] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [feedbackBadge, setFeedbackBadge] = useState<{
    id: string;
    type: "sound_on" | "sound_off";
  } | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isInteracting = useRef(false);
  const isVisibleInViewport = useRef(true);

  const sanitizeVideoUrl = (url: string) => {
    if (!url || url.includes("mixkit-woman-relaxing-in-a-comfortable-bed-41556-large.mp4")) {
      return "/videos/hero-mattress.mp4";
    }
    return url;
  };

  // 1. Fetch active videos from API
  useEffect(() => {
    const fetchHeroVideos = async () => {
      try {
        setLoading(true);
        const res = await heroVideoService.getActive();
        if (Array.isArray(res?.data) && res.data.length > 0) {
          const sanitized = res.data.map((item) => ({
            ...item,
            video_url: sanitizeVideoUrl(item.video_url),
            video_url_720p: item.video_url_720p ? sanitizeVideoUrl(item.video_url_720p) : undefined,
            video_url_360p: item.video_url_360p ? sanitizeVideoUrl(item.video_url_360p) : undefined,
          }));
          const orderedData = interleaveMedia(sanitized);
          setHeroVideos(orderedData);
        } else {
          setHeroVideos([
            {
              id: "hv_local_1",
              title: "Luxury Orthopedic Sleep Collection",
              subtitle: "Engineered with organic latex & high resilience foam",
              video_url: "/videos/hero-mattress.mp4",
              poster_url: "/hero-mattress.jpg",
              link_url: "/shop",
              display_order: 1,
              is_active: 1,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load homepage hero videos, using local fallback:", err);
        setHeroVideos([
          {
            id: "hv_local_1",
            title: "Luxury Orthopedic Sleep Collection",
            subtitle: "Engineered with organic latex & high resilience foam",
            video_url: "/videos/hero-mattress.mp4",
            poster_url: "/hero-mattress.jpg",
            link_url: "/shop",
            display_order: 1,
            is_active: 1,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroVideos();
  }, []);

  // 2. Instagram-Grade Video Cache Storage & Prefetching
  useEffect(() => {
    if (!heroVideos || heroVideos.length === 0) return;

    let isSubscribed = true;

    const loadCachedVideos = async () => {
      const sourceMap: { [id: string]: string } = {};

      for (let i = 0; i < heroVideos.length; i++) {
        const item = heroVideos[i];
        if (!isImageMedia(item.video_url)) {
          const adaptiveSrc = getAdaptiveVideoUrl(item);
          // Retrieve from local cache or stream into cache
          const cachedUrl = await videoCacheService.getVideoUrl(adaptiveSrc);
          sourceMap[item.id] = cachedUrl;

          // Prefetch next video in background (Instagram Reels pre-buffering)
          if (i + 1 < heroVideos.length && !isImageMedia(heroVideos[i + 1].video_url)) {
            const nextSrc = getAdaptiveVideoUrl(heroVideos[i + 1]);
            videoCacheService.prefetchVideo(nextSrc);
          }
        }
      }

      if (isSubscribed) {
        setCachedSources((prev) => ({ ...prev, ...sourceMap }));
      }
    };

    loadCachedVideos();

    return () => {
      isSubscribed = false;
    };
  }, [heroVideos]);

  // 3. Playback control
  const playAllVideos = () => {
    if (!isVisibleInViewport.current) return;
    Object.values(videoRefs.current).forEach((videoEl) => {
      if (videoEl) {
        videoEl.muted = isMuted;
        videoEl.play().catch(() => {});
      }
    });
  };

  useEffect(() => {
    playAllVideos();
  }, [heroVideos, cachedSources]);

  // 4. Viewport Observer (Pause decoders when scrolled out of view, saving battery)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleInViewport.current = entry.isIntersecting;
          if (!entry.isIntersecting) {
            // Scrolled out of screen -> pause to save GPU/decoders
            Object.values(videoRefs.current).forEach((v) => {
              if (v && !v.paused) v.pause();
            });
          } else {
            // Scrolled back into view -> resume
            playAllVideos();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isMuted]);

  // 5. Instagram-Style Reel auto-scroll every 5 seconds
  useEffect(() => {
    if (!heroVideos || heroVideos.length <= 1) return;

    const interval = setInterval(() => {
      if (isInteracting.current || !isVisibleInViewport.current) return;

      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % heroVideos.length;
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const cardElement = container.children[nextIndex] as HTMLElement;
          if (cardElement) {
            container.scrollTo({
              left: cardElement.offsetLeft - container.offsetLeft,
              behavior: "smooth",
            });
          }
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [heroVideos]);

  // 6. Instagram-Style Tap to Toggle Mute/Audio with Animated Floating Badge
  const handleToggleMute = (vidId: string) => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    Object.values(videoRefs.current).forEach((v) => {
      if (v) v.muted = newMuted;
    });

    nativeFeedback.lightTap();
    setFeedbackBadge({
      id: vidId,
      type: newMuted ? "sound_off" : "sound_on",
    });

    setTimeout(() => {
      setFeedbackBadge((current) => (current?.id === vidId ? null : current));
    }, 1100);
  };

  if (loading) {
    return (
      <div className="w-full my-3 select-none">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pt-2 pb-5 px-1 flex-nowrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-[65vw] sm:w-[220px] md:w-[225px] lg:w-[235px] xl:w-[245px] shrink-0 h-[400px] sm:h-[400px] md:h-[420px] lg:h-[430px] rounded-[28px] bg-gray-100 animate-pulse border border-gray-200 flex items-center justify-center"
            >
              <Video className="w-6 h-6 text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!heroVideos || heroVideos.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="w-full select-none mb-2 overflow-hidden">
      {/* Pure Video & Image Reel Showcase Container */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => {
          isInteracting.current = true;
        }}
        onMouseLeave={() => {
          isInteracting.current = false;
        }}
        onTouchStart={() => {
          isInteracting.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isInteracting.current = false;
          }, 3000);
        }}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pt-2 pb-5 px-1 w-full flex-nowrap"
      >
        {heroVideos.map((vid) => {
          const rawSrc = getAdaptiveVideoUrl(vid);
          // Use cached blob URL if available, else adaptive network URL
          const activeSrc = cachedSources[vid.id] || rawSrc;
          const isImage = isImageMedia(vid.video_url);
          const isBadgeActive = feedbackBadge?.id === vid.id;

          return (
            <div
              key={vid.id}
              onClick={() => {
                if (!isImage) handleToggleMute(vid.id);
              }}
              className="w-[65vw] sm:w-[220px] md:w-[225px] lg:w-[235px] xl:w-[245px] shrink-0 h-[400px] sm:h-[400px] md:h-[420px] lg:h-[430px] rounded-[28px] relative group shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12),0_8px_10px_-6px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer overflow-hidden"
              style={{ borderRadius: "28px" }}
            >
              <div
                className="w-full h-full rounded-[28px] overflow-hidden bg-black relative flex flex-col justify-between"
                style={{
                  borderRadius: "28px",
                  WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                }}
              >
                {isImage ? (
                  /* Image Display */
                  <img
                    src={vid.video_url}
                    alt={vid.title || "Banner"}
                    className="w-full h-full object-cover absolute inset-0 group-hover:scale-[1.02] transition-transform duration-300"
                  />
                ) : (
                  /* Video Player - Cached, continuous playback with Tap-to-Audio */
                  <>
                    <video
                      ref={(el) => {
                        videoRefs.current[vid.id] = el;
                        if (el) {
                          el.muted = isMuted;
                          el.setAttribute("muted", "");
                          el.setAttribute("playsinline", "");
                          if (el.paused && isVisibleInViewport.current) {
                            el.play().catch(() => {});
                          }
                        }
                      }}
                      src={activeSrc}
                      poster={vid.poster_url || "/hero-mattress.jpg"}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      preload="auto"
                      onError={(e) => {
                        const el = e.currentTarget;
                        if (!el.src.includes("hero-mattress.mp4")) {
                          el.src = "/videos/hero-mattress.mp4";
                          el.muted = isMuted;
                          el.play().catch(() => {});
                        }
                      }}
                      onPause={(e) => {
                        if (isVisibleInViewport.current && !isInteracting.current) {
                          e.currentTarget.play().catch(() => {});
                        }
                      }}
                      className="w-full h-full object-cover absolute inset-0 pointer-events-none group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* Instagram-Style Audio/Mute Floating Badge Overlay */}
                    {isBadgeActive && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-75 fade-in duration-150">
                        <div className="bg-black/70 backdrop-blur-md text-white px-3.5 py-2 rounded-full flex items-center gap-2 shadow-2xl border border-white/20">
                          {feedbackBadge.type === "sound_on" ? (
                            <>
                              <Volume2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold tracking-tight">Sound On</span>
                            </>
                          ) : (
                            <>
                              <VolumeX className="w-4 h-4 text-white/80" />
                              <span className="text-xs font-bold tracking-tight">Sound Off</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Corner Audio Indicator Icon */}
                    <div className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/90 transition-opacity">
                      {isMuted ? (
                        <VolumeX className="w-3.5 h-3.5 text-white/70" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                  </>
                )}

                {/* Subtitle / Title Pill at bottom */}
                {vid.title && (
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                    <p className="text-xs font-bold text-white line-clamp-1 drop-shadow-xs">
                      {vid.title}
                    </p>
                    {vid.subtitle && (
                      <p className="text-[10px] text-white/80 line-clamp-1">
                        {vid.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
