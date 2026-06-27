import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  ShieldCheck,
  ShieldX,
  KeyRound,
  Phone,
  IdCard,
  CalendarDays,
  Lock,
  Unlock,
  Users,
  Sparkles,
  AlertTriangle,
  Wallet,
  Clock3,
  X,
  Eye,
  EyeOff,
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

function dataHoraBR(data) {
  if (!data) return "Nunca acessou";
  return new Date(data).toLocaleString("pt-BR");
}

function normalizar(texto) {
  return String(texto || "").toLowerCase().trim();
}

function StatusBadge({ ativo }) {
  return ativo ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
      <Unlock className="h-3.5 w-3.5" />
      Ativo
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-black text-red-300">
      <Lock className="h-3.5 w-3.5" />
      Bloqueado
    </span>
  );
}

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("TODOS");

  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  async function carregarMotoristas() {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(`${API_URL}/motoristas`);
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar motoristas");
      }

      setMotoristas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao carregar motoristas");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMotoristas();
  }, []);

  const resumo = useMemo(() => {
    const ativos = motoristas.filter((m) => m.ativo).length;
    const bloqueados = motoristas.filter((m) => !m.ativo).length;
    const inadimplentes = motoristas.filter((m) => m.inadimplente).length;
    const totalAberto = motoristas.reduce(
      (total, m) => total + Number(m.totalAberto || 0),
      0
    );

    return {
      total: motoristas.length,
      ativos,
      bloqueados,
      inadimplentes,
      totalAberto,
    };
  }, [motoristas]);

  const motoristasFiltrados = useMemo(() => {
    return motoristas.filter((m) => {
      const termo = normalizar(busca);

      const passaBusca =
        !termo ||
        normalizar(m.nome).includes(termo) ||
        normalizar(m.cpf).includes(termo) ||
        normalizar(m.telefone).includes(termo);

      const passaFiltro =
        filtro === "TODOS" ||
        (filtro === "ATIVOS" && m.ativo) ||
        (filtro === "BLOQUEADOS" && !m.ativo) ||
        (filtro === "INADIMPLENTES" && m.inadimplente);

      return passaBusca && passaFiltro;
    });
  }, [motoristas, busca, filtro]);

  async function alterarStatus(motorista) {
    const acao = motorista.ativo ? "bloquear" : "ativar";

    const confirmar = window.confirm(
      `Deseja ${acao} o acesso de ${motorista.nome}?`
    );

    if (!confirmar) return;

    try {
      const response = await fetch(`${API_URL}/motoristas/${motorista.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !motorista.ativo }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao alterar status");
      }

      await carregarMotoristas();
    } catch (error) {
      alert(error.message || "Erro ao alterar status");
    }
  }

  function abrirModalSenha(motorista) {
    setMotoristaSelecionado(motorista);
    setNovaSenha("");
    setMostrarSenha(false);
    setModalSenhaAberto(true);
  }

  function fecharModalSenha() {
    setModalSenhaAberto(false);
    setMotoristaSelecionado(null);
    setNovaSenha("");
  }

  async function salvarNovaSenha() {
    if (!motoristaSelecionado) return;

    if (!novaSenha || novaSenha.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setSalvandoSenha(true);

      const response = await fetch(
        `${API_URL}/motoristas/${motoristaSelecionado.id}/redefinir-senha`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ novaSenha }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao redefinir senha");
      }

      alert("Senha redefinida com sucesso.");
      fecharModalSenha();
    } catch (error) {
      alert(error.message || "Erro ao redefinir senha");
    } finally {
      setSalvandoSenha(false);
    }
  }

async function renovarContrato(motorista) {
  if (!motorista.locacaoId) {
    alert("Esse motorista não possui locação ativa.");
    return;
  }

  const confirmar = window.confirm(
    `Renovar automaticamente o contrato de ${motorista.nome}?`
  );

  if (!confirmar) return;

  try {
    const response = await fetch(
      `${API_URL}/locacoes/${motorista.locacaoId}/renovar`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro);
    }

    alert("Contrato renovado com sucesso!");

    carregarMotoristas();
  } catch (error) {
    alert(error.message);
  }
}

  return (
    <Layout title="Motoristas">
      <PageWrapper maxWidth="max-w-[1450px]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[36px] border border-cyan-400/15 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl"
        >
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
                <Sparkles className="h-4 w-4" />
                CARFEX • Controle de acesso dos motoristas
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                Gestão de{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                  motoristas
                </span>
              </h1>

              <p className="mt-3 max-w-3xl text-slate-300">
                Controle acessos, bloqueios, pendências financeiras e redefinição
                de senha dos motoristas vinculados ao portal.
              </p>
            </div>

            <button
              onClick={carregarMotoristas}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </motion.section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={<Users className="h-5 w-5" />} title="Motoristas" value={resumo.total} color="cyan" />
          <MetricCard icon={<ShieldCheck className="h-5 w-5" />} title="Ativos" value={resumo.ativos} color="emerald" />
          <MetricCard icon={<ShieldX className="h-5 w-5" />} title="Bloqueados" value={resumo.bloqueados} color="red" />
          <MetricCard icon={<AlertTriangle className="h-5 w-5" />} title="Inadimplentes" value={resumo.inadimplentes} color="amber" />
          <MetricCard icon={<Wallet className="h-5 w-5" />} title="Total em aberto" value={brl(resumo.totalAberto)} color="violet" />
        </section>

        <section className="mt-6 rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                Motoristas cadastrados
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Acompanhe segurança, acessos e risco financeiro.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar nome, CPF ou telefone..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40 md:w-[310px]"
                />
              </div>

              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
              >
                <option value="TODOS">Todos</option>
                <option value="ATIVOS">Ativos</option>
                <option value="BLOQUEADOS">Bloqueados</option>
                <option value="INADIMPLENTES">Inadimplentes</option>
              </select>
            </div>
          </div>

          {erro && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-slate-400">
              Carregando motoristas...
            </div>
          ) : motoristasFiltrados.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-6 text-center text-slate-400">
              Nenhum motorista encontrado.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              <AnimatePresence>
                {motoristasFiltrados.map((motorista, index) => (
                  <motion.div
                    key={motorista.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: index * 0.025 }}
                    whileHover={{ y: -3, scale: 1.005 }}
                    className={`rounded-[30px] border p-5 transition ${
                      motorista.inadimplente
                        ? "border-red-400/25 bg-red-500/10"
                        : motorista.ativo
                        ? "border-cyan-400/15 bg-slate-950/40"
                        : "border-red-400/20 bg-red-500/10"
                    }`}
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-black capitalize text-white">
                            {motorista.nome || "Motorista"}
                          </h3>

                          <StatusBadge ativo={motorista.ativo} />

                          {motorista.inadimplente && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/15 px-3 py-1 text-xs font-black text-red-300">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Inadimplente
                            </span>
                          )}
                        </div>

                        <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-5">
                          <Info icon={<IdCard className="h-4 w-4" />} label="CPF" value={motorista.cpf || "-"} />
                          <Info icon={<Phone className="h-4 w-4" />} label="Telefone" value={motorista.telefone || "-"} />
                          <Info icon={<CalendarDays className="h-4 w-4" />} label="Cadastro" value={dataBR(motorista.createdAt)} />
                          <Info icon={<Clock3 className="h-4 w-4" />} label="Último acesso" value={dataHoraBR(motorista.ultimoLogin)} />
                          <Info icon={<Wallet className="h-4 w-4" />} label="Em aberto" value={brl(motorista.totalAberto)} />
                          <Info
  icon={<CalendarDays className="h-4 w-4" />}
  label="Contrato"
  value={motorista.tempoContrato === "3_MESES" ? "3 meses" : motorista.tempoContrato === "6_MESES" ? "6 meses" : motorista.tempoContrato === "12_MESES" ? "12 meses" : "-"}
/>

<Info
  icon={<CalendarDays className="h-4 w-4" />}
  label="Próxima renovação"
  value={dataBR(motorista.dataFimContrato)}
/>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => abrirModalSenha(motorista)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
                        >
                          <KeyRound className="h-4 w-4" />
                          Redefinir senha
                        </button>

                        <button
  onClick={() => renovarContrato(motorista)}
  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-500/20"
>
  Renovar contrato
</button>

                        <button
                          onClick={() => alterarStatus(motorista)}
                          className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 ${
                            motorista.ativo
                              ? "border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                          }`}
                        >
                          {motorista.ativo ? (
                            <>
                              <ShieldX className="h-4 w-4" />
                              Bloquear
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        <AnimatePresence>
          {modalSenhaAberto && (
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
                className="w-full max-w-md rounded-[34px] border border-cyan-400/20 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(34,211,238,0.18)]"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      Redefinir senha
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {motoristaSelecionado?.nome}
                    </p>
                  </div>

                  <button
                    onClick={fecharModalSenha}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Nova senha
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 focus-within:border-cyan-400/50">
                  <KeyRound className="h-5 w-5 text-cyan-300" />

                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                    className="text-slate-400 transition hover:text-cyan-300"
                  >
                    {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <button
                  onClick={salvarNovaSenha}
                  disabled={salvandoSenha}
                  className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60"
                >
                  {salvandoSenha ? "Salvando..." : "Salvar nova senha"}
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
    red: "border-red-400/25 bg-red-500/10 text-red-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-200",
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

