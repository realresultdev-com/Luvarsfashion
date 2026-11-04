import { useState, useEffect, useId } from "react";
import {
  Star,
  CheckCircle2,
  Camera,
  X,
  Upload,
  Lock,
  ThumbsUp,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Review, Product } from "../../types/product.types";
import { productService } from "../../services/product.service";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import RatingBadge from "../common/RatingBadge";
import { Link } from "react-router-dom";

interface ProductReviewsSectionProps {
  product: Product;
  onReviewAdded?: (updatedReview: Review) => void;
}

export default function ProductReviewsSection({
  product,
  onReviewAdded,
}: ProductReviewsSectionProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const fileInputId = useId();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Collapsible section state (Hidden by default)
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#reviews") {
      setIsExpanded(true);
    }
  }, []);

  // Review Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Photo viewer modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter by star
  const [selectedFilter, setSelectedFilter] = useState<number | "all">("all");

  useEffect(() => {
    let isMounted = true;
    const loadReviews = async () => {
      try {
        setLoading(true);
        const res = await productService.getReviews(product.id);
        if (isMounted) {
          setReviews(res.data);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [product.id]);

  // Check buyer eligibility
  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setCanReview(false);
      setAlreadyReviewed(false);
      setIsPurchased(false);
      return;
    }

    const checkEligibility = async () => {
      try {
        setCheckingEligibility(true);
        const res = await productService.canReview(product.id);
        if (isMounted) {
          setCanReview(Boolean(res.data.canReview));
          setAlreadyReviewed(Boolean(res.data.alreadyReviewed));
          setIsPurchased(Boolean(res.data.isPurchased));
        }
      } catch (err) {
        console.error("Failed to check review eligibility:", err);
      } finally {
        if (isMounted) setCheckingEligibility(false);
      }
    };

    checkEligibility();
    return () => {
      isMounted = false;
    };
  }, [user, product.id]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      setErrorMsg("");

      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.urls && Array.isArray(res.data.urls)) {
        setImages((prev) => [...prev, ...res.data.urls]);
      } else if (res.data?.url) {
        setImages((prev) => [...prev, res.data.url]);
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.error || "Failed to upload photo. Please try again."
      );
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg("Please write your review feedback.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      const res = await productService.submitReview(product.id, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
      });

      const newReview: Review = res.data.review;
      setReviews((prev) => [newReview, ...prev]);
      setAlreadyReviewed(true);
      setShowForm(false);
      setSuccessMsg("Thank you! Your verified review has been published.");
      if (onReviewAdded) onReviewAdded(newReview);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.error || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate rating stats
  const totalReviews = reviews.length;
  const avgScore =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : null;

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  // All user photos from reviews
  const allCustomerPhotos = reviews.flatMap((r) => r.images || []).filter(Boolean);

  // Filtered reviews list
  const filteredReviews =
    selectedFilter === "all"
      ? reviews
      : reviews.filter((r) => r.rating === selectedFilter);

  const starLabels: Record<number, string> = {
    1: "1 - Poor",
    2: "2 - Fair",
    3: "3 - Good",
    4: "4 - Very Good",
    5: "5 - Excellent",
  };

  return (
    <div id="reviews" className="pt-6 border-t border-gray-200 space-y-4">
      {/* 1. Collapsible Header Bar with Down Arrow Button */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between gap-4 cursor-pointer group select-none py-1"
      >
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#191142] flex items-center gap-2.5 group-hover:text-[#0ea9df] transition-colors">
            <span>Customer Ratings & Reviews</span>
            {Boolean(totalReviews > 0 && avgScore) && (
              <RatingBadge
                rating={avgScore}
                reviewCount={totalReviews}
                size="md"
              />
            )}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified authentic feedback from confirmed buyers.
          </p>
        </div>

        {/* View Reviews / Down Arrow Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 group-hover:bg-[#0ea9df] group-hover:text-white text-[#191142] text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          <span>{isExpanded ? "Hide Reviews" : "View Reviews"}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Expanded Review Section Contents */}
      {isExpanded && (
        <div className="space-y-8 pt-2 animate-in fade-in duration-200">
          {/* Action Button: Write a Review Row */}
          <div className="flex justify-end">
            {user ? (
              alreadyReviewed ? (
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>You reviewed this product</span>
                </div>
              ) : canReview ? (
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center gap-2 bg-[#0ea9df] hover:bg-[#0c93c4] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{showForm ? "Close Review Form" : "Write a Customer Review"}</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium px-3.5 py-2 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Verified buyers only</span>
                </div>
              )
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#191142] text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-gray-500" />
                <span>Sign in to review</span>
              </Link>
            )}
          </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-emerald-600 hover:text-emerald-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}


      {/* 2. Interactive Review Submission Form / Modal */}
      {showForm && (
        <div className="bg-slate-50 border border-cyan-200 p-5 sm:p-7 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-base font-black text-[#191142] flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Create Verified Customer Review
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Share your authentic sleeping experience, spine support, and comfort level.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Overall Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                      >
                        <span
                          className={`font-black ${
                            active ? "text-[#038e42]" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-gray-700 ml-2">
                  {starLabels[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Headline / Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Headline / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the most important thing to know?"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#0ea9df] focus:ring-1 focus:ring-[#0ea9df]"
              />
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Written Review <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How does it feel? How is the back support and fabric quality? What did you like or dislike?"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#0ea9df] focus:ring-1 focus:ring-[#0ea9df]"
                required
              />
            </div>

            {/* Photo Upload Section */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Add Photos of your Mattress or Bedding (Optional)
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                Shoppers love seeing real photos of the product in your home bedroom!
              </p>

              {/* Upload Drop Zone & Preview */}
              <div className="flex flex-wrap items-center gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-xl border border-gray-200 overflow-hidden bg-white group shadow-2xs"
                  >
                    <img
                      src={img}
                      alt={`Review photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                <label
                  htmlFor={fileInputId}
                  className={`w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0ea9df] bg-white flex flex-col items-center justify-center text-gray-500 hover:text-[#0ea9df] cursor-pointer transition-colors ${
                    uploadingImage ? "opacity-50 cursor-wait" : ""
                  }`}
                >
                  <input
                    id={fileInputId}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <span className="text-[10px] font-bold text-center animate-pulse">
                      Uploading...
                    </span>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">+ Photo</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#0ea9df] hover:bg-[#0c93c4] rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Rating Summary & Star Breakdown (Boxless) */}
      {Boolean(totalReviews > 0 && avgScore) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2">
          {/* Left: Score & Stars */}
          <div className="md:col-span-4 space-y-1 flex flex-col justify-center">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-[#191142] tracking-tight">
                {avgScore != null ? avgScore.toFixed(1) : ""}
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center text-[#0ea9df] text-base sm:text-lg font-black">
                  {"★".repeat(Math.round(avgScore || 5))}
                  {"☆".repeat(5 - Math.round(avgScore || 5))}
                </div>
                <span className="text-xs text-gray-500 font-medium block">
                  {totalReviews} {totalReviews === 1 ? "verified rating" : "verified ratings"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Star Breakdown Progress Bars */}
          <div className="md:col-span-8 space-y-2 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
            <span className="text-xs font-bold text-[#191142] block mb-2">
              Rating Distribution
            </span>
            {starCounts.map(({ star, count, percentage }) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === star ? "all" : star)}
                className={`w-full flex items-center gap-3 text-xs py-1 px-2 rounded-lg transition-colors cursor-pointer text-left ${
                  selectedFilter === star
                    ? "bg-cyan-50 font-bold"
                    : "hover:bg-white"
                }`}
              >
                <span className="w-12 shrink-0 text-gray-700 font-medium">
                  {star} star
                </span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-gray-500 font-semibold shrink-0">
                  {percentage}%
                </span>
                <span className="w-8 text-right text-gray-400 text-[11px] shrink-0">
                  ({count})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Customer Photos Gallery Strip */}
      {allCustomerPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#191142] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#0ea9df]" />
              <span>Customer Photos ({allCustomerPhotos.length})</span>
            </h3>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {allCustomerPhotos.map((photoUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(photoUrl)}
                className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-white hover:opacity-90 hover:scale-102 transition-all cursor-pointer shadow-2xs"
              >
                <img
                  src={photoUrl}
                  alt={`Customer mattress photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Reviews Feed with Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#191142]">
              Top Customer Reviews
            </h3>
            {selectedFilter !== "all" && (
              <button
                onClick={() => setSelectedFilter("all")}
                className="text-[11px] font-bold text-[#0ea9df] hover:underline"
              >
                Clear filter ({selectedFilter} star)
              </button>
            )}
          </div>
          <span className="text-xs text-gray-500">
            Showing {filteredReviews.length} of {totalReviews} reviews
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Loading verified reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-xs font-bold text-gray-700">No reviews found.</p>
            <p className="text-[11px] text-gray-500">
              Be the first verified customer to leave a review for this product!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-gray-200/80 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-3"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {rev.userAvatar ? (
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#191142] text-white font-bold text-xs flex items-center justify-center">
                        {rev.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-gray-900 block leading-tight">
                        {rev.userName}
                      </span>

                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Star Badge & Headline */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <RatingBadge rating={rev.rating} size="xs" showCount={false} />
                  {rev.title && (
                    <h4 className="text-xs sm:text-sm font-bold text-[#191142]">
                      {rev.title}
                    </h4>
                  )}
                </div>

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {rev.comment}
                </p>

                {/* Review Images */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {rev.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:opacity-90 hover:scale-102 transition-all cursor-pointer"
                      >
                        <img
                          src={img}
                          alt="Customer review visual"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      )}

      {/* Photo Zoom Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center z-10 transition-colors"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Customer photo high resolution"
              className="max-h-[80vh] w-auto mx-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
