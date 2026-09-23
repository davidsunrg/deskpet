import type { PropsWithChildren } from 'react';
export function StudioPageShell({ children }: PropsWithChildren) {
  return (
    <main id="studio-content" className="studio-page">
      {children}
    </main>
  );
}
