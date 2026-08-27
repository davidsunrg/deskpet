import type { BlogPost } from '@/lib/blog';
import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogPathPagination } from '@/components/blog/blog-path-pagination';
import { EmptyGrid } from '@/components/shared/empty-grid';

type BlogGridWithPaginationProps = {
  posts: BlogPost[];
  totalPages: number;
  routePrefix: string;
};

export function BlogGridWithPagination({
  posts,
  totalPages,
  routePrefix,
}: BlogGridWithPaginationProps) {
  if (posts.length === 0) {
    return <EmptyGrid />;
  }

  return (
    <div>
      <BlogGrid posts={posts} />
      <div className="mt-8 flex items-center justify-center">
        <BlogPathPagination routePrefix={routePrefix} totalPages={totalPages} />
      </div>
    </div>
  );
}
