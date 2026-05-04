import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Eye,
  Wallet,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  CarFront,
  UserRound,
  CalendarDays,
  X,
} from "lucide-react";
import Layout from "../components/Layout";
import PageWrapper from "../components/PageWrapper";
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

function normalizar(texto) {
  return String(texto || "").toLowerCase().trim();
}

export default function Comprovantes() {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [processandoId, setProcessandoId] = useState(null);
  const [modalRejeitar, setModalRejeitar] = useState(null);
  const [motivo, setMotivo] = useState("");

  async function carregar() {
    try {
      setCarregando(true);
      setErro("");

      const res = await fetch(`${API_URL}/pagamentos-motorista/comprovantes/analise`);
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao carregar comprovantes");
      }

      setDados(Array.isArray(data) ? data : []);
    } catch (error) {
      setErro(error.message || "Erro ao carregar comprovantes");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    return dados.filter((item) => {
      const termo = normalizar(busca);

      return (
        !termo ||
        normalizar(item.cliente?.nome).includes(termo) ||
        normalizar(item.referencia).includes(termo) ||
        normalizar(item.veiculo?.modelo).includes(termo) ||
        normalizar(item.veiculo?.placa).includes(termo)
      );
    });
  }, [dados, busca]);

  const totalAnalise = useMemo(() => {
    return dados.reduce((total, item) => total + Number(item.valor || 0), 0);
  }, [dados]);

  async function aprovar(id) {
    const confirmar = window.confirm(
      "Deseja aprovar esse comprovante e dar baixa no pagamento?"
    );
    if (!confirmar) return;

    try {
      setProcessandoId(id);

      const res = await fetch(
        `${API_URL}/pagamentos-motorista/${id}/aprovar-comprovante`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao aprovar comprovante");
      }

      await carregar();
      alert("Comprovante aprovado. Pagamento baixado como PAGO.");
    } catch (error) {
      alert(error.message || "Erro ao aprovar comprovante");
    } finally {
      setProcessandoId(null);
    }
  }

  async function rejeitar() {
    if (!modalRejeitar) return;

    try {
      setProcessandoId(modalRejeitar.id);

      const res = await fetch(
        `${API_URL}/pagamentos-motorista/${modalRejeitar.id}/rejeitar-comprovante`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            motivo: motivo || "Comprovante rejeitado pela empresa",
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao rejeitar comprovante");
      }

      setModalRejeitar(null);
      setMotivo("");
      await carregar();
      alert("Comprovante rejeitado. Pagamento voltou para PENDENTE.");
    } catch (error) {
      alert(error.message || "Erro ao rejeitar comprovante");
    } finally {
      setProcessandoId(null);
    }
  }

  function abrirComprovante(item) {
    if (!item.comprovanteArquivo) {
      alert("Esse pagamento não possui arquivo de comprovante.");
      return;
    }

    window.open(
      `${API_URL}/uploads/comprovantes/${item.comprovanteArquivo}`,
      "_blank"
    );
  }

  return (
    <Layout title="Comprovantes">
      <PageWrapper maxWidth="max-w-[1450px]">
        <section className="relative overflow-hidden rounded-[38px] border border-cyan-400/15 bg-white/[0.06] p-6 shadow-[0_30px_110px_rgba(2,8,23,0.55)] backdrop-blur-xl">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
                <ShieldCheck className="h-4 w-4" />
                CARFEX • Conferência financeira
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                Comprovantes em{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                  análise
                </span>
              </h1>

              <p className="mt-3 max-w-3xl text-slate-300">
                Aprove ou rejeite comprovantes enviados pelo portal do motorista.
                Ao aprovar, o pagamento vira PAGO automaticamente.
              </p>
            </div>

            <button
              onClick={carregar}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<FileCheck2 className="h-5 w-5" />}
            title="Comprovantes"
            value={dados.length}
            color="cyan"
          />
          <MetricCard
            icon={<Wallet className="h-5 w-5" />}
            title="Valor em análise"
            value={brl(totalAnalise)}
            color="emerald"
          />
          <MetricCard
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Aguardando conferência"
            value={dados.length}
            color="amber"
          />
        </section>

        <section className="mt-6 rounded-[38px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_110px_rgba(2,8,23,0.50)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Fila de análise</h2>
              <p className="mt-1 text-sm text-slate-400">
                Só aparecem pagamentos com status EM_ANALISE.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar motorista, referência, veículo ou placa..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40 md:w-[390px]"
              />
            </div>
          </div>

          {erro && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-slate-400">
              Carregando comprovantes...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-8 text-center">
              <p className="text-lg font-black text-white">
                Nenhum comprovante em análise
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Quando um motorista enviar comprovante, ele aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {filtrados.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.035 }}
                  whileHover={{ y: -4, scale: 1.004 }}
                  className="rounded-[32px] border border-cyan-400/15 bg-slate-950/45 p-5 transition"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black capitalize text-white">
                          {item.cliente?.nome || "Motorista"}
                        </h3>

                        <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
                          EM ANÁLISE
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <Info
                          icon={<UserRound className="h-4 w-4" />}
                          label="Referência"
                          value={item.referencia || "-"}
                        />
                        <Info
                          icon={<CarFront className="h-4 w-4" />}
                          label="Veículo"
                          value={`${item.veiculo?.marca || ""} ${
                            item.veiculo?.modelo || ""
                          }`.trim() || "-"}
                        />
                        <Info
                          icon={<CalendarDays className="h-4 w-4" />}
                          label="Vencimento"
                          value={dataBR(item.dataVencimento)}
                        />
                        <Info
                          icon={<Wallet className="h-4 w-4" />}
                          label="Valor"
                          value={brl(item.valor)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => abrirComprovante(item)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-400/10 px-4 py-3 text-sm font-black text-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-400/20"
                      >
                        <Eye className="h-4 w-4" />
                        Ver comprovante
                      </button>

                      <button
                        onClick={() => aprovar(item.id)}
                        disabled={processandoId === item.id}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-400/20 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {processandoId === item.id ? "Aprovando..." : "Aprovar"}
                      </button>

                      <button
                        onClick={() => setModalRejeitar(item)}
                        disabled={processandoId === item.id}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:-translate-y-0.5 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <AnimatePresence>
          {modalRejeitar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                className="w-full max-w-md rounded-[34px] border border-red-400/20 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(239,68,68,0.18)]"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      Rejeitar comprovante
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {modalRejeitar.cliente?.nome} • {modalRejeitar.referencia}
                    </p>
                  </div>

                  <button
                    onClick={() => setModalRejeitar(null)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Motivo da rejeição
                </label>

                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: comprovante ilegível, valor divergente..."
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-red-400/40"
                />

                <button
                  onClick={rejeitar}
                  disabled={processandoId === modalRejeitar.id}
                  className="mt-5 w-full rounded-2xl bg-red-500 px-5 py-4 text-sm font-black text-white transition hover:bg-red-400 disabled:opacity-60"
                >
                  {processandoId === modalRejeitar.id
                    ? "Rejeitando..."
                    : "Confirmar rejeição"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-20" />
      </PageWrapper>
    </Layout>
  );
}

function MetricCard({ icon, title, value, color }) {
  const colors = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      className={`rounded-[30px] border p-5 shadow-xl backdrop-blur ${colors[color]}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
        {icon}
      </div>

      <p className="text-sm font-bold opacity-80">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </motion.div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        <span className="text-cyan-300">{icon}</span>
        {label}
      </div>
      <p className="break-words font-semibold text-slate-200">{value}</p>
    </div>
  );
}