import { motion } from "framer-motion";

export function GlassPanel({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>}
    </div>
  );
}

export function MetricCard({ label, value, color = "text-sky-400" }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur"
    >
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${color}`}>{value}</p>
    </motion.div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 ${className}`}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 ${className}`}
    >
      {children}
    </select>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 shadow-md transition hover:-translate-y-0.5 hover:bg-slate-100 ${className}`}
    >
      {children}
    </button>
  );
}

export function DangerButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-2xl bg-red-500 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-red-400 ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "sky" }) {
  const variants = {
    sky: "bg-sky-500/15 text-sky-300",
    cyan: "bg-cyan-500/15 text-cyan-300",
    green: "bg-emerald-500/15 text-emerald-300",
    yellow: "bg-amber-500/15 text-amber-300",
    red: "bg-red-500/15 text-red-300",
    gray: "bg-white/10 text-slate-300",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}