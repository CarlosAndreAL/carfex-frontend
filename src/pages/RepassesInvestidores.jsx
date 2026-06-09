import Layout from "../components/Layout";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  UploadCloud,
  CheckCircle2,
  Clock3,
  Trash2,
  ReceiptText,
  User,
  CarFront,
} from "lucide-react";
import API_URL from "../config/api";

function brl(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20";

export default function RepassesInvestidores() {
  const [investidores, setInvestidores] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [repasses, setRepasses] = useState([]);
  const [comprovante, setComprovante] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [form, setForm] = useState({
    investidorId: "",
    veiculoId: "",
    referenciaMes: "",
    referenciaSemana: "",
    valorBruto: "",
    valorLiquido: "",
    status: "PENDENTE",
    observacoes: "",
    tipo: "REPASSE",
  });

  async function carregarDados() {
    try {
      const [resInvestidores, resVeiculos, resRepasses] = await Promise.all([
        fetch(`${API_URL}/investidores`),
        fetch(`${API_URL}/veiculos`),
        fetch(`${API_URL}/investidores/repasses`),
      ]);

      const investidoresData = await resInvestidores.json().catch(() => []);
      const veiculosData = await resVeiculos.json().catch(() => []);
      const repassesData = await resRepasses.json().catch(() => []);

      setInvestidores(Array.isArray(investidoresData) ? investidoresData : []);
      setVeiculos(Array.isArray(veiculosData) ? veiculosData : []);
      setRepasses(Array.isArray(repassesData) ? repassesData : []);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao carregar dados.");
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const veiculosFiltrados = useMemo(() => {
    if (!form.investidorId) return veiculos;

    return veiculos.filter(
      (v) => Number(v.investidorId) === Number(form.investidorId)
    );
  }, [veiculos, form.investidorId]);

  const totalPago = repasses
  .filter(
    (r) =>
      String(r.status).toUpperCase() === "PAGO" &&
      r.tipo !== "MANUTENCAO"
  )
  .reduce((total, r) => total + Number(r.valorLiquido || 0), 0);

  const totalPendente = repasses
  .filter(
    (r) =>
      String(r.status).toUpperCase() !== "PAGO" &&
      r.tipo !== "MANUTENCAO"
  )
  .reduce((total, r) => total + Number(r.valorLiquido || 0), 0);

  async function salvarRepasse(e) {
    e.preventDefault();

    try {
      setCarregando(true);
      setMensagem("");

      const body = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        body.append(key, value);
      });

      if (comprovante) {
        body.append("comprovante", comprovante);
      }

      const response = await fetch(`${API_URL}/investidores/repasses`, {
        method: "POST",
        body,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao criar repasse.");
      }

      setForm({
  investidorId: "",
  veiculoId: "",
  referenciaMes: "",
  referenciaSemana: "",
  valorBruto: "",
  valorLiquido: "",
  status: "PENDENTE",
  observacoes: "",
  tipo: "REPASSE", // 🔥 ESSENCIAL
});

      setComprovante(null);
      setMensagem("Repasse lançado com sucesso.");
      carregarDados();
    } catch (error) {
      console.error(error);
      setMensagem(error.message || "Erro ao salvar repasse.");
    } finally {
      setCarregando(false);
    }
  }

  async function excluirRepasse(id) {
    const confirmar = window.confirm("Excluir este repasse?");
    if (!confirmar) return;

    try {
      const response = await fetch(`${API_URL}/investidores/repasses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao excluir repasse.");
      }

      setMensagem("Repasse excluído com sucesso.");
      carregarDados();
    } catch (error) {
      console.error(error);
      setMensagem(error.message || "Erro ao excluir repasse.");
    }
  }

  return (
    <Layout title="Repasses">
    <div className="min-h-screen px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[36px] border border-cyan-400/15 bg-white/[0.06] p-7 shadow-[0_25px_90px_rgba(2,8,23,0.55)] backdrop-blur-xl"
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-bold text-cyan-300">
              <Wallet className="h-4 w-4" />
              Financeiro dos investidores
            </div>

            <h1 className="text-4xl font-black md:text-5xl">
              Repasses de investidores
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Lance repasses, vincule veículos, controle pagamentos e anexe
              comprovantes para o investidor baixar no portal.
            </p>
          </div>
        </motion.div>

        {mensagem && (
          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            {mensagem}
          </div>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-5">
            <ReceiptText className="h-8 w-8 text-cyan-300" />
            <p className="mt-4 text-sm text-slate-400">Total de repasses</p>
            <p className="mt-1 text-3xl font-black">{repasses.length}</p>
          </div>

          <div className="rounded-[30px] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            <p className="mt-4 text-sm text-emerald-100/80">Pago</p>
            <p className="mt-1 text-3xl font-black">{brl(totalPago)}</p>
          </div>

          <div className="rounded-[30px] border border-amber-400/20 bg-amber-400/10 p-5">
            <Clock3 className="h-8 w-8 text-amber-300" />
            <p className="mt-4 text-sm text-amber-100/80">Pendente</p>
            <p className="mt-1 text-3xl font-black">{brl(totalPendente)}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.form
            onSubmit={salvarRepasse}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl"
          >
            <h2 className="text-2xl font-black">Novo repasse</h2>
            <p className="mt-1 text-sm text-slate-400">
              Preencha os dados financeiros e anexe o comprovante.
            </p>

            <div className="mt-6 space-y-4">
              <select
                name="investidorId"
                value={form.investidorId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Selecione o investidor</option>
                {investidores.map((investidor) => (
                  <option key={investidor.id} value={investidor.id}>
                    {investidor.nome}
                  </option>
                ))}
              </select>

              <select
                name="veiculoId"
                value={form.veiculoId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Selecione o veículo</option>
                {veiculosFiltrados.map((veiculo) => (
                  <option key={veiculo.id} value={veiculo.id}>
                    {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                  </option>
                ))}
              </select>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="referenciaMes"
                  value={form.referenciaMes}
                  onChange={handleChange}
                  placeholder="Mês referência: 04/2026"
                  className={inputClass}
                />

                <input
                  name="referenciaSemana"
                  value={form.referenciaSemana}
                  onChange={handleChange}
                  placeholder="Semana: 01 a 07"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="valorBruto"
                  value={form.valorBruto}
                  onChange={handleChange}
                  placeholder="Valor bruto"
                  type="number"
                  step="0.01"
                  className={inputClass}
                />

                <input
                  name="valorLiquido"
                  value={form.valorLiquido}
                  onChange={handleChange}
                  placeholder="Valor líquido"
                  type="number"
                  step="0.01"
                  className={inputClass}
                />
              </div>

              <select
  name="tipo"
  value={form.tipo}
  onChange={handleChange}
  className={inputClass}
>
  <option value="REPASSE">Repasse do investidor</option>
  <option value="MANUTENCAO">Repasse de manutenção</option>
</select>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="PENDENTE">PENDENTE</option>
                <option value="PAGO">PAGO</option>
              </select>

              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                placeholder="Observações"
                rows={4}
                className={inputClass}
              />

              <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/10 p-6 text-center transition hover:bg-cyan-400/20">
  <UploadCloud className="h-10 w-10 text-cyan-300" />

  <p className="mt-3 text-sm font-bold text-cyan-100">
    {comprovante ? comprovante.name : "Clique para anexar comprovante"}
  </p>

  <p className="mt-1 text-xs text-cyan-100/60">
    PDF, PNG ou JPG até 10MB
  </p>

  <input
    type="file"
    accept=".pdf,.png,.jpg,.jpeg"
    onChange={(e) => {
      const arquivo = e.target.files?.[0];

      if (!arquivo) {
        setComprovante(null);
        return;
      }

      console.log("Arquivo selecionado:", arquivo);
      setComprovante(arquivo);
    }}
    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
  />
</label>

              <button
                disabled={carregando}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {carregando ? "Salvando..." : "Lançar repasse"}
              </button>
            </div>
          </motion.form>

          <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
            <h2 className="text-2xl font-black">Histórico lançado</h2>
            <p className="mt-1 text-sm text-slate-400">
              Repasses que já aparecem no portal do investidor.
            </p>

            <div className="mt-6 space-y-4">
              {repasses.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-slate-400">
                  Nenhum repasse lançado ainda.
                </div>
              ) : (
                repasses.map((repasse) => (
                  <motion.div
                    key={repasse.id}
                    whileHover={{ y: -4 }}
                    className="rounded-[30px] border border-white/10 bg-slate-950/40 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
    {repasse.investidor?.nome || "Investidor"}
  </span>

  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
    {repasse.veiculo?.placa || "-"}
  </span>

  {/* 🔥 AQUI É O NOVO */}
  <span
    className={`rounded-full px-3 py-1 text-xs font-bold ${
      repasse.tipo === "MANUTENCAO"
        ? "border border-amber-400/20 bg-amber-400/10 text-amber-300"
        : "border border-sky-400/20 bg-sky-400/10 text-sky-300"
    }`}
  >
    {repasse.tipo === "MANUTENCAO" ? "MANUTENÇÃO" : "REPASSE"}
  </span>
</div>

                        <h3 className="mt-3 text-xl font-black">
                          {brl(repasse.valorLiquido)}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          Bruto: {brl(repasse.valorBruto)} • Ref:{" "}
                          {repasse.referenciaMes}
                        </p>

                        {repasse.observacoes && (
                          <p className="mt-2 text-sm text-slate-500">
                            {repasse.observacoes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            repasse.status === "PAGO"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-amber-400/10 text-amber-300"
                          }`}
                        >
                          {repasse.status}
                        </span>

                        <button
                          onClick={() => excluirRepasse(repasse.id)}
                          className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-red-300 transition hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
    </Layout>
  );
}

