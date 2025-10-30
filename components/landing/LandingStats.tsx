"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "48+", label: "Verified Lab Topologies" },
  { value: "100%", label: "Tested on Multi Environment" },
  { value: "350+", label: "Technical Docs" },
];

export function LandingStats() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#080B16]/60 via-[#080B16]/95 to-[#0a0f1f]" />

      <div className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(circle_at_center,white,transparent_75%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(101,117,255,0.18)_0%,_rgba(8,11,22,0.05)_45%,_rgba(8,11,22,0.9)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center text-white">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ staggerChildren: 0.2, delayChildren: 0.05 }}
          className="grid grid-cols-1 gap-12 sm:grid-cols-3"
        >
          {stats.map((item) => (
            <motion.div
              key={item.label}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="group flex flex-col items-center space-y-3"
            >
              <span className="relative font-extrabold text-4xl tracking-tight drop-shadow-sm transition duration-300 group-hover:text-indigo-400 group-hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.35)] lg:text-5xl">
                {item.value}
              </span>
              <span className="text-sm font-medium text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#080B16]/95 via-[#080B16]/60 to-transparent z-0" />

     </section>
  );
}
