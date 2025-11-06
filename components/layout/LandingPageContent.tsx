"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Github, MenuIcon, MessageSquare, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Shuffle from "@/components/ui/shadcn-io/shuffle/index";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MarqueeLabs, type LabPreview } from "@/components/ui/marquee-labs";
import logo from "@/components/Asset/EtherDocs-Logo.png";
import { LandingStats } from "@/components/landing/LandingStats";
import type { LatestLabCard } from "./types";
import { Particles } from "@/components/ui/shadcn-io/particles";

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

const showcaseContainer = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const showcaseCard = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const latestLabItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const latestLabGrid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

interface LandingPageContentProps {
  labs: LabPreview[];
  latestLabs: LatestLabCard[];
}


export function LandingPageContent({ labs, latestLabs }: LandingPageContentProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(191,66,245,0.12)_0%,_rgba(255,255,255,0.88)_60%,_rgba(243,244,246,1)_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_center,_rgba(17,24,39,0.85)_0%,_rgba(8,11,22,0.95)_55%,_rgba(8,11,22,1)_100%)] dark:text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 flex items-start justify-center blur-[120px] dark:hidden">
          <div className="h-[34rem] w-[60rem] rounded-full bg-[radial-gradient(circle_at_top,_rgba(191,66,245,0.16)_0%,_rgba(44,106,165,0.12)_45%,_rgba(255,255,255,0.05)_80%)]" />
        </div>
        <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 blur-[140px] dark:block">
          <div className="h-64 w-[48rem] rounded-full bg-gradient-to-r from-cyan-500/20 via-violet-500/25 to-transparent" />
        </div>
        <div className="absolute bottom-[-10%] left-[10%] hidden h-64 w-64 rounded-full bg-cyan-500/10 blur-[120px] dark:block" />
        <div className="absolute bottom-[-15%] right-[12%] hidden h-72 w-72 rounded-full bg-violet-500/10 blur-[150px] dark:block" />
        <div className="absolute inset-0 hidden opacity-40 mix-blend-screen dark:flex">
          <div className="mx-auto h-full max-w-7xl bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35)_0%,_rgba(59,130,246,0)_60%)]" />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <LandingNav />
        <main className="flex flex-1 flex-col">
          <HeroSection labs={labs} />
          <div className="relative dark:bg-[#080B16]">
          <LandingStats />
          <Particles
                  className="absolute inset-0"
                  quantity={100}
                  ease={80}
                  staticity={50}
                  color="#bf42f5"
                  size={1}
                />
          <LandingShowcase latestLabs={latestLabs} />
          </div>
        </main>
        {/* 🌌 Smooth Global Glow Overlay */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* Lapisan Radial Global Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(191,66,245,0.08)_0%,_rgba(44,106,165,0.06)_45%,_transparent_80%)] blur-[120px] dark:bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08)_0%,_transparent_70%)]" />
          {/* Lapisan Fade Halus Vertikal */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0)_0%,_rgba(249,250,251,0.85)_60%,_rgba(243,244,246,1)_100%)] opacity-70 transition-colors duration-700 dark:bg-[linear-gradient(to_bottom,_rgba(8,11,22,0)_0%,_rgba(8,11,22,0.85)_60%,_rgba(8,11,22,1)_100%)]" />
        </div>
        <LandingFooter />
      </div>
    </div>
  );
}

