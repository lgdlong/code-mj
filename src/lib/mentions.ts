import { MENTION_MAX_HANDLES } from "./constants";

// Last char must be alnum/underscore so "hi @alice. thanks" yields "alice",
// not "alice.". Boundary (start of string or a char that is not \w and not @)
// is checked manually: no lookbehind, which Safari < 16.4 lacks.
const HANDLE = /@[a-z0-9._]{0,23}[a-z0-9_]/gi;

export interface MentionSegment {
  text: string;
  handle: string | null;
}

/**
 * Single pass over content. Used by the renderer (segments) and the server
 * validation (handles), so all three agree on what a mention is. The server
 * resolves `handles` against the users table; the stored, verified list is
 * what `MentionText` links against.
 */
export function parseMentions(text: string): {
  segments: MentionSegment[];
  handles: string[];
} {
  const segments: MentionSegment[] = [];
  const handles: string[] = [];
  let cursor = 0;
  HANDLE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = HANDLE.exec(text)) !== null) {
    const at = match.index;
    // Boundary: the char before "@" must not be a word char or another "@".
    if (at > 0 && /[\w@]/.test(text[at - 1])) continue;
    const handle = match[0].slice(1).toLowerCase();
    if (cursor < at) segments.push({ text: text.slice(cursor, at), handle: null });
    segments.push({ text: match[0], handle });
    if (!handles.includes(handle) && handles.length < MENTION_MAX_HANDLES) {
      handles.push(handle);
    }
    cursor = at + match[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), handle: null });
  return { segments, handles };
}
