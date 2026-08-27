import { Markdown } from '@/components/markdown/markdown';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/formatter';
import type { PageDoc } from '@/lib/pages';
import type { MarkdownResult } from '@/lib/markdown';
import { CalendarIcon } from 'lucide-react';

export function MarkdownPage({
  page,
  markdown,
}: {
  page: PageDoc;
  markdown: MarkdownResult;
}) {
  const { title, description, date } = page;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-center text-lg text-muted-foreground">
            {description}
          </p>
        )}
        {date ? (
          <div className="flex items-center justify-center gap-2">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {formatDate(new Date(date))}
            </p>
          </div>
        ) : null}
      </div>
      <Card>
        <CardContent>
          <Markdown
            markup={markdown.markup}
            className="prose prose-neutral dark:prose-invert max-w-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}