function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-background/50">
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
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-brand-soft transition hover:bg-primary/90"
          >
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-slate-200/70 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 hover:text-brand-foreground dark:border-muted-foreground/50 dark:text-muted-foreground dark:hover:bg-muted/20"
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
                className="rounded-xl border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-background/80"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              ariaTitle="Mobile navigation"
              className="bg-white/95 backdrop-blur-xl dark:bg-background/95 flex flex-col"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Mobile navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-1 flex-col">
                {/* Navigation Area */}
                <nav className="mt-16 flex flex-col gap-1 px-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative rounded-2xl px-5 py-4 text-base font-medium text-gray-600 transition-all duration-300 hover:translate-x-1 hover:bg-purple-50/80 hover:text-purple-900 dark:text-gray-400 dark:hover:bg-purple-950/30 dark:hover:text-purple-300"
                    >
                      <span className="relative z-10">{item.label}</span>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-violet-500/0 to-purple-600/0 transition-all duration-300 group-hover:from-purple-500/5 group-hover:via-violet-500/5 group-hover:to-purple-600/5" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom Action Buttons - Fixed at bottom */}
              <div className="mt-auto space-y-3 border-t border-purple-100/50 bg-gradient-to-t from-purple-50/30 to-transparent p-6 dark:border-purple-900/30 dark:from-purple-950/20">
                <Button
                  asChild
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 hover:shadow-2xl hover:shadow-purple-600/40"
                >
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-2xl border-2 border-purple-200 bg-white/50 px-6 py-3.5 text-sm font-medium text-purple-900 transition-all duration-300 hover:scale-[1.02] hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20 dark:text-purple-300 dark:hover:border-purple-700 dark:hover:bg-purple-900/30"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
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
    <section className="relative flex bg-neutral-50/95 dark:bg-[#080B16] flex-col items-center justify-center px-6 pt-32 pb-24 text-center text-slate-900 sm:px-8 lg:px-10 xl:px-0">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden dark:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(191,66,245,0.18)_0%,_rgba(44,106,165,0.12)_42%,_rgba(255,255,255,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,255,255,0.9)_0%,_rgba(243,244,246,0.88)_100%)]" />
      </div>
      {/* <div className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24)_0%,_rgba(14,23,45,0.85)_65%,_rgba(8,11,22,1)_100%)]" />
      </div> */}
      <motion.div
        className="mx-auto lg:mt-28 mt-2 mb-10 will-change-transform flex w-full max-w-6xl flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
        transition={{ duration: 0.8, ease: "easeOut" }}
        >
        <motion.span
          className="inline-flex items-center gap-2 will-change-transform rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Open Lab Network
        </motion.span>

        <motion.h1
          className="text-shadow-sm mt-6 max-w-4xl will-change-transform bg-gradient-to-r from-brand-base via-[#6e8df2] to-brand-secondary bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl md:text-6xl"
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
          className="mt-6 max-w-2xl text-base will-change-transform text-slate-600 sm:text-lg md:text-xl dark:text-muted-foreground"
          variants={heroVariants}
          transition={{ delay: 0.55, duration: 0.8 }}
          >
          Empowering Network Engineers through open labs, interactive documentation, and dynamic topology sharing.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col will-change-transform gap-4 sm:flex-row"
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
            className="rounded-xl border-slate-200/70 px-8 py-3 text-base font-semibold text-slate-700 hover:bg-white/70 hover:text-brand-foreground dark:border-muted-foreground/40 dark:text-muted-foreground dark:hover:bg-muted/10"
            >
            <Link href="/resources">View Documentation</Link>
          </Button>
        </motion.div>
      </motion.div>
      {/* <div className=""> */}
        <motion.section
          className="relative mt-4 will-change-transform w-full pb-24"
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
                className="relative will-change-transform"
                >
                <MarqueeLabs
                  labs={row}
                  pauseOnHover
                  direction={rowIndex % 2 === 0 ? "left" : "right"}
                  speed="slow"
                  />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16" />
              </motion.div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 bg-gradient-to-t from-neutral-50/95 via-white/92 to-transparent dark:from-[#080B16] dark:via-[#080B16]/96 dark:to-transparent backdrop-blur-[2px]" />
          <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
            <Button
              asChild
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition hover:bg-primary/90 hover:shadow-primary/60"
            >
              <Link href="/labs">View all Labs</Link>
            </Button>
          </div>
        </motion.section>
        {/* </div> */}
    </section>
  );
}

