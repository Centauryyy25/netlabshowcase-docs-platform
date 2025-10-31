"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MarqueeDirection = "left" | "right";
type MarqueeSpeed = "slow" | "normal" | "fast";

const DUPLICATION_COUNT = 2;

export interface LabPreview {
  id: string;
  title: string;
  category: string | null;
}

interface MarqueeLabsProps {
  labs: LabPreview[];
  direction?: MarqueeDirection;
  speed?: MarqueeSpeed;
  pauseOnHover?: boolean;
  className?: string;
}

const speedToDuration: Record<MarqueeSpeed, number> = {
  slow: 40,
  normal: 25,
  fast: 15,
};

const badgeBaseClasses =
  "relative z-20 inline-flex items-center rounded-full border border-slate-300/70 bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-600 transition-colors duration-300 dark:border-white/12 dark:bg-white/5 dark:text-slate-200";

export function MarqueeLabs({
  labs,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: MarqueeLabsProps) {
  const duplicatedLabs = React.useMemo(() => {
    if (!labs.length) return [];
    return Array.from({ length: DUPLICATION_COUNT }).flatMap(() => labs);
  }, [labs]);

  if (!labs.length)
    return (
      <div
        className={cn(
          "border bg-amber-600 p-10 text-center text-slate-700 dark:border-white/10 dark:text-muted-foreground",
          className,
        )}
      >
        <p>Labs will appear here once they are published. Stay tuned!</p>
      </div>
    );

  const duration = speedToDuration[speed];
  const trackDirection = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className={cn(
        "relative flex w-full overflow-hidden border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-[2px] dark:border-white/10 dark:bg-background/40",
        className,
      )}
      data-pause={pauseOnHover}
    >
      <div className="absolute inset-y-0 left-0 w-24 pointer-events-none bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 pointer-events-none bg-gradient-to-l from-background to-transparent z-10" />

      <div
        className="marquee__track relative z-0 flex gap-5 will-change-transform"
        style={
          {
            "--duration": `${duration}s`,
            "--marquee-direction": trackDirection,
            "--marquee-translate": `${-100 / DUPLICATION_COUNT}%`,
          } as React.CSSProperties
        }
      >
        {duplicatedLabs.map((lab, index) => (
          <article
            key={`${lab.id}-${index}`}
            className="group relative flex min-w-[240px] max-w-[260px] flex-col items-start justify-center gap-2 rounded-2xl border border-border/50 bg-card/60 p-4 text-left shadow-[0_10px_25px_-15px_rgba(15,23,42,0.35)] transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] dark:border-white/10 dark:bg-muted/20"
          >
            <Link
              href={`/labs/${lab.id}`}
              className="absolute inset-0 z-10 rounded-2xl"
              aria-label={`View lab ${lab.title}`}
            />
            <span
              className={cn(
                badgeBaseClasses,
                "group-hover:border-violet-400/90 group-hover:bg-violet-500/10 group-hover:text-violet-600 dark:group-hover:text-violet-200",
              )}
            >
              {lab.category ?? "Uncategorized"}
            </span>
            <h3 className="relative z-20 line-clamp-2 text-base font-semibold text-foreground">
              {lab.title}
            </h3>
          </article>
        ))}
      </div>

      <style jsx>{`
        .marquee__track {
          animation-name: var(--marquee-direction);
          animation-duration: var(--duration);
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }

        .marquee[data-pause="true"]:hover .marquee__track {
          animation-play-state: paused;
        }

        @keyframes marquee-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(var(--marquee-translate, -50%));
          }
        }

        @keyframes marquee-right {
          from {
            transform: translateX(var(--marquee-translate, -50%));
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </motion.div>
  );
}
