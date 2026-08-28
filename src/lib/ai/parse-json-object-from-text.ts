/**
 * Parse a JSON object from model text, tolerating fenced markdown wrappers.
 */
export function parseJsonObjectFromText(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();

  try {
    return JSON.parse(candidate) as unknown;
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as unknown;
    }
    throw new Error('Ark response was not valid JSON.');
  }
}
