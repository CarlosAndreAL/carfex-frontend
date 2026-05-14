import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  CreditCard,
  MapPin,
  FileText,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Users,
  BadgeDollarSign,
  ShieldCheck,
  Activity,
} from "lucide-react";
import Layout from "../components/Layout";
import PageWrapper from "../components/PageWrapper";

function aplicarMascaraCPF(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function aplicarMascaraTelefone(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function aplicarMascaraCEP(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

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

function HorizontalRanking({ items = [] }) {
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
              <p className="text-sm text-slate-300">{item.valor}</p>
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

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("erro");
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    rg: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  function mostrarMensagem(texto, tipo = "erro") {
    setMensagem(texto);
    setTipoMensagem(tipo);
    setTimeout(() => setMensagem(""), 3000);
  }

  async function carregarClientes() {
    try {
      const response = await fetch("https://carfex-backend.onrender.com/clientes");
      const data = await response.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setClientes([]);
      mostrarMensagem("Erro ao carregar clientes");
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  
  function formatarCep(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
}

async function buscarEnderecoPorCep(cepDigitado) {
  const cepLimpo = cepDigitado.replace(/\D/g, "");

  if (cepLimpo.length !== 8) return;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) {
      mostrarMensagem("CEP não encontrado.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      cep: formatarCep(cepLimpo),
      endereco: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      estado: data.uf || "",
    }));
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao buscar CEP.");
  }
}

function handleChange(e) {
  const { name, value } = e.target;

  if (name === "cpf") {
    setForm((prev) => ({
      ...prev,
cpf: aplicarMascaraCPF(value),    }));
    return;
  }

  if (name === "telefone") {
    setForm((prev) => ({
      ...prev,
telefone: aplicarMascaraTelefone(value),    }));
    return;
  }

  if (name === "cep") {
    const cepFormatado = formatarCep(value);

    setForm((prev) => ({
      ...prev,
      cep: cepFormatado,
    }));

    buscarEnderecoPorCep(cepFormatado);
    return;
  }

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
}

  async function salvarCliente(e) {
    e.preventDefault();

    if (!form.nome || !form.cpf || !form.telefone || !form.cep) {
      mostrarMensagem("Preencha nome, CPF, telefone e CEP.");
      return;
    }

    try {
      setSalvando(true);

      const response = await fetch("https://carfex-backend.onrender.com/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: form.nome,
          cpf: form.cpf,
          rg: form.rg || null,
          telefone: form.telefone,
          cep: form.cep,
          endereco: form.endereco || null,
          numero: form.numero || null,
          complemento: form.complemento || null,
          bairro: form.bairro || null,
          cidade: form.cidade || null,
          estado: form.estado || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || data.error || "Erro ao cadastrar cliente");
      }

      setForm({
        nome: "",
        cpf: "",
        rg: "",
        telefone: "",
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      });

      await carregarClientes();
      mostrarMensagem("Cliente cadastrado com sucesso.", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCliente(id) {
    const confirmar = window.confirm("Deseja excluir este cliente?");
    if (!confirmar) return;

    try {
      const response = await fetch(`https://carfex-backend.onrender.com/clientes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || data.error || "Erro ao excluir cliente");
      }

      await carregarClientes();
      mostrarMensagem("Cliente excluído", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarMensagem(error.message || "Erro ao excluir cliente");
    }
  }

  const clientesFiltrados = useMemo(() => {
    const lista = Array.isArray(clientes) ? clientes : [];
    const termo = busca.toLowerCase().trim();

    if (!termo) return lista;

    return lista.filter((cliente) => {
      return (
        String(cliente.nome || "").toLowerCase().includes(termo) ||
        String(cliente.cpf || "").toLowerCase().includes(termo) ||
        String(cliente.telefone || "").toLowerCase().includes(termo) ||
        String(cliente.cidade || "").toLowerCase().includes(termo)
      );
    });
  }, [clientes, busca]);

  const prontosContrato = clientes.filter(
    (c) =>
      c.nome &&
      c.cpf &&
      c.telefone &&
      c.cep &&
      c.endereco &&
      c.numero &&
      c.bairro &&
      c.cidade &&
      c.estado
  ).length;

  const incompletos = clientes.length - prontosContrato;

  const rankingCidades = useMemo(() => {
    const mapa = {};
    clientes.forEach((cliente) => {
      const cidade = cliente.cidade || "Sem cidade";
      mapa[cidade] = (mapa[cidade] || 0) + 1;
    });

    return Object.entries(mapa)
      .map(([label, valor]) => ({ label, valor: `${valor} cliente(s)`, bruto: valor }))
      .sort((a, b) => b.bruto - a.bruto)
      .slice(0, 5)
      .map((item) => ({ label: item.label, valor: item.valor, raw: item.bruto }));
  }, [clientes]);

  const rankingCompletude = [
    { label: "Prontos para contrato", valor: prontosContrato, raw: prontosContrato },
    { label: "Com cadastro incompleto", valor: incompletos, raw: incompletos },
  ];

  return (
    <Layout title="Clientes">
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
            CARFEX • Gestão executiva de clientes
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-6xl">
            Visão completa dos{" "}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              clientes
            </span>
          </h1>

          <p className="mt-3 text-sm text-slate-300 md:text-lg">
            Cadastre, acompanhe e analise os clientes com foco operacional e contratual.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Users className="h-4 w-4 text-cyan-300" />}
            title="Total de clientes"
            value={clientes.length}
            subtitle="Base completa cadastrada"
            valueClass="text-cyan-400"
            delay={0.08}
          />
          <MetricCard
            icon={<ShieldCheck className="h-4 w-4 text-emerald-300" />}
            title="Prontos para contrato"
            value={prontosContrato}
            subtitle="Cadastros completos"
            valueClass="text-emerald-400"
            delay={0.14}
          />
          <MetricCard
            icon={<Activity className="h-4 w-4 text-amber-300" />}
            title="Cadastros incompletos"
            value={incompletos}
            subtitle="Precisam de revisão"
            valueClass="text-amber-400"
            delay={0.2}
          />
          <MetricCard
            icon={<BadgeDollarSign className="h-4 w-4 text-violet-300" />}
            title="Taxa de completude"
            value={`${clientes.length ? Math.round((prontosContrato / clientes.length) * 100) : 0}%`}
            subtitle="Qualidade da base"
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
                <h2 className="text-xl font-semibold text-white">Novo cliente</h2>
                <p className="text-sm text-slate-400">
                  Preencha os dados usados no sistema e no contrato.
                </p>
              </div>
            </div>

            <form onSubmit={salvarCliente} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome completo" icon={<User className="h-4 w-4" />}>
                  <input type="text" name="nome" value={form.nome} onChange={handleChange} className={inputClass} placeholder="Nome completo" />
                </Field>

                <Field label="CPF" icon={<CreditCard className="h-4 w-4" />}>
                  <input type="text" name="cpf" value={form.cpf} onChange={handleChange} className={inputClass} placeholder="000.000.000-00" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="RG" icon={<FileText className="h-4 w-4" />}>
                  <input type="text" name="rg" value={form.rg} onChange={handleChange} className={inputClass} placeholder="RG" />
                </Field>

                <Field label="Telefone" icon={<Phone className="h-4 w-4" />}>
                  <input type="text" name="telefone" value={form.telefone} onChange={handleChange} className={inputClass} placeholder="(21) 99999-9999" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="CEP" icon={<MapPin className="h-4 w-4" />}>
                  <input type="text" name="cep" value={form.cep} onChange={handleChange} className={inputClass} placeholder="00000-000" />
                </Field>

                <Field label="Endereço" icon={<MapPin className="h-4 w-4" />}>
                  <input type="text" name="endereco" value={form.endereco} onChange={handleChange} className={inputClass} placeholder="Rua, Estrada, Avenida..." />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Número" icon={<MapPin className="h-4 w-4" />}>
                  <input type="text" name="numero" value={form.numero} onChange={handleChange} className={inputClass} placeholder="Número" />
                </Field>

                <Field label="Complemento" icon={<MapPin className="h-4 w-4" />}>
                  <input type="text" name="complemento" value={form.complemento} onChange={handleChange} className={inputClass} placeholder="Apto, bloco, casa..." />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Bairro" icon={<MapPin className="h-4 w-4" />}>
                  <input type="text" name="bairro" value={form.bairro} onChange={handleChange} className={inputClass} placeholder="Bairro" />
                </Field>

                <Field label="Cidade" icon={<MapPin className="h-4 w-4" />}>
                  <input type="text" name="cidade" value={form.cidade} onChange={handleChange} className={inputClass} placeholder="Cidade" />
                </Field>

                <Field label="Estado" icon={<MapPin className="h-4 w-4" />}>
                  <input type="text" name="estado" value={form.estado} onChange={handleChange} className={inputClass} placeholder="RJ" />
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
                {salvando ? "Salvando..." : "Cadastrar cliente"}
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
              <Activity className="h-5 w-5 text-sky-300" />
              <h2 className="text-2xl font-semibold text-white">Leitura executiva</h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Distribuição e qualidade dos cadastros.
            </p>

            <div className="mt-5">
              <HorizontalRanking
                items={rankingCompletude.map((item) => ({
                  label: item.label,
                  valor: item.valor,
                  raw: item.raw,
                }))}
              />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white">Cidades com mais clientes</h3>
              <HorizontalRanking
                items={rankingCidades.map((item) => ({
                  label: item.label,
                  valor: item.valor,
                  raw: item.raw,
                }))}
              />
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
              <h2 className="text-xl font-semibold text-white">Base de clientes</h2>
              <p className="text-sm text-slate-400">Busque, revise e exclua registros.</p>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            {clientesFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-center text-slate-400">
                Nenhum cliente encontrado.
              </div>
            ) : (
              clientesFiltrados.map((cliente, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.22 + index * 0.03 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  key={cliente.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{cliente.nome}</p>
                      <p className="mt-1 text-sm text-slate-400">{cliente.cpf}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300">
                        Cliente
                      </span>

                      <button
                        onClick={() => excluirCliente(cliente.id)}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                        title="Excluir cliente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">Telefone</p>
                      <p className="text-sm text-slate-200">{cliente.telefone || "-"}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">RG</p>
                      <p className="text-sm text-slate-200">{cliente.rg || "-"}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">CEP</p>
                      <p className="text-sm text-slate-200">{cliente.cep || "-"}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Cidade/UF</p>
                      <p className="text-sm text-slate-200">
                        {[cliente.cidade, cliente.estado].filter(Boolean).join(" / ") || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-slate-500">Endereço completo</p>
                    <p className="text-sm text-slate-200">
                      {[cliente.endereco, cliente.numero, cliente.complemento, cliente.bairro]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </p>
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