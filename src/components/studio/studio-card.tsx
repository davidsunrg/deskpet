import * as Tooltip from '@radix-ui/react-tooltip';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
export function StudioButton({
  className = '',
  primary = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      type="button"
      className={`studio-button ${primary ? 'studio-button-primary' : ''} ${className}`}
      {...props}
    />
  );
}
export function StudioIconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className="studio-icon-button"
          aria-label={label}
          {...props}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          data-studio-theme="light"
          className="studio-tooltip"
          sideOffset={6}
        >
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
export function StudioCardHeader({
  icon,
  title,
  action,
}: {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="studio-card-heading">
      <h2>
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}