function LandingShowcase({ latestLabs }: { latestLabs: LatestLabCard[] }) {
  const labsToRender = (latestLabs.length ? latestLabs : []).slice(0, 3);

  return (
    
    <section className="relative z-10 mx-auto mt-12 mr-72  w-full max-w-6xl px-1 pb-20 text-slate-900 sm:px-6 lg:px-8 dark:text-white">
      <div className="absolute rounded-2xl inset-0 w-full -z-10 scale-105 blur-[80px] opacity-75 [mask-image:linear-gradient(to_bottom,rgba(255,255,255,1)_65%,transparent_100%)]">
        <div className="absolute inset-0 mt-64 bg-[radial-gradient(ellipse_at_top,_rgba(191,66,245,0.2)_0%,_rgba(44,106,165,0.12)_45%,_rgba(255,255,255,0.08)_100%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(101,117,255,0.22)_0%,_rgba(8,11,22,0.4)_55%,_rgba(8,11,22,1)_100%)]" />
      </div>

    {/* Main glow effect - softer and more spread */}
        <div className="absolute  rounded-2xl inset-0 -z-10 scale-105 w-full opacity-60 [mask-image:linear-gradient(to_bottom,rgba(255,255,255,1)_52%,transparent_100%)]">
          {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(191,66,245,0.18)_0%,_rgba(44,106,165,0.08)_45%,_rgba(255,255,255,0.65)_100%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18)_0%,rgba(8,11,22,0.8)_45%,rgba(5,8,17,1)_100%)]" /> */}
        </div>

      {/* Bottom fade - smooth transition to LandingStats */}
      <div className="pointer-events-none absolute w-full inset-x-0 bottom-0 z-10 h-80 bg-gradient-to-b transition-all duration-700 dark:via-[#080B16]/60 dark:to-[#080B16]" />

      <motion.div
        className="relative overflow-hidden will-change-transform rounded-[26px] border border-slate-200/70 bg-[linear-gradient(140deg,rgba(255,255,255,0.94)_0%,rgba(243,244,246,0.9)_100%)] px-8 py-10 shadow-brand-soft dark:border-white/10 dark:bg-[linear-gradient(140deg,rgba(19,24,42,0.95)_0%,rgba(12,16,28,0.92)_45%,rgba(9,11,21,0.97)_100%)] dark:shadow-[0_18px_55px_-32px_rgba(15,23,42,0.6)]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={showcaseContainer}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl flex-col gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground shadow-brand-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200/75 dark:shadow-none">
              <Sparkles className="size-3.5 text-brand-base dark:text-cyan-200" />
              <span>Multi-Vendor Ecosystem</span>
            </span>
            <h2 className="bg-gradient-to-r from-brand-base via-[#7b8cf2] to-brand-secondary bg-clip-text text-3xl font-extrabold leading-tight text-transparent sm:text-[38px]">
              Multi Vendor Labs
            </h2>
            <p className="text-sm text-slate-600 sm:text-base dark:text-slate-200/80">
              Showcase integrasi lintas vendor seperti Cisco, MikroTik, Fortinet, hingga Ruijie dalam satu platform dokumentasi modern lengkap dengan asistensi AI.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300/75">
              <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/5">Cisco & MikroTik</span>
              <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/5">Fortinet & Ruijie</span>
              <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/5">Automation & Observability</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4 text-xs text-slate-600 shadow-brand-ring sm:text-right dark:border-white/10 dark:bg-white/5 dark:text-slate-200/75 dark:shadow-none">
            <span className="font-semibold text-brand-foreground dark:text-slate-100/90">Live Topology Preview</span>
            <span>Dapatkan insight konfigurasi otomatis serta rekomendasi optimasi jaringan dari AI EtherDocs.</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mt-8 ls:mt-2 will-change-transform lg:md-2 px-2 grid lg:gap-2 gap-6 md:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18 } } }}
      >
        <motion.article
          className="relative h-84 will-change-transform overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(150deg,rgba(255,255,255,0.94)_0%,rgba(243,244,246,0.88)_100%)] p-[1px] shadow-brand-soft transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-[linear-gradient(150deg,rgba(17,24,39,0.94)_0%,rgba(24,32,52,0.9)_55%,rgba(16,21,35,0.96)_100%)] dark:shadow-[0_18px_60px_-32px_rgba(17,24,39,0.6)]"
          variants={showcaseCard}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative h-full rounded-[27px] bg-[radial-gradient(circle_at_top_left,_rgba(191,66,245,0.14)_0%,_rgba(255,255,255,0.9)_65%)] p-8 backdrop-blur-md dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22)_0%,rgba(11,17,33,0.96)_65%)]">
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500 dark:text-emerald-300/80">
              <span className="inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.45)] dark:bg-emerald-300 dark:shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              355 Online
            </div>
            <div className="mt-5 space-y-3">
              <h3 className="text-2xl font-semibold text-slate-900 sm:text-[30px] dark:text-white">Join the Discord Community!</h3>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-200/80">
                Ruang terbuka bagi engineer, network learners, dan developer untuk kolaborasi, AMA bersama expert, hingga sesi build bareng setiap minggu.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300/70">
              <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/5">Networking</span>
              <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/5">Automation</span>
              <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/5">Security</span>
            </div>
            <Button
              asChild
              className="mt-6 w-fit rounded-full bg-[#5865F2] px-6 py-2 text-sm font-semibold text-white shadow-[0_18px_42px_-24px_rgba(88,101,242,0.55)] transition hover:bg-[#4752c4]"
            >
              <Link href="https://discord.gg/netlabshowcase" target="_blank" rel="noreferrer">
                <span className="flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Join Discord
                </span>
              </Link>
            </Button>
          </div>
        </motion.article>

        <motion.article
          className="relative h-84 will-change-transform overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(150deg,rgba(255,255,255,0.95)_0%,rgba(245,243,255,0.9)_100%)] p-[1px] shadow-brand-soft transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-[linear-gradient(150deg,rgba(26,19,47,0.95)_0%,rgba(35,22,64,0.9)_55%,rgba(25,18,49,0.95)_100%)] dark:shadow-[0_18px_60px_-34px_rgba(76,29,149,0.6)]"
          variants={showcaseCard}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
        >
          <div className="relative h-full rounded-[27px] bg-[radial-gradient(circle_at_top_right,_rgba(191,66,245,0.18)_0%,_rgba(255,255,255,0.92)_65%)] p-8 backdrop-blur-md dark:bg-[radial-gradient(circle_at_top_right,rgba(147,51,234,0.26)_0%,rgba(12,16,32,0.96)_65%)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground dark:border-white/10 dark:bg-white/5 dark:text-indigo-200/75">
              <Cpu className="size-4" />
              Labs AI
            </div>
            <div className="mt-5 space-y-3">
              <h3 className="text-2xl font-semibold text-slate-900 sm:text-[30px] dark:text-white">Pamerin Projek dengan LAB Asistence AI</h3>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-200/80">
                Integrasikan hasil lab kamu dan biarkan AI mendokumentasikan secara otomatis, melakukan analisa konfigurasi, serta memberi rekomendasi peningkatan.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-brand-foreground/90 dark:text-indigo-200/80">
              <span className="rounded-full border border-brand-base/25 bg-brand-base/10 px-3 py-1 text-brand-foreground dark:border-indigo-300/35 dark:bg-indigo-400/15 dark:text-indigo-100">AI Runbook</span>
              <span className="rounded-full border border-brand-base/25 bg-brand-base/10 px-3 py-1 text-brand-foreground dark:border-purple-300/35 dark:bg-purple-400/15 dark:text-indigo-100">Config Diff Checker</span>
              <span className="rounded-full border border-brand-secondary/30 bg-brand-secondary/10 px-3 py-1 text-brand-foreground dark:border-sky-300/35 dark:bg-sky-400/15 dark:text-indigo-100">Auto Docs</span>
            </div>
            <Button
              asChild
              variant="secondary"
              className="mt-6 w-fit rounded-full border border-brand-base/40 bg-brand-base/20 px-6 py-2 text-sm font-semibold text-brand-foreground shadow-[0_18px_42px_-28px_rgba(191,66,245,0.55)] transition hover:bg-brand-base/25 hover:text-brand-base dark:border-indigo-400/35 dark:bg-indigo-500/20 dark:text-indigo-100 dark:shadow-[0_10px_36px_-24px_rgba(79,70,229,0.7)] dark:hover:bg-indigo-500/30 dark:hover:text-white"
            >
              <Link href="/labs">
                <span className="flex items-center gap-2">
                  <ArrowRight className="size-4" />
                  Explore Labs AI
                </span>
              </Link>
            </Button>
          </div>
        </motion.article>
      </motion.div>

      <motion.div
        className="mt-8 will-change-transform ls:mt-2 lg:md-2 px-2 grid lg:gap-2 gap-6 md:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18 } } }}
      >
        <motion.article
          className="relative will-change-transform overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(150deg,rgba(255,255,255,0.94)_0%,rgba(243,244,246,0.9)_100%)] p-[1px] shadow-brand-soft transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-[linear-gradient(150deg,rgba(21,27,43,0.96)_0%,rgba(30,40,62,0.9)_55%,rgba(18,24,44,0.95)_100%)] dark:shadow-[0_18px_60px_-34px_rgba(15,23,42,0.58)]"
          variants={showcaseCard}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative h-full rounded-[27px] bg-[radial-gradient(circle_at_top_left,_rgba(191,66,245,0.12)_0%,_rgba(255,255,255,0.9)_60%)] p-7 backdrop-blur-md dark:bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.22)_0%,rgba(13,18,32,0.95)_60%)]">
            <div className="inline-flex size-11 items-center justify-center rounded-full bg-white/80 text-brand-base shadow-brand-ring dark:bg-white/10 dark:text-white dark:shadow-none">
              <Github className="size-5" />
            </div>
            <div className="mt-5 space-y-3">
              <h3 className="text-xl font-semibold text-slate-900 sm:text-[26px] dark:text-white">NetlabShowcase on GitHub</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200/80">
                Eksplor repositori open-source yang menjadi inti platform dokumentasi, kolaborasi, serta workflow otomatisasi NetlabShowcase.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-6 w-fit rounded-full border-slate-200/80 bg-white/80 px-5 py-2 text-xs font-semibold text-brand-foreground transition hover:border-brand-base/50 hover:bg-white dark:border-white/18 dark:bg-white/10 dark:text-white dark:hover:border-white/28 dark:hover:bg-white/20"
            >
              <Link href="https://github.com/Centauryyy25/netlabshowcase-docs-platform" target="_blank" rel="noreferrer">
                <span className="flex items-center gap-2">
                  <Github className="size-4" />
                  Star on GitHub
                </span>
              </Link>
            </Button>
          </div>
        </motion.article>

        <motion.article
          className="relative will-change-transform overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(150deg,rgba(255,255,255,0.95)_0%,rgba(243,244,246,0.9)_100%)] p-[1px] shadow-brand-soft transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-[linear-gradient(150deg,rgba(19,32,48,0.94)_0%,rgba(15,23,42,0.94)_55%,rgba(10,15,28,0.98)_100%)] dark:shadow-[0_18px_60px_-34px_rgba(21,94,117,0.55)]"
          variants={showcaseCard}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
        >
          <div className="relative h-full rounded-[27px] bg-[radial-gradient(circle_at_top_right,_rgba(191,66,245,0.16)_0%,_rgba(255,255,255,0.92)_60%)] p-7 backdrop-blur-md dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.2)_0%,rgba(13,18,34,0.95)_60%)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">LAB Terkini</h3>
                <p className="text-sm text-slate-600 dark:text-slate-200/80">Menampilkan lab konfigurasi terbaru yang diverifikasi.</p>
              </div>
              <Button
                asChild
                variant="ghost"
                className="hidden h-8 items-center gap-2 rounded-full border border-brand-secondary/40 bg-brand-secondary/20 px-3 text-[11px] font-semibold text-brand-foreground transition hover:border-brand-secondary/60 hover:bg-brand-secondary/30 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-100 dark:hover:border-cyan-200/45 dark:hover:bg-cyan-300/15 sm:flex"
              >
                <Link href="/labs">
                  <span>See all Labs</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>

            <motion.div className="mt-5 will-change-transform grid gap-3 sm:grid-cols-3" variants={latestLabGrid}>
              {labsToRender.map((lab) => (
                <motion.div
                  key={lab.id}
                  variants={latestLabItem}
                  className="group relative will-change-transform flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.95)_0%,rgba(243,244,246,0.9)_100%)] p-4 transition duration-300 hover:-translate-y-1 hover:border-brand-base/30 dark:border-white/12 dark:bg-[linear-gradient(145deg,rgba(26,33,52,0.88)_0%,rgba(17,24,39,0.95)_55%,rgba(15,23,42,1)_100%)] dark:hover:border-white/18"
                >
                  <Link href={`/labs/${lab.id}`} className="flex h-full flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-slate-200/80 bg-white/80 dark:border-white/12 dark:bg-slate-900/80">
                        <AvatarImage src={lab.authorImage ?? undefined} alt={lab.authorName ?? lab.title} />
                        <AvatarFallback className="text-sm font-semibold text-brand-foreground dark:text-white/80">
                          {getAvatarInitial(lab.authorName, lab.title)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-secondary dark:text-cyan-200/80">
                          {lab.category}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 transition group-hover:text-brand-base dark:text-white dark:group-hover:text-cyan-100">
                          {lab.title}
                        </h4>
                      </div>
                    </div>
                    <span className="mt-auto flex items-center gap-2 text-[11px] font-medium text-brand-secondary transition group-hover:text-brand-base dark:text-cyan-200/80 dark:group-hover:text-cyan-100">
                      Buka lab
                      <ArrowRight className="size-3" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.article>
      </motion.div>
    </section>
  );
}
function getAvatarInitial(name: string | null, fallback: string) {
  const source = (name ?? fallback ?? "").trim();

  if (!source.length) {
    return "N";
  }

  return source[0]!.toUpperCase();
}

function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/80 py-8 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-background/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center text-xs text-slate-600 sm:flex-row sm:text-sm dark:text-muted-foreground">
        <p className="text-slate-500 dark:text-muted-foreground">&copy; {new Date().getFullYear()} NetLabShowcase. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/help" className="transition-colors hover:text-brand-base dark:hover:text-primary">
            Support
          </Link>
          <Link href="/resources" className="transition-colors hover:text-brand-base dark:hover:text-primary">
            Documentation
          </Link>
          <Link href="/sign-up" className="transition-colors hover:text-brand-base dark:hover:text-primary">
            Join the community
          </Link>
        </div>
      </div>
    </footer>
  );
}
