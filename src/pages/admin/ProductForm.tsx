import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import { api } from "../../services/api";
import type { Category, ProductColorVariant } from "../../types/product.types";
import Loader from "../../components/common/Loader";
import R2ImageUploader from "../../components/admin/R2ImageUploader";
import OfferBadge from "../../components/common/OfferBadge";
import ColorSwatches from "../../components/common/ColorSwatches";
import {
  ArrowLeft,
  AlertCircle,
  Plus,
  Trash2,
  Tag,
  Loader2,
  Check,
  Upload,
  Pipette,
  Image as ImageIcon,
  Flame,
} from "lucide-react";

const COLOR_PRESETS = [
  { name: "Midnight Navy", color: "#1e2238" },
  { name: "Olive Green", color: "#858636" },
  { name: "Blush Pink", color: "#f1d8d9" },
  { name: "Warm Amber", color: "#e49e4d" },
  { name: "Crimson Red", color: "#b73644" },
  { name: "Charcoal Gray", color: "#2b2d42" },
  { name: "Pure White", color: "#ffffff" },
  { name: "Sky Blue", color: "#0ea9df" },
  { name: "Forest Green", color: "#2e7d32" },
];

interface InlineImageEyedropperProps {
  imageUrl: string;
  variantName: string;
  currentColor: string;
  onSelectColor: (hex: string) => void;
  onClose: () => void;
}

