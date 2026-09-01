'use client';

import { cn } from '@/lib/cn';

type LogoVariant = 'full' | 'mark' | 'wordmark';

interface PockEdLogoProps {
  variant?: LogoVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** When true, render a light-on-dark version (dark backgrounds) */
  onDark?: boolean;
  /** Accessible label override */
  ariaLabel?: string;
}

/**
 * PockEdLogo — single source of truth for the PockEd brand mark.
 *
 * Visual language:
 *  - Stacked flashcards inside an indigo→purple gradient pocket
 *  - Bold "P" letter on the front card
 *  - Motion lines on the left (focus / progress)
 *  - Sparkles in green + amber (momentum / learning)
 *
 * The component is purely inline SVG so it scales crisply and recolors
 * with currentColor. It does NOT stretch, rotate, or randomly recolor.
 */
export function PockEdLogo({
  variant = 'full',
  size = 'md',
  className,
  onDark = false,
  ariaLabel = 'PockEd',
}: PockEdLogoProps) {
  // Sizing scale per variant — locked, never distorted.
  const dims: Record<LogoVariant, Record<string, { w: number; h: number }>> = {
    full: {
      xs: { w: 96, h: 32 },
      sm: { w: 120, h: 40 },
      md: { w: 156, h: 52 },
      lg: { w: 196, h: 64 },
      xl: { w: 240, h: 80 },
    },
    wordmark: {
      xs: { w: 80, h: 24 },
      sm: { w: 100, h: 30 },
      md: { w: 128, h: 36 },
      lg: { w: 160, h: 44 },
      xl: { w: 192, h: 52 },
    },
    mark: {
      xs: { w: 20, h: 20 },
      sm: { w: 28, h: 28 },
      md: { w: 36, h: 36 },
      lg: { w: 48, h: 48 },
      xl: { w: 64, h: 64 },
    },
  };

  const { w, h } = dims[variant][size];
  const titleFill = onDark ? '#F8FAFC' : '#0F172A';
  const accentFill = '#4F46E5';
  const taglineFill = '#4F46E5';
  const gradId = `pocked-logo-grad-${variant}-${size}`;
  const gradId2 = `pocked-logo-grad2-${variant}-${size}`;

  if (variant === 'mark') {
    return (
      <span
        role="img"
        aria-label={ariaLabel}
        className={cn('inline-flex items-center justify-center select-none', className)}
        style={{ width: w, height: h }}
      >
        <svg
          viewBox="0 0 64 64"
          width={w}
          height={h}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id={gradId} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          {/* Outer pocket */}
          <rect x="8" y="8" width="48" height="48" rx="12" fill={`url(#${gradId})`} />
          {/* Stacked inner card */}
          <rect x="15" y="15" width="36" height="36" rx="9" fill="white" fillOpacity="0.18" />
          {/* Front P card */}
          <rect x="20" y="20" width="28" height="28" rx="7" fill="white" />
          {/* Letter P */}
          <path
            d="M28 27H37.5C40.5 27 43 29.5 43 32.5C43 35.5 40.5 38 37.5 38H32V45H28V27ZM32 30.5V34.5H37.5C38.6 34.5 39.5 33.6 39.5 32.5C39.5 31.4 38.6 30.5 37.5 30.5H32Z"
            fill={accentFill}
          />
          {/* Motion lines */}
          <path d="M2 22H9" stroke={accentFill} strokeWidth="2" strokeLinecap="round" />
          <path d="M0 32H7" stroke={accentFill} strokeWidth="2" strokeLinecap="round" />
          <path d="M2 42H9" stroke={accentFill} strokeWidth="2" strokeLinecap="round" />
          {/* Sparkles */}
          <path
            d="M56 4L57 7L60 8L57 9L56 12L55 9L52 8L55 7L56 4Z"
            fill="#10B981"
          />
          <path
            d="M58 56L58.7 58L60.7 58.7L58.7 59.4L58 61.4L57.3 59.4L55.3 58.7L57.3 58L58 56Z"
            fill="#F59E0B"
          />
        </svg>
      </span>
    );
  }

  if (variant === 'wordmark') {
    return (
      <span
        role="img"
        aria-label={ariaLabel}
        className={cn('inline-flex items-center select-none', className)}
        style={{ width: w, height: h }}
      >
        <svg
          viewBox="0 0 200 36"
          width={w}
          height={h}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          <text
            x="0"
            y="26"
            fontFamily="Poppins, system-ui, sans-serif"
            fontWeight="700"
            fontSize="24"
            fill={titleFill}
          >
            Pock<tspan fill={accentFill}>Ed</tspan>
          </text>
        </svg>
      </span>
    );
  }

  // Full logo (mark + wordmark + tagline)
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-3 select-none', className)}
      style={{ height: h }}
    >
      <span style={{ width: h, height: h }} className="inline-flex items-center justify-center">
        <svg
          viewBox="0 0 64 64"
          width={h}
          height={h}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id={gradId} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="48" height="48" rx="12" fill={`url(#${gradId})`} />
          <rect x="15" y="15" width="36" height="36" rx="9" fill="white" fillOpacity="0.18" />
          <rect x="20" y="20" width="28" height="28" rx="7" fill="white" />
          <path
            d="M28 27H37.5C40.5 27 43 29.5 43 32.5C43 35.5 40.5 38 37.5 38H32V45H28V27ZM32 30.5V34.5H37.5C38.6 34.5 39.5 33.6 39.5 32.5C39.5 31.4 38.6 30.5 37.5 30.5H32Z"
            fill={accentFill}
          />
          <path d="M2 22H9" stroke={accentFill} strokeWidth="2" strokeLinecap="round" />
          <path d="M0 32H7" stroke={accentFill} strokeWidth="2" strokeLinecap="round" />
          <path d="M2 42H9" stroke={accentFill} strokeWidth="2" strokeLinecap="round" />
          <path d="M56 4L57 7L60 8L57 9L56 12L55 9L52 8L55 7L56 4Z" fill="#10B981" />
          <path d="M58 56L58.7 58L60.7 58.7L58.7 59.4L58 61.4L57.3 59.4L55.3 58.7L57.3 58L58 56Z" fill="#F59E0B" />
        </svg>
      </span>
      <span
        className="flex flex-col justify-center"
        style={{ width: w - h - 12, height: h }}
      >
        <svg
          viewBox="0 0 240 36"
          width={w - h - 12}
          height={h * 0.55}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
          preserveAspectRatio="xMinYMid meet"
        >
          <defs>
            <linearGradient id={gradId2} x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <text
            x="0"
            y="24"
            fontFamily="Poppins, system-ui, sans-serif"
            fontWeight="700"
            fontSize="26"
            fill={titleFill}
          >
            Pock<tspan fill={`url(#${gradId2})`}>Ed</tspan>
          </text>
        </svg>
        <svg
          viewBox="0 0 240 12"
          width={w - h - 12}
          height={h * 0.22}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', marginTop: 2 }}
          preserveAspectRatio="xMinYMid meet"
        >
          <text
            x="0"
            y="9"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="600"
            fontSize="8"
            letterSpacing="2.4"
            fill={taglineFill}
          >
            MICRO-LEARNING SPRINTS
          </text>
        </svg>
      </span>
    </span>
  );
}
