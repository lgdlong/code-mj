export const MAX_USERS = 1000;
export const MAX_POST_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 300;
export const MAX_BIO_LENGTH = 160;
export const MAX_NAME_LENGTH = 40;
export const MAX_USERNAME_LENGTH = 24;
export const MAX_REPORT_REASON_LENGTH = 200;

export const MAX_POST_IMAGES = 5;
export const MAX_IMAGE_MB = 10;
/** Display ceiling. The server resizes to this with a single encode; the client only uses it when it must re-encode. */
export const COMPRESS_IMAGE_DIMENSION = 1600;
/** Client re-encode quality — only for originals above MAX_UPLOAD_BYTES, so the server stays the first real encode. */
export const CLIENT_IMAGE_QUALITY = 0.95;
/** Server single-generation WebP quality. */
export const SERVER_IMAGE_QUALITY = 88;
/** Originals at or under this size upload untouched (Vercel body cap is 4.5 MB). */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const MAX_VIDEO_MB = 50;
export const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 60;
/** Only H.264/AAC plays everywhere without transcoding; iPhone writes it into .MOV. */
export const VIDEO_MIME = "video/mp4";
export const MOV_MIME = "video/quicktime";
export const VIDEO_MIMES = [VIDEO_MIME, MOV_MIME];
/** Server re-encodes files already within COMPRESS_IMAGE_DIMENSION only above this ceiling. */
export const MAX_STORED_IMAGE_BYTES = 2 * 1024 * 1024;

export const FEED_PAGE_SIZE = 10;
export const COMMENT_PAGE_SIZE = 15;
export const RECENT_SEARCH_LIMIT = 10;
export const SEARCH_USER_LIMIT = 3;
export const DESKTOP_ADMIN_MIN_WIDTH = 1024;
export const USERNAME_CHANGE_COOLDOWN_DAYS = 1;

export const NOTIFICATIONS_LIMIT = 50;
export const LIKERS_PAGE_SIZE = 30;
export const FOLLOW_PAGE_SIZE = 30;
export const UNREAD_POLL_MS = 30_000;

export const MENTION_SUGGEST_LIMIT = 6;
export const MENTION_MAX_HANDLES = 10;
