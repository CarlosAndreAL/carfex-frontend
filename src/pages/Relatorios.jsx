import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CarFront,
  Download,
  FileSpreadsheet,
  RefreshCcw,
  Trophy,
  Wallet,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock3,
} from "lucide-react";
import Layout from "../components/Layout";
import API_URL from "../config/api";

function brl(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function dataBR(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
}

function statusUpper(status) {
  return String(status || "").toUpperCase();
}

function mesmoMes(data, hoje = new Date()) {
  if (!data) return false;
  const d = new Date(data);
  return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
}

function mesmoAno(data, hoje = new Date()) {
  if (!data) return false;
  const d = new Date(data);
  return d.getFullYear() === hoje.getFullYear();
}

function CardResumo({ icon: Icon, titulo, valor, subtitulo, color = "cyan" }) {
  const colors = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    blue: "border-blue-400/20 bg-blue-500/10 text-blue-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="rounded-[30px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_25px_80px_rgba(2,8,23,0.35)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            {titulo}
          </p>
          <p className="mt-3 text-3xl font-black text-white">{valor}</p>
          <p className="mt-2 text-sm text-slate-400">{subtitulo}</p>
        </div>

        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Relatorios() {
  const [pagamentos, setPagamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarFinanceiro() {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(`${API_URL}/pagamentos-motorista`);
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar financeiro");
      }

      setPagamentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao carregar financeiro");
      setPagamentos([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  const financeiro = useMemo(() => {
    const hoje = new Date();

    const pagos = pagamentos.filter((p) => statusUpper(p.status) === "PAGO");
    const parciais = pagamentos.filter((p) => statusUpper(p.status) === "PARCIAL");
    const emAnalise = pagamentos.filter((p) => statusUpper(p.status) === "EM_ANALISE");
    const pendentes = pagamentos.filter((p) => statusUpper(p.status) === "PENDENTE");
    const atrasados = pagamentos.filter((p) => statusUpper(p.status) === "ATRASADO");

    const pagosMes = pagos.filter((p) => mesmoMes(p.dataPagamento || p.updatedAt, hoje));
    const pagosAno = pagos.filter((p) => mesmoAno(p.dataPagamento || p.updatedAt, hoje));

    const pagamentosMes = pagamentos.filter((p) => mesmoMes(p.dataVencimento, hoje));
    const pagamentosAno = pagamentos.filter((p) => mesmoAno(p.dataVencimento, hoje));

    const faturamentoMes = pagosMes.reduce(
      (t, p) => t + Number(p.valorPago || p.valor || 0),
      0
    );

    const faturamentoAno = pagosAno.reduce(
      (t, p) => t + Number(p.valorPago || p.valor || 0),
      0
    );

    const projecaoMes = pagamentosMes.reduce((t, p) => {
      const status = statusUpper(p.status);

      if (status === "PAGO") return t + Number(p.valorPago || p.valor || 0);
      if (status === "PARCIAL") return t + Number(p.valor || 0);

      return t + Number(p.valor || 0);
    }, 0);

    const projecaoAno = pagamentosAno.reduce((t, p) => {
      const status = statusUpper(p.status);

      if (status === "PAGO") return t + Number(p.valorPago || p.valor || 0);
      if (status === "PARCIAL") return t + Number(p.valor || 0);

      return t + Number(p.valor || 0);
    }, 0);

    const emAberto = [...pendentes, ...atrasados, ...parciais, ...emAnalise].reduce(
      (t, p) => {
        const status = statusUpper(p.status);

        if (status === "PARCIAL") return t + Number(p.saldoRestante || 0);
        if (status === "EM_ANALISE") return t + Number(p.saldoRestante || p.valor || 0);

        return t + Number(p.valor || 0);
      },
      0
    );

    const baixasAutomaticas = pagos.filter((p) =>
      String(p.observacoes || "").toLowerCase().includes("comprovante")
    );

    const carrosMap = new Map();

    pagamentos.forEach((p) => {
      const veiculoId = p.veiculoId || p.veiculo?.id || `sem-id-${p.id}`;
      const atual = carrosMap.get(veiculoId) || {
        veiculoId,
        veiculo: `${p.veiculo?.marca || ""} ${p.veiculo?.modelo || ""}`.trim() || "Veículo",
        placa: p.veiculo?.placa || "-",
        totalRecebido: 0,
        totalPrevisto: 0,
        quantidadePagamentos: 0,
      };

      atual.totalPrevisto += Number(p.valor || 0);

      if (statusUpper(p.status) === "PAGO") {
        atual.totalRecebido += Number(p.valorPago || p.valor || 0);
        atual.quantidadePagamentos += 1;
      }

      carrosMap.set(veiculoId, atual);
    });

    const carros = Array.from(carrosMap.values()).sort(
      (a, b) => b.totalRecebido - a.totalRecebido
    );

    return {
      faturamentoMes,
      faturamentoAno,
      projecaoMes,
      projecaoAno,
      emAberto,
      pagos,
      parciais,
      emAnalise,
      pendentes,
      atrasados,
      baixasAutomaticas,
      carros,
      pagamentosMes,
      pagamentosAno,
    };
  }, [pagamentos]);

  const maiorGanho = financeiro.carros[0] || null;
  const maxValor = Math.max(...financeiro.carros.map((c) => Number(c.totalRecebido || 0)), 1);

  function baixarCSV() {
    const linhas = [
      ["Indicador", "Valor"],
      ["Faturamento do mês", financeiro.faturamentoMes.toFixed(2)],
      ["Faturamento anual", financeiro.faturamentoAno.toFixed(2)],
      ["Projeção do mês", financeiro.projecaoMes.toFixed(2)],
      ["Projeção anual", financeiro.projecaoAno.toFixed(2)],
      ["Em aberto", financeiro.emAberto.toFixed(2)],
      [],
      ["Veículo", "Placa", "Recebido", "Previsto", "Pagamentos"],
      ...financeiro.carros.map((carro) => [
        carro.veiculo || "-",
        carro.placa || "-",
        Number(carro.totalRecebido || 0).toFixed(2),
        Number(carro.totalPrevisto || 0).toFixed(2),
        carro.quantidadePagamentos || 0,
      ]),
    ];

    const csv = linhas.map((linha) => linha.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `financeiro_carfex.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <Layout title="Financeiro">
      <div className="min-h-screen bg-slate-950 pb-24 text-white">
        <section className="relative overflow-hidden rounded-[38px] border border-cyan-400/15 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.48)] backdrop-blur-xl">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                <BarChart3 className="h-4 w-4" />
                CARFEX • Financeiro executivo
              </div>

              <h1 className="text-3xl font-black md:text-5xl">
                Financeiro
              </h1>

              <p className="mt-3 max-w-3xl text-slate-400">
                Faturamento mensal, anual, projeções, baixas automáticas,
                pendências, parciais e ranking de ganhos por veículo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={carregarFinanceiro}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
              >
                <RefreshCcw className="h-4 w-4" />
                Atualizar
              </button>

              <button
                onClick={baixarCSV}
                disabled={!pagamentos.length}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                Baixar CSV
              </button>
            </div>
          </div>
        </section>

        {erro && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {erro}
          </div>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CardResumo
            icon={Wallet}
            titulo="Faturamento do mês"
            valor={brl(financeiro.faturamentoMes)}
            subtitulo="Baixas pagas no mês atual"
            color="emerald"
          />

          <CardResumo
            icon={TrendingUp}
            titulo="Faturamento anual"
            valor={brl(financeiro.faturamentoAno)}
            subtitulo="Total recebido no ano"
            color="cyan"
          />

          <CardResumo
            icon={CalendarDays}
            titulo="Projeção do mês"
            valor={brl(financeiro.projecaoMes)}
            subtitulo="Previsto por vencimentos do mês"
            color="blue"
          />

          <CardResumo
            icon={BarChart3}
            titulo="Projeção anual"
            valor={brl(financeiro.projecaoAno)}
            subtitulo="Previsto por vencimentos do ano"
            color="blue"
          />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <CardResumo
            icon={Clock3}
            titulo="Em aberto"
            valor={brl(financeiro.emAberto)}
            subtitulo="Pendentes, atrasados e parciais"
            color="amber"
          />

          <CardResumo
            icon={AlertTriangle}
            titulo="Atrasados"
            valor={financeiro.atrasados.length}
            subtitulo="Cobranças vencidas"
            color="red"
          />

          <CardResumo
            icon={FileSpreadsheet}
            titulo="Parciais"
            valor={financeiro.parciais.length}
            subtitulo="Pagamentos incompletos"
            color="blue"
          />

          <CardResumo
            icon={CheckCircle2}
            titulo="Baixas automáticas"
            valor={financeiro.baixasAutomaticas.length}
            subtitulo="Baixadas por comprovante"
            color="emerald"
          />

          <CardResumo
            icon={CarFront}
            titulo="Carros com ganho"
            valor={financeiro.carros.filter((c) => c.totalRecebido > 0).length}
            subtitulo="Veículos com recebimento"
            color="cyan"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Ranking financeiro por veículo</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Do maior para o menor faturamento recebido.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                <CalendarDays className="h-4 w-4 text-cyan-300" />
                Ano atual
              </div>
            </div>

            {carregando ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-slate-400">
                Carregando financeiro...
              </div>
            ) : financeiro.carros.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-slate-400">
                Nenhum pagamento encontrado.
              </div>
            ) : (
              <div className="space-y-4">
                {financeiro.carros.map((carro, index) => {
                  const largura = (Number(carro.totalRecebido || 0) / maxValor) * 100;

                  return (
                    <motion.div
                      key={carro.veiculoId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="rounded-[28px] border border-white/10 bg-slate-950/40 p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-black text-cyan-300">
                              #{index + 1}
                            </span>

                            <div>
                              <h3 className="text-lg font-black text-white">
                                {carro.veiculo || "Veículo"}
                              </h3>
                              <p className="text-sm text-slate-400">
                                Placa: {carro.placa || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-2xl font-black text-emerald-300">
                            {brl(carro.totalRecebido)}
                          </p>
                          <p className="text-sm text-slate-400">
                            Previsto: {brl(carro.totalPrevisto)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-300"
                          style={{ width: `${Math.max(largura, 6)}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
              <div className="mb-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  <Trophy className="h-4 w-4" />
                  Destaque financeiro
                </div>

                <h2 className="text-2xl font-black">Melhor desempenho</h2>
              </div>

              {maiorGanho ? (
                <div className="rounded-[30px] border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <p className="text-sm text-emerald-100/80">Veículo campeão</p>
                  <h3 className="mt-2 text-3xl font-black text-white">
                    {maiorGanho.veiculo}
                  </h3>

                  <div className="mt-5 grid gap-3">
                    <InfoBox titulo="Total recebido" valor={brl(maiorGanho.totalRecebido)} />
                    <InfoBox titulo="Total previsto" valor={brl(maiorGanho.totalPrevisto)} />
                    <InfoBox titulo="Placa" valor={maiorGanho.placa || "-"} />
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-slate-400">
                  Nenhum destaque ainda.
                </div>
              )}
            </div>

            <div className="rounded-[36px] border border-amber-400/20 bg-amber-400/10 p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
              <h2 className="text-2xl font-black text-white">Regra operacional</h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-amber-50/90">
                <p>
                  Quando o motorista envia comprovante, a equipe confere e o sistema
                  registra a baixa.
                </p>

                <p>
                  Se o valor pago for menor que a cobrança, o status fica{" "}
                  <b>PARCIAL</b> e o saldo restante continua em aberto.
                </p>

                <p>
                  No dia seguinte, caso a baixa automática esteja incorreta, a empresa
                  pode corrigir manualmente pela aba de pagamentos.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function InfoBox({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {titulo}
      </p>
      <p className="mt-1 text-xl font-black">{valor}</p>
    </div>
  );
}