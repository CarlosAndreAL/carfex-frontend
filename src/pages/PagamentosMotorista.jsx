import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Search,
  Filter,
  Trash2,
  Siren,
  Clock3,
  Eye,
} from "lucide-react";
import Layout from "../components/Layout";
import API_URL from "../config/api";

function brl(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function normalizar(texto) {
  return String(texto || "").toLowerCase().trim();
}

function statusUpper(status) {
  return String(status || "").toUpperCase();
}

function diasAtraso(dataVencimento) {
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);

  hoje.setHours(0, 0, 0, 0);
  vencimento.setHours(0, 0, 0, 0);

  const diff = Math.ceil((hoje - vencimento) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function StatusBadge({ status }) {
  const s = statusUpper(status);

  if (s === "PAGO") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Pago
      </span>
    );
  }

  if (s === "PARCIAL") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-300">
        <AlertCircle className="h-3.5 w-3.5" />
        Parcial
      </span>
    );
  }

  if (s === "EM_ANALISE") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
        <Eye className="h-3.5 w-3.5" />
        Em análise
      </span>
    );
  }

  if (s === "ATRASADO") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1 text-xs font-black text-red-300">
        <Siren className="h-3.5 w-3.5" />
        Atrasado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300">
      <AlertCircle className="h-3.5 w-3.5" />
      Pendente
    </span>
  );
}

