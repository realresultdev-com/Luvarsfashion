import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  X,
  ArrowUp,
  ArrowDown,
  Loader2,
  ExternalLink,
  Link2,
} from "lucide-react";
import { heroVideoService, type HeroVideo } from "../../services/heroVideo.service";
import { api } from "../../services/api";
import { transcodeVideoInBrowser, transcodeAllQualitiesInBrowser } from "../../utils/videoTranscoder";

export default function HeroVideoManage() {
  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Manual Transcode State
  const [manualTranscodingId, setManualTranscodingId] = useState<string | null>(null);
  const [manualProgress, setManualProgress] = useState<number>(0);
  const [manualStatusText, setManualStatusText] = useState<string>("");

  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // Transcoding Options State
  const [shouldTranscode, setShouldTranscode] = useState(true);
  const [transcodeProgress, setTranscodeProgress] = useState<number>(0);
  const [transcodingStatus, setTranscodingStatus] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    video_url: "",
    video_url_720p: "",
    video_url_360p: "",
    poster_url: "",
    link_url: "/shop",
    display_order: 1,
    is_active: 1,
  });

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const posterFileInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await heroVideoService.getAllAdmin();
      setVideos(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to load hero videos:", err);
      setError(err.response?.data?.message || "Failed to load hero video banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleResetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      video_url: "",
      video_url_720p: "",
      video_url_360p: "",
      poster_url: "",
      link_url: "/shop",
      display_order: (videos.length || 0) + 1,
      is_active: 1,
    });
    setIsEditing(null);
    setShowForm(false);
    setError(null);
    setTranscodeProgress(0);
    setTranscodingStatus("");
  };

  const isImageMedia = (url?: string) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url);
  };

  const handleVideoFileUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/") || isImageMedia(file.name);
    const isVideo = file.type.startsWith("video/") || file.name.match(/\.(mp4|webm|mov|m4v|avi)$/i);

    if (!isImage && !isVideo) {
      setError("Please upload a valid video (MP4, WEBM, MOV) or image file (JPG, PNG, WEBP).");
      return;
    }

    setUploadingVideo(true);
    setError(null);
    setTranscodeProgress(0);

    try {
      if (isImage) {
        setTranscodingStatus("Uploading image banner to Cloudflare R2...");
        const data = new FormData();
        data.append("file", file);

        const res = await api.post("/upload", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const imageUrl = res.data.url || (res.data.urls && res.data.urls[0]);
        if (imageUrl) {
          setFormData((prev) => ({
            ...prev,
            video_url: imageUrl,
            video_url_720p: imageUrl,
            video_url_360p: imageUrl,
          }));
          setSuccessMsg("Image uploaded successfully to R2 Storage!");
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      } else if (shouldTranscode) {
        // Multi-quality WASM Transcoding (1080p, 720p, 360p)
        setTranscodingStatus("Starting WebAssembly Multi-Quality Transcoding...");
        const { file1080p, file720p, file360p } = await transcodeAllQualitiesInBrowser(file, (status, pct) => {
          setTranscodingStatus(status);
          setTranscodeProgress(pct);
        });

        setTranscodingStatus("Uploading 1080p, 720p, and 360p video files to Cloudflare R2...");

        // Upload all 3 transcoded qualities to R2
        const formData1080 = new FormData();
        formData1080.append("file", file1080p);

        const formData720 = new FormData();
        formData720.append("file", file720p);

        const formData360 = new FormData();
        formData360.append("file", file360p);

        const [res1080, res720, res360] = await Promise.all([
          api.post("/upload", formData1080, { headers: { "Content-Type": "multipart/form-data" } }),
          api.post("/upload", formData720, { headers: { "Content-Type": "multipart/form-data" } }),
          api.post("/upload", formData360, { headers: { "Content-Type": "multipart/form-data" } }),
        ]);

        const url1080 = res1080.data.url || res1080.data.urls?.[0];
        const url720 = res720.data.url || res720.data.urls?.[0];
        const url360 = res360.data.url || res360.data.urls?.[0];

        setFormData((prev) => ({
          ...prev,
          video_url: url1080,
          video_url_720p: url720,
          video_url_360p: url360,
        }));

        setSuccessMsg("Multi-quality videos (1080p, 720p, 360p) uploaded successfully to R2!");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        // Upload Raw Original Video directly without transcoding
        setTranscodingStatus("Uploading raw video file directly to Cloudflare R2...");
        const data = new FormData();
        data.append("file", file);

        const res = await api.post("/upload", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const videoUrl = res.data.url || (res.data.urls && res.data.urls[0]);
        if (videoUrl) {
          setFormData((prev) => ({
            ...prev,
            video_url: videoUrl,
            video_url_720p: videoUrl,
            video_url_360p: videoUrl,
          }));
          setSuccessMsg("Raw video uploaded successfully to R2 Storage!");
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to process and upload media.");
    } finally {
      setUploadingVideo(false);
      setTranscodeProgress(0);
      setTranscodingStatus("");
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

  const handlePosterFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setUploadingPoster(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await api.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const posterUrl = res.data.url || (res.data.urls && res.data.urls[0]);
      if (posterUrl) {
        setFormData((prev) => ({ ...prev, poster_url: posterUrl }));
        setSuccessMsg("Thumbnail poster uploaded successfully!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload poster image.");
    } finally {
      setUploadingPoster(false);
      if (posterFileInputRef.current) posterFileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.video_url.trim()) {
      setError("Video URL is required.");
      return;
    }

    setError(null);
    try {
      if (isEditing) {
        await heroVideoService.update(isEditing, formData);
        setSuccessMsg("Hero video banner updated!");
      } else {
        await heroVideoService.create(formData);
        setSuccessMsg("Hero video banner created!");
      }
      handleResetForm();
      fetchVideos();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save hero video.");
    }
  };

  const handleEditClick = (v: HeroVideo) => {
    setIsEditing(v.id);
    setFormData({
      title: v.title,
      subtitle: v.subtitle || "",
      video_url: v.video_url,
      video_url_720p: v.video_url_720p || "",
      video_url_360p: v.video_url_360p || "",
      poster_url: v.poster_url || "",
      link_url: v.link_url || "/shop",
      display_order: v.display_order,
      is_active: Number(v.is_active) === 1 ? 1 : 0,
    });
    setShowForm(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this hero video banner?")) return;
    try {
      await heroVideoService.delete(id);
      setSuccessMsg("Hero video deleted!");
      fetchVideos();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete hero video.");
    }
  };

  const handleToggleActive = async (v: HeroVideo) => {
    const nextState = Number(v.is_active) === 1 ? 0 : 1;
    try {
      await heroVideoService.update(v.id, { is_active: nextState });
      fetchVideos();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handlePriorityChange = async (v: HeroVideo, newOrder: number) => {
    if (newOrder < 1) return;
    try {
      await heroVideoService.update(v.id, { display_order: newOrder });
      fetchVideos();
    } catch (err) {
      console.error("Failed to change priority:", err);
    }
  };

  const handleManualTranscode = async (v: HeroVideo) => {
    if (!v.video_url) {
      setError("No video URL found for transcoding.");
      return;
    }

    setManualTranscodingId(v.id);
    setManualProgress(0);
    setManualStatusText("Downloading raw video for WebAssembly transcoding...");
    setError(null);

    try {
      // 1. Fetch raw video file
      const response = await fetch(v.video_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch raw video (${response.statusText}).`);
      }
      const blob = await response.blob();
      const ext = v.video_url.split('.').pop()?.split('?')[0] || 'mp4';
      const file = new File([blob], `hero_video_${v.id}.${ext}`, { type: blob.type || "video/mp4" });

      // 2. Transcode into 1080p, 720p, 360p
      setManualStatusText("Starting WebAssembly Multi-Quality Transcoding...");
      const { file1080p, file720p, file360p } = await transcodeAllQualitiesInBrowser(file, (status, pct) => {
        setManualStatusText(status);
        setManualProgress(pct);
      });

      // 3. Upload all 3 files to R2
      setManualStatusText("Uploading 1080p, 720p, and 360p files to Cloudflare R2...");

      const formData1080 = new FormData();
      formData1080.append("file", file1080p);

      const formData720 = new FormData();
      formData720.append("file", file720p);

      const formData360 = new FormData();
      formData360.append("file", file360p);

      const [res1080, res720, res360] = await Promise.all([
        api.post("/upload", formData1080, { headers: { "Content-Type": "multipart/form-data" } }),
        api.post("/upload", formData720, { headers: { "Content-Type": "multipart/form-data" } }),
        api.post("/upload", formData360, { headers: { "Content-Type": "multipart/form-data" } }),
      ]);

      const url1080 = res1080.data.url || res1080.data.urls?.[0];
      const url720 = res720.data.url || res720.data.urls?.[0];
      const url360 = res360.data.url || res360.data.urls?.[0];

      // 4. Save to Database
      await heroVideoService.update(v.id, {
        video_url: url1080,
        video_url_720p: url720,
        video_url_360p: url360,
      });

      setSuccessMsg(`Video "${v.title}" transcoded & updated successfully (1080p, 720p, 360p)!`);
      fetchVideos();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Manual transcode failed:", err);
      setError(err.message || err.response?.data?.error || "Failed to transcode video manually.");
    } finally {
      setManualTranscodingId(null);
      setManualProgress(0);
      setManualStatusText("");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Hero Banners
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage videos and images displayed in the homepage hero reel.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        )}
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create / Edit Form Card */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-base font-semibold text-gray-900">
              {isEditing ? "Edit Hero Banner" : "Create Hero Banner"}
            </h2>
            <button
              type="button"
              onClick={handleResetForm}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Banner Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Short description or tagline"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black"
                />
              </div>

              {/* Media File Input */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Media Source (Video or Image)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    required
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="Enter file URL or upload below"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black bg-white"
                  />
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/*,image/*,.mp4,.webm,.mov,.avi,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleVideoFileUpload(e.target.files[0])}
                  />
                  <button
                    type="button"
                    disabled={uploadingVideo}
                    onClick={() => videoFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 text-sm font-medium flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {uploadingVideo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Upload File</span>
                  </button>
                </div>

                {/* Transcode Option */}
                <div className="flex items-center gap-2 pt-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    id="transcodeCheck"
                    checked={shouldTranscode}
                    onChange={(e) => setShouldTranscode(e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  />
                  <label htmlFor="transcodeCheck" className="cursor-pointer text-xs text-gray-600">
                    Transcode uploaded videos into 1080p, 720p &amp; 360p for adaptive streaming
                  </label>
                </div>

                {uploadingVideo && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{transcodingStatus || "Uploading media..."}</span>
                      {transcodeProgress > 0 && <span>{transcodeProgress}%</span>}
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-black h-full transition-all duration-200"
                        style={{ width: `${Math.max(5, transcodeProgress)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Poster Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poster Thumbnail <span className="text-gray-400 font-normal">(Optional for videos)</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={formData.poster_url}
                    onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black"
                  />
                  <input
                    ref={posterFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePosterFileUpload(e.target.files[0])}
                  />
                  <button
                    type="button"
                    disabled={uploadingPoster}
                    onClick={() => posterFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {uploadingPoster ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Poster</span>
                  </button>
                </div>
              </div>

              {/* CTA Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Redirect Link
                </label>
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/shop"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black bg-white cursor-pointer"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Hidden</option>
                </select>
              </div>
            </div>

            {/* Media Preview */}
            {formData.video_url && (
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="w-48 h-28 rounded-md overflow-hidden border border-gray-300 bg-gray-900 relative">
                  {isImageMedia(formData.video_url) ? (
                    <img
                      src={formData.video_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={formData.video_url}
                      poster={formData.poster_url}
                      controls
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {isEditing ? "Save Changes" : "Save Banner"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Banners Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
            All Banners ({videos.length})
          </h2>
          <span className="text-xs text-gray-500">
            Sorted by order number
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400 mb-2" />
            Loading banners...
          </div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-xs font-medium text-gray-700">No hero banners added yet</p>
            <p className="text-xs text-gray-500">
              Click &quot;Add Banner&quot; to upload your first image or video banner.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {videos.map((v) => {
              const isImage = isImageMedia(v.video_url);
              const isTranscoded = Boolean(
                v.video_url_720p &&
                v.video_url_360p &&
                v.video_url_720p !== v.video_url &&
                v.video_url_360p !== v.video_url
              );

              return (
                <div
                  key={v.id}
                  className="p-4 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Left Section: Order + Media Preview + Title Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Order Controls */}
                    <div className="flex items-center gap-1 shrink-0 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md text-xs font-semibold text-gray-700">
                      <span>#{v.display_order}</span>
                      <div className="flex flex-col ml-1">
                        <button
                          type="button"
                          onClick={() => handlePriorityChange(v, v.display_order - 1)}
                          className="text-gray-400 hover:text-black cursor-pointer leading-none"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePriorityChange(v, v.display_order + 1)}
                          className="text-gray-400 hover:text-black cursor-pointer leading-none"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Media Thumbnail */}
                    <div className="w-24 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-900 shrink-0 relative group">
                      {isImage ? (
                        <img
                          src={v.video_url}
                          alt={v.title || "Banner"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={v.video_url}
                          poster={v.poster_url}
                          muted
                          loop
                          className="w-full h-full object-cover"
                        />
                      )}
                      <a
                        href={v.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        title="Open media URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {v.title || <span className="text-gray-400 italic">Untitled Banner</span>}
                        </h3>

                        {/* Media Type Tag */}
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {isImage ? "Image" : "Video"}
                        </span>
                      </div>

                      {v.subtitle && (
                        <p className="text-xs text-gray-500 truncate">
                          {v.subtitle}
                        </p>
                      )}

                      {v.link_url && (
                        <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1 truncate">
                          <Link2 className="w-3 h-3" /> {v.link_url}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Status Indicator & Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {/* Clean Status Dot */}
                    {Number(v.is_active) === 1 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Hidden
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {!isImage && (
                        <button
                          type="button"
                          disabled={manualTranscodingId === v.id}
                          onClick={() => handleManualTranscode(v)}
                          className="px-2.5 py-1 rounded text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                          title={isTranscoded ? "Re-transcode video" : "Transcode raw video into 1080p, 720p, 360p"}
                        >
                          {manualTranscodingId === v.id ? (
                            <span className="flex items-center gap-1 text-amber-700">
                              <Loader2 className="w-3 h-3 animate-spin" /> {manualProgress}%
                            </span>
                          ) : isTranscoded ? (
                            "Re-transcode"
                          ) : (
                            "Transcode"
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleActive(v)}
                        className="px-2.5 py-1 rounded text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {Number(v.is_active) === 1 ? "Hide" : "Show"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditClick(v)}
                        className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(v.id)}
                        className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
