"use client";

import { cn } from "@/lib/utils";

/**
 * EdgeSwarm BrandMark — layered hexagonal "S"-stack emblem.
 * Pure SVG, no external assets. Scales to any size.
 */
export function BrandMark({
  className,
  glow = true,
  size = 40,
}: {
  className?: string;
  glow?: boolean;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn(glow && "drop-shadow-[0_0_8px_rgba(19,221,242,0.55)]", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="es-grad-cyan" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#13DDF2" />
          <stop offset="100%" stopColor="#368BFF" />
        </linearGradient>
        <linearGradient id="es-grad-violet" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#368BFF" />
          <stop offset="100%" stopColor="#9A55FF" />
        </linearGradient>
        <linearGradient id="es-grad-magenta" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#9A55FF" />
          <stop offset="100%" stopColor="#D857F8" />
        </linearGradient>
        <linearGradient id="es-grad-text" x1="0" y1="0" x2="64" y2="0">
          <stop offset="0%" stopColor="#13DDF2" />
          <stop offset="50%" stopColor="#9A55FF" />
          <stop offset="100%" stopColor="#D857F8" />
        </linearGradient>
      </defs>
      {/* Layered hexagons — back to front */}
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="url(#es-grad-cyan)" opacity="0.18" />
      <polygon points="32,10 50,21 50,43 32,54 14,43 14,21" fill="url(#es-grad-violet)" opacity="0.35" />
      <polygon points="32,16 44,24 44,40 32,48 20,40 20,24" fill="url(#es-grad-magenta)" opacity="0.95" />
      {/* Inner S-curve cut */}
      <path
        d="M36 24 C 30 24, 28 28, 32 30 C 36 32, 36 36, 30 36 C 28 36, 27 35, 27 33"
        stroke="#050B17"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="32" r="2.2" fill="#050B17" />
    </svg>
  );
}

/** EdgeSwarm wordmark — "Edge" in white, "Swarm" in brand gradient */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      <span className="text-[#F4F8FF]">Edge</span>
      <span className="es-brand-text">Swarm</span>
    </span>
  );
}

/** Small connected-globe glyph used in the hero */
export function NetworkGlobe({ className, size = 180 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="globe-core" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#13DDF2" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#368BFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#9A55FF" stopOpacity="0.1" />
        </radialGradient>
        <linearGradient id="globe-ring" x1="0" y1="0" x2="200" y2="200">
          <stop offset="0%" stopColor="#13DDF2" />
          <stop offset="100%" stopColor="#D857F8" />
        </linearGradient>
      </defs>
      {/* Core glow */}
      <circle cx="100" cy="100" r="62" fill="url(#globe-core)" />
      <circle cx="100" cy="100" r="58" stroke="url(#globe-ring)" strokeWidth="1.4" opacity="0.6" />
      {/* Latitude / longitude lines */}
      <ellipse cx="100" cy="100" rx="58" ry="22" stroke="url(#globe-ring)" strokeWidth="1" opacity="0.5" />
      <ellipse cx="100" cy="100" rx="58" ry="44" stroke="url(#globe-ring)" strokeWidth="0.8" opacity="0.4" />
      <ellipse cx="100" cy="100" rx="22" ry="58" stroke="url(#globe-ring)" strokeWidth="1" opacity="0.5" />
      <ellipse cx="100" cy="100" rx="44" ry="58" stroke="url(#globe-ring)" strokeWidth="0.8" opacity="0.4" />
      {/* Nodes */}
      {[
        [100, 42],
        [152, 78],
        [138, 140],
        [70, 150],
        [42, 96],
        [110, 100],
        [86, 70],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3.4" fill="#13DDF2" />
          <circle cx={x} cy={y} r="6" fill="#13DDF2" opacity="0.18" />
        </g>
      ))}
      {/* Connection arcs */}
      <path d="M100 42 Q 130 70 152 78" stroke="#13DDF2" strokeWidth="1" opacity="0.45" fill="none" />
      <path d="M152 78 Q 150 110 138 140" stroke="#368BFF" strokeWidth="1" opacity="0.45" fill="none" />
      <path d="M138 140 Q 100 158 70 150" stroke="#9A55FF" strokeWidth="1" opacity="0.45" fill="none" />
      <path d="M70 150 Q 50 124 42 96" stroke="#D857F8" strokeWidth="1" opacity="0.45" fill="none" />
      <path d="M42 96 Q 70 60 100 42" stroke="#13DDF2" strokeWidth="1" opacity="0.45" fill="none" />
    </svg>
  );
}
