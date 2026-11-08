"use client";

import { motion } from "framer-motion";
import { Home, Briefcase, Cpu, Wallet, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Which slide indices belong to this tab (for highlighting) */
  slides: number[];
}

export const TABS: TabDef[] = [
  { id: "home", label: "Home", icon: Home, slides: [0] },
  { id: "jobs", label: "Jobs", icon: Briefcase, slides: [1, 2, 3, 4, 5] },
  { id: "agents", label: "Agents", icon: Cpu, slides: [6] },
  { id: "payments", label: "Payments", icon: Wallet, slides: [7] },
  { id: "more", label: "More", icon: LayoutGrid, slides: [8, 9] },
];

export function TabBar({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (tabIndex: number) => void;
}) {
  const activeTabIdx = Math.max(
    0,
    TABS.findIndex((t) => t.slides.includes(activeIndex))
  );

  return (
    <nav className="relative z-20 flex h-[68px] items-stretch justify-between border-t border-[#253A60]/60 bg-[#080D21]/90 px-2 backdrop-blur-xl">
      {TABS.map((tab, i) => {
        const Icon = tab.icon;
        const active = i === activeTabIdx;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(i)}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 pt-2"
            aria-label={tab.label}
            aria-current={active ? "page" : undefined}
          >
            {active && (
              <motion.div
                layoutId="tab-pill"
                className="absolute top-1.5 h-[3px] w-8 rounded-full es-brand-gradient es-glow-cyan"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              className={cn(
                "h-[22px] w-[22px] transition-colors",
                active ? "text-[#13DDF2]" : "text-[#8496B5]"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                active ? "text-[#F4F8FF]" : "text-[#8496B5]"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
