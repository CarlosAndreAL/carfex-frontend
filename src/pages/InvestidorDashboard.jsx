import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CarFront,
  CircleDollarSign,
  Clock3,
  Landmark,
  LogOut,
  PieChart,
  Search,
  Sparkles,
  TrendingUp,
  Wallet,
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

  const config = {
    ALUGADO: {
      label: "Alugado",
      className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
      dot: "bg-emerald-400",
    },
    DISPONIVEL: {
      label: "Disponível",
      className: "border-sky-400/25 bg-sky-400/10 text-sky-300",
      dot: "bg-sky-400",
    },
    MANUTENCAO: {
      label: "Manutenção",
      className: "border-amber-400/25 bg-amber-400/10 text-amber-300",
      dot: "bg-amber-400",
    },
  };

  const item = config[s] || {
    label: status || "Sem status",
    className: "border-white/10 bg-white/5 text-slate-300",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${item.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function CardIndicador({ icon: Icon, titulo, valor, subtitulo, destaque = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        y: -8,
        scale: 1.025,
        boxShadow: "0px 28px 70px rgba(34, 211, 238, 0.18)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`group relative overflow-hidden rounded-[30px] border p-5 backdrop-blur-xl ${
        destaque
          ? "border-cyan-300/25 bg-cyan-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            {titulo}
          </p>

          <p className="mt-3 text-3xl font-black text-white">{valor}</p>

          <p className="mt-2 text-sm text-slate-400">{subtitulo}</p>
        </div>

        <motion.div
          whileHover={{ rotate: 8, scale: 1.12 }}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            destaque
              ? "border border-cyan-300/20 bg-cyan-300/15 text-cyan-200"
              : "border border-cyan-400/10 bg-cyan-400/10 text-cyan-300"
          }`}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
      </div>
    </motion.div>
  );
}

function BarraProgresso({ valor }) {
  const porcentagem = Math.max(0, Math.min(100, valor));

  return (
    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${porcentagem}%` }}
        transition={{ duration: 1 }}
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-300 shadow-[0_0_20px_rgba(34,211,238,0.45)]"
      />
    </div>
  );
}

