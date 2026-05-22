export const POSTS_PER_PAGE = 10;

export function getTotalPages(totalPosts: number): number {
  return Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
}

export function getPageUrl(page: number): string {
  if (page <= 1) return '/';
  return `/page${page}/`;
}

export function getPostsForPage<T>(posts: T[], page: number): T[] {
  const start = (page - 1) * POSTS_PER_PAGE;
  return posts.slice(start, start + POSTS_PER_PAGE);
}

export function getPaginationPageForPostIndex(postIndex: number): number {
  return Math.floor(postIndex / POSTS_PER_PAGE) + 1;
}