export default function PagamentosMotorista() {
  const [pagamentos, setPagamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ABERTOS");
  const [busca, setBusca] = useState("");

  async function carregarPagamentos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(`${API_URL}/pagamentos-motorista`);
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar pagamentos");
      }

      setPagamentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao carregar pagamentos");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPagamentos();
  }, []);

  const resumo = useMemo(() => {
    const pendentes = pagamentos.filter((p) => statusUpper(p.status) === "PENDENTE");
    const atrasados = pagamentos.filter((p) => statusUpper(p.status) === "ATRASADO");
    const pagos = pagamentos.filter((p) => statusUpper(p.status) === "PAGO");
    const parciais = pagamentos.filter((p) => statusUpper(p.status) === "PARCIAL");
    const analise = pagamentos.filter((p) => statusUpper(p.status) === "EM_ANALISE");

    return {
      totalPendente: pendentes.reduce((t, p) => t + Number(p.valor || 0), 0),
      totalAtrasado: atrasados.reduce((t, p) => t + Number(p.valor || 0), 0),
      totalPago: pagos.reduce((t, p) => t + Number(p.valorPago || p.valor || 0), 0),
      totalParcial: parciais.reduce((t, p) => t + Number(p.saldoRestante || 0), 0),
      totalAnalise: analise.reduce((t, p) => t + Number(p.valorPago || 0), 0),
    };
  }, [pagamentos]);

  const pagamentosFiltrados = useMemo(() => {
    return pagamentos.filter((pagamento) => {
      const status = statusUpper(pagamento.status);

      const passaStatus =
        filtroStatus === "TODOS" ||
        filtroStatus === status ||
        (filtroStatus === "ABERTOS" && status !== "PAGO");

      const termo = normalizar(busca);

      const passaBusca =
        !termo ||
        normalizar(pagamento.cliente?.nome).includes(termo) ||
        normalizar(pagamento.veiculo?.modelo).includes(termo) ||
        normalizar(pagamento.veiculo?.placa).includes(termo) ||
        normalizar(pagamento.referencia).includes(termo);

      return passaStatus && passaBusca;
    });
  }, [pagamentos, filtroStatus, busca]);

  async function enviarWhatsApp(id) {
    try {
      const response = await fetch(`${API_URL}/pagamentos-motorista/${id}/whatsapp`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao gerar link do WhatsApp");
      }

      window.open(data.link, "_blank");
    } catch (error) {
      alert(error.message || "Erro ao abrir WhatsApp");
    }
  }

  async function cobrarTodosAtrasados() {
    try {
      const response = await fetch(`${API_URL}/pagamentos-motorista/cobrar-atrasados`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao cobrar atrasados");
      }

      if (!data.links || data.links.length === 0) {
        alert("Nenhum pagamento atrasado ou parcial para cobrar.");
        return;
      }

      data.links.forEach((link, index) => {
        setTimeout(() => {
          window.open(link, "_blank");
        }, index * 800);
      });
    } catch (error) {
      alert(error.message || "Erro ao cobrar atrasados");
    }
  }

  async function marcarComoPago(pagamento) {
    const confirmar = window.confirm(
      `Confirmar baixa total de ${brl(pagamento.valor)} para ${
        pagamento.cliente?.nome || "motorista"
      }?`
    );

    if (!confirmar) return;

    try {
      const response = await fetch(
        `${API_URL}/pagamentos-motorista/${pagamento.id}/pagar`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valorPago: pagamento.valor }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao dar baixa no pagamento");
      }

      carregarPagamentos();
    } catch (error) {
      alert(error.message || "Erro ao marcar como pago");
    }
  }

  async function excluirPagamento(pagamento) {
    const confirmar = window.confirm(
      `Excluir cobrança de ${brl(pagamento.valor)} de ${
        pagamento.cliente?.nome || "motorista"
      }?`
    );

    if (!confirmar) return;

    try {
      const response = await fetch(`${API_URL}/pagamentos-motorista/${pagamento.id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao excluir pagamento");
      }

      carregarPagamentos();
    } catch (error) {
      alert(error.message || "Erro ao excluir pagamento");
    }
  }

  return (
    <Layout title="Pagamentos dos Motoristas">
      <div className="min-h-screen bg-slate-950 pb-24">
        <section className="relative overflow-hidden rounded-[36px] border border-cyan-400/15 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                <Wallet className="h-4 w-4" />
                Financeiro dos motoristas
              </div>

              <h1 className="text-3xl font-black md:text-5xl">
                Cobranças dos Motoristas
              </h1>

              <p className="mt-3 max-w-3xl text-slate-400">
                Controle pendências, pagamentos parciais, comprovantes e baixas.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              
                <button
  onClick={cobrarPendenciasHoje}
  className="rounded-2xl border border-rose-400/30 bg-rose-500/15 px-5 py-3 font-bold text-rose-100"
>
  Cobrar pendências
</button>
              <button
                onClick={carregarPagamentos}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
              >
                <RefreshCcw className="h-4 w-4" />
                Atualizar
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-5">
          <ResumoCard titulo="Pendente" valor={brl(resumo.totalPendente)} cor="amber" />
          <ResumoCard titulo="Atrasado" valor={brl(resumo.totalAtrasado)} cor="red" />
          <ResumoCard titulo="Parcial restante" valor={brl(resumo.totalParcial)} cor="blue" />
          <ResumoCard titulo="Em análise" valor={brl(resumo.totalAnalise)} cor="cyan" />
          <ResumoCard titulo="Pago" valor={brl(resumo.totalPago)} cor="emerald" />
        </section>

        <section className="mt-6 rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-black">Cobranças lançadas</h2>
              <p className="mt-1 text-sm text-slate-400">
                Veja pendentes, parciais, em análise e pagos.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar motorista, placa..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40 md:w-[280px]"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-8 text-sm text-white outline-none focus:border-cyan-400/40 md:w-[230px]"
                >
                  <option value="ABERTOS">Abertos</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="ATRASADO">Atrasados</option>
                  <option value="PARCIAL">Parciais</option>
                  <option value="EM_ANALISE">Em análise</option>
                  <option value="PAGO">Pagos</option>
                  <option value="TODOS">Todos</option>
                </select>
              </div>
            </div>
          </div>

          {erro && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-slate-400">
              Carregando pagamentos...
            </div>
          ) : pagamentosFiltrados.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-slate-400">
              Nenhuma cobrança encontrada nesse filtro.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {pagamentosFiltrados.map((pagamento, index) => {
                const status = statusUpper(pagamento.status);
                const atrasado = status === "ATRASADO";
                const parcial = status === "PARCIAL";
                const analise = status === "EM_ANALISE";

                return (
                  <motion.div
                    key={pagamento.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -4 }}
                    className={`rounded-[30px] border p-5 ${
                      atrasado
                        ? "border-red-400/25 bg-red-500/10"
                        : parcial
                        ? "border-blue-400/25 bg-blue-500/10"
                        : analise
                        ? "border-cyan-400/25 bg-cyan-400/10"
                        : "border-white/10 bg-slate-950/40"
                    }`}
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black capitalize">
                            {pagamento.cliente?.nome || "Motorista"}
                          </h3>
                          <StatusBadge status={pagamento.status} />
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          Veículo: {pagamento.veiculo?.marca || ""}{" "}
                          {pagamento.veiculo?.modelo || ""} • Placa:{" "}
                          {pagamento.veiculo?.placa || "-"}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Referência: {pagamento.referencia || "-"} • Vencimento:{" "}
                          {pagamento.dataVencimento
                            ? new Date(pagamento.dataVencimento).toLocaleDateString("pt-BR")
                            : "-"}
                        </p>

                        {atrasado && (
                          <p className="mt-2 text-sm font-bold text-red-300">
                            {diasAtraso(pagamento.dataVencimento)} dia(s) de atraso
                          </p>
                        )}

                        {(parcial || analise) && (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-blue-200/70">
                                Valor pago
                              </p>
                              <p className="mt-1 text-lg font-black text-blue-100">
                                {brl(pagamento.valorPago)}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-amber-200/70">
                                Saldo restante
                              </p>
                              <p className="mt-1 text-lg font-black text-amber-100">
                                {brl(pagamento.saldoRestante)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Valor total
                          </p>
                          <p className="mt-1 text-xl font-black">
                            {brl(pagamento.valor)}
                          </p>
                        </div>

                        <button
                          onClick={() => enviarWhatsApp(pagamento.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-400/20"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </button>

                        <button
                          onClick={() => marcarComoPago(pagamento)}
                          disabled={status === "PAGO"}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Dar baixa
                        </button>

                        <button
                          onClick={() => excluirPagamento(pagamento)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/10 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-200/70 transition hover:-translate-y-0.5 hover:border-red-400/25 hover:bg-red-500/10 hover:text-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <div className="h-40 bg-slate-950" />
      </div>
    </Layout>
  );
}

function ResumoCard({ titulo, valor, cor }) {
  const cores = {
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    red: "border-red-400/25 bg-red-500/10 text-red-100",
    blue: "border-blue-400/25 bg-blue-500/10 text-blue-100",
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  };

function limparTelefone(telefone = "") {
  return String(telefone).replace(/\D/g, "");
}

function mesmaDataHoje(data) {
  if (!data) return false;

  const hoje = new Date();
  const vencimento = new Date(data);

  return (
    hoje.getDate() === vencimento.getDate() &&
    hoje.getMonth() === vencimento.getMonth() &&
    hoje.getFullYear() === vencimento.getFullYear()
  );
}

function gerarMensagemCobranca(pagamento) {
  const nome =
    pagamento?.cliente?.nome ||
    pagamento?.motorista ||
    "motorista";

  const valor = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(
    Number(
      pagamento?.saldoRestante ||
      pagamento?.valor ||
      0
    )
  );

  const vencimento = new Date(
    pagamento.dataVencimento
  ).toLocaleDateString("pt-BR");

  return `Olá, ${nome}. Tudo bem?

Identificamos uma pendência referente à sua locação CARFEX.

📅 Vencimento: ${vencimento}
💰 Valor pendente: ${valor}

Pedimos a gentileza de realizar o pagamento ainda hoje.

Caso já tenha efetuado o pagamento, envie o comprovante.

Equipe CARFEX`;
}

function cobrarPendenciasHoje() {
  const pendenciasHoje = pagamentos.filter((p) => {
    const status = String(p.status || "").toUpperCase();

    return (
      mesmaDataHoje(p.dataVencimento) &&
      status !== "PAGO" &&
      status !== "EM_ANALISE"
    );
  });

  if (pendenciasHoje.length === 0) {
    alert("Nenhuma pendência encontrada para hoje.");
    return;
  }

  const confirmar = window.confirm(
    `Encontramos ${pendenciasHoje.length} cobrança(s) para hoje. Deseja abrir todas no WhatsApp?`
  );

  if (!confirmar) return;

  pendenciasHoje.forEach((pagamento, index) => {
    const telefone = limparTelefone(
      pagamento?.cliente?.telefone ||
      pagamento?.telefone ||
      ""
    );

    if (!telefone) return;

    const mensagem = gerarMensagemCobranca(pagamento);

    const link = `https://wa.me/55${telefone}?text=${encodeURIComponent(
      mensagem
    )}`;

    setTimeout(() => {
      window.open(link, "_blank");
    }, index * 900);
  });
}

  return (
    <div className={`rounded-[28px] border p-5 ${cores[cor]}`}>
      <p className="text-sm opacity-80">{titulo}</p>
      <p className="mt-2 text-2xl font-black">{valor}</p>
    </div>
  );
}