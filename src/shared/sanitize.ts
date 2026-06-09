import DOMPurify from 'dompurify';

// §6 rule 5: allow-list for sanitized rich text at render time (client).
const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a', 'h3', 'h4', 'p', 'br'];
const ALLOWED_ATTR = ['href'];

/**
 * Sanitize HTML at render time using DOMPurify.
 * Only the allow-listed tags/attributes are permitted.
 * href values are validated to http(s) only (§6 rule 6).
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORCE_BODY: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });

  // Strip any href that is not http(s)
  return clean.replace(/href="([^"]*?)"/gi, (_match, url: string) => {
    if (/^https?:\/\//i.test(url)) {
      return `href="${url}"`;
    }
    return '';
  });
}

/**
 * Validate that a URL is http(s) only. Returns true if safe.
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
