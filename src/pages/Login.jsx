import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  LockKeyhole,
  UserRound,
  Building2,
} from "lucide-react";
import logo from "../assets/logo.png";
import API_URL from "../config/api";

function FloatingParticle({ delay, duration, left, top, size }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.12, 0.32, 0.12],
        y: [0, -18, 0],
      }}
      transition={{
        delay,
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute rounded-full bg-sky-300/30 blur-[1px]"
      style={{
        left,
        top,
        width: size,
        height: size,
      }}
    />
  );
}

function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/70"
    >
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-40 w-40 rounded-full bg-sky-400/10 blur-3xl"
        />

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative rounded-[30px] border border-white/10 bg-white/5 p-8 shadow-[0_0_70px_rgba(56,189,248,0.14)]"
        >
          <img
            src={logo}
            alt="CARFEX"
            className="h-28 w-auto object-contain drop-shadow-[0_0_24px_rgba(56,189,248,0.22)]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
            CARFEX
          </p>
          <p className="mt-2 text-lg text-white">Validando acesso interno...</p>
        </motion.div>

        <div className="mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "220%" }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-24 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400"
          />
        </div>
      </div>
    </motion.div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20";

export default function Login() {
  const navigate = useNavigate();

  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [rotate, setRotate] = useState({ rx: 0, ry: 0 });
  const [entrando, setEntrando] = useState(false);
  const [mostrarLoginAdmin, setMostrarLoginAdmin] = useState(false);
  const [erroAdmin, setErroAdmin] = useState("");
  const [adminForm, setAdminForm] = useState({
    login: "",
    senha: "",
  });

  function handleAdminChange(e) {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  }

  async function entrarAdmin(e) {
    e.preventDefault();
    setErroAdmin("");

    try {
      const response = await fetch(`${API_URL}/admin-auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao fazer login interno");
      }

      localStorage.setItem("carfex_token", data.token);
      localStorage.setItem("carfex_user", JSON.stringify(data.user));

      setEntrando(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error(error);
      setErroAdmin(error.message || "Erro ao fazer login interno");
    }
  }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const x = px * 100;
    const y = py * 100;

    const ry = (px - 0.5) * 10;
    const rx = -(py - 0.5) * 10;

    setMouse({ x, y });
    setRotate({ rx, ry });
  }

  function handleMouseLeave() {
    setRotate({ rx: 0, ry: 0 });
    setMouse({ x: 50, y: 50 });
  }

  const glowStyle = useMemo(
    () => ({
      background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(56,189,248,0.20), transparent 22%)`,
    }),
    [mouse]
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.14),_transparent_26%)]" />

      <div className="absolute inset-0 overflow-hidden">
        <FloatingParticle delay={0} duration={5} left="12%" top="18%" size={6} />
        <FloatingParticle delay={0.8} duration={6} left="22%" top="72%" size={8} />
        <FloatingParticle delay={1.3} duration={5.6} left="78%" top="20%" size={7} />
        <FloatingParticle delay={2.1} duration={6.4} left="88%" top="68%" size={9} />
        <FloatingParticle delay={1.8} duration={5.3} left="52%" top="12%" size={5} />
        <FloatingParticle delay={2.7} duration={6.1} left="64%" top="82%" size={7} />
      </div>

      <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1600px) rotateX(${rotate.rx}deg) rotateY(${rotate.ry}deg)`,
        }}
        className="relative z-10 w-full max-w-5xl transition-transform duration-150"
      >
        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(2,8,23,0.85)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0" style={glowStyle} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_25%,transparent_65%,rgba(56,189,248,0.05))]" />

          <div className="grid min-h-[680px] lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative flex flex-col justify-between border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-300"
                >
                  <Sparkles className="h-4 w-4" />
                  Plataforma premium CARFEX
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 0.6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-10 flex justify-center lg:justify-start"
                >
                  <div className="group relative">
                    <div className="absolute -inset-5 rounded-[34px] bg-sky-400/10 blur-2xl transition-all duration-500 group-hover:bg-sky-400/20" />
                    <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-sky-400/10 via-transparent to-cyan-400/10" />
                    <div className="relative rounded-[34px] border border-white/10 bg-white/5 p-8 shadow-[0_0_70px_rgba(56,189,248,0.12)]">
                      <img
                        src={logo}
                        alt="CARFEX"
                        className="h-32 w-auto object-contain drop-shadow-[0_0_24px_rgba(56,189,248,0.22)] md:h-36"
                      />
                    </div>
                  </div>
                </motion.div>

                <h1 className="max-w-xl text-4xl font-bold leading-tight text-white md:text-6xl">
                  Gestão moderna para a operação da{" "}
                  <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                    CARFEX
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                  Controle clientes, veículos, contratos, multas e locações em
                  um painel interno premium e ofereça transparência total aos
                  investidores da sua operação.
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-slate-300 shadow-inner shadow-sky-500/5">
                  Plataforma com acesso separado para equipe interna e portal do
                  investidor.
                </div>
              </div>
            </div>

            <div className="relative flex items-center p-8 lg:p-12">
              <div className="w-full">
                <div className="mb-3 text-sm font-medium text-sky-300">
                  Acesso seguro
                </div>

                <h2 className="text-3xl font-bold text-white md:text-5xl">
                  Escolha seu acesso
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-400">
                  A área interna da empresa agora exige autenticação. O portal do
                  investidor permanece separado para garantir segurança e
                  organização total do sistema.
                </p>

                <div className="mt-8 space-y-4">
                  <motion.button
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setMostrarLoginAdmin((prev) => !prev)}
                    className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:border-sky-400/20 hover:bg-white/10"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Building2 className="h-5 w-5" />
                      Área interna da empresa
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {mostrarLoginAdmin && (
                      <motion.form
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        onSubmit={entrarAdmin}
                        className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="relative">
                          <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            name="login"
                            value={adminForm.login}
                            onChange={handleAdminChange}
                            placeholder="Login interno"
                            className={`${inputClass} pl-11`}
                          />
                        </div>

                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            name="senha"
                            type="password"
                            value={adminForm.senha}
                            onChange={handleAdminChange}
                            placeholder="Senha"
                            className={`${inputClass} pl-11`}
                          />
                        </div>

                        {erroAdmin && (
                          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {erroAdmin}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Entrar na área interna
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <Link
                    to="/investidor/login"
                    className="flex w-full items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/20"
                  >
                    Acesso do investidor
                  </Link>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-400">
                    Área administrativa protegida • portal do investidor separado •
                    experiência premium CARFEX
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 rounded-[38px] border border-sky-400/10" />

          <AnimatePresence>{entrando && <LoadingOverlay />}</AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

