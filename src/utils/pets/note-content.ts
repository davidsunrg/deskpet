/** Empty plain-text note document stored in `content_json`. */
export const EMPTY_NOTE_CONTENT_JSON = {
  type: 'plain-text-note',
  text: '',
} as const satisfies Record<string, unknown>;

export type PlainTextNoteContentJson = {
  type: 'plain-text-note';
  text: string;
};

export function buildPlainTextNoteContentJson(
  text: string
): PlainTextNoteContentJson {
  return {
    type: 'plain-text-note',
    text,
  };
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Escape plain text and preserve line breaks as simple HTML. */
export function plainTextToNoteHtml(text: string): string {
  if (!text) return '';
  return escapeHtml(text).replace(/\r\n|\r|\n/g, '<br>');
}
