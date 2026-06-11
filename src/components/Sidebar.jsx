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
  Landmark,
  BarChart3,
  IdCard,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import API_URL from "../config/api";
import logo from "../assets/logo.png";

export default function Sidebar({ mobile = false, onNavigate = null }) {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.perfil === "admin";
  const [qtdAnalise, setQtdAnalise] = useState(0);

  async function buscarComprovantes() {
    try {
      const res = await fetch(
        `${API_URL}/pagamentos-motorista/comprovantes/analise`
      );
      const data = await res.json();
      setQtdAnalise(Array.isArray(data) ? data.length : 0);
    } catch {
      setQtdAnalise(0);
    }
  }

  useEffect(() => {
    buscarComprovantes();
    const interval = setInterval(buscarComprovantes, 10000);
    return () => clearInterval(interval);
  }, []);

  function handleNavigate() {
    if (typeof onNavigate === "function") onNavigate();
  }

  const menuItems = [
    { to: "/motoristas", label: "Motoristas", icon: IdCard },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/clientes", label: "Clientes", icon: Users },
    { to: "/veiculos", label: "Veículos", icon: CarFront },
    { to: "/locacoes", label: "Locações", icon: ReceiptText },
    { to: "/multas", label: "Multas", icon: FileWarning },
    { to: "/pagamentos-motorista", label: "Pagamentos", icon: Wallet },
    {
      to: "/comprovantes",
      label: "Comprovantes",
      icon: ShieldCheck,
      adminOnly: true,
      badge: qtdAnalise,
    },
    { to: "/investidores", label: "Investidores", icon: Landmark },
    { to: "/repasses-investidores", label: "Repasses", icon: Wallet },
    { to: "/relatorios", label: "Financeiro", icon: BarChart3, adminOnly: true },
  ];

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-full flex-col bg-slate-950"
          : "hidden h-screen w-[280px] shrink-0 border-r border-white/10 bg-slate-950/95 px-5 py-6 lg:flex"
      }
    >
      <div className={mobile ? "px-5 py-6" : ""}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="group relative">
            <div className="absolute inset-0 rounded-3xl blur-2xl group-hover:bg-cyan-500/20" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-4 group-hover:border-cyan-400/70">
              <div className="flex justify-center">
                <img src={logo} className="w-40" alt="CARFEX" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-white">CARFEX</p>
            <p className="text-xs text-slate-400">Sistema premium</p>
          </div>
        </motion.div>

        <nav className="space-y-2">
          {menuItems
            .filter((item) => (item.adminOnly ? isAdmin : true))
            .map((item) => {
              const Icon = item.icon;
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(`${item.to}/`);

              return (
                <motion.div key={item.to} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Link
                    to={item.to}
                    onClick={handleNavigate}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                      active
                        ? "border border-cyan-400/20 bg-cyan-500/15 text-cyan-300"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                      <Icon className="h-4 w-4" />
                    </div>

                    <span className="flex-1">{item.label}</span>

                    {item.badge > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white"
                      >
                        {item.badge}
                      </motion.div>
                    )}

                    <ChevronRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
        </nav>

        <motion.div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Sistema inteligente em operação ⚡</p>
          <h3 className="mt-2 text-sm font-semibold text-cyan-300">
            Quem controla os números, controla o jogo.
          </h3>
        </motion.div>
      </div>
    </aside>
  );
}