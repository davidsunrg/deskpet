import { localizeHref, getLocale } from '@/lib/locale';
import {
  Link,
  useNavigate,
  useRouter,
  type LinkProps,
} from '@tanstack/react-router';

type LocaleLinkProps = Omit<LinkProps, 'to'> & {
  href: string;
  children?: React.ReactNode;
};

function splitHref(href: string): {
  pathname: string;
  search: Record<string, string>;
} {
  const [pathname, query = ''] = href.split('?');
  const search = Object.fromEntries(new URLSearchParams(query));
  return { pathname: pathname || '/', search };
}

/** Locale-aware link — mirrors DeskPet Next `LocaleLink`. */
export function LocaleLink({ href, children, ...props }: LocaleLinkProps) {
  const { pathname, search } = splitHref(href);
  const to = localizeHref(pathname, { locale: getLocale() });
  return (
    <Link to={to} search={search} {...props}>
      {children}
    </Link>
  );
}

type LocaleRouter = {
  replace: (href: string, options?: { scroll?: boolean }) => void;
  push: (href: string, options?: { scroll?: boolean }) => void;
};

/** Locale-aware router — mirrors DeskPet Next `useLocaleRouter`. */
export function useLocaleRouter(): LocaleRouter {
  const navigate = useNavigate();

  return {
    replace(href, options) {
      const { pathname, search } = splitHref(href);
      void navigate({
        to: localizeHref(pathname, { locale: getLocale() }),
        search,
        replace: true,
        resetScroll: options?.scroll !== false,
      });
    },
    push(href, options) {
      const { pathname, search } = splitHref(href);
      void navigate({
        to: localizeHref(pathname, { locale: getLocale() }),
        search,
        resetScroll: options?.scroll !== false,
      });
    },
  };
}

export function useLocalePathname(): string {
  const router = useRouter();
  return router.state.location.pathname;
}
