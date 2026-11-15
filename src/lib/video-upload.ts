import { MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, VIDEO_MIMES } from "@/lib/constants";

export type VideoUploadErrorCode =
  | "errVideoType"
  | "errVideoTooLarge"
  | "errVideoDuration"
  | "errVideoUpload";

export class VideoUploadError extends Error {
  constructor(readonly code: VideoUploadErrorCode) {
    super(code);
  }
}

export interface UploadedVideo {
  url: string;
  key: string;
  sizeKb: number;
}

/** Sample-entry fourcc: hvc1 / hev1 mean HEVC, which only Apple devices play. */
const HEVC_MARKERS = [
  [0x68, 0x76, 0x63, 0x31],
  [0x68, 0x65, 0x76, 0x31],
];
const SCAN_CHUNK_BYTES = 4 * 1024 * 1024;
const MARKER_BYTES = 4;

function foundMarker(data: Uint8Array, marker: number[]): boolean {
  outer: for (let i = 0; i <= data.length - MARKER_BYTES; i += 1) {
    for (let j = 0; j < MARKER_BYTES; j += 1) {
      if (data[i + j] !== marker[j]) continue outer;
    }
    return true;
  }
  return false;
}

/**
 * iPhone "High Efficiency" recordings are HEVC: they pass the container check but
 * render a black box on Android/Chrome, so they are refused here instead.
 * iPhone .MOV keeps `moov` at the end, hence the whole-file scan.
 */
export async function isHevc(file: File): Promise<boolean> {
  let offset = 0;
  let carry = new Uint8Array(0);
  while (offset < file.size) {
    const chunk = new Uint8Array(
      await file.slice(offset, offset + SCAN_CHUNK_BYTES).arrayBuffer()
    );
    const window = new Uint8Array(carry.length + chunk.length);
    window.set(carry, 0);
    window.set(chunk, carry.length);
    if (HEVC_MARKERS.some((marker) => foundMarker(window, marker))) return true;
    carry = window.slice(window.length - (MARKER_BYTES - 1));
    offset += SCAN_CHUNK_BYTES;
  }
  return false;
}

/** Reads duration from the file itself, so the 60s ceiling is checked before any network call. */
function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const duration = el.duration;
      URL.revokeObjectURL(objectUrl);
      resolve(duration);
    };
    el.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("decode"));
    };
    el.src = objectUrl;
  });
}

/** Presigned PUT: the file goes straight to R2, never through the app server. */
export async function uploadVideo(file: File): Promise<UploadedVideo> {
  const contentType = file.type;
  if (!VIDEO_MIMES.includes(contentType)) throw new VideoUploadError("errVideoType");
  if (file.size > MAX_VIDEO_BYTES) throw new VideoUploadError("errVideoTooLarge");
  if (await isHevc(file)) throw new VideoUploadError("errVideoType");

  let duration = 0;
  try {
    duration = await readDuration(file);
  } catch {
    throw new VideoUploadError("errVideoType");
  }
  if (!Number.isFinite(duration) || duration > MAX_VIDEO_SECONDS) {
    throw new VideoUploadError("errVideoDuration");
  }

  const sigRes = await fetch("/api/upload/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  });
  const sigJson = (await sigRes.json()) as {
    data?: { uploadUrl: string; key: string; url: string };
  };
  if (!sigRes.ok || !sigJson.data) throw new VideoUploadError("errVideoUpload");

  const put = await fetch(sigJson.data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!put.ok) throw new VideoUploadError("errVideoUpload");

  return {
    url: sigJson.data.url,
    key: sigJson.data.key,
    sizeKb: Math.max(1, Math.round(file.size / 1024)),
  };
}
