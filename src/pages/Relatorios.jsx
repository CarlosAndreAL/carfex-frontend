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

function CardResumo({ icon: Icon, titulo, valor, subtitulo }) {
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

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Relatorios() {
  const [tipo, setTipo] = useState("semanal");
  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarRelatorio() {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(
        `${API_URL}/relatorios/ganhos-carros?tipo=${tipo}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar relatório");
      }

      setRelatorio(data);
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao carregar relatório");
      setRelatorio(null);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarRelatorio();
  }, [tipo]);

  const carros = relatorio?.carros || [];

  const maiorGanho = useMemo(() => {
    if (!carros.length) return null;
    return carros[0];
  }, [carros]);

  const totalPagamentos = carros.reduce(
    (total, carro) => total + Number(carro.quantidadePagamentos || 0),
    0
  );

  const mediaPorCarro =
    carros.length > 0 ? Number(relatorio?.totalGeral || 0) / carros.length : 0;

  const maxValor = Math.max(...carros.map((c) => Number(c.totalPago || 0)), 1);

  function baixarCSV() {
    const linhas = [
      ["Veículo", "Placa", "Investidor", "Total pago", "Qtd pagamentos"],
      ...carros.map((carro) => [
        carro.veiculo || "-",
        carro.placa || "-",
        carro.investidor || "-",
        Number(carro.totalPago || 0).toFixed(2),
        carro.quantidadePagamentos || 0,
      ]),
    ];

    const csv = linhas.map((linha) => linha.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_ganhos_carros_${tipo}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <Layout title="Relatórios">
      <div className="min-h-screen bg-slate-950 pb-24 text-white">
        <section className="relative overflow-hidden rounded-[38px] border border-cyan-400/15 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.48)] backdrop-blur-xl">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                <BarChart3 className="h-4 w-4" />
                Relatório financeiro executivo
              </div>

              <h1 className="text-3xl font-black md:text-5xl">
                Ganhos dos carros
              </h1>

              <p className="mt-3 max-w-3xl text-slate-400">
                Acompanhe os ganhos semanais e mensais por veículo, ranking de
                desempenho e exportação para planilha.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-400/40"
              >
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>

              <button
                onClick={carregarRelatorio}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
              >
                <RefreshCcw className="h-4 w-4" />
                Atualizar
              </button>

              <button
                onClick={baixarCSV}
                disabled={!carros.length}
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
            titulo="Total recebido"
            valor={brl(relatorio?.totalGeral)}
            subtitulo={`Período ${tipo}`}
          />

          <CardResumo
            icon={CarFront}
            titulo="Carros com ganho"
            valor={relatorio?.totalCarros || 0}
            subtitulo="Veículos com pagamento no período"
          />

          <CardResumo
            icon={FileSpreadsheet}
            titulo="Pagamentos"
            valor={totalPagamentos}
            subtitulo="Baixas realizadas no período"
          />

          <CardResumo
            icon={Trophy}
            titulo="Média por carro"
            valor={brl(mediaPorCarro)}
            subtitulo="Média de recebimento"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Ranking por veículo</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Do maior para o menor ganho no período.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                <CalendarDays className="h-4 w-4 text-cyan-300" />
                {dataBR(relatorio?.periodo?.inicio)} até{" "}
                {dataBR(relatorio?.periodo?.fim)}
              </div>
            </div>

            {carregando ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-slate-400">
                Carregando relatório...
              </div>
            ) : carros.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-slate-400">
                Nenhum pagamento pago encontrado nesse período.
              </div>
            ) : (
              <div className="space-y-4">
                {carros.map((carro, index) => {
                  const largura =
                    (Number(carro.totalPago || 0) / maxValor) * 100;

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
                                Placa: {carro.placa || "-"} • Investidor:{" "}
                                {carro.investidor || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-2xl font-black text-emerald-300">
                            {brl(carro.totalPago)}
                          </p>
                          <p className="text-sm text-slate-400">
                            {carro.quantidadePagamentos} pagamento(s)
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

          <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                <Trophy className="h-4 w-4" />
                Destaque do período
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
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Total recebido
                    </p>
                    <p className="mt-1 text-2xl font-black text-emerald-300">
                      {brl(maiorGanho.totalPago)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Placa
                    </p>
                    <p className="mt-1 text-xl font-black">
                      {maiorGanho.placa || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Investidor
                    </p>
                    <p className="mt-1 text-xl font-black">
                      {maiorGanho.investidor || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-slate-400">
                Nenhum destaque ainda. Dê baixa em pagamentos para alimentar o
                relatório.
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}