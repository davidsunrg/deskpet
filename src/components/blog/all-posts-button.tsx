import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/lib/i18n/navigation';
import { getServerTranslations } from '@/lib/deskpet-i18n';
import { ArrowLeftIcon } from 'lucide-react';

export function AllPostsButton() {
  const t = getServerTranslations('BlogPage');

  return (
    <Button
      size="lg"
      variant="default"
      className="group inline-flex items-center gap-2"
      asChild
    >
      <LocaleLink href="/blog">
        <ArrowLeftIcon className="size-5 transition-transform duration-200 group-hover:-translate-x-1" />
        <span>{t('allPosts')}</span>
      </LocaleLink>
    </Button>
  );
}
