/**
 * Slug for `/blog/[slug]/` from an Astro 5 content-layer entry.
 * Entries expose `id` (file-derived), not `slug`.
 */
export function blogEntrySlug(post: { id: string }): string {
  const tail = post.id.replace(/\\/g, '/').split('/').pop() ?? post.id
  return tail.replace(/\.mdx?$/i, '')
}