export default function InvestidorDashboard() {
  const navigate = useNavigate();

  const [agora, setAgora] = useState(new Date());
  const [dadosDashboard, setDadosDashboard] = useState(null);
  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroMes, setFiltroMes] = useState("");

  const investidorLocal = useMemo(() => {
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

        const response = await fetch(`${API_URL}/investidores/me/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.erro || "Erro ao carregar dashboard do investidor");
        }

        setDadosDashboard(data);
        setVeiculos(
          Array.isArray(data.relatorioVeiculos) ? data.relatorioVeiculos : []
        );
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

  const resumo = dadosDashboard?.resumo || {};
  const investidorApi = dadosDashboard?.investidor || {};

  const nomeInvestidor =
    investidorApi?.nome || investidorLocal?.nome || "Investidor";

  const totalVeiculos = Number(resumo.totalVeiculos || veiculos.length || 0);
  const alugados = Number(resumo.alugados || 0);
  const disponiveis = Number(resumo.disponiveis || 0);
  const manutencao = Number(resumo.manutencao || 0);

  const investimentoTotal = Number(investidorApi.investimentoTotal || 0);
  const retornoMes = Number(resumo.retornoMes || 0);
  const percentualRetorno = Number(resumo.percentualRetorno || 0);
  const totalPago = Number(resumo.totalPago || 0);
  const totalPendente = Number(resumo.totalPendente || 0);
  const mesReferencia = resumo.mesReferencia || "Mês atual";

  const taxaOcupacao = totalVeiculos > 0 ? (alugados / totalVeiculos) * 100 : 0;

  const veiculosFiltrados = veiculos.filter((v) => {
    const placaOk = String(v.placa || "")
      .toLowerCase()
      .includes(filtroPlaca.toLowerCase());

    const mesOk = !filtroMes || String(mesReferencia).includes(filtroMes);

    return placaOk && mesOk;
  });

  const totalRecebidoFiltrado = veiculosFiltrados.reduce(
    (acc, v) => acc + Number(v.totalRecebido || 0),
    0
  );

  const totalRecebidoMesFiltrado = veiculosFiltrados.reduce(
    (acc, v) => acc + Number(v.recebidoMes || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.16),_transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:58px_58px]" />

        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl"
        />

        <motion.div
          animate={{ y: [0, 24, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-6 overflow-hidden rounded-[38px] border border-cyan-300/15 bg-white/[0.07] p-6 shadow-[0_25px_100px_rgba(2,8,23,0.65)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_28%,transparent_68%,rgba(34,211,238,0.07))]" />

            <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-fit rounded-[30px] border border-cyan-300/15 bg-white/[0.07] p-4 shadow-[0_0_55px_rgba(34,211,238,0.12)]"
                >
                  <div className="absolute -inset-3 rounded-[34px] bg-cyan-400/10 blur-2xl" />
                  <img
                    src={logo}
                    alt="CARFEX"
                    className="relative h-16 w-auto object-contain drop-shadow-[0_0_22px_rgba(34,211,238,0.22)]"
                  />
                </motion.div>

                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Dashboard financeiro premium
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                    Bem-vindo,{" "}
                    <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                      {nomeInvestidor}
                    </span>
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                    Acompanhe investimento, retorno mensal, rentabilidade e
                    relatório detalhado dos veículos vinculados à sua carteira.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center">
                <div className="rounded-3xl border border-white/10 bg-slate-950/35 px-4 py-3">
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

                <div className="rounded-3xl border border-white/10 bg-slate-950/35 px-4 py-3">
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
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 hover:bg-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          </motion.header>

          {erro && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-8 text-slate-300 backdrop-blur-xl">
              Carregando dashboard financeiro...
            </div>
          ) : (
            <>
              <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <CardIndicador
                  icon={Landmark}
                  titulo="Total investido"
                  valor={brl(investimentoTotal)}
                  subtitulo="Capital vinculado à carteira"
                />

                <CardIndicador
                  icon={CircleDollarSign}
                  titulo="Retorno do mês"
                  valor={brl(retornoMes)}
                  subtitulo={`Referência: ${mesReferencia}`}
                  destaque
                />

                <CardIndicador
                  icon={TrendingUp}
                  titulo="Rentabilidade"
                  valor={`${percentualRetorno.toFixed(2)}%`}
                  subtitulo="Retorno mensal sobre o capital"
                />

                <CardIndicador
                  icon={BadgeCheck}
                  titulo="Total recebido"
                  valor={brl(totalPago)}
                  subtitulo={`Pendente: ${brl(totalPendente)}`}
                />
              </section>

              <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <CardIndicador
                  icon={CarFront}
                  titulo="Veículos totais"
                  valor={totalVeiculos}
                  subtitulo="Ativos vinculados à carteira"
                />

                <CardIndicador
                  icon={Wallet}
                  titulo="Recebido no filtro"
                  valor={brl(totalRecebidoMesFiltrado)}
                  subtitulo="Soma do mês nos veículos listados"
                />

                <CardIndicador
                  icon={BarChart3}
                  titulo="Recebido total"
                  valor={brl(totalRecebidoFiltrado)}
                  subtitulo="Histórico dos veículos listados"
                />

                <CardIndicador
                  icon={PieChart}
                  titulo="Taxa de ocupação"
                  valor={`${taxaOcupacao.toFixed(0)}%`}
                  subtitulo="Percentual de ativos operando"
                />
              </section>

              <section className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[34px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.48)] backdrop-blur-xl"
                >
                  <div className="mb-6">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      Panorama financeiro
                    </div>

                    <h2 className="text-2xl font-black text-white">
                      Rentabilidade da carteira
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Indicadores financeiros calculados com base nos repasses pagos.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                      <p className="text-sm text-slate-400">Investimento total</p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {brl(investimentoTotal)}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Valor total cadastrado pela empresa.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-cyan-400/10 bg-cyan-400/10 p-5">
                      <p className="text-sm text-cyan-100/80">Retorno do mês</p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {brl(retornoMes)}
                      </p>
                      <p className="mt-2 text-sm text-cyan-100/80">
                        Referência atual: {mesReferencia}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-emerald-400/10 bg-emerald-400/10 p-5">
                      <p className="text-sm text-emerald-100/80">
                        Rentabilidade mensal
                      </p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {percentualRetorno.toFixed(2)}%
                      </p>
                      <BarraProgresso valor={Math.min(percentualRetorno * 10, 100)} />
                    </div>

                    <div className="rounded-3xl border border-amber-400/10 bg-amber-400/10 p-5">
                      <p className="text-sm text-amber-100/80">
                        Valores pendentes
                      </p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {brl(totalPendente)}
                      </p>
                      <p className="mt-2 text-sm text-amber-100/80">
                        Repasses ainda não pagos.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[34px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.48)] backdrop-blur-xl"
                >
                  <div className="mb-6">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Visão executiva
                    </div>

                    <h2 className="text-2xl font-black text-white">
                      Resumo operacional
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                      <p className="text-sm text-slate-400">Ativos operando</p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {alugados}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                      <p className="text-sm text-slate-400">Ativos disponíveis</p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {disponiveis}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                      <p className="text-sm text-slate-400">Em manutenção</p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {manutencao}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
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

              <section className="rounded-[34px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.48)] backdrop-blur-xl">
                <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Relatório por veículo
                    </div>

                    <h2 className="text-2xl font-black text-white">
                      Ganhos dos veículos
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Filtre por placa e acompanhe o recebido no mês e total.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        value={filtroPlaca}
                        onChange={(e) => setFiltroPlaca(e.target.value)}
                        placeholder="Filtrar por placa"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-10 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                      />
                    </div>

                    <input
                      value={filtroMes}
                      onChange={(e) => setFiltroMes(e.target.value)}
                      placeholder="Mês. Ex: 04/2026"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                    />
                  </div>
                </div>

                {veiculosFiltrados.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-slate-400">
                    Nenhum veículo encontrado para esse filtro.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {veiculosFiltrados.map((veiculo, index) => {
                      return (
                        <motion.div
                          key={veiculo.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          whileHover={{ y: -4 }}
                          className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/40 p-5 transition"
                        >
                          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

                          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex-1">
                              <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h3 className="text-xl font-black text-white">
                                  {veiculo.marca} {veiculo.modelo}
                                </h3>
                                <StatusBadge status={veiculo.status} />
                              </div>

                              <div className="grid gap-3 text-sm text-slate-400 md:grid-cols-2">
                                <p>Placa: {veiculo.placa || "-"}</p>
                                <p>Status: {veiculo.status || "-"}</p>
                                <p>
                                  Base semanal:{" "}
                                  {brl(veiculo.valorSemanalPadrao)}
                                </p>
                                <p>
                                  Base mensal:{" "}
                                  {brl(Number(veiculo.valorSemanalPadrao || 0) * 4)}
                                </p>
                              </div>
                            </div>

                            <div className="grid min-w-[260px] gap-3 md:grid-cols-2">
                              <div className="rounded-3xl border border-emerald-400/10 bg-emerald-400/10 px-4 py-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/80">
                                  Recebido no mês
                                </p>
                                <p className="mt-2 text-2xl font-black text-white">
                                  {brl(veiculo.recebidoMes)}
                                </p>
                              </div>

                              <div className="rounded-3xl border border-sky-400/10 bg-sky-400/10 px-4 py-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-sky-100/80">
                                  Total recebido
                                </p>
                                <p className="mt-2 text-2xl font-black text-white">
                                  {brl(veiculo.totalRecebido)}
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