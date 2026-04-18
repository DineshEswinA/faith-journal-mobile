/**
 * Calculates estimated reading time based on ~200 words per minute.
 * Handles string content, JSON object content, or excerpt fallback.
 */
export function getReadTime(post: { content?: any; excerpt?: string }): string {
  const text =
    typeof post.content === 'string'
      ? post.content
      : typeof post.content === 'object' && post.content !== null
      ? JSON.stringify(post.content)
      : post.excerpt || '';

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} MIN READ`;
}
