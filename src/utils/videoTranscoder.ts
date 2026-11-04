import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

export async function getFFmpegInstance(onProgress?: (ratio: number) => void): Promise<FFmpeg> {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
  }

  if (onProgress) {
    ffmpegInstance.on("progress", ({ progress }) => {
      onProgress(Math.min(1, Math.max(0, progress)));
    });
  }

  if (!ffmpegInstance.loaded) {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
  }

  return ffmpegInstance;
}

export interface TranscodeOptions {
  resolution?: "360p" | "720p" | "1080p" | "original";
  bitrate?: string;
  onProgress?: (progressPercent: number) => void;
}

/**
 * Transcodes a raw video file in browser via WebAssembly (FFmpeg WASM).
 * Converts MOV/AVI/MP4 to web-optimized H.264 MP4 with progressive faststart streaming flags.
 */
export async function transcodeVideoInBrowser(
  inputFile: File,
  options: TranscodeOptions = {}
): Promise<File> {
  const { resolution = "720p", onProgress } = options;

  try {
    const ffmpeg = await getFFmpegInstance((ratio) => {
      if (onProgress) {
        onProgress(Math.round(ratio * 100));
      }
    });

    const ext = inputFile.name.split(".").pop()?.toLowerCase() || "mp4";
    const inputName = `input_${Date.now()}.${ext}`;
    const outputName = `transcoded_${resolution}_${Date.now()}.mp4`;

    // Load file into FFmpeg virtual MEMFS
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

    // Scale options
    let scaleFilter = "";
    if (resolution === "360p") {
      scaleFilter = "scale='min(360,iw)':-2";
    } else if (resolution === "720p") {
      scaleFilter = "scale='min(720,iw)':-2";
    } else if (resolution === "1080p") {
      scaleFilter = "scale='min(1080,iw)':-2";
    }

    // Build FFmpeg CLI arguments for fast progressive web streaming (faststart flag)
    const ffmpegArgs = [
      "-i", inputName,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", resolution === "360p" ? "32" : resolution === "720p" ? "28" : "24",
      "-c:a", "aac",
      "-b:a", resolution === "360p" ? "64k" : "128k",
      "-movflags", "+faststart",
    ];

    if (scaleFilter) {
      ffmpegArgs.push("-vf", scaleFilter);
    }

    ffmpegArgs.push(outputName);

    // Execute FFmpeg WASM command
    await ffmpeg.exec(ffmpegArgs);

    // Read result blob
    const data = await ffmpeg.readFile(outputName);
    const transcodedBlob = new Blob([data as any], { type: "video/mp4" });

    // Clean virtual MEMFS
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    // Return new File object
    const cleanName = inputFile.name.replace(/\.[^/.]+$/, "") + `_${resolution}.mp4`;
    return new File([transcodedBlob], cleanName, { type: "video/mp4" });
  } catch (err) {
    console.warn("WebAssembly FFmpeg Transcoding Warning / Fallback:", err);
    return inputFile;
  }
}

export interface MultiQualityFiles {
  file1080p: File;
  file720p: File;
  file360p: File;
}

/**
 * Transcodes a raw video file into ALL 3 resolution qualities:
 * 1. 1080p (Full HD)
 * 2. 720p (HD - Standard)
 * 3. 360p (Low - Mobile Data Saver)
 */
export async function transcodeAllQualitiesInBrowser(
  inputFile: File,
  onProgress?: (statusText: string, percent: number) => void
): Promise<MultiQualityFiles> {
  // 1. Transcode 1080p (or High Quality)
  if (onProgress) onProgress("Transcoding 1080p Full HD version...", 15);
  const file1080p = await transcodeVideoInBrowser(inputFile, {
    resolution: "1080p",
    onProgress: (pct) => onProgress && onProgress("Transcoding 1080p Full HD version...", Math.round(pct * 0.33)),
  });

  // 2. Transcode 720p (Medium Quality)
  if (onProgress) onProgress("Transcoding 720p HD version...", 45);
  const file720p = await transcodeVideoInBrowser(inputFile, {
    resolution: "720p",
    onProgress: (pct) => onProgress && onProgress("Transcoding 720p HD version...", Math.round(33 + pct * 0.33)),
  });

  // 3. Transcode 360p (Mobile Data Saver)
  if (onProgress) onProgress("Transcoding 360p Data-Saver version...", 80);
  const file360p = await transcodeVideoInBrowser(inputFile, {
    resolution: "360p",
    onProgress: (pct) => onProgress && onProgress("Transcoding 360p Data-Saver version...", Math.round(66 + pct * 0.34)),
  });

  if (onProgress) onProgress("Transcoding complete! Preparing R2 upload...", 100);

  return { file1080p, file720p, file360p };
}

/**
 * Smart Network Detector helper to adapt streaming strategy for homepage video player based on user connection speed.
 */
export function getNetworkSpeedMode(): "slow" | "medium" | "fast" {
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (connection) {
    if (connection.saveData || connection.effectiveType === "2g" || connection.effectiveType === "slow-2g") {
      return "slow";
    }
    if (connection.effectiveType === "3g") {
      return "medium";
    }
  }

  return "fast";
}

/**
 * Selects optimal resolution video URL for a video based on user's current connection speed.
 */
export function getAdaptiveVideoUrl(video: {
  video_url: string;
  video_url_720p?: string;
  video_url_360p?: string;
}): string {
  const mode = getNetworkSpeedMode();

  if (mode === "slow") {
    // 2G / Slow Mobile Data -> 360p URL if available, else 720p, else main URL
    return video.video_url_360p || video.video_url_720p || video.video_url;
  }
  
  if (mode === "medium") {
    // 3G / Medium Speed -> 720p URL if available, else main URL
    return video.video_url_720p || video.video_url;
  }

  // 4G / Broadband -> Main 1080p URL
  return video.video_url;
}
