import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images?: string[];
  productName: string;
  className?: string;
  featuredImage?: string;
}

const FALLBACK_IMAGE = "/logo-transparent.png";

export default function ProductGallery({
  images = [],
  productName,
  className = "",
  featuredImage,
}: ProductGalleryProps) {
  const baseImageList = images.length > 0 ? images : [FALLBACK_IMAGE];
  const imageList =
    featuredImage && !baseImageList.includes(featuredImage)
      ? [featuredImage, ...baseImageList]
      : baseImageList;

  const [selectedImage, setSelectedImage] = useState<string>(featuredImage || imageList[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalZoom, setModalZoom] = useState(1);

  useEffect(() => {
    if (featuredImage) {
      setSelectedImage(featuredImage);
    } else if (imageList.length > 0) {
      setSelectedImage(imageList[0]);
    }
  }, [featuredImage]);

  // Prevent background scrolling and handle keyboard inside modal
  useEffect(() => {
    if (!isModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setModalZoom(1);
      } else if (e.key === "ArrowLeft") {
        setModalIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
        setModalZoom(1);
      } else if (e.key === "ArrowRight") {
        setModalIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
        setModalZoom(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, imageList.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setMousePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(touch.clientY - rect.top, rect.height));
      setMousePos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
      setIsHovered(true);
    }
  };

  const openModal = () => {
    const idx = imageList.indexOf(selectedImage);
    setModalIndex(idx >= 0 ? idx : 0);
    setModalZoom(1);
    setIsModalOpen(true);
  };

  return (
    <div className={`w-full max-w-full min-w-0 flex flex-col select-none relative ${className}`}>
      {/* Row Layout: Vertical Thumbnails Strip (Left) + Main Image Viewport (Right) */}
      <div className="flex flex-row items-start gap-2.5 sm:gap-3 w-full">
        {/* Left Side: Thumbnail Strip */}
        {imageList.length > 1 && (
          <div className="flex flex-col gap-2 shrink-0 overflow-y-auto max-h-[320px] sm:max-h-[380px] py-0.5 px-0.5 no-scrollbar">
            {imageList.map((img, idx) => {
              const isSelected = (selectedImage || imageList[0]) === img;
              return (
                <button
                  key={idx}
                  type="button"
                  onMouseEnter={() => setSelectedImage(img)}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`Select product image ${idx + 1}`}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded bg-white overflow-hidden transition-all shrink-0 cursor-pointer p-0.5 ${
                    isSelected
                      ? "border-2 border-gray-900 ring-1 ring-gray-900/30 shadow-2xs scale-105"
                      : "border border-gray-300 hover:border-gray-500 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain rounded-xs"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Right Side: Responsive Contained Zoom Viewport */}
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div
            className="relative w-full aspect-square max-h-[320px] sm:max-h-[380px] bg-white rounded-lg flex items-center justify-center p-2 cursor-zoom-in group border border-gray-200 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsHovered(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsHovered(false)}
            onClick={openModal}
          >
            {/* The Main Image with Smooth Responsive In-Place 2.5x Zoom */}
            <img
              src={selectedImage || imageList[0]}
              alt={productName}
              className="w-full h-full max-w-full max-h-full object-contain will-change-transform select-none transition-transform pointer-events-none"
              style={{
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                transform: isHovered ? "scale(2.5)" : "scale(1)",
                transitionDuration: isHovered ? "0.08s" : "0.3s",
                transitionTimingFunction: "ease-out",
              }}
              draggable={false}
            />

            {/* Hover / Touch Zoom Indicator Pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 absolute bottom-2.5 right-2.5 text-[11px] text-gray-700 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-gray-200 pointer-events-none shadow-xs transition-opacity duration-200 ${
                isHovered ? "opacity-0" : "opacity-90 group-hover:opacity-100"
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
              <span>Roll over to zoom</span>
            </div>
          </div>

          {/* Click to see full view link */}
          <button
            type="button"
            onClick={openModal}
            className="text-xs text-gray-600 hover:text-gray-900 hover:underline font-medium mt-1.5 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5 text-gray-700" />
            <span>Click to expand full screen</span>
          </button>
        </div>
      </div>

      {/* Full-Screen High-Resolution Lightbox Modal via Portal */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
                setModalZoom(1);
              }
            }}
          >
            {/* Prominent Always-Visible Floating Close Button in Top-Right Corner */}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setModalZoom(1);
              }}
              className="fixed top-3 right-3 sm:top-5 sm:right-6 z-[100000] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-black border border-white/40 hover:border-white text-xs font-bold shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95"
              aria-label="Close full view"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Close</span>
            </button>

            {/* Modal Header Bar */}
            <div className="flex items-center justify-between text-white pb-3 max-w-6xl mx-auto w-full border-b border-white/10 pr-24 sm:pr-28">
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-semibold truncate text-white">
                  {productName}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Image {modalIndex + 1} of {imageList.length} • Press ESC or click Close to exit
                </p>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalZoom((prev) => (prev > 1 ? prev - 0.75 : 1))}
                  disabled={modalZoom <= 1}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-gray-300 w-10 text-center">
                  {Math.round(modalZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setModalZoom((prev) => (prev < 3 ? prev + 0.75 : 3))}
                  disabled={modalZoom >= 3}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Center Viewport */}
            <div
              className="flex-1 flex items-center justify-center relative max-w-6xl mx-auto w-full my-auto overflow-hidden"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsModalOpen(false);
                  setModalZoom(1);
                }
              }}
            >
              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setModalIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
                    setModalZoom(1);
                  }}
                  aria-label="Previous image"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-20 cursor-pointer shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <div
                className="w-full h-full flex items-center justify-center overflow-auto p-4 cursor-grab active:cursor-grabbing"
                onClick={() => setModalZoom((prev) => (prev === 1 ? 2 : 1))}
                title="Click to toggle zoom"
              >
                <img
                  src={imageList[modalIndex]}
                  alt={`${productName} full view ${modalIndex + 1}`}
                  className="max-h-[70vh] sm:max-h-[78vh] max-w-full object-contain rounded-md transition-transform duration-200 select-none shadow-2xl"
                  style={{
                    transform: `scale(${modalZoom})`,
                  }}
                  draggable={false}
                />
              </div>

              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setModalIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
                    setModalZoom(1);
                  }}
                  aria-label="Next image"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-20 cursor-pointer shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Modal Thumbnail Strip */}
            {imageList.length > 1 && (
              <div className="flex items-center justify-center gap-2 py-3 overflow-x-auto max-w-xl mx-auto w-full no-scrollbar">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setModalIndex(idx);
                      setModalZoom(1);
                    }}
                    className={`w-12 h-12 rounded-md border p-1 bg-white transition-all cursor-pointer shrink-0 ${
                      modalIndex === idx
                        ? "border-white ring-2 ring-white scale-105 shadow-md"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
