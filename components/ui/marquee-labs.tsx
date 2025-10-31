"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type MarqueeDirection = "left" | "right";
type MarqueeSpeed = "slow" | "normal" | "fast";

const DUPLICATION_COUNT = 4;

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

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
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

  if (!labs.length) {
    return (
      <div
        className={cn(
          "border bg-amber-600 p-10 text-center text-slate-700 shadow-[0_20px_55px_-18px_rgba(8,47,73,0.5)] dark:border-white/10 dark:from-background/40 dark:via-background/30 dark:to-background/40 dark:text-muted-foreground",
          className,
        )}
      >
        <p className="text-muted-foreground">
          Labs will appear here once they are published. Stay tuned!
        </p>
      </div>
    );
  }

  const duration = speedToDuration[speed];
  const trackDirection = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div
      className={cn(
        "marquee relative flex w-full overflow-hidden border border-border/60 bg-card/80 p-4 shadow-[0_22px_45px_-18px_rgba(15,23,42,0.25)] backdrop-blur-sm dark:border-white/10 dark:bg-background/40 dark:shadow-[0_25px_70px_-25px_rgba(12,74,110,0.4)]",
        className,
      )}
      data-pause={pauseOnHover}
    >
      <div className="marquee__gradient-left pointer-events-none absolute inset-y-0 left-0 w-24" />
      <div className="marquee__gradient-right pointer-events-none absolute inset-y-0 right-0 w-24" />

      <div
        className="marquee__track relative z-10"
        style={
          {
            "--duration": `${duration}s`,
            "--marquee-direction": trackDirection,
            "--marquee-translate": `${-100 / DUPLICATION_COUNT}%`,
          } as React.CSSProperties
        }
      >
        {duplicatedLabs.map((lab, index) => (
          <motion.article
            key={`${lab.id}-${index}`}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            className="group relative flex min-w-[240px] max-w-[260px] flex-col items-start justify-center gap-2 rounded-2xl border border-border/60 bg-card p-4 text-left shadow-[0_15px_40px_-22px_rgba(15,23,42,0.45)] transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_45px_rgba(56,189,248,0.25)] dark:border-white/10 dark:bg-muted/20 dark:hover:shadow-[0_0_35px_rgba(56,189,248,0.25)]"
          >
            <Link href={`/labs/${lab.id}`} className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`View lab ${lab.title}`} />
            <span
              className={cn(
                badgeBaseClasses,
                "group-hover:border-violet-400/90 group-hover:bg-violet-500/10 group-hover:text-violet-600 group-hover:shadow-[0_0_18px_rgba(139,92,246,0.25)] dark:group-hover:text-violet-200 dark:group-hover:shadow-[0_0_18px_rgba(139,92,246,0.35)]",
              )}
            >
              {lab.category ?? "Uncategorized"}
            </span>
            <h3 className="relative z-20 line-clamp-2 text-base font-semibold text-foreground">
              {lab.title}
            </h3>
          </motion.article>
        ))}
      </div>

      <style jsx>{`
        .marquee {
          --duration: 25s;
        }

        .marquee__track {
          display: flex;
          gap: 1.25rem;
          width: fit-content;
          animation-name: var(--marquee-direction);
          animation-duration: var(--duration);
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }

        .marquee[data-pause="true"]:hover .marquee__track,
        .marquee[data-pause="true"]:hover .marquee__track::after {
          animation-play-state: paused;
        }

        .marquee__gradient-left,
        .marquee__gradient-right {
          background: linear-gradient(
            to right,
            hsl(var(--background)) 0%,
            transparent 100%
          );
          z-index: 5;
        }

        .marquee__gradient-right {
          background: linear-gradient(
            to left,
            hsl(var(--background)) 0%,
            transparent 100%
          );
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
    </div>
  );
}
