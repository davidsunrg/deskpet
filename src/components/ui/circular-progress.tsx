'use client';

import { cn } from '@/utils/cn';

type CircularProgressProps = {
  /** Progress from 0–100. */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** Accessible label, e.g. "Uploading". */
  label?: string;
};

/**
 * Circular progress with the percent value centered inside.
 */
export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 5,
  className,
  label,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block size-full -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-deskpet-ink/12"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[#2f9d78] transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="flex items-baseline gap-px leading-none text-deskpet-ink">
          <span className="text-[13px] font-black tabular-nums tracking-tight">
            {clamped}
          </span>
          <span className="text-[10px] font-bold">%</span>
        </span>
      </span>
    </div>
  );
}
