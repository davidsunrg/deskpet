import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { IconX } from '@tabler/icons-react';
import { useLocation } from '@tanstack/react-router';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Routes } from '@/lib/routes';
import { StudioHeader } from './studio-header';
import { getStudioSection } from './studio-sections';
import { StudioSidebar } from './studio-sidebar';
import '@/styles/studio.css';
export function StudioShell({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const pathSegments = pathname?.split('/').filter(Boolean) ?? [];
  const studioIndex = pathSegments.indexOf('studio');
  const sectionSlug =
    studioIndex >= 0 ? pathSegments[studioIndex + 1] : undefined;
  const childSlug =
    studioIndex >= 0 ? pathSegments[studioIndex + 2] : undefined;
  const section = sectionSlug ? getStudioSection(sectionSlug) : undefined;
  const isHome = studioIndex >= 0 && !sectionSlug;
  const breadcrumbs = section
    ? [
        {
          label: section.title,
          href: childSlug ? `${Routes.Studio}/${section.slug}` : undefined,
        },
        ...(childSlug
          ? [
              {
                label:
                  childSlug === 'editor'
                    ? 'Editor'
                    : childSlug === 'templates'
                      ? 'Templates'
                      : childSlug,
              },
            ]
          : []),
      ]
    : undefined;
  useEffect(() => {
    if (pathname) setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1280px)');
    const close = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener('change', close);
    return () => query.removeEventListener('change', close);
  }, []);
  return (
    <Tooltip.Provider delayDuration={250}>
      <div data-studio-theme="light" className="studio-root">
        <div className="studio-layout">
          <div className="studio-desktop-sidebar">
            <StudioSidebar />
          </div>
          <div className="studio-main">
            <div className="studio-main-inner">
              <StudioHeader
                breadcrumbs={breadcrumbs}
                isHome={isHome}
                onOpenMenu={() => setOpen(true)}
              />
              {children}
            </div>
          </div>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              data-studio-theme="light"
              className="studio-drawer-overlay"
            />
            <Dialog.Content
              data-studio-theme="light"
              className="studio-drawer"
              aria-describedby={undefined}
            >
              <Dialog.Title className="studio-sr-only">
                Studio navigation
              </Dialog.Title>
              <Dialog.Close
                className="studio-icon-button studio-drawer-close"
                aria-label="Close navigation"
              >
                <IconX />
              </Dialog.Close>
              <StudioSidebar onNavigate={() => setOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Tooltip.Provider>
  );
}
