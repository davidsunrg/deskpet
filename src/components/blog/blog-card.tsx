import type { BlogPost } from '@/lib/blog';
import { getCategoriesForPost } from '@/lib/blog';
import { LocaleLink } from '@/lib/i18n/navigation';
import { formatDate } from '@/lib/formatter';
import { BlogImage } from '@/components/blog/blog-image';

export function BlogCard({ post }: { post: BlogPost }) {
  const publishDate = formatDate(new Date(post.date));
  const blogCategories = getCategoriesForPost(post);

  return (
    <LocaleLink href={`/blog/${post.slug}`} className="block h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-border transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg hover:shadow-primary/20">
        <div className="relative aspect-video w-full overflow-hidden">
          <BlogImage
            src={post.image}
            alt={post.title}
            title={post.title}
          />
          {blogCategories.length > 0 ? (
            <div className="absolute bottom-2 left-2 z-20">
              <div className="flex flex-wrap gap-1">
                {blogCategories.map((category) => (
                  <span
                    key={category.slug}
                    className="rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <h3 className="line-clamp-2 text-lg font-medium">{post.title}</h3>
            {post.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {post.description}
              </p>
            ) : null}
          </div>
          <div className="mt-4 flex items-center justify-end border-t pt-4 text-muted-foreground">
            <time className="truncate text-sm" dateTime={post.date}>
              {publishDate}
            </time>
          </div>
        </div>
      </div>
    </LocaleLink>
  );
}
