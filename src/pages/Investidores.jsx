import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CarFront,
  CircleCheckBig,
  CircleX,
  Link2,
  Mail,
  Phone,
  ShieldCheck,
  Wallet,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";
import Layout from "../components/Layout";
import API_URL from "../config/api";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20";

const selectClass =
  "w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20";

function CardIndicador({ icon: Icon, titulo, valor, subtitulo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_12px_40px_rgba(2,8,23,0.32)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            {titulo}
          </p>
          <p className="mt-3 text-3xl font-bold text-white">{valor}</p>
          <p className="mt-2 text-sm text-slate-400">{subtitulo}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/10 bg-sky-400/10 text-sky-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();

  if (s === "ATIVO") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        ATIVO
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-300">
      <span className="h-2 w-2 rounded-full bg-red-400" />
      INATIVO
    </span>
  );
}

export default function Investidores() {
  const [investidores, setInvestidores] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [investidorId, setInvestidorId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("info");
  const [carregando, setCarregando] = useState(true);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpfCnpj: "",
    senha: "",
    status: "ATIVO",
    investimentoTotal: "",
  });

  async function carregarDados() {
    try {
      setCarregando(true);

      const [resInvestidores, resVeiculos] = await Promise.all([
        fetch(`${API_URL}/investidores`),
        fetch(`${API_URL}/veiculos`),
      ]);

      const investidoresData = await resInvestidores.json().catch(() => []);
      const veiculosData = await resVeiculos.json().catch(() => []);

      setInvestidores(Array.isArray(investidoresData) ? investidoresData : []);
      setVeiculos(Array.isArray(veiculosData) ? veiculosData : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setTipoMensagem("erro");
      setMensagem("Erro ao carregar investidores.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function salvarInvestidor(e) {
    e.preventDefault();

    try {
      setMensagem("");
      setTipoMensagem("info");

      const response = await fetch(`${API_URL}/investidores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao cadastrar investidor");
      }

      setForm({
        nome: "",
        email: "",
        telefone: "",
        cpfCnpj: "",
        senha: "",
        status: "ATIVO",
      });

      setTipoMensagem("sucesso");
      setMensagem("Investidor cadastrado com sucesso.");
      await carregarDados();
    } catch (error) {
      console.error(error);
      setTipoMensagem("erro");
      setMensagem(error.message || "Erro ao cadastrar investidor");
    }
  }

  async function vincularVeiculo() {
    if (!investidorId || !veiculoId) {
      setTipoMensagem("erro");
      setMensagem("Selecione investidor e veículo.");
      return;
    }

    try {
      setMensagem("");
      setTipoMensagem("info");

      const response = await fetch(
        `${API_URL}/investidores/${investidorId}/vincular-veiculo/${veiculoId}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao vincular veículo");
      }

      setTipoMensagem("sucesso");
      setMensagem("Veículo vinculado com sucesso.");
      setInvestidorId("");
      setVeiculoId("");
      await carregarDados();
    } catch (error) {
      console.error(error);
      setTipoMensagem("erro");
      setMensagem(error.message || "Erro ao vincular veículo");
    }
  }

  async function excluirInvestidor(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este investidor?"
    );

    if (!confirmar) return;

    try {
      setMensagem("");
      setTipoMensagem("info");

      const response = await fetch(`${API_URL}/investidores/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao excluir investidor");
      }

      setTipoMensagem("sucesso");
      setMensagem("Investidor excluído com sucesso.");
      await carregarDados();
    } catch (error) {
      console.error(error);
      setTipoMensagem("erro");
      setMensagem(error.message || "Erro ao excluir investidor");
    }
  }

  const totalInvestidores = investidores.length;
  const investidoresAtivos = investidores.filter(
    (item) => String(item.status).toUpperCase() === "ATIVO"
  ).length;
  const totalVeiculosVinculados = investidores.reduce(
    (acc, item) => acc + (item.veiculos?.length || 0),
    0
  );
  const veiculosDisponiveis = veiculos.filter(
    (item) => !item.investidorId
  ).length;

  function brl(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

  const veiculosLivres = useMemo(
    () => veiculos.filter((veiculo) => !veiculo.investidorId),
    [veiculos]
  );

  return (
    <Layout title="Investidores">
      <div className="mx-auto w-full max-w-7xl">
        <section className="relative mb-6 overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.35)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.10),_transparent_26%)]" />
          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Gestão premium de investidores
              </div>

              <h1 className="text-3xl font-bold text-white md:text-5xl">
                Portal de investidores
              </h1>

              <p className="mt-3 max-w-3xl text-slate-300">
                Cadastre investidores, vincule veículos à carteira de cada um,
                acompanhe ativos relacionados e mantenha a estrutura pronta para
                o portal financeiro da operação.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-400/10 bg-cyan-400/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                Módulo estratégico
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Estrutura de patrimônio e repasse
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CardIndicador
            icon={BriefcaseBusiness}
            titulo="Investidores"
            valor={totalInvestidores}
            subtitulo="Cadastros totais no portal"
          />

          <CardIndicador
            icon={CircleCheckBig}
            titulo="Ativos"
            valor={investidoresAtivos}
            subtitulo="Investidores com status ativo"
          />

          <CardIndicador
            icon={CarFront}
            titulo="Veículos vinculados"
            valor={totalVeiculosVinculados}
            subtitulo="Ativos já conectados às carteiras"
          />

          <CardIndicador
            icon={WalletCards}
            titulo="Veículos livres"
            valor={veiculosDisponiveis}
            subtitulo="Disponíveis para nova vinculação"
          />
        </section>

        {mensagem && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${
              tipoMensagem === "erro"
                ? "border border-red-400/20 bg-red-500/10 text-red-200"
                : "border border-sky-400/20 bg-sky-500/10 text-sky-200"
            }`}
          >
            {mensagem}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.28)]"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/10 bg-sky-400/10 text-sky-300">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Novo investidor
                </h2>
                <p className="text-sm text-slate-400">
                  Cadastre um novo parceiro da operação.
                </p>
              </div>
            </div>

            <form onSubmit={salvarInvestidor} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Nome completo"
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="Telefone"
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <div className="relative">
                  <BadgeDollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="cpfCnpj"
                    value={form.cpfCnpj}
                    onChange={handleChange}
                    placeholder="CPF ou CNPJ"
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <div className="relative">
                  <Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  
                   <input
                   name="investimentoTotal"
                   type="number"
                   value={form.investimentoTotal}
                   onChange={handleChange}
                   placeholder="Valor investido (R$)"
                   className={`${inputClass} pl-11`}
                       />
                         </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <input
                  name="senha"
                  type="password"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="Senha do investidor"
                  className={inputClass}
                />

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Cadastrar investidor
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.28)]"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-300">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Vincular veículo
                </h2>
                <p className="text-sm text-slate-400">
                  Relacione um ativo a um investidor.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <select
                value={investidorId}
                onChange={(e) => setInvestidorId(e.target.value)}
                className={selectClass}
              >
                <option value="">Selecione o investidor</option>
                {investidores.map((investidor) => (
                  <option key={investidor.id} value={investidor.id}>
                    {investidor.nome}
                  </option>
                ))}
              </select>

              <select
                value={veiculoId}
                onChange={(e) => setVeiculoId(e.target.value)}
                className={selectClass}
              >
                <option value="">Selecione o veículo</option>
                {veiculosLivres.map((veiculo) => (
                  <option key={veiculo.id} value={veiculo.id}>
                    {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={vincularVeiculo}
                className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400"
              >
                Vincular veículo
              </button>

              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
                {veiculosLivres.length > 0
                  ? `${veiculosLivres.length} veículo(s) disponível(is) para nova vinculação.`
                  : "Nenhum veículo livre disponível no momento."}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.28)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/10 bg-sky-400/10 text-sky-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Investidores cadastrados
              </h2>
              <p className="text-sm text-slate-400">
                Visualização executiva dos investidores e seus ativos.
              </p>
            </div>
          </div>

          {carregando ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-slate-400">
              Carregando investidores...
            </div>
          ) : investidores.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-slate-400">
              Nenhum investidor cadastrado ainda.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {investidores.map((investidor, index) => {
  const totalRecebido = Number(investidor.totalRecebido || 0);
  const percentual = Number(investidor.percentual || 0);

async function atualizarPercentualEmpresa(id, percentualEmpresa) {
  try {
    setMensagem("");
    setTipoMensagem("info");

    const response = await fetch(
      `${API_URL}/investidores/${id}/percentual-empresa`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ percentualEmpresa }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.erro || "Erro ao atualizar percentual");
    }

    setTipoMensagem("sucesso");
    setMensagem("Percentual da empresa atualizado com sucesso.");

    await carregarDados();
  } catch (error) {
    console.error(error);
    setTipoMensagem("erro");
    setMensagem(error.message || "Erro ao atualizar percentual");
  }
}

  return (
    <motion.div
      key={investidor.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-[28px] border border-white/10 bg-slate-900/60 p-5"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">
              {investidor.nome}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {investidor.email}
            </p>
          </div>

          <StatusBadge status={investidor.status} />
        </div>

        <div className="grid gap-3 text-sm text-slate-400 md:grid-cols-2">
          <p>Telefone: {investidor.telefone || "-"}</p>
          <p>CPF/CNPJ: {investidor.cpfCnpj || "-"}</p>
          <p>Veículos: {investidor.veiculos?.length || 0}</p>
          <p>ID: {investidor.id}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/10 p-4">
            <p className="text-xs text-slate-400">Investido</p>
            <p className="mt-1 text-lg font-bold text-white">
              {brl(investidor.investimentoTotal)}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 p-4">
            <p className="text-xs text-slate-400">Retornado</p>
            <p className="mt-1 text-lg font-bold text-white">
              {brl(totalRecebido)}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-400/10 bg-purple-400/10 p-4">
            <p className="text-xs text-slate-400">ROI</p>
            <p className="mt-1 text-lg font-bold text-white">
              {percentual.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
            style={{
              width: `${Math.min(percentual, 100)}%`,
            }}
          />
        </div>

        {investidor.veiculos?.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">
              Veículos vinculados
            </p>

            <div className="flex flex-wrap gap-2">
              {investidor.veiculos.map((veiculo) => (
                <span
                  key={veiculo.id}
                  className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-200"
                >
                  {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            Nenhum veículo vinculado.
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
  <p className="mb-3 text-sm font-semibold text-slate-300">
    Percentual da empresa
  </p>

  <div className="flex flex-wrap gap-2">
    {[
      { label: "10%", value: 10 },
      { label: "15%", value: 15 },
      { label: "20%", value: 20 },
      { label: "NULO", value: 100 },
    ].map((opcao) => {
      const ativo =
        Number(investidor.percentualEmpresa || 15) === opcao.value;

      return (
        <button
          key={opcao.value}
          type="button"
          onClick={() =>
            atualizarPercentualEmpresa(investidor.id, opcao.value)
          }
          className={`rounded-xl border px-4 py-2 text-xs font-black transition ${
            ativo
              ? "border-cyan-300/40 bg-cyan-400/20 text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.18)]"
              : "border-white/10 bg-white/5 text-slate-400 hover:border-cyan-400/30 hover:text-white"
          }`}
        >
          {opcao.label}
        </button>
      );
    })}
  </div>

  <p className="mt-3 text-xs text-slate-500">
    {Number(investidor.percentualEmpresa || 15) === 100
      ? "NULO = carro próprio da empresa. A CARFEX fica com 100% do bruto."
      : `A CARFEX fica com ${Number(
          investidor.percentualEmpresa || 15
        )}% do faturamento bruto dos veículos vinculados.`}
  </p>
</div>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => excluirInvestidor(investidor.id)}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Excluir investidor
          </button>
        </div>
      </div>
    </motion.div>
  );
})}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

