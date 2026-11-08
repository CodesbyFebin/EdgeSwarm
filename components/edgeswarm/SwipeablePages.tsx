"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal swipeable pages container powered by Embla Carousel.
 * Children are rendered as full-width slides. Snaps, supports touch and drag.
 */
export function SwipeablePages({
  children,
  activeIndex,
  onIndexChange,
  className,
}: {
  children: React.ReactNode[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
  className?: string;
}) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  // Sync external activeIndex -> embla scroll
  React.useEffect(() => {
    if (!embla) return;
    const current = embla.selectedScrollSnap();
    if (current !== activeIndex) {
      embla.scrollTo(activeIndex, true);
    }
  }, [activeIndex, embla]);

  // Sync embla scroll -> external state
  React.useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      const idx = embla.selectedScrollSnap();
      onIndexChange(idx);
    };
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect);
      embla.off("reInit", onSelect);
    };
  }, [embla, onIndexChange]);

  return (
    <div className={cn("relative flex-1 overflow-hidden", className)}>
      <div className="es-embla__container h-full" ref={emblaRef}>
        <div className="flex h-full">
          {React.Children.map(children, (child, i) => (
            <div
              className="es-embla__slide flex h-full min-w-0 flex-col"
              data-slide={i}
              aria-hidden={i !== activeIndex}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
