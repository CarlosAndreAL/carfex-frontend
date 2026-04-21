import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Building2,
  ShieldCheck,
  Clock3,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

function formatarDataHora(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

export default function Layout({ title = "Painel", children }) {
  const navigate = useNavigate();
  const auth = useAuth ? useAuth() : {};
  const user = auth?.user || null;
  const logout = auth?.logout;

  const [agora, setAgora] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nomeExibicao = useMemo(() => {
    if (user?.nome) return user.nome;
    if (user?.name) return user.name;
    return "Equipe interna";
  }, [user]);

  const perfilExibicao = useMemo(() => {
    if (user?.perfil === "admin") return "Administrador";
    if (user?.perfil) return user.perfil;
    return "Operação";
  }, [user]);

  function handleLogout() {
    try {
      if (typeof logout === "function") {
        logout();
      }

      localStorage.removeItem("user");
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      localStorage.removeItem("perfil");
      localStorage.removeItem("carfex_user");
      localStorage.removeItem("carfex_token");
      sessionStorage.clear();

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Erro ao sair:", error);
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              />

              <motion.div
                initial={{ x: -320, opacity: 0.6 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0.6 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="fixed left-0 top-0 z-[60] h-screen w-[290px] max-w-[85vw] overflow-y-auto border-r border-white/10 bg-slate-950 shadow-2xl lg:hidden"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
                      Menu CARFEX
                    </span>
                  </div>

                  <button
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <Sidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[180px] bg-gradient-to-b from-slate-700/70 via-slate-800/35 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[1px] bg-white/10" />

          <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/45 backdrop-blur-2xl">
            <div className="flex flex-col gap-4 px-4 py-5 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-800/60 text-white shadow-lg shadow-slate-950/30 transition hover:bg-slate-700/70 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-w-0"
                >
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Painel corporativo
                  </div>

                  <h1 className="truncate text-2xl font-bold tracking-tight text-white md:text-4xl">
                    {title}
                  </h1>

                  <p className="mt-1 text-sm text-slate-300">
                    Sistema interno de gestão da CARFEX
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center"
              >
                <div className="rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 shadow-lg shadow-sky-950/20 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.95)]" />

                    <div className="leading-tight">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Sistema
                      </p>
                      <p className="text-sm font-semibold text-white">
                        Operando normalmente
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 shadow-lg shadow-slate-950/30 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-4 w-4 text-sky-300" />

                    <div className="leading-tight">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Data e hora
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {formatarDataHora(agora)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 shadow-lg shadow-slate-950/30 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-cyan-300" />

                    <div className="leading-tight">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Unidade
                      </p>
                      <p className="text-sm font-semibold text-white">
                        CARFEX
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 shadow-lg shadow-slate-950/30 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />

                    <div className="leading-tight">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Sessão
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {nomeExibicao} • {perfilExibicao}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </motion.button>
              </motion.div>
            </div>
          </header>

          <div className="relative z-10 flex-1 px-4 py-4 lg:px-6 lg:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}