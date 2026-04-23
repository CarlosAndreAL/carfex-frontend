import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CarFront,
  Wallet,
  CalendarDays,
  TrendingUp,
  ShieldCheck,
  LogOut,
  Landmark,
  CircleDollarSign,
  BadgeCheck,
  Clock3,
  BarChart3,
  PieChart,
  Sparkles,
  BriefcaseBusiness,
} from "lucide-react";
import logo from "../assets/logo.png";
import API_URL from "../config/api";

function brl(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function formatarDataHora(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function normalizarStatus(status) {
  return String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function StatusBadge({ status }) {
  const s = normalizarStatus(status);

  if (s === "ALUGADO") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Alugado
      </span>
    );
  }

  if (s === "DISPONIVEL") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
        <span className="h-2 w-2 rounded-full bg-sky-400" />
        Disponível
      </span>
    );
  }

  if (s === "MANUTENCAO") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        Manutenção
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      {status || "Sem status"}
    </span>
  );
}

function CardIndicador({ icon: Icon, titulo, valor, subtitulo, destaque = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[28px] border p-5 shadow-[0_10px_40px_rgba(2,8,23,0.35)] ${
        destaque
          ? "border-cyan-400/15 bg-cyan-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            {titulo}
          </p>
          <p className="mt-3 text-3xl font-bold text-white">{valor}</p>
          <p className="mt-2 text-sm text-slate-400">{subtitulo}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            destaque
              ? "border border-cyan-300/10 bg-cyan-300/10 text-cyan-200"
              : "border border-cyan-400/10 bg-cyan-400/10 text-cyan-300"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function BarraProgresso({ valor }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400"
        style={{ width: `${Math.max(0, Math.min(100, valor))}%` }}
      />
    </div>
  );
}

export default function InvestidorDashboard() {
  const navigate = useNavigate();

  const [agora, setAgora] = useState(new Date());
  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const investidor = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("carfex_investidor") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("carfex_investidor_token");
    const investidorSalvo = localStorage.getItem("carfex_investidor");

    if (!token || !investidorSalvo) {
      navigate("/investidor/login", { replace: true });
      return;
    }

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const response = await fetch(`${API_URL}/investidores/me/veiculos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(data.erro || "Erro ao carregar veículos do investidor");
        }

        setVeiculos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setErro(error.message || "Erro ao carregar dashboard do investidor");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [navigate]);

  function sair() {
    localStorage.removeItem("carfex_investidor_token");
    localStorage.removeItem("carfex_investidor");
    navigate("/investidor/login", { replace: true });
  }

  const nomeInvestidor = investidor?.nome || "Investidor";

  const totalVeiculos = veiculos.length;

  const veiculosAlugados = veiculos.filter(
    (v) => normalizarStatus(v.status) === "ALUGADO"
  );

  const veiculosDisponiveis = veiculos.filter(
    (v) => normalizarStatus(v.status) === "DISPONIVEL"
  );

  const veiculosManutencao = veiculos.filter(
    (v) => normalizarStatus(v.status) === "MANUTENCAO"
  );

  const receitaSemanalTotal = veiculos.reduce(
    (total, v) => total + Number(v.valorSemanalPadrao || 0),
    0
  );

  const receitaMensalTotal = receitaSemanalTotal * 4;

  const receitaSemanalEmOperacao = veiculosAlugados.reduce(
    (total, v) => total + Number(v.valorSemanalPadrao || 0),
    0
  );

  const receitaMensalEmOperacao = receitaSemanalEmOperacao * 4;

  const ticketSemanalMedio =
    totalVeiculos > 0 ? receitaSemanalTotal / totalVeiculos : 0;

  const taxaOcupacao =
    totalVeiculos > 0 ? (veiculosAlugados.length / totalVeiculos) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.14),_transparent_26%)]" />
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <header className="mb-6 overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_70px_rgba(2,8,23,0.5)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_25%,transparent_65%,rgba(34,211,238,0.05))]" />

            <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                  <img
                    src={logo}
                    alt="CARFEX"
                    className="h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.18)]"
                  />
                </div>

                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Portal premium do investidor
                  </div>

                  <h1 className="text-2xl font-bold md:text-4xl">
                    Bem-vindo, {nomeInvestidor}
                  </h1>

                  <p className="mt-1 text-sm text-slate-300">
                    Acompanhe sua carteira, desempenho financeiro e status
                    operacional dos veículos vinculados ao seu investimento.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-4 w-4 text-cyan-300" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Data e hora
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {formatarDataHora(agora)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BriefcaseBusiness className="h-4 w-4 text-cyan-300" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Carteira
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {totalVeiculos} veículo(s)
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={sair}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          </header>

          {erro && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">
              Carregando portal do investidor...
            </div>
          ) : (
            <>
              <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <CardIndicador
                  icon={CarFront}
                  titulo="Veículos totais"
                  valor={totalVeiculos}
                  subtitulo="Total de ativos vinculados à sua carteira"
                />

                <CardIndicador
                  icon={Wallet}
                  titulo="Receita semanal"
                  valor={brl(receitaSemanalTotal)}
                  subtitulo="Soma semanal dos veículos da carteira"
                  destaque
                />

                <CardIndicador
                  icon={TrendingUp}
                  titulo="Receita mensal"
                  valor={brl(receitaMensalTotal)}
                  subtitulo="Projeção mensal da carteira"
                />

                <CardIndicador
                  icon={PieChart}
                  titulo="Taxa de ocupação"
                  valor={`${taxaOcupacao.toFixed(0)}%`}
                  subtitulo="Percentual de ativos em operação"
                />
              </section>

              <section className="mb-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.35)]"
                >
                  <div className="mb-5">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      Panorama financeiro
                    </div>

                    <h2 className="text-2xl font-bold text-white">
                      Desempenho da carteira
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Leitura consolidada dos ativos vinculados ao seu perfil.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                      <p className="text-sm text-slate-400">
                        Receita semanal em operação
                      </p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {brl(receitaSemanalEmOperacao)}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Considerando somente ativos alugados.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                      <p className="text-sm text-slate-400">
                        Receita mensal em operação
                      </p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {brl(receitaMensalEmOperacao)}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Base mensal dos ativos atualmente alugados.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                      <p className="text-sm text-slate-400">
                        Ticket semanal médio
                      </p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {brl(ticketSemanalMedio)}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Média semanal por ativo da carteira.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-cyan-400/10 bg-cyan-400/10 p-5">
                      <p className="text-sm text-cyan-100/80">
                        Projeção mensal estimada
                      </p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {brl(receitaMensalTotal)}
                      </p>
                      <p className="mt-2 text-sm text-cyan-100/80">
                        Estimativa mensal total da sua carteira atual.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.35)]"
                >
                  <div className="mb-5">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Visão executiva
                    </div>

                    <h2 className="text-2xl font-bold text-white">
                      Resumo da operação
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Indicadores rápidos do desempenho atual da carteira.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                      <p className="text-sm text-slate-400">Ativos operando</p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {veiculosAlugados.length}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Veículos atualmente alugados e em operação.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                      <p className="text-sm text-slate-400">Ativos disponíveis</p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {veiculosDisponiveis.length}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Veículos disponíveis para nova locação.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                      <p className="text-sm text-slate-400">Em manutenção</p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {veiculosManutencao.length}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Veículos temporariamente fora de operação.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-400">Taxa de ocupação</p>
                        <p className="text-sm font-semibold text-white">
                          {taxaOcupacao.toFixed(0)}%
                        </p>
                      </div>
                      <BarraProgresso valor={taxaOcupacao} />
                    </div>
                  </div>
                </motion.div>
              </section>

              <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.35)]">
                <div className="mb-5">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Carteira detalhada
                  </div>

                  <h2 className="text-2xl font-bold text-white">
                    Meus veículos
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Visualização completa dos veículos vinculados ao seu perfil.
                  </p>
                </div>

                {veiculos.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-slate-400">
                    Nenhum veículo vinculado à sua carteira no momento.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {veiculos.map((veiculo, index) => {
                      const receitaSemanalVeiculo = Number(
                        veiculo.valorSemanalPadrao || 0
                      );
                      const receitaMensalVeiculo = receitaSemanalVeiculo * 4;

                      return (
                        <motion.div
                          key={veiculo.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className="rounded-[28px] border border-white/10 bg-slate-900/50 p-5"
                        >
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex-1">
                              <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h3 className="text-xl font-semibold text-white">
                                  {veiculo.marca} {veiculo.modelo}
                                </h3>
                                <StatusBadge status={veiculo.status} />
                              </div>

                              <div className="grid gap-3 text-sm text-slate-400 md:grid-cols-2">
                                <p>Placa: {veiculo.placa || "-"}</p>
                                <p>Ano/modelo: {veiculo.anoModelo || "-"}</p>
                                <p>Renavam: {veiculo.renavam || "-"}</p>
                                <p>Chassi: {veiculo.chassi || "-"}</p>
                                <p>Franquia: {veiculo.franquia ? brl(veiculo.franquia) : "-"}</p>
                                <p>Caução padrão: {veiculo.caucaoPadrao ? brl(veiculo.caucaoPadrao) : "-"}</p>
                              </div>
                            </div>

                            <div className="grid min-w-[260px] gap-3">
                              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/10 px-4 py-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">
                                  Receita semanal
                                </p>
                                <p className="mt-2 text-2xl font-bold text-white">
                                  {brl(receitaSemanalVeiculo)}
                                </p>
                                <p className="mt-1 text-xs text-cyan-100/80">
                                  Base semanal do ativo
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                  Receita mensal
                                </p>
                                <p className="mt-2 text-2xl font-bold text-white">
                                  {brl(receitaMensalVeiculo)}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Projeção mensal estimada
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}