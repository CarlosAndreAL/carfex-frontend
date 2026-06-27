import API_URL from "../config/api";
import { useEffect, useMemo, useState } from "react";
import {
  Car,
  CreditCard,
  Gauge,
  CalendarDays,
  User,
  Wallet,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  FileText,
  Trash2,
  MapPin,
  TrendingUp,
  Activity,
  BadgeDollarSign,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import PageWrapper from "../components/PageWrapper";

function brl(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 inline-flex items-center gap-2 text-sm text-slate-300">
        <span className="text-sky-400">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoMetric({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs uppercase tracking-wide">{title}</span>
      </div>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, valueClass = "text-white", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
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

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20";

function calcularDataFim(dataInicio, tempoContrato) {
  if (!dataInicio || !tempoContrato) return "";
  const data = new Date(`${dataInicio}T00:00:00`);

  if (tempoContrato === "3_MESES") data.setMonth(data.getMonth() + 3);
  else if (tempoContrato === "6_MESES") data.setMonth(data.getMonth() + 6);
  else if (tempoContrato === "12_MESES") data.setFullYear(data.getFullYear() + 1);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function Locacoes() {
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [locacoes, setLocacoes] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("erro");
  const [salvando, setSalvando] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaVeiculo, setBuscaVeiculo] = useState("");

  const [form, setForm] = useState({
    clienteId: "",
    veiculoId: "",
    numeroContrato: "",
    tipoContrato: "PROFISSIONAL",
    tempoContrato: "6_MESES",
    dataInicio: "",
    dataInicioCobranca: "",
    dataFim: "",
    dataAssinatura: "",
    cidadeAssinatura: "Rio de Janeiro",
    valorSemanal: "",
    caucao: "",
    franquia: "",
    observacoes: "",
  });

  function mostrarMensagem(texto, tipo = "erro") {
    setMensagem(texto);
    setTipoMensagem(tipo);
    setTimeout(() => setMensagem(""), 3000);
  }

  async function carregarDados() {
  try {
    const urls = [
      [`${API_URL}/clientes`, "clientes"],
      [`${API_URL}/veiculos`, "veiculos"],
      [`${API_URL}/locacoes`, "locacoes"],
    ];

    const respostas = await Promise.all(
      urls.map(async ([url, nome]) => {
        const res = await fetch(url);
        const texto = await res.text();

        if (!res.ok) {
          throw new Error(`Erro em ${nome}: ${res.status} - ${texto}`);
        }

        try {
          return JSON.parse(texto);
        } catch {
          throw new Error(`Resposta inválida em ${nome}: ${texto.slice(0, 80)}`);
        }
      })
    );

    const [clientesData, veiculosData, locacoesData] = respostas;

    setClientes(Array.isArray(clientesData) ? clientesData : []);
    setVeiculos(Array.isArray(veiculosData) ? veiculosData : []);
    setLocacoes(Array.isArray(locacoesData) ? locacoesData : []);
  } catch (error) {
    console.error("ERRO AO CARREGAR DADOS:", error);
    setClientes([]);
    setVeiculos([]);
    setLocacoes([]);
    mostrarMensagem(error.message || "Erro ao carregar dados");
  }
}
  useEffect(() => {
    carregarDados();
  }, []);

 const veiculosDisponiveis = useMemo(() => {
  return veiculos.filter((v) => {
    const status = String(v.status || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

    return status === "DISPONIVEL";
  });
}, [veiculos]);

const clientesFiltrados = useMemo(() => {
  const termo = buscaCliente.toLowerCase().trim();

  if (!termo) return clientes;

  return clientes.filter((cliente) =>
    `${cliente.nome || ""} ${cliente.cpf || ""} ${cliente.telefone || ""}`
      .toLowerCase()
      .includes(termo)
  );
}, [clientes, buscaCliente]);

const veiculosFiltrados = useMemo(() => {
  const termo = buscaVeiculo.toLowerCase().trim();

  if (!termo) return veiculosDisponiveis;

  return veiculosDisponiveis.filter((veiculo) =>
    `${veiculo.marca || ""} ${veiculo.modelo || ""} ${veiculo.placa || ""}`
      .toLowerCase()
      .includes(termo)
  );
}, [veiculosDisponiveis, buscaVeiculo]);

  const clienteSelecionado = useMemo(() => {
    return clientes.find((c) => c.id === Number(form.clienteId));
  }, [clientes, form.clienteId]);

  const veiculoSelecionado = useMemo(() => {
    return veiculos.find((v) => v.id === Number(form.veiculoId));
  }, [veiculos, form.veiculoId]);

  const locacoesFiltradas = useMemo(() => {
    const termo = filtroBusca.toLowerCase().trim();
    const lista = Array.isArray(locacoes) ? locacoes : [];

    if (!termo) return lista;

    return lista.filter((locacao) => {
      const cliente = String(locacao.cliente?.nome || "").toLowerCase();
      const veiculo = String(
        `${locacao.veiculo?.marca || ""} ${locacao.veiculo?.modelo || ""} ${locacao.veiculo?.placa || ""}`
      ).toLowerCase();
      const numeroContrato = String(locacao.numeroContrato || "").toLowerCase();
      const status = String(locacao.status || "").toLowerCase();

      return (
        cliente.includes(termo) ||
        veiculo.includes(termo) ||
        numeroContrato.includes(termo) ||
        status.includes(termo)
      );
    });
  }, [locacoes, filtroBusca]);

  const totalLocacoesAtivas = locacoes.filter((l) => l.status === "ATIVA").length;
  const faturamentoSemanal = locacoes
    .filter((l) => l.status === "ATIVA")
    .reduce((acc, locacao) => acc + Number(locacao.valorSemanal || 0), 0);
  const totalCaucoes = locacoes
    .filter((l) => l.status === "ATIVA")
    .reduce((acc, locacao) => acc + Number(locacao.caucao || 0), 0);
  const totalFranquias = locacoes
    .filter((l) => l.status === "ATIVA")
    .reduce((acc, locacao) => acc + Number(locacao.franquia || 0), 0);

  const rankingClientes = [...locacoes]
    .map((locacao) => ({
      label: locacao.cliente?.nome || "Cliente",
      valor: Number(locacao.valorSemanal || 0),
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => {
      const novoForm = { ...prev, [name]: value };

      if (name === "dataInicio" || name === "tempoContrato") {
        novoForm.dataFim = calcularDataFim(
          name === "dataInicio" ? value : prev.dataInicio,
          name === "tempoContrato" ? value : prev.tempoContrato
        );
      }

      return novoForm;
    });
  }

  function handleVeiculoChange(event) {
    const veiculoId = event.target.value;
    const veiculo = veiculos.find((v) => v.id === Number(veiculoId));

    setForm((prev) => ({
      ...prev,
      veiculoId,
      valorSemanal: veiculo?.valorSemanalPadrao ?? "",
      caucao: veiculo?.caucaoPadrao ?? "",
      franquia: veiculo?.franquia ?? "",
    }));
  }

  async function salvarLocacao() {
    if (
      !form.clienteId ||
      !form.veiculoId ||
      !form.numeroContrato ||
      !form.tempoContrato ||
      !form.dataInicio ||
      !form.dataFim
    ) {
      mostrarMensagem("Preencha os campos obrigatórios.");
      return;
    }

    try {
      setSalvando(true);

      const response = await fetch(`${API_URL}/locacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: Number(form.clienteId),
          veiculoId: Number(form.veiculoId),
          numeroContrato: form.numeroContrato,
          tipoContrato: form.tipoContrato,
          tempoContrato: form.tempoContrato,
          dataInicio: form.dataInicio,
          dataInicioCobranca: form.dataInicioCobranca || null,
          dataFim: form.dataFim,
          dataAssinatura: form.dataAssinatura || null,
          cidadeAssinatura: form.cidadeAssinatura || null,
          valorSemanal: form.valorSemanal ? Number(form.valorSemanal) : null,
          caucao: form.caucao ? Number(form.caucao) : null,
          franquia: form.franquia ? Number(form.franquia) : null,
          observacoes: form.observacoes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || data.error || "Erro ao salvar locação");
      }

      setForm({
        clienteId: "",
        veiculoId: "",
        numeroContrato: "",
        tipoContrato: "PROFISSIONAL",
        tempoContrato: "6_MESES",
        dataInicio: "",
        dataFim: "",
        dataAssinatura: "",
        cidadeAssinatura: "Rio de Janeiro",
        valorSemanal: "",
        caucao: "",
        franquia: "",
        observacoes: "",
      });

      await carregarDados();
      mostrarMensagem("Locação criada com sucesso.", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function finalizarLocacao(id) {
    try {
      const response = await fetch(`${API_URL}/locacoes/${id}/finalizar`, {
        method: "PATCH",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || data.error || "Erro ao finalizar locação");
      }

      await carregarDados();
      mostrarMensagem("Locação finalizada com sucesso.", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message, "erro");
    }
  }

  async function excluirLocacao(id) {
    const confirmar = window.confirm("Deseja excluir esta locação?");
    if (!confirmar) return;

    try {
      const response = await fetch(`${API_URL}/locacoes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || data.error || "Erro ao excluir locação");
      }

      await carregarDados();
      mostrarMensagem("Locação excluída com sucesso.", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message, "erro");
    }
  }

function baixarContratoDocx(id) {
  if (!id) {
    mostrarMensagem("ID da locação não encontrado.");
    return;
  }

  window.open(
    `${API_URL}/locacoes/${id}/contrato-docx`,
    "_blank"
  );
}

function baixarContratoPdf(id) {
  if (!id) {
    mostrarMensagem("ID da locação não encontrado.");
    return;
  }

  window.open(
    `${API_URL}/locacoes/${id}/contrato-pdf`,
    "_blank"
  );
}
  function formatarTempoContrato(tempo) {
    if (tempo === "3_MESES") return "3 meses";
    if (tempo === "6_MESES") return "6 meses";
    if (tempo === "12_MESES") return "1 ano";
    return "-";
  }

  return (
    <Layout title="Locações">
      {mensagem && (
        <div className="fixed right-6 top-6 z-50">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`min-w-[320px] rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl ${
              tipoMensagem === "erro"
                ? "border-red-400/30 bg-red-500/15 text-red-100"
                : "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
            }`}
          >
            <p className="text-sm font-medium">{mensagem}</p>
          </motion.div>
        </div>
      )}

      <PageWrapper maxWidth="max-w-[1450px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mb-8"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sm text-sky-300">
            <Sparkles className="h-4 w-4" />
            CARFEX • Gestão executiva de locações
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-6xl">
            Visão completa das{" "}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              locações
            </span>
          </h1>

          <p className="mt-3 text-sm text-slate-300 md:text-lg">
            Controle contratos, faturamento e operação com leitura executiva.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<FileText className="h-4 w-4 text-cyan-300" />}
            title="Locações ativas"
            value={totalLocacoesAtivas}
            subtitle="Contratos em andamento"
            valueClass="text-cyan-400"
            delay={0.08}
          />
          <MetricCard
            icon={<Wallet className="h-4 w-4 text-emerald-300" />}
            title="Faturamento semanal"
            value={brl(faturamentoSemanal)}
            subtitle="Base das locações ativas"
            valueClass="text-emerald-400"
            delay={0.14}
          />
          <MetricCard
            icon={<ShieldCheck className="h-4 w-4 text-violet-300" />}
            title="Cauções em aberto"
            value={brl(totalCaucoes)}
            subtitle="Garantias atuais"
            valueClass="text-violet-400"
            delay={0.2}
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4 text-amber-300" />}
            title="Franquias vinculadas"
            value={brl(totalFranquias)}
            subtitle="Risco coberto"
            valueClass="text-amber-400"
            delay={0.26}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-sky-900/10 backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Nova locação</h2>
                <p className="text-sm text-slate-400">
                  Preencha os dados da locação e do contrato.
                </p>
              </div>

              <div className="inline-flex rounded-2xl border border-white/10 bg-slate-900/70 p-1">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, tipoContrato: "PROFISSIONAL" }))}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    form.tipoContrato === "PROFISSIONAL"
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  Profissional
                </button>

                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, tipoContrato: "PARTICULAR" }))}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    form.tipoContrato === "PARTICULAR"
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  Particular
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
  <Field icon={<User className="h-4 w-4" />} label="Cliente">
    <div className="relative mb-3">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={buscaCliente}
        onChange={(e) => setBuscaCliente(e.target.value)}
        placeholder="Pesquisar cliente por nome, CPF ou telefone..."
        className={`${inputClass} pl-11`}
      />
    </div>

    <select
      name="clienteId"
      value={form.clienteId}
      onChange={handleChange}
      className={inputClass}
    >
      <option value="">Selecione o cliente</option>
      {clientesFiltrados.map((cliente) => (
        <option key={cliente.id} value={cliente.id}>
          {cliente.nome}
        </option>
      ))}
    </select>
  </Field>

  <Field icon={<Car className="h-4 w-4" />} label="Veículo">
    <div className="relative mb-3">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={buscaVeiculo}
        onChange={(e) => setBuscaVeiculo(e.target.value)}
        placeholder="Pesquisar veículo por placa, marca ou modelo..."
        className={`${inputClass} pl-11`}
      />
    </div>

    <select
      name="veiculoId"
      value={form.veiculoId}
      onChange={handleVeiculoChange}
      className={inputClass}
    >
      <option value="">Selecione o veículo</option>
      {veiculosFiltrados.map((veiculo) => (
        <option key={veiculo.id} value={veiculo.id}>
          {[veiculo.marca, veiculo.modelo].filter(Boolean).join(" ")} - {veiculo.placa}
        </option>
      ))}
    </select>
  </Field>
