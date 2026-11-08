"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * iOS-style status bar — live clock, 5G, wifi, battery.
 */
export function StatusBar({ className }: { className?: string }) {
  const [time, setTime] = React.useState("9:41");
  React.useEffect(() => {
    const tick = () => {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes();
      // Keep the iconic 9:41 aesthetic by using actual time but styled like iOS
      h = h % 12 === 0 ? 12 : h % 12;
      setTime(`${h}:${String(m).padStart(2, "0")}`);
    };
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "relative z-20 flex h-11 select-none items-center justify-between px-6 pt-1 text-[#F4F8FF]",
        className
      )}
    >
      {/* Time */}
      <span className="text-[15px] font-semibold tracking-tight es-tabular">{time}</span>

      {/* Notch / Dynamic Island placeholder space — center */}
      <div className="pointer-events-none absolute left-1/2 top-1.5 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />

      {/* Right cluster */}
      <div className="flex items-center gap-1.5">
        {/* Signal */}
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none" aria-hidden="true">
          <rect x="0" y="7" width="3" height="4" rx="1" fill="#F4F8FF" />
          <rect x="5" y="5" width="3" height="6" rx="1" fill="#F4F8FF" />
          <rect x="10" y="2.5" width="3" height="8.5" rx="1" fill="#F4F8FF" />
          <rect x="15" y="0" width="3" height="11" rx="1" fill="#F4F8FF" />
        </svg>
        {/* 5G */}
        <span className="text-[11px] font-semibold tracking-tight text-[#F4F8FF]">5G</span>
        {/* Wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden="true">
          <path
            d="M8.5 2C5.4 2 2.7 3.3 0.7 5.4l1.3 1.3C3.6 4.9 5.9 4 8.5 4s4.9.9 6.5 2.7l1.3-1.3C14.3 3.3 11.6 2 8.5 2Z"
            fill="#F4F8FF"
          />
          <path
            d="M8.5 6c-1.7 0-3.3.7-4.4 1.9l1.3 1.3c.8-.9 1.9-1.4 3.1-1.4s2.3.5 3.1 1.4l1.3-1.3C11.8 6.7 10.2 6 8.5 6Z"
            fill="#F4F8FF"
          />
          <circle cx="8.5" cy="10.5" r="1.5" fill="#F4F8FF" />
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div className="relative h-[12px] w-[24px] rounded-[3px] border border-[#F4F8FF]/60 p-[1px]">
            <div className="h-full w-[82%] rounded-[1.5px] bg-[#F4F8FF]" />
          </div>
          <div className="h-[4px] w-[1.5px] rounded-r bg-[#F4F8FF]/60" />
        </div>
      </div>
    </div>
  );
}

/**
 * iOS home indicator bar at the bottom of the screen.
 */
export function HomeIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none flex h-5 items-center justify-center", className)}>
      <div className="h-[5px] w-[140px] rounded-full bg-white/70" />
    </div>
  );
}

/**
 * iOS-style phone frame — renders the app inside a device shell on desktop.
 * On small screens it fills the viewport.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#02050D] es-radial-fade">
      {/* Ambient back glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#13DDF2]/10 blur-[120px]" />
        <div className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-[#9A55FF]/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D857F8]/8 blur-[120px]" />
      </div>

      {/* Desktop: device shell. Mobile: full screen. */}
      <div className="relative z-10 w-full max-w-[440px] sm:my-6">
        <div className="relative overflow-hidden rounded-[44px] border border-[#1a2747]/80 bg-[#050B17] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] sm:border-[10px] sm:border-[#0a0f1f] sm:p-0">
          {/* subtle inner ring */}
          <div className="pointer-events-none absolute inset-0 z-30 rounded-[34px] ring-1 ring-inset ring-white/5" />
          {children}
        </div>
        {/* Caption */}
        <div className="mt-4 hidden text-center text-[11px] uppercase tracking-[0.2em] es-text-muted sm:block">
          EdgeSwarm · Mobile · iOS-style
        </div>
      </div>
    </div>
  );
}

/**
 * Screen scroll container — vertical scroll, hidden scrollbar, safe paddings.
 */
export function ScreenScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "es-scroll-y es-no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-2",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Animated entrance wrapper for screen content */
export function ScreenEnter({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
