import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Search,
  Plus,
  Trash2,
  Sparkles,
  CalendarDays,
  CreditCard,
  User,
  Car,
  TrendingUp,
  Activity,
  BadgeDollarSign,
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

export default function Multas() {
  const [multas, setMultas] = useState([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("erro");
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    cliente: "",
    veiculo: "",
    valor: "",
    data: "",
    status: "PENDENTE",
  });

  function mostrarMensagem(texto, tipo = "erro") {
    setMensagem(texto);
    setTipoMensagem(tipo);
    setTimeout(() => setMensagem(""), 3000);
  }

  async function carregarMultas() {
    try {
      const response = await fetch("https://carfex-backend.onrender.com/multas");
      const data = await response.json();
      setMultas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMultas([]);
      mostrarMensagem("Erro ao carregar multas");
    }
  }

  useEffect(() => {
    carregarMultas();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function salvarMulta(e) {
  e.preventDefault();

  if (!form.cliente || !form.veiculo || !form.valor || !form.data || !form.status) {
    mostrarMensagem("Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    setSalvando(true);

    const response = await fetch("https://carfex-backend.onrender.com/multas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cliente: form.cliente,
        veiculo: form.veiculo,
        valor: Number(form.valor),
        data: form.data,
        status: form.status,
      }),
    });

    let data = {};
    const texto = await response.text();

    if (texto) {
      try {
        data = JSON.parse(texto);
      } catch {
        data = {};
      }
    }

    if (!response.ok) {
      throw new Error(data.erro || data.error || "Erro ao cadastrar multa");
    }

    setForm({
      cliente: "",
      veiculo: "",
      valor: "",
      data: "",
      status: "PENDENTE",
    });

    await carregarMultas();
    mostrarMensagem("Multa cadastrada com sucesso.", "sucesso");
  } catch (error) {
    console.error(error);
    mostrarMensagem(error.message || "Erro ao cadastrar multa", "erro");
  } finally {
    setSalvando(false);
  }
}
  async function excluirMulta(id) {
    const confirmar = window.confirm("Deseja excluir esta multa?");
    if (!confirmar) return;

    try {
      const response = await fetch(`https://carfex-backend.onrender.com/multas/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || data.error || "Erro ao excluir multa");
      }

      await carregarMultas();
      mostrarMensagem("Multa excluída", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message || "Erro ao excluir multa");
    }
  }

  const multasFiltradas = useMemo(() => {
    const lista = Array.isArray(multas) ? multas : [];
    const termo = busca.toLowerCase().trim();

    if (!termo) return lista;

    return lista.filter((multa) => {
      return (
        String(multa.cliente || "").toLowerCase().includes(termo) ||
        String(multa.veiculo || "").toLowerCase().includes(termo) ||
        String(multa.status || "").toLowerCase().includes(termo)
      );
    });
  }, [multas, busca]);

  const totalMultas = multas.length;
  const pendentes = multas.filter((m) => String(m.status || "").toUpperCase() === "PENDENTE").length;
  const pagas = multas.filter((m) => String(m.status || "").toUpperCase() === "PAGA").length;
  const totalValor = multas.reduce((acc, multa) => acc + Number(multa.valor || 0), 0);
  const valorPendente = multas
    .filter((m) => String(m.status || "").toUpperCase() === "PENDENTE")
    .reduce((acc, multa) => acc + Number(multa.valor || 0), 0);

  const rankingClientes = useMemo(() => {
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

  const rankingVeiculos = useMemo(() => {
    const mapa = {};
    multas.forEach((multa) => {
      const nome = multa.veiculo || "Veículo";
      mapa[nome] = (mapa[nome] || 0) + Number(multa.valor || 0);
    });

    return Object.entries(mapa)
      .map(([label, valor]) => ({ label, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [multas]);

  return (
    <Layout title="Multas">
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
            CARFEX • Gestão executiva de multas
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-6xl">
            Visão completa das{" "}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              multas
            </span>
          </h1>

          <p className="mt-3 text-sm text-slate-300 md:text-lg">
            Controle financeiro e operacional das infrações da frota.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<AlertCircle className="h-4 w-4 text-cyan-300" />}
            title="Total de multas"
            value={totalMultas}
            subtitle="Base cadastrada"
            valueClass="text-cyan-400"
            delay={0.08}
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4 text-rose-300" />}
            title="Pendentes"
            value={pendentes}
            subtitle={brl(valorPendente)}
            valueClass="text-rose-400"
            delay={0.14}
          />
          <MetricCard
            icon={<Activity className="h-4 w-4 text-emerald-300" />}
            title="Pagas"
            value={pagas}
            subtitle="Regularizadas"
            valueClass="text-emerald-400"
            delay={0.2}
          />
          <MetricCard
            icon={<BadgeDollarSign className="h-4 w-4 text-violet-300" />}
            title="Valor total"
            value={brl(totalValor)}
            subtitle="Soma geral das multas"
            valueClass="text-violet-400"
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
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-300">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Nova multa</h2>
                <p className="text-sm text-slate-400">Cadastre uma multa no sistema.</p>
              </div>
            </div>

            <form onSubmit={salvarMulta} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cliente" icon={<User className="h-4 w-4" />}>
                  <input type="text" name="cliente" value={form.cliente} onChange={handleChange} className={inputClass} placeholder="Nome do cliente" />
                </Field>

                <Field label="Veículo" icon={<Car className="h-4 w-4" />}>
                  <input type="text" name="veiculo" value={form.veiculo} onChange={handleChange} className={inputClass} placeholder="Veículo / placa" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Valor" icon={<CreditCard className="h-4 w-4" />}>
                  <input type="number" step="0.01" name="valor" value={form.valor} onChange={handleChange} className={inputClass} placeholder="0,00" />
                </Field>

                <Field label="Data" icon={<CalendarDays className="h-4 w-4" />}>
                  <input type="date" name="data" value={form.data} onChange={handleChange} className={inputClass} />
                </Field>

                <Field label="Status" icon={<AlertCircle className="h-4 w-4" />}>
                  <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                    <option value="PENDENTE">PENDENTE</option>
                    <option value="PAGA">PAGA</option>
                  </select>
                </Field>
              </div>

              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={salvando}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {salvando ? "Salvando..." : "Cadastrar multa"}
              </motion.button>
            </form>
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
              Concentração de multas por cliente.
            </p>

            {rankingClientes.length > 0 ? (
              <HorizontalRanking items={rankingClientes} valueFormatter={brl} />
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-slate-400">
                Nenhuma multa cadastrada.
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white">Veículos com maior impacto</h3>
              {rankingVeiculos.length > 0 ? (
                <HorizontalRanking items={rankingVeiculos} valueFormatter={brl} />
              ) : null}
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Base de multas</h2>
              <p className="text-sm text-slate-400">Busque e gerencie as multas.</p>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar multa..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            {multasFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-center text-slate-400">
                Nenhuma multa encontrada.
              </div>
            ) : (
              multasFiltradas.map((multa, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.22 + index * 0.03 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  key={multa.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{multa.cliente}</p>
                      <p className="mt-1 text-sm text-slate-400">{multa.veiculo}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          String(multa.status || "").toUpperCase() === "PAGA"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {multa.status}
                      </span>

                      <button
                        onClick={() => excluirMulta(multa.id)}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                        title="Excluir multa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">Valor</p>
                      <p className="text-sm text-slate-200">{brl(multa.valor)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Data</p>
                      <p className="text-sm text-slate-200">
                        {multa.data ? new Date(multa.data).toLocaleDateString("pt-BR") : "-"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
      </PageWrapper>
    </Layout>
  );
}