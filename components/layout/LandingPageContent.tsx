"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MenuIcon } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Shuffle from "@/components/ui/shadcn-io/shuffle/index";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MarqueeLabs, type LabPreview } from "@/components/ui/marquee-labs";
import logo from "@/components/Asset/EtherDocs-Logo.png";

const navItems = [
  { label: "Documentation", href: "/resources" },
  { label: "Eksplor", href: "/search" },
  { label: "Showcase", href: "/labs" },
];

const heroMarqueeRows: LabPreview[][] = [
  [
    { id: "r1-1", title: "Hybrid Cloud Topology Playbook", category: "Cloud" },
    { id: "r1-2", title: "EVPN Fabric Quickstart", category: "Data Center" },
    { id: "r1-3", title: "Zero Trust Remote Office", category: "Security" },
    { id: "r1-4", title: "Multi-Vendor Routing Sandbox", category: "Routing" },
    { id: "r1-5", title: "Campus Automation Toolkit", category: "Automation" },
    { id: "r1-6", title: "LTE Failover Lab", category: "Edge" },
  ],
  [
    { id: "r2-1", title: "BGP Policy Lab", category: "Routing" },
    { id: "r2-2", title: "Segment Routing Explorer", category: "Core" },
    { id: "r2-3", title: "Firewall High Availability", category: "Security" },
    { id: "r2-4", title: "Observability Pipeline", category: "Monitoring" },
    { id: "r2-5", title: "SASE Jumpstart", category: "Access" },
    { id: "r2-6", title: "Automation Playgrounds", category: "Automation" },
  ],
  [
    { id: "r3-1", title: "WLAN Roaming Lab", category: "Wireless" },
    { id: "r3-2", title: "SD-WAN Mesh Builder", category: "WAN" },
    { id: "r3-3", title: "Telemetry Deep Dive", category: "Monitoring" },
    { id: "r3-4", title: "QoS Assurance Lab", category: "Routing" },
    { id: "r3-5", title: "Container Networking Lab", category: "Cloud" },
    { id: "r3-6", title: "MPLS Fast Reroute", category: "Core" },
  ],
];

const heroVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

interface LandingPageContentProps {
  labs: LabPreview[];
}

export function LandingPageContent({ labs }: LandingPageContentProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-foreground dark:bg-[radial-gradient(circle_at_center,_rgba(17,24,39,0.85)_0%,_rgba(8,11,22,0.95)_55%,_rgba(8,11,22,1)_100%)]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 blur-[140px] dark:block">
          <div className="h-64 w-[48rem] rounded-full bg-gradient-to-r from-cyan-500/20 via-violet-500/25 to-transparent" />
        </div>
        <div className="absolute bottom-[-10%] left-[10%] hidden h-64 w-64 rounded-full bg-cyan-500/10 blur-[120px] dark:block" />
        <div className="absolute bottom-[-15%] right-[12%] hidden h-72 w-72 rounded-full bg-violet-500/10 blur-[150px] dark:block" />

        <div className="absolute inset-0 block dark:hidden">
          <div className="mx-auto h-full max-w-6xl bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15)_0%,_rgba(14,165,233,0)_65%)] blur-[60px]" />
        </div>
      </div>

      <div className="absolute inset-0 -z-10 hidden opacity-40 mix-blend-screen dark:block">
        <div className="mx-auto h-full max-w-7xl bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35)_0%,_rgba(59,130,246,0)_60%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <LandingNav />
        <main className="flex flex-1 flex-col">
          <HeroSection labs={labs} />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}

function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md dark:border-white/10 dark:bg-background/50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]">
          <Image
            src={logo}
            alt="NetLabShowcase logo"
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button
            asChild
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 hover:shadow-primary/40"
          >
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-muted-foreground/50 px-5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/20"
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="rounded-xl border-white/10 bg-background/80"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background/95 backdrop-blur-xl">
              <div className="mt-10 flex flex-col gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-3">
                  <Button
                    asChild
                    className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-xl border-muted-foreground/50 px-5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/20"
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ labs }: { labs: LabPreview[] }) {
  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center sm:px-8 lg:px-10 xl:px-0">
      <motion.div
        className="mx-auto flex mt-40 mb-10 w-full max-w-6xl flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.span
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Open Lab Network
        </motion.span>

        <motion.h1
          className="mt-6 text-shadow-sm max-w-4xl bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl md:text-6xl"
          variants={heroVariants}
          transition={{ delay: 0.45, duration: 0.8, ease: "easeOut" }}
        >
          <Shuffle
            text="Explore. Document. Showcase."
            shuffleDirection="right"
            duration={0.5}
            animationMode="evenodd"
            shuffleTimes={2}
            ease="power3.out"
            stagger={0.05}
            threshold={0.1}
            triggerOnce={false}
            triggerOnHover={true}
            respectReducedMotion={true}
            className="text-foreground"
            style={{
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontFamily: 'inherit'
            }}
          />

        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl"
          variants={heroVariants}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          Empowering Network Engineers through open labs, interactive documentation, and dynamic topology sharing.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col gap-4 sm:flex-row"
          variants={heroVariants}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Button
            asChild
            className="rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition hover:bg-primary/90 hover:shadow-primary/50"
          >
            <Link href="/dashboard">Explore Labs</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-muted-foreground/40 px-8 py-3 text-base font-semibold text-muted-foreground hover:bg-muted/10"
          >
            <Link href="/resources">View Documentation</Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.section
        className="mt-4 w-full "
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        <div className="space-y-6">
          {[
            heroMarqueeRows[0],
            heroMarqueeRows[1],
            labs.length ? labs.slice(0, 6) : heroMarqueeRows[2],
          ].map((row, rowIndex) => (
            <motion.div
              key={`hero-marquee-row-${rowIndex}`}
              variants={fadeInUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <MarqueeLabs
                labs={row}
                pauseOnHover
                direction={rowIndex % 2 === 0 ? "left" : "right"}
                speed="slow"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 " />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80 py-8 backdrop-blur dark:border-white/10 dark:bg-background/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-sm">
        <p>&copy; {new Date().getFullYear()} NetLabShowcase. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/help" className="transition-colors hover:text-primary">
            Support
          </Link>
          <Link href="/resources" className="transition-colors hover:text-primary">
            Documentation
          </Link>
          <Link href="/sign-up" className="transition-colors hover:text-primary">
            Join the community
          </Link>
        </div>
      </div>
    </footer>
  );
}
