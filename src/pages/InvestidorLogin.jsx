import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  Landmark,
  Sparkles,
  ShieldCheck,
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
      className="absolute rounded-full bg-cyan-300/30 blur-[1px]"
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
          className="absolute h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl"
        />

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative rounded-[30px] border border-white/10 bg-white/5 p-8 shadow-[0_0_70px_rgba(34,211,238,0.14)]"
        >
          <img
            src={logo}
            alt="CARFEX"
            className="h-28 w-auto object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.22)]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            PORTAL DO INVESTIDOR
          </p>
          <p className="mt-2 text-lg text-white">Carregando sua carteira...</p>
        </motion.div>

        <div className="mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "220%" }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-24 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400"
          />
        </div>
      </div>
    </motion.div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20";

export default function InvestidorLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [rotate, setRotate] = useState({ rx: 0, ry: 0 });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function entrar(e) {
    e.preventDefault();
    setErro("");

    try {
      const response = await fetch(`${API_URL}/investidores/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao fazer login do investidor");
      }

      localStorage.setItem("carfex_investidor_token", data.token);
      localStorage.setItem("carfex_investidor", JSON.stringify(data.investidor));

      setEntrando(true);

      setTimeout(() => {
        navigate("/investidor/dashboard");
      }, 1000);
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao fazer login");
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
      background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(34,211,238,0.20), transparent 22%)`,
    }),
    [mouse]
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.14),_transparent_26%)]" />

      <div className="absolute inset-0 overflow-hidden">
        <FloatingParticle delay={0} duration={5} left="12%" top="18%" size={6} />
        <FloatingParticle delay={0.8} duration={6} left="22%" top="72%" size={8} />
        <FloatingParticle delay={1.3} duration={5.6} left="78%" top="20%" size={7} />
        <FloatingParticle delay={2.1} duration={6.4} left="88%" top="68%" size={9} />
        <FloatingParticle delay={1.8} duration={5.3} left="52%" top="12%" size={5} />
        <FloatingParticle delay={2.7} duration={6.1} left="64%" top="82%" size={7} />
      </div>

      <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />

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
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_25%,transparent_65%,rgba(34,211,238,0.05))]" />

          <div className="grid min-h-[680px] lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative flex flex-col justify-between border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300"
                >
                  <Sparkles className="h-4 w-4" />
                  Portal premium do investidor
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 0.6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-10 flex justify-center lg:justify-start"
                >
                  <div className="group relative">
                    <div className="absolute -inset-5 rounded-[34px] bg-cyan-400/10 blur-2xl transition-all duration-500 group-hover:bg-cyan-400/20" />
                    <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-cyan-400/10 via-transparent to-sky-400/10" />
                    <div className="relative rounded-[34px] border border-white/10 bg-white/5 p-8 shadow-[0_0_70px_rgba(34,211,238,0.12)]">
                      <img
                        src={logo}
                        alt="CARFEX"
                        className="h-32 w-auto object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.22)] md:h-36"
                      />
                    </div>
                  </div>
                </motion.div>

                <h1 className="max-w-xl text-4xl font-bold leading-tight text-white md:text-6xl">
                  Acompanhe sua carteira com visão{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
                    premium
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                  Consulte seus veículos, acompanhe status de locação, receitas
                  semanais, resultados mensais e o desempenho da sua operação
                  com total transparência.
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-slate-300 shadow-inner shadow-cyan-500/5">
                  Portal exclusivo para investidores com leitura clara,
                  segurança e visão estratégica da carteira.
                </div>
              </div>
            </div>

            <div className="relative flex items-center p-8 lg:p-12">
              <div className="w-full">
                <div className="mb-3 text-sm font-medium text-cyan-300">
                  Área exclusiva
                </div>

                <h2 className="text-3xl font-bold text-white md:text-5xl">
                  Entrar no portal
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-400">
                  Use seu email e sua senha para acessar o ambiente do
                  investidor e visualizar seus ativos com segurança.
                </p>

                <form onSubmit={entrar} className="mt-8 space-y-4">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email do investidor"
                      className={`${inputClass} pl-11`}
                    />
                  </div>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      name="senha"
                      type="password"
                      value={form.senha}
                      onChange={handleChange}
                      placeholder="Senha"
                      className={`${inputClass} pl-11`}
                    />
                  </div>

                  {erro && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {erro}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-white px-6 py-5 text-lg font-semibold text-slate-950 shadow-[0_20px_50px_rgba(255,255,255,0.12)] transition hover:bg-slate-100"
                  >
                    <span className="absolute inset-0 -translate-x-[120%] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.75),transparent)] transition duration-1000 group-hover:translate-x-[120%]" />
                    <span className="relative z-10 flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5" />
                      Entrar no portal do investidor
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </button>

                  <Link
                    to="/"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para a tela inicial
                  </Link>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-400">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Landmark className="h-4 w-4" />
                      Portal de acompanhamento patrimonial CARFEX
                    </div>
                    <p className="mt-2">
                      Segurança, transparência e visão completa dos veículos
                      vinculados ao seu investimento.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 rounded-[38px] border border-cyan-400/10" />

          <AnimatePresence>{entrando && <LoadingOverlay />}</AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

