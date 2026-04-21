import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CarFront,
  Hash,
  ShieldCheck,
  Wallet,
  Wrench,
  Search,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  Activity,
  BarChart3,
  BadgeDollarSign,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Layout from "../components/Layout";
import PageWrapper from "../components/PageWrapper";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20";

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

function brl(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function normalizarStatus(status) {
  return String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
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

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("erro");
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    anoModelo: "",
    placa: "",
    renavam: "",
    chassi: "",
    franquia: "",
    valorSemanalPadrao: "",
    caucaoPadrao: "",
    status: "DISPONIVEL",
  });

  function mostrarMensagem(texto, tipo = "erro") {
    setMensagem(texto);
    setTipoMensagem(tipo);
    setTimeout(() => setMensagem(""), 3000);
  }

  async function carregarVeiculos() {
    try {
      const response = await fetch("https://carfex-backend.onrender.com/veiculos");
      const data = await response.json();
      setVeiculos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setVeiculos([]);
      mostrarMensagem("Erro ao carregar veículos");
    }
  }

  useEffect(() => {
    carregarVeiculos();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "placa" ? value.toUpperCase() : value,
    }));
  }

  async function salvarVeiculo(e) {
    e.preventDefault();

    if (!form.marca || !form.modelo || !form.placa || !form.status) {
      mostrarMensagem("Preencha marca, modelo, placa e status.");
      return;
    }

    try {
      setSalvando(true);

      const response = await fetch("https://carfex-backend.onrender.com/veiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marca: form.marca,
          modelo: form.modelo,
          anoModelo: form.anoModelo || null,
          placa: form.placa,
          renavam: form.renavam || null,
          chassi: form.chassi || null,
          franquia: form.franquia ? Number(form.franquia) : null,
          valorSemanalPadrao: form.valorSemanalPadrao
            ? Number(form.valorSemanalPadrao)
            : null,
          caucaoPadrao: form.caucaoPadrao ? Number(form.caucaoPadrao) : null,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || data.error || "Erro ao cadastrar veículo");
      }

      setForm({
        marca: "",
        modelo: "",
        anoModelo: "",
        placa: "",
        renavam: "",
        chassi: "",
        franquia: "",
        valorSemanalPadrao: "",
        caucaoPadrao: "",
        status: "DISPONIVEL",
      });

      await carregarVeiculos();
      mostrarMensagem("Veículo cadastrado com sucesso.", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirVeiculo(id) {
    const confirmar = window.confirm("Deseja excluir este veículo?");
    if (!confirmar) return;

    try {
      const response = await fetch(`https://carfex-backend.onrender.com/veiculos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || data.error || "Erro ao excluir veículo");
      }

      await carregarVeiculos();
      mostrarMensagem("Veículo excluído", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message || "Erro ao excluir veículo");
    }
  }

  const veiculosFiltrados = useMemo(() => {
    let lista = Array.isArray(veiculos) ? veiculos : [];

    if (filtroStatus !== "TODOS") {
      lista = lista.filter(
        (veiculo) => normalizarStatus(veiculo.status) === filtroStatus
      );
    }

    const termo = busca.toLowerCase().trim();
    if (!termo) return lista;

    return lista.filter((veiculo) => {
      return (
        String(veiculo.marca || "").toLowerCase().includes(termo) ||
        String(veiculo.modelo || "").toLowerCase().includes(termo) ||
        String(veiculo.placa || "").toLowerCase().includes(termo) ||
        String(veiculo.renavam || "").toLowerCase().includes(termo)
      );
    });
  }, [veiculos, busca, filtroStatus]);

  const total = veiculos.length;
  const disponiveis = veiculos.filter(
    (v) => normalizarStatus(v.status) === "DISPONIVEL"
  ).length;
  const alugados = veiculos.filter(
    (v) => normalizarStatus(v.status) === "ALUGADO"
  ).length;
  const manutencao = veiculos.filter(
    (v) => normalizarStatus(v.status) === "MANUTENCAO"
  ).length;

  const taxaDisponibilidade = total > 0 ? Math.round((disponiveis / total) * 100) : 0;

  const valorSemanalMedio =
    total > 0
      ? veiculos.reduce((acc, v) => acc + Number(v.valorSemanalPadrao || 0), 0) / total
      : 0;

  const caucaoMedia =
    total > 0
      ? veiculos.reduce((acc, v) => acc + Number(v.caucaoPadrao || 0), 0) / total
      : 0;

  const potencialSemanalFrota = veiculos.reduce(
    (acc, v) => acc + Number(v.valorSemanalPadrao || 0),
    0
  );

  const potencialMensalFrota = potencialSemanalFrota * 4;

  const rankingRentabilidade = [...veiculos]
    .map((veiculo) => ({
      label: [veiculo.marca, veiculo.modelo, veiculo.placa]
        .filter(Boolean)
        .join(" - "),
      valor: Number(veiculo.valorSemanalPadrao || 0),
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  const rankingCaucao = [...veiculos]
    .map((veiculo) => ({
      label: [veiculo.marca, veiculo.modelo, veiculo.placa]
        .filter(Boolean)
        .join(" - "),
      valor: Number(veiculo.caucaoPadrao || 0),
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  const graficoStatus = [
    { label: "Disponíveis", valor: disponiveis },
    { label: "Alugados", valor: alugados },
    { label: "Manutenção", valor: manutencao },
  ];

  return (
    <Layout title="Veículos">
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
            CARFEX • Gestão executiva da frota
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-6xl">
            Visão completa da{" "}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              frota
            </span>
          </h1>

          <p className="mt-3 text-sm text-slate-300 md:text-lg">
            Cadastre, acompanhe e analise os veículos com leitura operacional e financeira.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<CarFront className="h-4 w-4 text-cyan-300" />}
            title="Total de veículos"
            value={total}
            subtitle="Frota cadastrada"
            valueClass="text-cyan-400"
            delay={0.08}
          />
          <MetricCard
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
            title="Disponíveis"
            value={disponiveis}
            subtitle={`${taxaDisponibilidade}% da frota`}
            valueClass="text-emerald-400"
            delay={0.14}
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4 text-amber-300" />}
            title="Alugados"
            value={alugados}
            subtitle="Em operação"
            valueClass="text-amber-400"
            delay={0.2}
          />
          <MetricCard
            icon={<AlertTriangle className="h-4 w-4 text-rose-300" />}
            title="Manutenção"
            value={manutencao}
            subtitle="Indisponíveis temporariamente"
            valueClass="text-rose-400"
            delay={0.26}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<BadgeDollarSign className="h-4 w-4 text-sky-300" />}
            title="Potencial semanal"
            value={brl(potencialSemanalFrota)}
            subtitle="Se toda a frota estiver locada"
            valueClass="text-sky-400"
            delay={0.32}
          />
          <MetricCard
            icon={<BarChart3 className="h-4 w-4 text-cyan-300" />}
            title="Potencial mensal"
            value={brl(potencialMensalFrota)}
            subtitle="Estimado em 4 semanas"
            valueClass="text-cyan-400"
            delay={0.38}
          />
          <MetricCard
            icon={<Wallet className="h-4 w-4 text-violet-300" />}
            title="Valor semanal médio"
            value={brl(valorSemanalMedio)}
            subtitle="Média da frota"
            valueClass="text-violet-400"
            delay={0.44}
          />
          <MetricCard
            icon={<ShieldCheck className="h-4 w-4 text-emerald-300" />}
            title="Caução média"
            value={brl(caucaoMedia)}
            subtitle="Média por veículo"
            valueClass="text-emerald-400"
            delay={0.5}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-sky-900/10 backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-300">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Novo veículo</h2>
                <p className="text-sm text-slate-400">
                  Preencha os dados operacionais e financeiros do veículo.
                </p>
              </div>
            </div>

            <form onSubmit={salvarVeiculo} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Marca" icon={<CarFront className="h-4 w-4" />}>
                  <input type="text" name="marca" value={form.marca} onChange={handleChange} className={inputClass} placeholder="Ex: FIAT" />
                </Field>

                <Field label="Modelo" icon={<CarFront className="h-4 w-4" />}>
                  <input type="text" name="modelo" value={form.modelo} onChange={handleChange} className={inputClass} placeholder="Ex: MOBI LIKE" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Ano/Modelo" icon={<Hash className="h-4 w-4" />}>
                  <input type="text" name="anoModelo" value={form.anoModelo} onChange={handleChange} className={inputClass} placeholder="Ex: 2022/2023" />
                </Field>

                <Field label="Placa" icon={<Hash className="h-4 w-4" />}>
                  <input type="text" name="placa" value={form.placa} onChange={handleChange} className={inputClass} placeholder="ABC1D23" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="RENAVAM" icon={<Hash className="h-4 w-4" />}>
                  <input type="text" name="renavam" value={form.renavam} onChange={handleChange} className={inputClass} placeholder="RENAVAM" />
                </Field>

                <Field label="Chassi" icon={<Hash className="h-4 w-4" />}>
                  <input type="text" name="chassi" value={form.chassi} onChange={handleChange} className={inputClass} placeholder="Chassi" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Franquia" icon={<ShieldCheck className="h-4 w-4" />}>
                  <input type="number" step="0.01" name="franquia" value={form.franquia} onChange={handleChange} className={inputClass} placeholder="5600" />
                </Field>

                <Field label="Valor semanal padrão" icon={<Wallet className="h-4 w-4" />}>
                  <input type="number" step="0.01" name="valorSemanalPadrao" value={form.valorSemanalPadrao} onChange={handleChange} className={inputClass} placeholder="645" />
                </Field>

                <Field label="Caução padrão" icon={<Wallet className="h-4 w-4" />}>
                  <input type="number" step="0.01" name="caucaoPadrao" value={form.caucaoPadrao} onChange={handleChange} className={inputClass} placeholder="1650" />
                </Field>
              </div>

              <Field label="Status" icon={<Wrench className="h-4 w-4" />}>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  <option value="DISPONIVEL">DISPONÍVEL</option>
                  <option value="ALUGADO">ALUGADO</option>
                  <option value="MANUTENCAO">MANUTENÇÃO</option>
                </select>
              </Field>

              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={salvando}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {salvando ? "Salvando..." : "Cadastrar veículo"}
              </motion.button>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">Frota cadastrada</h2>
                  <p className="text-sm text-slate-400">Busque e filtre os veículos.</p>
                </div>

                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar veículo..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {["TODOS", "DISPONIVEL", "ALUGADO", "MANUTENCAO"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFiltroStatus(status)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      filtroStatus === status
                        ? "bg-sky-500 text-white"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {status === "TODOS"
                      ? "TODOS"
                      : status === "DISPONIVEL"
                      ? "DISPONÍVEL"
                      : status === "ALUGADO"
                      ? "ALUGADO"
                      : "MANUTENÇÃO"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {veiculosFiltrados.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-center text-slate-400">
                  Nenhum veículo encontrado.
                </div>
              ) : (
                veiculosFiltrados.map((veiculo, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.22 + index * 0.03 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    key={veiculo.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {[veiculo.marca, veiculo.modelo].filter(Boolean).join(" ")}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">{veiculo.placa}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            normalizarStatus(veiculo.status) === "DISPONIVEL"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : normalizarStatus(veiculo.status) === "ALUGADO"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {veiculo.status}
                        </span>

                        <button
                          onClick={() => excluirVeiculo(veiculo.id)}
                          className="rounded-full p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                          title="Excluir veículo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">Ano/Modelo</p>
                        <p className="text-sm text-slate-200">{veiculo.anoModelo || "-"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">RENAVAM</p>
                        <p className="text-sm text-slate-200">{veiculo.renavam || "-"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Chassi</p>
                        <p className="text-sm text-slate-200">{veiculo.chassi || "-"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Franquia</p>
                        <p className="text-sm text-slate-200">{brl(veiculo.franquia)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Valor semanal</p>
                        <p className="text-sm text-slate-200">{brl(veiculo.valorSemanalPadrao)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Caução</p>
                        <p className="text-sm text-slate-200">{brl(veiculo.caucaoPadrao)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-sky-300" />
              <h2 className="text-2xl font-semibold text-white">Distribuição da frota</h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Visão dos status operacionais dos veículos.
            </p>

            <MiniBarChart data={graficoStatus} formatValue={(v) => `${v}`} />
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

            {rankingRentabilidade.length > 0 ? (
              <HorizontalRanking items={rankingRentabilidade} valueFormatter={brl} />
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
              <ShieldCheck className="h-5 w-5 text-violet-300" />
              <h2 className="text-2xl font-semibold text-white">
                Maiores cauções da frota
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Ranking por caução padrão cadastrada.
            </p>

            {rankingCaucao.length > 0 ? (
              <HorizontalRanking items={rankingCaucao} valueFormatter={brl} />
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-slate-400">
                Nenhum veículo com caução cadastrada.
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <h2 className="text-2xl font-semibold text-white">Resumo executivo da frota</h2>
            <p className="mt-2 text-sm text-slate-400">
              Leitura rápida dos principais indicadores.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5">
                <p className="text-sm text-slate-300">Potencial semanal</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {brl(potencialSemanalFrota)}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                <p className="text-sm text-slate-300">Potencial mensal</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {brl(potencialMensalFrota)}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <p className="text-sm text-slate-300">Disponibilidade</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {taxaDisponibilidade}%
                </p>
              </div>

              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
                <p className="text-sm text-slate-300">Valor médio semanal</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {brl(valorSemanalMedio)}
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </PageWrapper>
    </Layout>
  );
}