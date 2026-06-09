import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Car,
  FileText,
  AlertCircle,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Activity,
  BadgeDollarSign,
  BarChart3,
  CalendarRange,
  Filter,
} from "lucide-react";
import Layout from "../components/Layout";
import PageWrapper from "../components/PageWrapper";
import API_URL from "../config/api";

function normalizarStatus(status) {
  return String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function brl(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function formatarMesAno(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function parseDateSafe(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function estaNoPeriodo(dateValue, periodo) {
  const d = parseDateSafe(dateValue);
  if (!d) return false;

  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  if (periodo === "30") {
    const limite = new Date(inicioHoje);
    limite.setDate(limite.getDate() - 30);
    return d >= limite;
  }

  if (periodo === "90") {
    const limite = new Date(inicioHoje);
    limite.setDate(limite.getDate() - 90);
    return d >= limite;
  }

  if (periodo === "180") {
    const limite = new Date(inicioHoje);
    limite.setDate(limite.getDate() - 180);
    return d >= limite;
  }

  return true;
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  valueClass = "text-white",
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur"
    >
      <div className="flex items-center gap-3 text-slate-400">
        <div className="rounded-2xl bg-white/5 p-2">{icon}</div>
        <p className="text-xs uppercase tracking-wide">{title}</p>
      </div>

      <p className={`mt-4 text-3xl font-bold md:text-4xl ${valueClass}`}>{value}</p>

      {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
    </motion.div>
  );
}

function BlocoResumo({ titulo, valor, descricao, classes = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 ${classes}`}
    >
      <p className="text-sm text-slate-300">{titulo}</p>
      <p className="mt-3 text-5xl font-bold text-white">{valor}</p>
      {descricao ? <p className="mt-2 text-sm text-slate-400">{descricao}</p> : null}
    </motion.div>
  );
}

function MiniBarChart({ data = [], formatValue }) {
  const max = Math.max(...data.map((item) => item.valor), 1);

  return (
    <div className="mt-6 flex h-72 items-end gap-3">
      {data.map((item, index) => {
        const altura = Math.max((item.valor / max) * 100, 8);

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.05 }}
            className="flex flex-1 flex-col items-center justify-end"
          >
            <div className="mb-3 text-center text-[11px] text-slate-400">
              {formatValue ? formatValue(item.valor) : item.valor}
            </div>

            <div className="flex h-52 w-full items-end rounded-2xl bg-white/5 p-1">
              <div
                className="w-full rounded-xl bg-gradient-to-t from-sky-500 via-cyan-400 to-sky-300 shadow-[0_0_30px_rgba(56,189,248,0.20)] transition-all duration-500"
                style={{ height: `${altura}%` }}
              />
            </div>

            <div className="mt-3 text-center text-xs text-slate-300">{item.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

function HorizontalRanking({ items = [], valueFormatter = (v) => v }) {
  const max = Math.max(...items.map((item) => item.valor), 1);

  return (
    <div className="mt-5 space-y-4">
      {items.map((item, index) => {
        const largura = Math.max((item.valor / max) * 100, 6);

        return (
          <motion.div
            key={`${item.label}-${index}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
            className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-white">{item.label}</p>
              <p className="text-sm text-slate-300">{valueFormatter(item.valor)}</p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300"
                style={{ width: `${largura}%` }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [locacoes, setLocacoes] = useState([]);
  const [multas, setMultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState("30");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resClientes, resVeiculos, resLocacoes, resMultas] =
          await Promise.all([
            fetch(`${API_URL}/clientes`),
            fetch(`${API_URL}/veiculos`),
            fetch(`${API_URL}/locacoes`),
            fetch(`${API_URL}/multas`),
          ]);

        const clientesData = await resClientes.json().catch(() => []);
        const veiculosData = await resVeiculos.json().catch(() => []);
        const locacoesData = await resLocacoes.json().catch(() => []);
        const multasData = await resMultas.json().catch(() => []);

        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setVeiculos(Array.isArray(veiculosData) ? veiculosData : []);
        setLocacoes(Array.isArray(locacoesData) ? locacoesData : []);
        setMultas(Array.isArray(multasData) ? multasData : []);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        setClientes([]);
        setVeiculos([]);
        setLocacoes([]);
        setMultas([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const clientesPeriodo = useMemo(() => {
    return clientes.filter((cliente) =>
      estaNoPeriodo(cliente.createdAt, periodo)
    );
  }, [clientes, periodo]);

  const locacoesPeriodo = useMemo(() => {
    return locacoes.filter((locacao) =>
      estaNoPeriodo(locacao.createdAt || locacao.dataInicio, periodo)
    );
  }, [locacoes, periodo]);

  const multasPeriodo = useMemo(() => {
    return multas.filter((multa) => estaNoPeriodo(multa.data, periodo));
  }, [multas, periodo]);

  const totalClientes = clientes.length;

  const veiculosDisponiveis = useMemo(() => {
    return veiculos.filter(
      (veiculo) => normalizarStatus(veiculo.status) === "DISPONIVEL"
    ).length;
  }, [veiculos]);

  const veiculosAlugados = useMemo(() => {
    return veiculos.filter(
      (veiculo) => normalizarStatus(veiculo.status) === "ALUGADO"
    ).length;
  }, [veiculos]);

  const locacoesAtivasLista = useMemo(() => {
    return locacoes.filter(
      (locacao) => normalizarStatus(locacao.status) === "ATIVA"
    );
  }, [locacoes]);

  const locacoesAtivas = locacoesAtivasLista.length;

  const multasPendentesLista = useMemo(() => {
    return multas.filter((multa) => {
      const status = normalizarStatus(multa.status);
      return status === "PENDENTE" || status === "ABERTA";
    });
  }, [multas]);

  const multasPendentes = multasPendentesLista.length;

  const valorMultasPendentes = useMemo(() => {
    return multasPendentesLista.reduce(
      (acc, multa) => acc + Number(multa.valor || 0),
      0
    );
  }, [multasPendentesLista]);

  const taxaOcupacao = useMemo(() => {
    if (!veiculos.length) return 0;
    return Math.round((veiculosAlugados / veiculos.length) * 100);
  }, [veiculos.length, veiculosAlugados]);

  const receitaSemanalAtiva = useMemo(() => {
    return locacoesAtivasLista.reduce(
      (acc, locacao) => acc + Number(locacao.valorSemanal || 0),
      0
    );
  }, [locacoesAtivasLista]);

  const receitaMensalEstimada = useMemo(() => {
    return receitaSemanalAtiva * 4;
  }, [receitaSemanalAtiva]);

  const totalCaucoesAtivas = useMemo(() => {
    return locacoesAtivasLista.reduce(
      (acc, locacao) => acc + Number(locacao.caucao || 0),
      0
    );
  }, [locacoesAtivasLista]);

  const totalFranquiasAtivas = useMemo(() => {
    return locacoesAtivasLista.reduce(
      (acc, locacao) => acc + Number(locacao.franquia || 0),
      0
    );
  }, [locacoesAtivasLista]);

  const novasLocacoesPeriodo = locacoesPeriodo.length;
  const novasMultasPeriodo = multasPeriodo.length;
  const novosClientesPeriodo = clientesPeriodo.length;

  const faturamentoPeriodo = useMemo(() => {
    return locacoesPeriodo.reduce(
      (acc, locacao) => acc + Number(locacao.valorSemanal || 0),
      0
    );
  }, [locacoesPeriodo]);

  const faturamentoMensalGrafico = useMemo(() => {
    const hoje = new Date();
    const meses = [];

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = d.getMonth();
      const ano = d.getFullYear();

      const valor = locacoes.reduce((acc, locacao) => {
        const dataBase = parseDateSafe(locacao.createdAt || locacao.dataInicio);
        if (!dataBase) return acc;
        if (dataBase.getMonth() === mes && dataBase.getFullYear() === ano) {
          return acc + Number(locacao.valorSemanal || 0) * 4;
        }
        return acc;
      }, 0);

      meses.push({
        label: formatarMesAno(d).toUpperCase(),
        valor,
      });
    }

    if (meses.every((m) => m.valor === 0) && receitaMensalEstimada > 0) {
      return meses.map((m, idx) => ({
        ...m,
        valor: idx === meses.length - 1 ? receitaMensalEstimada : receitaMensalEstimada * 0.7,
      }));
    }

    return meses;
  }, [locacoes, receitaMensalEstimada]);

  const mesAtualValor = faturamentoMensalGrafico[faturamentoMensalGrafico.length - 1]?.valor || 0;
  const mesAnteriorValor = faturamentoMensalGrafico[faturamentoMensalGrafico.length - 2]?.valor || 0;

  const variacaoMensal = useMemo(() => {
    if (mesAnteriorValor <= 0) return mesAtualValor > 0 ? 100 : 0;
    return Math.round(((mesAtualValor - mesAnteriorValor) / mesAnteriorValor) * 100);
  }, [mesAtualValor, mesAnteriorValor]);

  const ocupacaoGrafico = useMemo(() => {
    return [
      { label: "Disponíveis", valor: veiculosDisponiveis },
      { label: "Alugados", valor: veiculosAlugados },
    ];
  }, [veiculosDisponiveis, veiculosAlugados]);

  const rankingVeiculos = useMemo(() => {
    return [...veiculos]
      .map((veiculo) => ({
        label: [veiculo.marca, veiculo.modelo, veiculo.placa]
          .filter(Boolean)
          .join(" - "),
        valor: Number(veiculo.valorSemanalPadrao || 0),
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [veiculos]);

  const rankingClientesMultas = useMemo(() => {
    const mapa = {};

    multas.forEach((multa) => {
      const nome = multa.cliente || "Cliente";
      mapa[nome] = (mapa[nome] || 0) + Number(multa.valor || 0);
    });

    return Object.entries(mapa)
      .map(([label, valor]) => ({ label, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [multas]);

  const atividadesRecentes = useMemo(() => {
    const atividades = [];

    clientes.slice(0, 3).forEach((cliente) => {
      atividades.push(`Cliente cadastrado: ${cliente.nome}.`);
    });

    locacoesAtivasLista.slice(0, 3).forEach((locacao) => {
      atividades.push(
        `Locação ativa: ${locacao.cliente?.nome || "Cliente"} com ${
          locacao.veiculo?.modelo || "veículo"
        }.`
      );
    });

    multasPendentesLista.slice(0, 3).forEach((multa) => {
      atividades.push(
        `Multa pendente: ${multa.cliente || "Cliente"} - ${brl(multa.valor)}.`
      );
    });

    return atividades.slice(0, 8);
  }, [clientes, locacoesAtivasLista, multasPendentesLista]);

  return (
    <Layout title="Dashboard">
      <PageWrapper maxWidth="max-w-[1450px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sm text-sky-300">
              <Sparkles className="h-4 w-4" />
              CARFEX • Painel executivo máximo
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-6xl">
              Visão geral da{" "}
              <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                operação
              </span>
            </h1>

            <p className="mt-3 text-sm text-slate-300 md:text-lg">
              Indicadores financeiros e operacionais com análise ampliada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
              <Filter className="h-4 w-4 text-sky-300" />
              <span className="text-sm">Período</span>
            </div>

            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            >
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="180">Últimos 180 dias</option>
              <option value="all">Todo o período</option>
            </select>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Users className="h-4 w-4 text-cyan-300" />}
            title="Clientes cadastrados"
            value={carregando ? "..." : totalClientes}
            subtitle={`${novosClientesPeriodo} no período`}
            valueClass="text-cyan-400"
            delay={0.08}
          />
          <MetricCard
            icon={<Car className="h-4 w-4 text-emerald-300" />}
            title="Veículos disponíveis"
            value={carregando ? "..." : veiculosDisponiveis}
            subtitle={`${veiculosAlugados} alugado(s)`}
            valueClass="text-emerald-400"
            delay={0.14}
          />
          <MetricCard
            icon={<FileText className="h-4 w-4 text-yellow-300" />}
            title="Locações ativas"
            value={carregando ? "..." : locacoesAtivas}
            subtitle={`${novasLocacoesPeriodo} no período`}
            valueClass="text-yellow-400"
            delay={0.2}
          />
          <MetricCard
            icon={<AlertCircle className="h-4 w-4 text-rose-300" />}
            title="Multas pendentes"
            value={carregando ? "..." : multasPendentes}
            subtitle={`${novasMultasPeriodo} registradas no período`}
            valueClass="text-rose-400"
            delay={0.26}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<BadgeDollarSign className="h-4 w-4 text-sky-300" />}
            title="Receita semanal ativa"
            value={carregando ? "..." : brl(receitaSemanalAtiva)}
            subtitle="Soma das locações ativas"
            valueClass="text-sky-400"
            delay={0.32}
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4 text-cyan-300" />}
            title="Faturamento mensal estimado"
            value={carregando ? "..." : brl(receitaMensalEstimada)}
            subtitle={`Variação mensal: ${variacaoMensal >= 0 ? "+" : ""}${variacaoMensal}%`}
            valueClass="text-cyan-400"
            delay={0.38}
          />
          <MetricCard
            icon={<ShieldCheck className="h-4 w-4 text-emerald-300" />}
            title="Cauções em aberto"
            value={carregando ? "..." : brl(totalCaucoesAtivas)}
            subtitle="Locações ativas"
            valueClass="text-emerald-400"
            delay={0.44}
          />
          <MetricCard
            icon={<Wallet className="h-4 w-4 text-violet-300" />}
            title="Franquias vinculadas"
            value={carregando ? "..." : brl(totalFranquiasAtivas)}
            subtitle={`Multas pendentes: ${brl(valorMultasPendentes)}`}
            valueClass="text-violet-400"
            delay={0.5}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-sky-300" />
              <h2 className="text-2xl font-semibold text-white">
                Faturamento mensal
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Histórico visual consolidado por mês.
            </p>

            <MiniBarChart data={faturamentoMensalGrafico} formatValue={brl} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <h2 className="text-2xl font-semibold text-white">Resumo executivo</h2>
            <p className="mt-2 text-sm text-slate-400">
              Leitura rápida da operação atual.
            </p>

            <div className="mt-6 space-y-4">
              <BlocoResumo
                titulo="Taxa de ocupação da frota"
                valor={carregando ? "..." : `${taxaOcupacao}%`}
                descricao="Percentual de veículos alugados"
                classes="border-emerald-500/20 bg-emerald-500/10"
              />
              <BlocoResumo
                titulo="Faturamento no período"
                valor={carregando ? "..." : brl(faturamentoPeriodo)}
                descricao="Soma das locações criadas no período filtrado"
                classes="border-sky-500/20 bg-sky-500/10"
              />
              <BlocoResumo
                titulo="Exposição em multas"
                valor={carregando ? "..." : brl(valorMultasPendentes)}
                descricao="Total financeiro pendente"
                classes="border-rose-500/20 bg-rose-500/10"
              />
            </div>
          </motion.section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-cyan-300" />
              <h2 className="text-2xl font-semibold text-white">Ocupação da frota</h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Distribuição entre veículos disponíveis e alugados.
            </p>

            <MiniBarChart data={ocupacaoGrafico} formatValue={(v) => `${v}`} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.32 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-300" />
              <h2 className="text-2xl font-semibold text-white">
                Veículos mais rentáveis
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Ranking por valor semanal padrão.
            </p>

            {rankingVeiculos.length > 0 ? (
              <HorizontalRanking items={rankingVeiculos} valueFormatter={brl} />
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-slate-400">
                Nenhum veículo com valor semanal cadastrado.
              </div>
            )}
          </motion.section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.36 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-300" />
              <h2 className="text-2xl font-semibold text-white">
                Clientes com mais multas
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Ranking por valor acumulado em multas.
            </p>

            {rankingClientesMultas.length > 0 ? (
              <HorizontalRanking items={rankingClientesMultas} valueFormatter={brl} />
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-slate-400">
                Nenhuma multa cadastrada.
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-sky-300" />
              <h2 className="text-2xl font-semibold text-white">Atividades recentes</h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Movimentações recentes registradas no sistema.
            </p>

            <div className="mt-6 space-y-4">
              {atividadesRecentes.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-slate-400">
                  Nenhuma atividade recente.
                </div>
              ) : (
                atividadesRecentes.map((atividade, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.45 + index * 0.05 }}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-slate-200"
                  >
                    {atividade}
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </PageWrapper>
    </Layout>
  );
}