</div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Field icon={<FileText className="h-4 w-4" />} label="Número do contrato">
                <input type="text" name="numeroContrato" value={form.numeroContrato} onChange={handleChange} className={inputClass} placeholder="Ex: 1282026004140033" />
              </Field>

              <Field icon={<FileText className="h-4 w-4" />} label="Tipo de contrato">
                <select name="tempoContrato" value={form.tempoContrato} onChange={handleChange} className={inputClass}>
                  <option value="3_MESES">3 meses</option>
                  <option value="6_MESES">6 meses</option>
                  <option value="12_MESES">1 ano</option>
                </select>
              </Field>

              <Field icon={<MapPin className="h-4 w-4" />} label="Cidade da assinatura">
                <input type="text" name="cidadeAssinatura" value={form.cidadeAssinatura} onChange={handleChange} className={inputClass} placeholder="Cidade da assinatura" />
              </Field>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
  <Field
    icon={<CalendarDays className="h-4 w-4" />}
    label="Data de início"
  >
    <input
      type="date"
      name="dataInicio"
      value={form.dataInicio}
      onChange={handleChange}
      className={inputClass}
    />
  </Field>

  <Field
    icon={<CalendarDays className="h-4 w-4" />}
    label="Início da cobrança"
  >
    <input
      type="date"
      name="dataInicioCobranca"
      value={form.dataInicioCobranca}
      onChange={handleChange}
      className={inputClass}
    />

    <p className="mt-2 text-xs text-slate-500">
      Use essa data para clientes antigos já ativos.
    </p>
  </Field>

  <Field
    icon={<CalendarDays className="h-4 w-4" />}
    label="Data de fim"
  >
    <input
      type="date"
      name="dataFim"
      value={form.dataFim}
      onChange={handleChange}
      className={inputClass}
      readOnly
    />
  </Field>

  <Field
    icon={<CalendarDays className="h-4 w-4" />}
    label="Data da assinatura"
  >
    <input
      type="date"
      name="dataAssinatura"
      value={form.dataAssinatura}
      onChange={handleChange}
      className={inputClass}
    />
  </Field>
