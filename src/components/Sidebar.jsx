import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CarFront,
  ReceiptText,
  FileWarning,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const menuItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { to: "/clientes", label: "Clientes", icon: Users, adminOnly: false },

  // AQUI FOI CORRIGIDO:
  { to: "/veiculos", label: "Veículos", icon: CarFront, adminOnly: false },

  { to: "/locacoes", label: "Locações", icon: ReceiptText, adminOnly: false },
  { to: "/multas", label: "Multas", icon: FileWarning, adminOnly: false },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.perfil === "admin";

  return (
    <aside className="hidden w-[280px] border-r border-white/10 bg-slate-950/95 px-5 py-6 md:block">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="logo-wrapper flex justify-center rounded-3xl border border-white/10 bg-white/5 p-4">
          <img src={logo} alt="CARFEX" className="logo-img w-40" />
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-white">CARFEX</p>
          <p className="text-xs text-slate-400">Locação de veículos</p>
        </div>
      </motion.div>

      <nav className="space-y-2">
        {menuItems
          .filter((item) => (item.adminOnly ? isAdmin : true))
          .map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-sky-500/15 text-sky-300 shadow-lg shadow-sky-500/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <p className="text-xs text-slate-400">
          Gestão eficiente gera resultados reais 🚀
        </p>

        <h3 className="mt-2 bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-base font-semibold leading-7 text-transparent">
          “Quem controla bem hoje, cresce mais rápido amanhã.”
        </h3>
      </motion.div>
    </aside>
  );
}