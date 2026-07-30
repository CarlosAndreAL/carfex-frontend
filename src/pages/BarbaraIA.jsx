import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CarFront,
  CircleDollarSign,
  ShieldCheck,
  CalendarDays,
  Plus,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Sparkles,
  Wifi,
  Clock3,
  Gauge,
} from "lucide-react";

import Layout from "../components/Layout";
import API_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const estadoInicial = {
  nome: "",
  ano: "",
  valorSemanal: "",
  caucao: "",
  observacao: "",
};

function moeda(valor) {
  const numero = Number(valor || 0);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataHoje() {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

export default function BarbaraIA() {
  const { user } = useAuth();

  const [form, setForm] = useState(estadoInicial);
  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const empresaId =
    user?.empresaId ||
    user?.empresa?.id ||
    localStorage.getItem("empresaId") ||
    1;

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-empresa-id": String(empresaId),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [empresaId, token]
  );

  async function carregarVeiculos() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(
        `${API_URL}/barbara/veiculos/hoje`,
        { headers }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados?.erro || "Erro ao carregar veículos.");
      }

      setVeiculos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarVeiculos();
  }, []);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function adicionarVeiculo(evento) {
    evento.preventDefault();

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      const resposta = await fetch(
        `${API_URL}/barbara/veiculos`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            nome: form.nome,
            ano: form.ano || null,
            valorSemanal: form.valorSemanal,
            caucao: form.caucao,
            observacao: form.observacao,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados?.erro || "Erro ao adicionar veículo.");
      }

      setForm(estadoInicial);
      setMensagem("Veículo adicionado à disponibilidade de hoje.");
      await carregarVeiculos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(id, status) {
    try {
      setErro("");
      setMensagem("");

      const rota =
        status === "ALUGADO"
          ? `${API_URL}/barbara/veiculos/${id}/alugado`
          : `${API_URL}/barbara/veiculos/${id}/disponivel`;

      const resposta = await fetch(rota, {
        method: "PATCH",
        headers,
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados?.erro || "Erro ao atualizar status.");
      }

      setMensagem(
        status === "ALUGADO"
          ? "Veículo marcado como alugado e removido da lista da IA."
          : "Veículo voltou a ficar disponível para a IA."
      );

      await carregarVeiculos();
    } catch (error) {
      setErro(error.message);
    }
  }

  async function excluirVeiculo(id) {
    const confirmar = window.confirm(
      "Deseja remover este veículo da lista de hoje?"
    );

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");

      const resposta = await fetch(
        `${API_URL}/barbara/veiculos/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados?.erro || "Erro ao excluir veículo.");
      }

      setMensagem("Veículo removido da lista de hoje.");
      await carregarVeiculos();
    } catch (error) {
      setErro(error.message);
    }
  }

  const disponiveis = veiculos.filter(
    (veiculo) => veiculo.status === "DISPONIVEL"
  );

  const alugados = veiculos.filter(
    (veiculo) => veiculo.status === "ALUGADO"
  );

  const receitaSemanal = disponiveis.reduce(
    (total, veiculo) => total + Number(veiculo.valorSemanal || 0),
    0
  );

  const caucaoTotal = disponiveis.reduce(
    (total, veiculo) => total + Number(veiculo.caucao || 0),
    0
  );

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="border-b border-white/5 bg-slate-950/80 px-6 py-5 backdrop-blur-xl lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                <Sparkles className="h-4 w-4" />
                Inteligência comercial
              </div>

              <h1 className="text-3xl font-black tracking-tight lg:text-4xl">
                Central da <span className="text-cyan-400">Bárbara IA</span>
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Controle os veículos que a IA pode oferecer aos clientes durante o dia.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatusTopo
                icon={<Wifi className="h-4 w-4" />}
                label="WhatsApp"
                value="Conectado"
                destaque
              />

              <StatusTopo
                icon={<Bot className="h-4 w-4" />}
                label="Atendimento"
                value="Ativo"
              />

              <StatusTopo
                icon={<CalendarDays className="h-4 w-4" />}
                label="Disponibilidade"
                value="Hoje"
              />

              <StatusTopo
                icon={<Clock3 className="h-4 w-4" />}
                label="Atualização"
                value="Automática"
              />
            </div>
          </div>
        </div>

        <main className="space-y-6 p-5 lg:p-8">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metrica
              icon={<CarFront className="h-5 w-5" />}
              titulo="Disponíveis hoje"
              valor={disponiveis.length}
              descricao="Veículos que a Bárbara pode oferecer"
              cor="cyan"
            />

            <Metrica
              icon={<CheckCircle2 className="h-5 w-5" />}
              titulo="Alugados hoje"
              valor={alugados.length}
              descricao="Removidos da oferta automaticamente"
              cor="emerald"
            />

            <Metrica
              icon={<CircleDollarSign className="h-5 w-5" />}
              titulo="Receita semanal"
              valor={moeda(receitaSemanal)}
              descricao="Soma dos veículos disponíveis"
              cor="violet"
            />

            <Metrica
              icon={<ShieldCheck className="h-5 w-5" />}
              titulo="Cauções"
              valor={moeda(caucaoTotal)}
              descricao="Garantias dos veículos disponíveis"
              cor="amber"
            />
          </section>

          {(mensagem || erro) && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                erro
                  ? "border-red-500/20 bg-red-500/10 text-red-200"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {erro || mensagem}
            </div>
          )}

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.5fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                    <Plus className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">
                      Adicionar veículo
                    </h2>

                    <p className="text-sm text-slate-400">
                      Cadastre somente o que está disponível hoje.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={adicionarVeiculo}
                className="space-y-4"
              >
                <Campo
                  label="Veículo"
                  name="nome"
                  value={form.nome}
                  onChange={atualizarCampo}
                  placeholder="Ex: HB20 Comfort"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Campo
                    label="Ano"
                    name="ano"
                    value={form.ano}
                    onChange={atualizarCampo}
                    placeholder="2024"
                    type="number"
                  />

                  <Campo
                    label="Valor semanal"
                    name="valorSemanal"
                    value={form.valorSemanal}
                    onChange={atualizarCampo}
                    placeholder="700"
                    type="number"
                    required
                  />
                </div>

                <Campo
                  label="Caução"
                  name="caucao"
                  value={form.caucao}
                  onChange={atualizarCampo}
                  placeholder="3000"
                  type="number"
                  required
                />

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Observação
                  </label>

                  <textarea
                    name="observacao"
                    value={form.observacao}
                    onChange={atualizarCampo}
                    placeholder="Ex: completo, disponível para aplicativo..."
                    className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvando}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {salvando
                    ? "Adicionando..."
                    : "Adicionar à lista de hoje"}
                </button>

                <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.05] p-4">
                  <p className="text-xs leading-5 text-slate-400">
                    A lista é renovada automaticamente pela data. Amanhã, os veículos cadastrados hoje não serão mais enviados pela IA.
                  </p>
                </div>
              </form>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-400">
                    Disponibilidade comercial
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Veículos de hoje
                  </h2>

                  <p className="mt-1 text-sm capitalize text-slate-400">
                    {dataHoje()}
                  </p>
                </div>

                <button
                  onClick={carregarVeiculos}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                  Atualizar
                </button>
              </div>

              {carregando ? (
                <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-white/10">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                    <p className="mt-4 text-sm text-slate-400">
                      Carregando disponibilidade...
                    </p>
                  </div>
                </div>
              ) : veiculos.length === 0 ? (
                <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/10 px-6 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5">
                      <CarFront className="h-7 w-7 text-slate-500" />
                    </div>

                    <h3 className="mt-4 text-lg font-black">
                      Nenhum veículo cadastrado hoje
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Quando não houver veículos disponíveis, a Bárbara informa isso ao cliente e oferece atendimento humano.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {veiculos.map((veiculo) => (
                    <CardVeiculo
                      key={veiculo.id}
                      veiculo={veiculo}
                      onAlugado={() =>
                        alterarStatus(veiculo.id, "ALUGADO")
                      }
                      onDisponivel={() =>
                        alterarStatus(
                          veiculo.id,
                          "DISPONIVEL"
                        )
                      }
                      onExcluir={() =>
                        excluirVeiculo(veiculo.id)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-cyan-400/10 bg-gradient-to-r from-cyan-500/[0.08] via-blue-500/[0.05] to-transparent p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                  <Bot className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Como a Bárbara usa esta lista
                  </h3>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
                    Ao receber uma solicitação de locação, a IA consulta apenas os veículos marcados como disponíveis hoje. Quando você marca como alugado, ele deixa de ser oferecido imediatamente.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">
                <Gauge className="h-4 w-4" />
                Atualização em tempo real
              </div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}

function StatusTopo({
  icon,
  label,
  value,
  destaque = false,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
        <span
          className={
            destaque ? "text-emerald-400" : "text-cyan-400"
          }
        >
          {icon}
        </span>
        {label}
      </div>

      <p className="mt-1 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}

function Metrica({
  icon,
  titulo,
  valor,
  descricao,
  cor,
}) {
  const estilos = {
    cyan: "bg-cyan-500/10 text-cyan-300",
    emerald: "bg-emerald-500/10 text-emerald-300",
    violet: "bg-violet-500/10 text-violet-300",
    amber: "bg-amber-500/10 text-amber-300",
  };

  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${estilos[cor]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 text-2xl font-black text-white">
        {valor}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {descricao}
      </p>
    </div>
  );
}

function Campo({
  label,
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </label>

      <input
        {...props}
        className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
      />
    </div>
  );
}

function CardVeiculo({
  veiculo,
  onAlugado,
  onDisponivel,
  onExcluir,
}) {
  const disponivel = veiculo.status === "DISPONIVEL";

  return (
    <div
      className={`group relative overflow-hidden rounded-[26px] border p-5 transition ${
        disponivel
          ? "border-cyan-400/15 bg-cyan-500/[0.04] hover:border-cyan-400/35"
          : "border-red-400/10 bg-red-500/[0.03] opacity-80"
      }`}
    >
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                disponivel
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "bg-red-500/10 text-red-300"
              }`}
            >
              <CarFront className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {veiculo.nome}
              </h3>

              <p className="text-sm text-slate-500">
                {veiculo.ano || "Ano não informado"}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
              disponivel
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-red-500/10 text-red-300"
            }`}
          >
            {disponivel ? "Disponível" : "Alugado"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/5 bg-black/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Semana
            </p>

            <p className="mt-1 text-lg font-black text-cyan-300">
              {moeda(veiculo.valorSemanal)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Caução
            </p>

            <p className="mt-1 text-lg font-black text-violet-300">
              {moeda(veiculo.caucao)}
            </p>
          </div>
        </div>

        {veiculo.observacao && (
          <div className="mt-3 rounded-2xl border border-white/5 bg-black/10 p-3">
            <p className="text-xs leading-5 text-slate-400">
              {veiculo.observacao}
            </p>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {disponivel ? (
            <button
              onClick={onAlugado}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
            >
              <CheckCircle2 className="h-4 w-4" />
              Marcar alugado
            </button>
          ) : (
            <button
              onClick={onDisponivel}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              <RotateCcw className="h-4 w-4" />
              Voltar disponível
            </button>
          )}

          <button
            onClick={onExcluir}
            title="Excluir"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}