</div>

            <AnimatePresence mode="wait">
              <motion.div
                key={form.tipoContrato}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className="mt-5 space-y-5"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <Field icon={<Wallet className="h-4 w-4" />} label="Valor semanal">
                    <input type="number" step="0.01" name="valorSemanal" value={form.valorSemanal} onChange={handleChange} className={inputClass} placeholder="Valor semanal" />
                  </Field>

                  <Field icon={<CreditCard className="h-4 w-4" />} label="Caução">
                    <input type="number" step="0.01" name="caucao" value={form.caucao} onChange={handleChange} className={inputClass} placeholder="Caução" />
                  </Field>

                  <Field icon={<ShieldCheck className="h-4 w-4" />} label="Franquia">
                    <input type="number" step="0.01" name="franquia" value={form.franquia} onChange={handleChange} className={inputClass} placeholder="Franquia" />
                  </Field>
                </div>

                <Field icon={<Gauge className="h-4 w-4" />} label="Observações">
                  <textarea
                    name="observacoes"
                    value={form.observacoes}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[110px] resize-none`}
                    placeholder="Observações da locação"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-4">
                  <InfoMetric icon={<FileText className="h-4 w-4" />} title="Prazo" value={formatarTempoContrato(form.tempoContrato)} />
                  <InfoMetric icon={<Wallet className="h-4 w-4" />} title="Valor semanal" value={brl(form.valorSemanal)} />
                  <InfoMetric icon={<CreditCard className="h-4 w-4" />} title="Caução" value={brl(form.caucao)} />
                  <InfoMetric icon={<ShieldCheck className="h-4 w-4" />} title="Franquia" value={brl(form.franquia)} />
                </div>

                {(clienteSelecionado || veiculoSelecionado) && (
                  <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                    <p className="mb-3 text-sm font-medium text-sky-200">
                      Prévia dos dados para contrato
                    </p>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-400">Locatário</p>
                        <p className="text-sm text-white">{clienteSelecionado?.nome || "-"}</p>
                        <p className="text-xs text-slate-300">{clienteSelecionado?.cpf || "-"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Veículo</p>
                        <p className="text-sm text-white">
                          {veiculoSelecionado
                            ? `${veiculoSelecionado.marca || ""} ${veiculoSelecionado.modelo || ""}`.trim()
                            : "-"}
                        </p>
                        <p className="text-xs text-slate-300">{veiculoSelecionado?.placa || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex flex-wrap gap-3">
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={salvarLocacao}
                disabled={salvando}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Salvar locação
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-sky-300" />
              <h2 className="text-2xl font-semibold text-white">Leitura executiva</h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Faturamento e concentração de contratos.
            </p>

            {rankingClientes.length > 0 ? (
              <HorizontalRanking items={rankingClientes} valueFormatter={brl} />
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-slate-400">
                Nenhuma locação cadastrada.
              </div>
            )}
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
        >
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Locações recentes</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {locacoesFiltradas.length} registros
              </span>
            </div>

            <input
              type="text"
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              placeholder="Buscar por cliente, veículo, contrato ou status..."
              className={inputClass}
            />
          </div>

          <div className="space-y-3">
            {locacoesFiltradas.map((locacao, index) => (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.22 + index * 0.03 }}
                whileHover={{ y: -4, scale: 1.01 }}
                key={locacao.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{locacao.cliente?.nome || "-"}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {locacao.veiculo
                        ? `${locacao.veiculo.marca || ""} ${locacao.veiculo.modelo || ""} - ${locacao.veiculo.placa || ""}`.trim()
                        : "-"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        locacao.tipoContrato === "PARTICULAR"
                          ? "bg-cyan-500/15 text-cyan-300"
                          : "bg-sky-500/15 text-sky-300"
                      }`}
                    >
                      {locacao.tipoContrato || "PROFISSIONAL"}
                    </span>

                    <button
                      onClick={() => excluirLocacao(locacao.id)}
                      className="rounded-full p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                      title="Excluir locação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Contrato</p>
                    <p className="text-sm text-slate-200">{locacao.numeroContrato || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="text-sm text-slate-200">{locacao.status}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Prazo</p>
                    <p className="text-sm text-slate-200">{formatarTempoContrato(locacao.tempoContrato)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Valor semanal</p>
                    <p className="text-sm text-slate-200">{brl(locacao.valorSemanal)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Caução</p>
                    <p className="text-sm text-slate-200">{brl(locacao.caucao)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Franquia</p>
                    <p className="text-sm text-slate-200">{brl(locacao.franquia)}</p>
                  </div>
                </div>

               <div className="mt-4 flex flex-wrap gap-3">
  <button
    onClick={() => baixarContratoDocx(locacao.id)}
    className="flex-1 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-sky-400"
  >
    Baixar DOCX
  </button>

  <button
    onClick={() => baixarContratoPdf(locacao.id)}
    className="flex-1 rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-cyan-400"
  >
    Baixar PDF
  </button>

  {locacao.status === "ATIVA" && (
    <button
      onClick={() => finalizarLocacao(locacao.id)}
      className="flex-1 rounded-2xl bg-red-500 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-red-400"
    >
      Finalizar
    </button>
  )}
</div>
              </motion.div>
            ))}

            {locacoesFiltradas.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center text-slate-400">
                Nenhuma locação encontrada.
              </div>
            )}
          </div>
        </motion.section>
      </PageWrapper>
    </Layout>
  );
}

