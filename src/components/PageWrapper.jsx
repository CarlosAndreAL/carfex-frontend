import { motion } from "framer-motion";

export default function PageWrapper({ children, maxWidth = "max-w-7xl" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.992 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="relative min-h-[calc(100vh-140px)] overflow-hidden rounded-[28px] bg-slate-950 text-slate-100"
    >
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.08),_transparent_20%)]" />

      <div className="absolute -left-20 top-8 h-52 w-52 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute right-0 top-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-6 left-1/3 h-44 w-44 rounded-full bg-sky-400/5 blur-3xl" />

      <div className={`relative z-[2] mx-auto ${maxWidth} px-6 py-8 lg:px-8`}>
        {children}
      </div>
    </motion.div>
  );
}