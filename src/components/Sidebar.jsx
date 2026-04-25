import { Landmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CarFront,
  ReceiptText,
  FileWarning,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const menuItems = [
  { to: "/investidores", label: "Investidores", icon: Landmark, adminOnly: false },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { to: "/clientes", label: "Clientes", icon: Users, adminOnly: false },
  { to: "/veiculos", label: "Veículos", icon: CarFront, adminOnly: false },
  { to: "/locacoes", label: "Locações", icon: ReceiptText, adminOnly: false },
  { to: "/repasses-investidores", label: "Repasses", icon: Wallet, adminOnly: false },
  { to: "/multas", label: "Multas", icon: FileWarning, adminOnly: false },
];

export default function Sidebar({ mobile = false, onNavigate = null }) {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.perfil === "admin";

  function handleNavigate() {
    if (typeof onNavigate === "function") {
      onNavigate();
    }
  }

  return (
    <aside
      className={`${
        mobile
          ? "flex h-full w-full flex-col bg-slate-950"
          : "hidden h-screen w-[280px] shrink-0 border-r border-white/10 bg-slate-950/95 px-5 py-6 lg:flex"
      }`}
    >
      <div className={mobile ? "px-5 py-6" : ""}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="group relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-sky-500/0 blur-2xl transition-all duration-500 group-hover:bg-sky-500/20" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 transition-all duration-300 group-hover:border-sky-400/70 group-hover:bg-slate-900/80 group-hover:shadow-[0_0_35px_rgba(56,189,248,0.22)]">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-cyan-400/10 opacity-80 transition duration-300 group-hover:opacity-100" />

              <div className="relative flex justify-center">
                <img
                  src={logo}
                  alt="CARFEX"
                  className={`${mobile ? "w-36" : "w-40"} transition duration-300 group-hover:scale-105 drop-shadow-[0_0_18px_rgba(56,189,248,0.22)]`}
                />
              </div>
            </div>
          </motion.div>

          <div className="mt-4 text-center">
            <p className="text-sm font-semibold tracking-wide text-white">CARFEX</p>
            <p className="text-xs text-slate-400">Locação de veículos</p>
          </div>
        </motion.div>

        <div className="mb-4">
          <p className="px-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Navegação
          </p>
        </div>

        <nav className="space-y-2">
          {menuItems
            .filter((item) => (item.adminOnly ? isAdmin : true))
            .map((item, index) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;

              return (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * index }}
                >
                  <Link
                    to={item.to}
                    onClick={handleNavigate}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                      active
                        ? "border border-sky-400/20 bg-gradient-to-r from-sky-500/15 via-cyan-400/10 to-transparent text-sky-300 shadow-lg shadow-sky-500/10"
                        : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.8)]" />
                    )}

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        active
                          ? "bg-sky-400/10 text-sky-300"
                          : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="truncate">{item.label}</span>
                      <ChevronRight
                        className={`h-4 w-4 transition ${
                          active
                            ? "translate-x-0 text-sky-300"
                            : "text-slate-500 group-hover:translate-x-0.5 group-hover:text-slate-300"
                        }`}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        >
          <div className="bg-gradient-to-r from-sky-500/10 via-cyan-400/10 to-blue-500/10 px-4 py-4">
            <p className="text-xs text-slate-400">
              Gestão eficiente gera resultados reais 🚀
            </p>

            <h3 className="mt-2 bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-base font-semibold leading-7 text-transparent">
              “Quem controla bem hoje, cresce mais rápido amanhã.”
            </h3>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}