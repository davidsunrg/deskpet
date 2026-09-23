import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { useLocalePathname, LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { StudioHeader } from './studio-header';
import { StudioSidebar } from './studio-sidebar';
import '@/styles/studio.css';
export function StudioShell({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const pathname = useLocalePathname();
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
            <StudioHeader onOpenMenu={() => setOpen(true)} />
            {children}
          </div>
        </div>
        <footer className="studio-footer">
          <LocaleLink href={Routes.Root}>DeskPet</LocaleLink>
          <span>A lifetime of love, in a digital home.</span>
          <nav aria-label="Studio footer">
            <LocaleLink href={Routes.About}>About</LocaleLink>
            <LocaleLink href={Routes.Blog}>Blog</LocaleLink>
            <LocaleLink href={Routes.Contact}>Help & Contact</LocaleLink>
          </nav>
          <span className="studio-handwriting">
            Good pets make a brighter world.
          </span>
        </footer>
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