function InlineImageEyedropper({
  imageUrl,
  variantName,
  currentColor,
  onSelectColor,
  onClose,
}: InlineImageEyedropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoverColor, setHoverColor] = useState<string>(currentColor || "#1e2238");
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";

    const proxyUrl = imageUrl.startsWith("data:")
      ? imageUrl
      : `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=800&output=jpg`;

    img.onload = () => {
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setLoaded(true);
    };

    img.onerror = () => {
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = "Anonymous";
      fallbackImg.onload = () => {
        canvas.width = fallbackImg.naturalWidth || 600;
        canvas.height = fallbackImg.naturalHeight || 600;
        ctx.drawImage(fallbackImg, 0, 0, canvas.width, canvas.height);
        setLoaded(true);
      };
      fallbackImg.onerror = () => setError(true);
      fallbackImg.src = imageUrl;
    };

    img.src = proxyUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;

    const sample = (clientX: number, clientY: number) => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const mouseX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const mouseY = Math.max(0, Math.min(clientY - rect.top, rect.height));

      const canvasX = Math.floor(mouseX * scaleX);
      const canvasY = Math.floor(mouseY * scaleY);

      setHoverPos({ x: mouseX, y: mouseY });

      try {
        const p = ctx.getImageData(canvasX, canvasY, 1, 1).data;
        const toHex = (c: number) => c.toString(16).padStart(2, "0");
        const hex = `#${toHex(p[0])}${toHex(p[1])}${toHex(p[2])}`;
        setHoverColor(hex);
        onSelectColor(hex);
      } catch {
        // ignore
      }
    };

    const handleTouch = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches && e.touches[0]) {
        sample(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener("touchstart", handleTouch, { passive: false });
    canvas.addEventListener("touchmove", handleTouch, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouch);
      canvas.removeEventListener("touchmove", handleTouch);
    };
  }, [loaded, onSelectColor]);

  const sampleColorAtPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const mouseY = Math.max(0, Math.min(clientY - rect.top, rect.height));

    const canvasX = Math.floor(mouseX * scaleX);
    const canvasY = Math.floor(mouseY * scaleY);

    setHoverPos({ x: mouseX, y: mouseY });

    try {
      const p = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const toHex = (c: number) => c.toString(16).padStart(2, "0");
      const hex = `#${toHex(p[0])}${toHex(p[1])}${toHex(p[2])}`;
      setHoverColor(hex);
      onSelectColor(hex);
    } catch {
      // ignore
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    sampleColorAtPoint(e.clientX, e.clientY);
  };

  return (
    <div className="mt-2.5 p-3 bg-gray-900 rounded-md space-y-2 text-white animate-in fade-in duration-150">
      <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full border border-gray-700 shrink-0"
            style={{ backgroundColor: hoverColor }}
          />
          <span className="text-xs font-mono font-bold text-white">{hoverColor}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            (Click/touch photo to pick {variantName || "color"})
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 rounded text-xs font-semibold bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors"
        >
          Done
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-h-[340px] overflow-hidden bg-black rounded flex items-center justify-center cursor-crosshair select-none touch-none border border-gray-800"
      >
        {!loaded && !error && (
          <div className="flex items-center justify-center text-white py-10 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span className="text-xs font-medium">Loading image...</span>
          </div>
        )}

        {error && (
          <div className="text-gray-400 text-xs text-center py-8">
            Failed to load image for eyedropper.
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={() => onClose()}
          className={`max-w-full max-h-[320px] object-contain rounded touch-none select-none ${
            loaded ? "block" : "hidden"
          }`}
        />

        {hoverPos && loaded && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-black/90 text-white px-2 py-0.5 rounded-full border border-gray-600 z-20 shadow-md"
            style={{ left: hoverPos.x, top: Math.max(24, hoverPos.y - 28) }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/40"
              style={{ backgroundColor: hoverColor }}
            />
            <span className="text-[10px] font-mono font-bold">{hoverColor}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);
  const [activeInlinePickerIndex, setActiveInlinePickerIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    discount_percent: 0,
    stock: 10,
    categoryId: "",
    is_trending: false,
    offer_badge_prefix: "",
    offer_badge_value: "",
    images: [] as string[],
    color_variants: [] as ProductColorVariant[],
    about: [] as { key: string; value: string }[],
  });

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await categoryService.getAll();
        setCategories(Array.isArray(catRes?.data) ? catRes.data : []);

        if (isEditing && id) {
          const prodRes = await productService.getById(id);
          const p = prodRes.data;
          const origPrice =
            p.original_price && p.original_price > p.price
              ? p.original_price
              : p.originalMRP && p.originalMRP > p.price
              ? p.originalMRP
              : 0;
          const discPercent =
            p.discount_percent ??
            p.discountPercent ??
            (origPrice > p.price ? Math.round(((origPrice - p.price) / origPrice) * 100) : 0);

          const rawImages = p.images && p.images.length > 0 ? p.images : [];
          const rawVariants = Array.isArray(p.color_variants) ? p.color_variants : [];
          const processedVariants = await autoProcessAndFilterColorVariants(rawVariants, rawImages);

          setFormData({
            name: p.name || "",
            description: p.description || "",
            price: p.price || 0,
            original_price: origPrice,
            discount_percent: discPercent,
            stock: p.stock ?? 10,
            categoryId: p.categoryId || "",
            is_trending: Boolean(p.is_trending),
            offer_badge_prefix: p.offer_badge_prefix || "",
            offer_badge_value: p.offer_badge_value || "",
            images: rawImages,
            color_variants: processedVariants,
            about: Array.isArray(p.about) ? p.about : [],
          });
        } else if (catRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: catRes.data[0].id }));
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing]);

  const extractDominantHexColor = async (fileOrUrl: File | string): Promise<string> => {
    if (!fileOrUrl) return "#5a6f87";

    const getCanvasData = async (src: string): Promise<{ data: Uint8ClampedArray; width: number; height: number } | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(null);
            canvas.width = 120;
            canvas.height = 120;
            ctx.drawImage(img, 0, 0, 120, 120);
            const data = ctx.getImageData(0, 0, 120, 120).data;
            resolve({ data, width: 120, height: 120 });
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    let result: { data: Uint8ClampedArray; width: number; height: number } | null = null;

    try {
      if (fileOrUrl instanceof File) {
        const dataUrl = await new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = (e) => res((e.target?.result as string) || "");
          r.onerror = () => res("");
          r.readAsDataURL(fileOrUrl);
        });
        if (dataUrl) result = await getCanvasData(dataUrl);
      } else {
        result = await getCanvasData(fileOrUrl);
        if (!result) {
          const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(fileOrUrl)}&w=120&h=120&output=jpg`;
          result = await getCanvasData(proxyUrl);
        }
      }
    } catch (e) {
      // fallback
    }

    if (result && result.data.length > 0) {
      const { data, width, height } = result;
      const buckets: Record<string, { rSum: number; gSum: number; bSum: number; count: number }> = {};

      const minX = Math.floor(width * 0.10);
      const maxX = Math.floor(width * 0.90);
      const minY = Math.floor(height * 0.22);
      const maxY = Math.floor(height * 0.90);

      for (let y = minY; y < maxY; y += 2) {
        for (let x = minX; x < maxX; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const chrom = max - min;

          if (r > 205 && g > 205 && b > 205 && chrom < 25) continue;
          if (r < 20 && g < 20 && b < 20) continue;

          const qr = Math.floor(r / 24) * 24 + 12;
          const qg = Math.floor(g / 24) * 24 + 12;
          const qb = Math.floor(b / 24) * 24 + 12;
          const key = `${qr},${qg},${qb}`;

          if (!buckets[key]) {
            buckets[key] = { rSum: 0, gSum: 0, bSum: 0, count: 0 };
          }

          const weight = chrom >= 18 ? 5 : 1;
          buckets[key].rSum += r * weight;
          buckets[key].gSum += g * weight;
          buckets[key].bSum += b * weight;
          buckets[key].count += weight;
        }
      }

      let maxWeight = 0;
      let bestKey = null;
      for (const k in buckets) {
        if (buckets[k].count > maxWeight) {
          maxWeight = buckets[k].count;
          bestKey = k;
        }
      }

      if (bestKey && buckets[bestKey].count > 0) {
        const b = buckets[bestKey];
        const avgR = Math.round(b.rSum / b.count);
        const avgG = Math.round(b.gSum / b.count);
        const avgB = Math.round(b.bSum / b.count);
        const toHex = (c: number) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, "0");
        return `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`;
      }
    }

    return "#5a6f87";
  };

  const autoProcessAndFilterColorVariants = async (
    currentVariants: ProductColorVariant[],
    step3Images: string[]
  ): Promise<ProductColorVariant[]> => {
    if (step3Images.length > 0 && currentVariants.length === 0) {
      const generated: ProductColorVariant[] = [];
      for (let i = 0; i < step3Images.length; i++) {
        const img = step3Images[i];
        const hex = await extractDominantHexColor(img);
        generated.push({
          name: `Color #${i + 1}`,
          color: hex,
          image: img,
          images: [img],
        });
      }
      return generated;
    }

    if (currentVariants.length === 0) return [];

    const updated = [...currentVariants];
    const usedImages = new Set<string>();

    updated.forEach((v) => {
      if (Array.isArray(v.images)) v.images.forEach((img) => usedImages.add(img));
      if (v.image) usedImages.add(v.image);
    });

    for (let i = 0; i < updated.length; i++) {
      const v = updated[i];
      const imgVal = (v.image || "").trim();
      const hasImages = (v.images && v.images.length > 0) || imgVal.length > 0;

      if (!hasImages && step3Images.length > 0) {
        const unassigned = step3Images.find((img) => !usedImages.has(img)) || step3Images[i % step3Images.length];
        if (unassigned) {
          usedImages.add(unassigned);
          const hex = await extractDominantHexColor(unassigned);
          updated[i] = {
            ...v,
            name: v.name || `Color #${i + 1}`,
            image: unassigned,
            images: [unassigned],
            color: hex,
          };
        }
      } else if (hasImages) {
        const imgs = v.images && v.images.length > 0 ? v.images : v.image ? [v.image] : [];
        const primary = imgs[0] || "";
        const hex = await extractDominantHexColor(primary);
        updated[i] = {
          ...v,
          name: v.name || `Color #${i + 1}`,
          image: primary,
          images: imgs,
          color: hex,
        };
      }
    }

    return updated.filter((v) => {
      const imgCount = (v.images ? v.images.length : 0) + ((v.image || "").trim().length > 0 ? 1 : 0);
      return imgCount > 0;
    });
  };

  const handlePriceChange = (newPrice: number) => {
    const orig = formData.original_price;
    let disc = formData.discount_percent;
    if (orig > 0 && orig > newPrice) {
      disc = Math.round(((orig - newPrice) / orig) * 100);
    }
    setFormData((prev) => ({
      ...prev,
      price: newPrice,
      discount_percent: disc,
    }));
  };

  const handleOriginalPriceChange = (newMRP: number) => {
    const price = formData.price;
    let disc = formData.discount_percent;
    if (newMRP > 0 && price > 0 && newMRP > price) {
      disc = Math.round(((newMRP - price) / newMRP) * 100);
    }
    setFormData((prev) => ({
      ...prev,
      original_price: newMRP,
      discount_percent: disc,
    }));
  };

  const handleDiscountPercentChange = (newDiscount: number) => {
    setFormData((prev) => ({
      ...prev,
      discount_percent: newDiscount,
    }));
  };

  const handleApplyDiscountToPrice = (discountToApply: number) => {
    const orig = formData.original_price;
    if (orig > 0 && discountToApply >= 0 && discountToApply < 100) {
      const calculatedPrice = Math.round(orig * (1 - discountToApply / 100));
      setFormData((prev) => ({
        ...prev,
        price: calculatedPrice,
        discount_percent: discountToApply,
      }));
    }
  };

  const handleAddAboutRow = (suggestedKey?: string) => {
    setFormData((prev) => ({
      ...prev,
      about: [...prev.about, { key: suggestedKey || "", value: "" }],
    }));
  };

  const handleAboutChange = (index: number, field: "key" | "value", val: string) => {
    setFormData((prev) => {
      const updated = [...prev.about];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, about: updated };
    });
  };

  const handleRemoveAboutRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      about: prev.about.filter((_, i) => i !== index),
    }));
  };

  const handleAddColorVariant = async (preset?: { name: string; color: string }) => {
    const nextIdx = formData.color_variants.length;
    const usedImages = new Set(
      formData.color_variants.flatMap((v) => v.images || (v.image ? [v.image] : []))
    );
    const unassignedImg = formData.images.find((img) => !usedImages.has(img)) || formData.images[nextIdx % formData.images.length] || "";

    let defaultColor = preset?.color || "#1e2238";
    if (unassignedImg && (!preset || preset.color === "#1e2238")) {
      defaultColor = await extractDominantHexColor(unassignedImg);
    }

    setFormData((prev) => ({
      ...prev,
      color_variants: [
        ...prev.color_variants,
        {
          name: preset?.name || `Color #${nextIdx + 1}`,
          color: defaultColor,
          image: unassignedImg,
          images: unassignedImg ? [unassignedImg] : [],
        },
      ],
    }));
  };

  const handleToggleStep3ImageForVariant = async (variantIdx: number, imageUrl: string) => {
    const variant = formData.color_variants[variantIdx];
    if (!variant) return;

    const currentImages = variant.images && variant.images.length > 0
      ? variant.images
      : variant.image
      ? [variant.image]
      : [];

    let newImages: string[];
    if (currentImages.includes(imageUrl)) {
      newImages = currentImages.filter((img) => img !== imageUrl);
    } else {
      newImages = [...currentImages, imageUrl];
    }

    const primaryImg = newImages.length > 0 ? newImages[0] : "";
    let extractedColor = variant.color || variant.hex || "#0ea9df";
    if (primaryImg && (!variant.color || variant.color === "#1e2238" || variant.color === "#0ea9df")) {
      extractedColor = await extractDominantHexColor(primaryImg);
    }

    setFormData((prev) => {
      const updated = [...prev.color_variants];
      updated[variantIdx] = {
        ...updated[variantIdx],
        image: primaryImg,
        images: newImages,
        color: extractedColor,
      };
      return { ...prev, color_variants: updated };
    });
  };

  const handleColorVariantChange = (
    index: number,
    field: "name" | "color" | "image",
    val: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.color_variants];
      const curr = updated[index];
      const newImages = field === "image"
        ? (curr.images && curr.images.length > 0 ? Array.from(new Set([val, ...curr.images])) : [val])
        : curr.images;
      updated[index] = { ...curr, [field]: val, images: newImages };
      return { ...prev, color_variants: updated };
    });
  };

  const handleRemoveColorVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      color_variants: prev.color_variants.filter((_, i) => i !== index),
    }));
  };

  const handleAutoExtractColorFromVariant = async (index: number) => {
    const variant = formData.color_variants[index];
    if (!variant || !variant.image) return;
    const extractedHex = await extractDominantHexColor(variant.image);
    handleColorVariantChange(index, "color", extractedHex);
  };

  const handleColorImageFileUpload = async (index: number, file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingVariantIndex(index);
    try {
      const autoExtractedColor = await extractDominantHexColor(file);

      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url || res.data.urls?.[0];
      if (url) {
        setFormData((prev) => {
          const updated = [...prev.color_variants];
          const curr = updated[index];
          updated[index] = {
            ...curr,
            image: url,
            images: curr.images && curr.images.length > 0 ? Array.from(new Set([url, ...curr.images])) : [url],
            color: (!curr.color || curr.color === "#1e2238" || curr.color === "#0ea9df") ? autoExtractedColor : curr.color,
          };
          return {
            ...prev,
            color_variants: updated,
            images: prev.images.includes(url) ? prev.images : [...prev.images, url],
          };
        });
      }
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      setError("Failed to upload image");
    } finally {
      setUploadingVariantIndex(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError("Valid selling price is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let processedVariants = formData.color_variants;
      if (formData.images.length > 0) {
        processedVariants = await autoProcessAndFilterColorVariants(formData.color_variants, formData.images);
      }

      const validColorVariants = processedVariants
        .filter((c) => ((c.image || "").trim().length > 0) || (c.images && c.images.length > 0))
        .filter((c) => ((c.name || "").trim().length > 0) || ((c.color || c.hex || "").trim().length > 0));

      const payload = {
        name: (formData.name || "").trim(),
        description: (formData.description || "").trim(),
        price: Number(formData.price || 0),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        discount_percent: formData.discount_percent ? Number(formData.discount_percent) : null,
        stock: Number(formData.stock || 0),
        categoryId: formData.categoryId || "",
        is_trending: Boolean(formData.is_trending),
        offer_badge_prefix: (formData.offer_badge_prefix || "").trim(),
        offer_badge_value: (formData.offer_badge_value || "").trim(),
        images:
          formData.images.length > 0
            ? formData.images
            : ["/logo-transparent.png"],
        color_variants: validColorVariants.map((c) => ({
          name: (c.name || "").trim() || "Variant",
          color: c.color || c.hex || "#1e2238",
          image: c.image || (c.images && c.images[0]) || "",
          images: c.images && c.images.length > 0 ? c.images : (c.image ? [c.image] : []),
        })),
        about: formData.about.filter((item) => (item.key || "").trim() || (item.value || "").trim()),
      };

      productService.clearCache();

      if (isEditing && id) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      productService.clearCache();
      navigate("/admin/products");
    } catch (err: any) {
      console.error("Save product changes failed:", err);
      setError(err.response?.data?.message || err.message || "Failed to save product changes");
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading product editor..." />;

  const effectiveMRP = formData.original_price > formData.price ? formData.original_price : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Product" : "Add Product"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Fill in product details, pricing, images, and color variants.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products"
            className="px-3.5 py-1.5 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="px-4 py-1.5 rounded-md bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isEditing ? (
              <span>Save Changes</span>
            ) : (
              <span>Publish</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Single Page Clean Human Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: General Details */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            General Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Orthopedic Memory Foam Mattress"
              className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black focus:ring-0 outline-none bg-white placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-900">
                  Category *
                </label>
                <Link
                  to="/admin/categories"
                  className="text-[11px] text-gray-500 hover:text-black hover:underline font-medium"
                >
                  + Add Category
                </Link>
              </div>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs bg-white text-gray-900 focus:border-black focus:ring-0 outline-none cursor-pointer"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black focus:ring-0 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description and highlights..."
              className="w-full p-3 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black focus:ring-0 outline-none leading-relaxed placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* SECTION 2: Pricing & Offers */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            Pricing &amp; Offers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Selling Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1.5 text-gray-400 font-medium text-xs">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.price || ""}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  placeholder="6500"
                  className="w-full pl-6 pr-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-900 focus:border-black focus:ring-0 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                M.R.P. (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1.5 text-gray-400 font-medium text-xs">₹</span>
                <input
                  type="number"
                  min={0}
                  value={formData.original_price || ""}
                  onChange={(e) => handleOriginalPriceChange(Number(e.target.value))}
                  placeholder="Optional"
                  className="w-full pl-6 pr-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-800 focus:border-black focus:ring-0 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={formData.discount_percent || ""}
                  onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                  placeholder="Auto or manual"
                  className="w-full pl-3 pr-6 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black focus:ring-0 outline-none"
                />
                <span className="absolute right-3 top-1.5 text-gray-400 font-medium text-xs">%</span>
              </div>
            </div>
          </div>

          {formData.original_price > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-gray-500 mr-1">Quick Discount:</span>
              {[10, 20, 30, 40, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleApplyDiscountToPrice(pct)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                    formData.discount_percent === pct
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          )}

          {/* Pricing Preview */}
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 flex items-baseline gap-2 text-xs">
            <span className="font-semibold text-gray-600">Price Preview:</span>
            <span className="font-bold text-gray-900 text-sm">
              ₹{(formData.price || 0).toLocaleString("en-IN")}
            </span>
            {effectiveMRP > formData.price && (
              <span className="text-gray-400 line-through text-[11px]">
                MRP: ₹{effectiveMRP.toLocaleString("en-IN")}
              </span>
            )}
            {effectiveMRP > formData.price && formData.discount_percent > 0 && (
              <span className="text-gray-700 font-medium">
                ({formData.discount_percent}% off)
              </span>
            )}
          </div>

          {/* Feature Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 rounded-md border border-gray-200 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.is_trending}
                onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                className="w-4 h-4 text-black rounded focus:ring-0 cursor-pointer accent-black"
              />
              <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-gray-700" />
                Feature on Home Page Slider
              </span>
            </label>

            <div className="p-3 rounded-md border border-gray-200 bg-white space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.offer_badge_value && formData.offer_badge_value.trim())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, offer_badge_value: "Best Value" });
                      } else {
                        setFormData({ ...formData, offer_badge_value: "" });
                      }
                    }}
                    className="w-4 h-4 text-black rounded focus:ring-0 cursor-pointer accent-black"
                  />
                  <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-700" />
                    Apply Offer Badge Tag
                  </span>
                </div>
                {Boolean(formData.offer_badge_value && formData.offer_badge_value.trim()) && (
                  <OfferBadge value={formData.offer_badge_value} size="sm" />
                )}
              </label>

              {Boolean(formData.offer_badge_value && formData.offer_badge_value.trim()) && (
                <div className="pt-2 border-t border-gray-100">
                  <input
                    type="text"
                    placeholder="Badge text (e.g. Best Value, Save ₹500)"
                    value={formData.offer_badge_value}
                    onChange={(e) => setFormData({ ...formData, offer_badge_value: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black outline-none font-medium"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Product Photos */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            Product Images
          </h2>
          <R2ImageUploader
            images={formData.images}
            onChange={(imgs) => setFormData({ ...formData, images: imgs })}
            maxImages={8}
          />
        </div>

        {/* SECTION 4: Color Variants */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2 gap-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Color Variants</h2>
              <p className="text-xs text-gray-500">
                Link photos and custom colors for product options.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAddColorVariant()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Color</span>
            </button>
          </div>

          {/* Color Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                onClick={() => handleAddColorVariant(preset)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-800 transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                  style={{ backgroundColor: preset.color }}
                />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Color Variants List */}
          {formData.color_variants.length > 0 && (
            <div className="p-2.5 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">
                {formData.color_variants.length} variant{formData.color_variants.length > 1 ? "s" : ""}:
              </span>
              <ColorSwatches variants={formData.color_variants} size="sm" showLabel={true} />
            </div>
          )}

          {formData.color_variants.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No color variants added (optional).</p>
          ) : (
            <div className="space-y-4">
              {formData.color_variants.map((variant, idx) => {
                const variantImages = variant.images && variant.images.length > 0
                  ? variant.images
                  : variant.image
                  ? [variant.image]
                  : [];

                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-white border border-gray-200 rounded-md shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs">
                      <span className="font-semibold text-gray-900">Color #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColorVariant(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                        title="Delete variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      {/* Left Side: Images */}
                      <div className="shrink-0 flex items-center justify-center">
                        {variantImages.length > 0 ? (
                          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[160px] py-0.5">
                            {variantImages.slice(0, 3).map((img, imgI) => (
                              <button
                                key={imgI}
                                type="button"
                                onClick={() =>
                                  setActiveInlinePickerIndex(
                                    activeInlinePickerIndex === idx ? null : idx
                                  )
                                }
                                className="relative group shrink-0 cursor-pointer text-left"
                                title="Click to pick color directly from image"
                              >
                                <img
                                  src={img}
                                  alt={variant.name || `Color #${idx + 1}`}
                                  className="w-12 h-12 rounded object-cover border border-gray-300 shrink-0"
                                />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Right Side: Inputs */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                        <div className="sm:col-span-4 flex items-center gap-2">
                          <label
                            className="w-7 h-7 rounded-full border border-gray-300 cursor-pointer shrink-0 overflow-hidden flex items-center justify-center shadow-2xs"
                            style={{ backgroundColor: variant.color || variant.hex || "#1e2238" }}
                            title="Pick Color"
                          >
                            <input
                              type="color"
                              value={(variant.color || variant.hex || "").startsWith("#") ? (variant.color || variant.hex) : "#1e2238"}
                              onChange={(e) => handleColorVariantChange(idx, "color", e.target.value)}
                              className="opacity-0 w-full h-full cursor-pointer"
                            />
                          </label>
                          <input
                            type="text"
                            value={variant.color || variant.hex || ""}
                            onChange={(e) => handleColorVariantChange(idx, "color", e.target.value)}
                            placeholder="#1e2238"
                            className="w-full px-2.5 py-1 border border-gray-200 rounded-md text-xs font-mono font-semibold bg-white text-gray-900 focus:border-black outline-none"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => handleColorVariantChange(idx, "name", e.target.value)}
                            placeholder="Variant Name"
                            className="w-full px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium bg-white text-gray-900 focus:border-black outline-none"
                          />
                        </div>

                        <div className="sm:col-span-4 flex items-center gap-1.5 justify-end">
                          {variantImages.length > 0 && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAutoExtractColorFromVariant(idx)}
                                className="p-1.5 rounded text-gray-600 hover:text-black hover:bg-gray-100 cursor-pointer transition-colors"
                                title="Auto Extract Color"
                              >
                                <Pipette className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setActiveInlinePickerIndex(
                                    activeInlinePickerIndex === idx ? null : idx
                                  )
                                }
                                className={`p-1.5 rounded cursor-pointer transition-colors ${
                                  activeInlinePickerIndex === idx
                                    ? "bg-black text-white"
                                    : "text-gray-600 hover:text-black hover:bg-gray-100"
                                }`}
                                title="Eyedropper Color Picker"
                              >
                                <Pipette className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <label
                            className="p-1.5 rounded text-gray-600 hover:text-black hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-center"
                            title="Upload Variant Photo"
                          >
                            {uploadingVariantIndex === idx ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleColorImageFileUpload(idx, f);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {activeInlinePickerIndex === idx && variantImages.length > 0 && (
                      <InlineImageEyedropper
                        imageUrl={variantImages[0]}
                        variantName={variant.name}
                        currentColor={variant.color || variant.hex || "#1e2238"}
                        onSelectColor={(hex) => handleColorVariantChange(idx, "color", hex)}
                        onClose={() => setActiveInlinePickerIndex(null)}
                      />
                    )}

                    {/* Step 3 Photo Link Selector */}
                    {formData.images.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 space-y-1 bg-gray-50/60 p-2 rounded-md">
                        <span className="text-[11px] font-semibold text-gray-700 block">
                          Link Photos from Product Images ({variantImages.length} linked):
                        </span>
                        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                          {formData.images.map((imgUrl, imgIdx) => {
                            const isSelected = variantImages.includes(imgUrl);
                            return (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => handleToggleStep3ImageForVariant(idx, imgUrl)}
                                className={`relative aspect-square rounded overflow-hidden border transition-all p-0.5 cursor-pointer ${
                                  isSelected
                                    ? "border-black ring-1 ring-black bg-white"
                                    : "border-gray-200 opacity-60 hover:opacity-100 bg-white"
                                }`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover rounded" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 5: Specifications */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-sm font-bold text-gray-900">Specifications &amp; Features</h2>
            <button
              type="button"
              onClick={() => handleAddAboutRow()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Spec</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {["Firmness", "Dimensions", "Material", "Warranty"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddAboutRow(tag)}
                className="px-2 py-0.5 rounded text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer font-medium border border-gray-200 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>

          {formData.about.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center">No specifications added (optional).</p>
          ) : (
            <div className="space-y-2">
              {formData.about.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Key (e.g. Firmness)"
                    value={row.key}
                    onChange={(e) => handleAboutChange(idx, "key", e.target.value)}
                    className="w-1/3 px-2.5 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-900 focus:border-black outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. Medium Firm)"
                    value={row.value}
                    onChange={(e) => handleAboutChange(idx, "value", e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAboutRow(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <Link
            to="/admin/products"
            className="px-4 py-2 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-md bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isEditing ? (
              <span>Save Changes</span>
            ) : (
              <span>Publish Product</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
