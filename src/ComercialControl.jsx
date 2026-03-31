import { useState, useEffect, useCallback, useMemo } from "react";

// ============================================================
// SUPABASE CONFIG — mesmo projeto do RHControl
// ============================================================
const SUPABASE_URL      = "https://ziqqyuburyvmfsnqkqkt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXF5dWJ1cnl2bWZzbnFrcWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTE0MjIsImV4cCI6MjA4OTMyNzQyMn0.eljJE-TeDe4Vux1kY4HcwIdhUETnJR2vpuCEAZ6gNNU";
const USE_SUPABASE = true;

// ============================================================
// ADMIN AUTH — mesmo usuário/senha do RHControl
// ============================================================
const ADMIN_USER      = "admin";
const ADMIN_PASS_HASH = "fa4ceb16548f4b1aa428afeed1fe8586f88bcd36e9c8483c03a33d573e02a5b9";

async function hashPassword(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================
// TELA DE BOAS-VINDAS — identidade RHControl
// ============================================================
function WelcomeScreen({ onAcessar }) {
  const frase = "Gestão comercial com precisão e resultados.";
  return (
    <div style={{ minHeight:"100vh", position:"relative", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80')", backgroundSize:"cover", backgroundPosition:"center", filter:"brightness(0.50)" }} />
      <div style={{ position:"relative", textAlign:"center", maxWidth:480, background:"rgba(0,0,0,0.55)", borderRadius:24, padding:"48px 52px" }}>
        <img src="data:image/png;base64,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" alt="Logo" style={{ width:120, height:120, objectFit:"contain", marginBottom:24 }} onError={e => e.target.style.display="none"} />
        <div style={{ fontSize:32, fontWeight:900, color:"white", marginBottom:32, letterSpacing:-1 }}>Altitude Topografia e Engenharia</div>
        <div style={{ fontSize:17, color:"rgba(255,255,255,0.75)", fontStyle:"italic", marginBottom:48, lineHeight:1.7, maxWidth:380, margin:"0 auto 48px" }}>
          "{frase}"
        </div>
        <button onClick={onAcessar}
          style={{ padding:"16px 56px", border:"none", borderRadius:14, cursor:"pointer", fontWeight:900, fontSize:17, background:"linear-gradient(135deg,#1DB864,#0A7A3C)", color:"white", boxShadow:"0 8px 32px rgba(29,184,100,0.4)", letterSpacing:0.5 }}>
          Acessar Sistema
        </button>
      </div>
    </div>
  );
}

// ============================================================
// TELA DE LOGIN — identidade RHControl
// ============================================================
function LoginScreen({ onLogin, onVoltar }) {
  const [user, setUser]     = useState("");
  const [pass, setPass]     = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!user || !pass) { setError("Preencha usuário e senha."); return; }
    setLoading(true); setError("");
    if (user !== ADMIN_USER) { setError("Usuário ou senha incorretos."); setLoading(false); return; }
    const hash = await hashPassword(pass);
    if (hash !== ADMIN_PASS_HASH) { setError("Usuário ou senha incorretos."); setLoading(false); return; }
    onLogin();
  }

  return (
    <div style={{ minHeight:"100vh", background:"#EEF2F7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background:"white", borderRadius:20, padding:"40px 44px", width:"100%", maxWidth:420, boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontWeight:900, fontSize:26, color:"#0A0A0A", marginBottom:8 }}>Bem Vindo!</div>
          <div style={{ fontSize:15, color:"#64748B" }}>Faça login para acessar o sistema Comercial.</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#64748B", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.7px" }}>Usuário</label>
          <input value={user} onChange={e => { setUser(e.target.value); setError(""); }} placeholder="Digite seu usuário"
            style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #E2E8F0", borderRadius:9, fontSize:14, color:"#1E293B", background:"white", outline:"none", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor="#1DB864"} onBlur={e => e.target.style.borderColor="#E2E8F0"} />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#64748B", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.7px" }}>Senha</label>
          <div style={{ position:"relative" }}>
            <input type={showPass?"text":"password"} value={pass} onChange={e => { setPass(e.target.value); setError(""); }} placeholder="Digite sua senha"
              onKeyDown={e => e.key==="Enter" && handleLogin()}
              style={{ width:"100%", padding:"10px 44px 10px 13px", border:`1.5px solid ${error?"#EF4444":"#E2E8F0"}`, borderRadius:9, fontSize:14, color:"#1E293B", background:"white", outline:"none", boxSizing:"border-box" }}
              onFocus={e => !error && (e.target.style.borderColor="#1DB864")} onBlur={e => !error && (e.target.style.borderColor="#E2E8F0")} />
            <button onClick={() => setShowPass(v => !v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#64748B", fontSize:16, padding:2 }}>
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
          {error && <div style={{ fontSize:12, color:"#EF4444", marginTop:8, fontWeight:600 }}>⚠️ {error}</div>}
        </div>
        <button onClick={handleLogin} disabled={loading}
          style={{ width:"100%", padding:"13px", border:"none", borderRadius:11, cursor:loading?"not-allowed":"pointer", fontWeight:800, fontSize:15, background:loading?"#E2E8F0":"linear-gradient(135deg,#0A0A0A,#1DB864)", color:loading?"#94A3B8":"white", transition:"all 0.2s", marginBottom:12 }}>
          {loading ? "Verificando..." : "Entrar"}
        </button>
        <button onClick={onVoltar}
          style={{ width:"100%", padding:"11px", border:"1.5px solid #E2E8F0", borderRadius:11, cursor:"pointer", fontWeight:600, fontSize:13, background:"white", color:"#64748B" }}
          onMouseEnter={e => e.target.style.background="#F8FAFC"} onMouseLeave={e => e.target.style.background="white"}>
          ← Voltar
        </button>
      </div>
    </div>
  );
}

async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  if (res.status === 204) return null;
  return res.json();
}

// Helpers Supabase
const sbSelect  = (table, query = "*") => sb(`/${table}?select=${query}&order=created_at.desc`);
const sbInsert  = (table, body)        => sb(`/${table}`, { method: "POST", body: JSON.stringify(body) });
const sbUpdate  = (table, id, body)    => sb(`/${table}?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(body) });
const sbDelete  = (table, id)          => sb(`/${table}?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" });
const sbDeleteBy = (table, col, val)   => sb(`/${table}?${col}=eq.${val}`, { method: "DELETE", prefer: "return=minimal" });

// ============================================================
// SQL SCHEMA — criar no Supabase Dashboard → SQL Editor
// ============================================================
/*
create table clientes (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null,
  cnpj text,
  contato text,
  email text,
  telefone text,
  cidade text,
  estado text,
  created_at timestamptz default now()
);

create table propostas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  cliente_id uuid references clientes(id),
  titulo text not null,
  tipo text,
  status text default 'rascunho',
  data_emissao date not null,
  data_validade date not null,
  descricao_servico text,
  revisoes_inclusas int default 6,
  valor_total numeric(12,2),
  desconto numeric(12,2) default 0,
  valor_com_desconto numeric(12,2),
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table proposta_itens (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid references propostas(id) on delete cascade,
  descricao text not null,
  codigo_unidade text,
  valor_unitario numeric(12,4),
  quantidade numeric(12,4),
  valor_total numeric(12,2),
  sort_order int default 0
);

create table proposta_parcelas (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid references propostas(id) on delete cascade,
  numero int not null,
  valor numeric(12,2) not null,
  descricao text,
  sort_order int default 0
);

create table contratos (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid references propostas(id),
  cliente_id uuid references clientes(id),
  codigo text not null unique,
  status text default 'ativo',
  data_assinatura date,
  data_inicio date,
  data_fim_prevista date,
  prazo_meses int,
  valor_total numeric(12,2),
  observacoes text,
  created_at timestamptz default now()
);

create table orcamentos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  cliente_id uuid references clientes(id),
  titulo text not null,
  status text default 'aberto',
  data date not null,
  valor_total numeric(12,2),
  desconto numeric(12,2) default 0,
  observacoes text,
  -- Campos da calculadora (snapshot do cálculo)
  margem int,
  emitir_nf boolean default true,
  custo_total numeric(12,2),
  preco_ideal_sem_nf numeric(12,2),
  preco_ideal_com_nf numeric(12,2),
  fator_regua numeric(6,4),
  dias_campo int,
  created_at timestamptz default now()
);

-- RLS: habilitar e criar políticas conforme sua autenticação
-- alter table clientes enable row level security;
-- (repita para cada tabela)
*/

// ============================================================
// MOCK DATA — usado quando USE_SUPABASE = false
// ============================================================
const MOCK = {
  clientes: [
    { id: "c1", razao_social: "GSP Golden Boituva II Empreendimentos Imobiliários Ltda", cnpj: "19.105.692/0001-60", contato: "Cibele Nakamura", email: "cibele@gspboituva.com.br", telefone: "", cidade: "Boituva", estado: "SP" },
    { id: "c2", razao_social: "Pacaembu Construtora SA", cnpj: "96.298.013/0001-68", contato: "Valdinei Torres", email: "valdinei@pacaembu.com.br", telefone: "", cidade: "Uberlândia", estado: "MG" },
  ],
  propostas: [
    { id: "p1", codigo: "2026.0015.V2", cliente_id: "c1", titulo: "Projetos de Infraestrutura | Golden Boituva 2", tipo: "infraestrutura", status: "enviada", data_emissao: "2026-03-30", data_validade: "2026-05-01", valor_total: 44677.50, desconto: 4467.75, valor_com_desconto: 40209.75, revisoes_inclusas: 6 },
    { id: "p2", codigo: "2026.0012.V1", cliente_id: "c2", titulo: "Topografia | Campo Alegre C1", tipo: "topografia", status: "enviada", data_emissao: "2026-03-09", data_validade: "2026-04-10", valor_total: 357000.00, desconto: 0, valor_com_desconto: 357000.00, revisoes_inclusas: 0 },
  ],
  proposta_itens: [
    { id: "i1", proposta_id: "p1", descricao: "Projeto de Terraplanagem Loteamento", codigo_unidade: "m²", valor_unitario: 0.15, quantidade: 297850, valor_total: 44677.50 },
    { id: "i2", proposta_id: "p2", descricao: "Equipe de Topografia Mensal", codigo_unidade: "mês", valor_unitario: 25500.00, quantidade: 14, valor_total: 357000.00 },
  ],
  proposta_parcelas: [
    { id: "pa1", proposta_id: "p1", numero: 1, valor: 6031.46, descricao: "Na assinatura do contrato" },
    { id: "pa2", proposta_id: "p1", numero: 2, valor: 16087.90, descricao: "30 dias após quitação da Parcela 1" },
    { id: "pa3", proposta_id: "p1", numero: 3, valor: 12062.93, descricao: "30 dias após quitação da Parcela 2" },
    { id: "pa4", proposta_id: "p1", numero: 4, valor: 6027.46, descricao: "30 dias após quitação da Parcela 3" },
    { id: "pa5", proposta_id: "p2", numero: 1, valor: 25500.00, descricao: "Medição mensal (×14)" },
  ],
  contratos: [
    { id: "ct1", proposta_id: "p2", cliente_id: "c2", codigo: "2026.CT.001", status: "ativo", data_assinatura: "2026-03-15", data_inicio: "2026-04-01", data_fim_prevista: "2027-06-01", prazo_meses: 14, valor_total: 357000.00 },
  ],
  orcamentos: [
    { id: "o1", cliente_id: "c1", codigo: "ORC-2026-001", titulo: "Levantamento Planialtimétrico - Golden", status: "aprovado", data: "2026-02-10", valor_total: 12500.00, desconto: 0 },
  ],
};

// ============================================================
// HOOK GENÉRICO — carrega dados do Supabase ou MOCK
// ============================================================
function useTable(table, mockKey, selectQuery = "*") {
  const [data, setData]       = useState(MOCK[mockKey] || []);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    if (!USE_SUPABASE) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await sbSelect(table, selectQuery);
      setData(rows || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [table, selectQuery]);

  useEffect(() => { load(); }, [load]);

  const insert = useCallback(async (body) => {
    if (!USE_SUPABASE) {
      const rec = { ...body, id: table + Date.now() };
      setData(p => [rec, ...p]);
      return rec;
    }
    const rows = await sbInsert(table, body);
    const rec = Array.isArray(rows) ? rows[0] : rows;
    setData(p => [rec, ...p]);
    return rec;
  }, [table]);

  const update = useCallback(async (id, body) => {
    if (!USE_SUPABASE) {
      setData(p => p.map(r => r.id === id ? { ...r, ...body } : r));
      return { id, ...body };
    }
    const rows = await sbUpdate(table, id, body);
    const rec = Array.isArray(rows) ? rows[0] : rows;
    setData(p => p.map(r => r.id === id ? rec : r));
    return rec;
  }, [table]);

  const remove = useCallback(async (id) => {
    if (!USE_SUPABASE) { setData(p => p.filter(r => r.id !== id)); return; }
    await sbDelete(table, id);
    setData(p => p.filter(r => r.id !== id));
  }, [table]);

  return { data, setData, loading, error, load, insert, update, remove };
}

// ============================================================
// UTILS
// ============================================================
const fmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—";
const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";
const nextCodigo = (propostas) => {
  const year = new Date().getFullYear();
  const max = propostas.reduce((acc, p) => {
    const m = p.codigo.match(/\d{4}\.(\d{4})/);
    return m ? Math.max(acc, parseInt(m[1])) : acc;
  }, 0);
  return `${year}.${String(max + 1).padStart(4, "0")}.V1`;
};

const STATUS_COLORS = {
  rascunho:  { bg: "#f1f5f9", text: "#64748b", label: "Rascunho" },
  enviada:   { bg: "#dbeafe", text: "#1d4ed8", label: "Enviada" },
  aprovada:  { bg: "#dcfce7", text: "#15803d", label: "Aprovada" },
  recusada:  { bg: "#fee2e2", text: "#b91c1c", label: "Recusada" },
  expirada:  { bg: "#fef3c7", text: "#b45309", label: "Expirada" },
  aberto:    { bg: "#dbeafe", text: "#1d4ed8", label: "Aberto" },
  aprovado:  { bg: "#dcfce7", text: "#15803d", label: "Aprovado" },
  reprovado: { bg: "#fee2e2", text: "#b91c1c", label: "Reprovado" },
  ativo:     { bg: "#dcfce7", text: "#15803d", label: "Ativo" },
  concluido: { bg: "#f1f5f9", text: "#64748b", label: "Concluído" },
  cancelado: { bg: "#fee2e2", text: "#b91c1c", label: "Cancelado" },
};

const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: "#f1f5f9", text: "#64748b", label: status };
  return (
    <span style={{ background: s.bg, color: s.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
};

// ============================================================
// DESIGN TOKENS
// ============================================================
const COLORS = {
  bg: "#f4f6f9",
  sidebar: "#EEF2F7",
  sidebarActive: "rgba(29,184,100,0.08)",
  sidebarBorder: "#E2E8F0",
  accent: "#1DB864",
  accentLight: "#e8f5ee",
  accentHover: "#17a358",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  card: "#ffffff",
  danger: "#dc2626",
  warning: "#d97706",
};

// ============================================================
// CSS GLOBAL
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sora', sans-serif; background: ${COLORS.bg}; color: ${COLORS.text}; }

  .app { display: flex; height: 100vh; overflow: hidden; }

  .sidebar { width: 260px; flex-shrink: 0; background: ${COLORS.sidebar}; display: flex; flex-direction: column; border-right: 1px solid ${COLORS.border}; }
  .sidebar-logo { padding: 20px 20px 16px; border-bottom: 1px solid ${COLORS.border}; display: flex; align-items: center; gap: 10px; }
  .sidebar-logo img { width: 36px; height: 36px; object-fit: contain; }
  .sidebar-logo-tag { font-size: 9px; font-weight: 700; letter-spacing: 2px; color: ${COLORS.accent}; text-transform: uppercase; margin-bottom: 2px; }
  .sidebar-logo-name { font-size: 14px; font-weight: 700; color: ${COLORS.text}; letter-spacing: -0.3px; }
  .sidebar-logo-name span { color: ${COLORS.accent}; }
  .sidebar-logo-sub { font-size: 10px; color: ${COLORS.textMuted}; margin-top: 1px; }
  .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
  .nav-section { padding: 16px 20px 6px; font-size: 9px; font-weight: 700; letter-spacing: 2px; color: ${COLORS.textMuted}; text-transform: uppercase; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; cursor: pointer; color: ${COLORS.textMuted}; font-size: 13px; font-weight: 500; transition: all 0.15s; border-left: 3px solid transparent; }
  .nav-item:hover { background: rgba(29,184,100,0.05); color: ${COLORS.text}; }
  .nav-item.active { background: ${COLORS.sidebarActive}; color: ${COLORS.accent}; border-left-color: ${COLORS.accent}; font-weight: 700; }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-badge { margin-left: auto; background: ${COLORS.accent}; color: #fff; border-radius: 10px; font-size: 10px; font-weight: 700; padding: 1px 7px; }
  .sidebar-footer { padding: 16px 20px; border-top: 1px solid ${COLORS.border}; }
  .sidebar-user { display: flex; align-items: center; gap: 10px; }
  .sidebar-avatar { width: 32px; height: 32px; border-radius: 50%; background: ${COLORS.accent}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .sidebar-user-name { font-size: 12px; font-weight: 600; color: ${COLORS.text}; }
  .sidebar-user-role { font-size: 10px; color: ${COLORS.textMuted}; }

  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 60px; background: #fff; border-bottom: 1px solid ${COLORS.border}; display: flex; align-items: center; padding: 0 28px; gap: 16px; flex-shrink: 0; }
  .topbar-title { font-size: 16px; font-weight: 700; flex: 1; letter-spacing: -0.3px; }
  .topbar-title span { color: ${COLORS.accent}; }
  .topbar-status { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
  .topbar-status.online  { background: #dcfce7; color: #15803d; }
  .topbar-status.offline { background: #fef3c7; color: #b45309; }
  .topbar-status.error   { background: #fee2e2; color: #b91c1c; }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: 'Sora', sans-serif; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: ${COLORS.accent}; color: #fff; }
  .btn-primary:hover:not(:disabled) { background: ${COLORS.accentHover}; }
  .btn-ghost { background: transparent; color: ${COLORS.textMuted}; border: 1px solid ${COLORS.border}; }
  .btn-ghost:hover:not(:disabled) { background: ${COLORS.bg}; color: ${COLORS.text}; }
  .btn-danger { background: #fee2e2; color: ${COLORS.danger}; }
  .btn-danger:hover:not(:disabled) { background: #fecaca; }
  .btn-sm { padding: 5px 11px; font-size: 12px; }
  .btn-icon { padding: 7px 10px; }

  .content { flex: 1; overflow-y: auto; padding: 24px 28px; }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .kpi-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid ${COLORS.border}; display: flex; flex-direction: column; gap: 6px; transition: box-shadow 0.2s; }
  .kpi-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .kpi-label { font-size: 11px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.8px; }
  .kpi-value { font-size: 26px; font-weight: 700; letter-spacing: -1px; color: ${COLORS.text}; }
  .kpi-value.green { color: ${COLORS.accent}; }
  .kpi-sub { font-size: 11px; color: ${COLORS.textMuted}; }
  .kpi-icon { font-size: 22px; margin-bottom: 4px; }

  .table-card { background: #fff; border-radius: 12px; border: 1px solid ${COLORS.border}; overflow: hidden; margin-bottom: 24px; }
  .table-header { padding: 16px 20px; border-bottom: 1px solid ${COLORS.border}; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .table-title { font-size: 14px; font-weight: 700; flex: 1; }
  .search-input { padding: 7px 12px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 13px; font-family: 'Sora', sans-serif; color: ${COLORS.text}; background: ${COLORS.bg}; outline: none; width: 220px; }
  .search-input:focus { border-color: ${COLORS.accent}; }
  table { width: 100%; border-collapse: collapse; }
  th { padding: 10px 16px; text-align: left; font-size: 10px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.8px; background: ${COLORS.bg}; border-bottom: 1px solid ${COLORS.border}; }
  td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid ${COLORS.border}; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafbfc; }
  .td-code { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: ${COLORS.textMuted}; }
  .td-bold { font-weight: 600; }
  .td-muted { color: ${COLORS.textMuted}; font-size: 12px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; animation: fadeIn 0.15s ease; }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .modal { background: #fff; border-radius: 16px; width: 100%; max-width: 780px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.25); animation: slideUp 0.2s ease; }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  .modal-header { padding: 24px 28px 20px; border-bottom: 1px solid ${COLORS.border}; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #fff; z-index: 10; }
  .modal-title { font-size: 17px; font-weight: 700; letter-spacing: -0.3px; }
  .modal-body { padding: 24px 28px; }
  .modal-footer { padding: 16px 28px; border-top: 1px solid ${COLORS.border}; display: flex; justify-content: flex-end; gap: 10px; position: sticky; bottom: 0; background: #fff; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .form-full { grid-column: 1 / -1; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-label { font-size: 11px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.6px; }
  .form-input, .form-select, .form-textarea { padding: 9px 12px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 13px; font-family: 'Sora', sans-serif; color: ${COLORS.text}; background: #fff; outline: none; transition: border-color 0.15s; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: ${COLORS.accent}; box-shadow: 0 0 0 3px ${COLORS.accentLight}; }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-section { margin-bottom: 24px; }
  .form-section-title { font-size: 12px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid ${COLORS.border}; }

  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  .items-table th { padding: 8px 10px; font-size: 10px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.6px; background: ${COLORS.bg}; border-bottom: 1px solid ${COLORS.border}; }
  .items-table td { padding: 6px 6px; border-bottom: 1px solid ${COLORS.border}; }
  .items-table tr:last-child td { border-bottom: none; }
  .item-input { padding: 6px 8px; border: 1px solid ${COLORS.border}; border-radius: 6px; font-size: 12px; font-family: 'Sora', sans-serif; width: 100%; outline: none; }
  .item-input:focus { border-color: ${COLORS.accent}; }

  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .detail-field { display: flex; flex-direction: column; gap: 3px; }
  .detail-label { font-size: 10px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.8px; }
  .detail-value { font-size: 14px; font-weight: 500; }

  .tabs { display: flex; gap: 2px; margin-bottom: 20px; border-bottom: 1px solid ${COLORS.border}; }
  .tab { padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer; color: ${COLORS.textMuted}; border-bottom: 2px solid transparent; transition: all 0.15s; margin-bottom: -1px; }
  .tab:hover { color: ${COLORS.text}; }
  .tab.active { color: ${COLORS.accent}; border-bottom-color: ${COLORS.accent}; }

  .empty { padding: 48px; text-align: center; color: ${COLORS.textMuted}; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
  .empty-sub { font-size: 12px; }

  select.status-select { padding: 4px 8px; border: 1px solid ${COLORS.border}; border-radius: 6px; font-size: 12px; font-family: 'Sora', sans-serif; background: #fff; cursor: pointer; }

  .loading-row td { text-align: center; padding: 32px; color: ${COLORS.textMuted}; font-size: 13px; }
  .error-bar { background: #fee2e2; color: #b91c1c; padding: 10px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

  /* ── ORÇAMENTOS CALCULADORA ── */
  .orc-root { font-family: 'Sora', sans-serif; color: ${COLORS.text}; background: ${COLORS.bg}; }
  .orc-tabs { display: flex; gap: 2px; padding: 0 0; background: ${COLORS.card}; border-bottom: 1px solid ${COLORS.border}; border-radius: 12px 12px 0 0; overflow: hidden; }
  .orc-tab { padding: 13px 18px; font-size: 13px; font-weight: 600; cursor: pointer; color: ${COLORS.textMuted}; border: none; background: transparent; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; font-family: 'Sora', sans-serif; }
  .orc-tab:hover { color: ${COLORS.text}; }
  .orc-tab.active { color: ${COLORS.accent}; border-bottom-color: ${COLORS.accent}; }
  .orc-body { padding: 24px 0 0; }
  .orc-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
  .orc-g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  .orc-col { display: flex; flex-direction: column; gap: 16px; }
  .orc-card { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 12px; padding: 20px 22px; }
  .orc-card-title { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 1px; padding-left: 10px; margin-bottom: 16px; border-left: 3px solid ${COLORS.accent}; }
  .orc-card-title.blue   { border-left-color: #1d4ed8; }
  .orc-card-title.purple { border-left-color: #7c3aed; }
  .orc-card-title.warn   { border-left-color: ${COLORS.warning}; }
  .orc-card-title.danger { border-left-color: ${COLORS.danger}; }
  .orc-hint { font-size: 12px; color: ${COLORS.textMuted}; margin-bottom: 14px; line-height: 1.5; }
  .orc-label { font-size: 10px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.6px; display: block; margin-bottom: 5px; }
  .orc-input, .orc-select { padding: 8px 12px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 13px; font-family: 'Sora', sans-serif; color: ${COLORS.text}; background: ${COLORS.bg}; outline: none; width: 100%; transition: border-color 0.15s; }
  .orc-input:focus, .orc-select:focus { border-color: ${COLORS.accent}; box-shadow: 0 0 0 3px ${COLORS.accentLight}; }
  .orc-input-inline { width: auto; }
  .orc-field { margin-bottom: 14px; }
  .orc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .orc-table th { padding: 9px 12px; text-align: left; font-size: 10px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.6px; background: ${COLORS.bg}; border-bottom: 1px solid ${COLORS.border}; }
  .orc-table td { padding: 9px 12px; border-bottom: 1px solid ${COLORS.border}; vertical-align: middle; }
  .orc-table tbody tr:last-child td { border-bottom: none; }
  .orc-table tbody tr:hover td { background: #fafbfc; }
  .orc-table tfoot td { font-weight: 700; background: ${COLORS.bg}; border-top: 1px solid ${COLORS.border}; padding: 10px 12px; }
  .orc-regua { margin-bottom: 10px; padding: 12px; background: ${COLORS.bg}; border-radius: 10px; border: 1px solid ${COLORS.border}; }
  .orc-regua-label { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: ${COLORS.textMuted}; }
  .orc-regua-btns { display: flex; gap: 6px; }
  .orc-regua-btn { flex: 1; padding: 7px 4px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'Sora', sans-serif; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.12s; }
  .orc-linha { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid ${COLORS.border}; font-size: 13px; }
  .orc-linha:last-child { border-bottom: none; }
  .orc-linha.destaque { padding: 11px 14px; margin: 4px 0; background: ${COLORS.accentLight}; border-radius: 8px; border: none; }
  .orc-linha.subitem .orc-linha-label { color: ${COLORS.textMuted}; font-size: 12px; padding-left: 8px; }
  .orc-linha-label { color: ${COLORS.textMuted}; }
  .orc-linha.destaque .orc-linha-label { color: ${COLORS.accent}; font-weight: 700; font-size: 14px; }
  .orc-linha-val { font-weight: 600; color: ${COLORS.text}; }
  .orc-linha-val.green { color: ${COLORS.accent}; font-weight: 700; }
  .orc-linha-val.red   { color: ${COLORS.danger}; }
  .orc-linha.destaque .orc-linha-val { color: ${COLORS.accent}; font-weight: 800; font-size: 18px; }
  .orc-linha.destaque.red-dest { background: #fee2e2; }
  .orc-linha.destaque.red-dest .orc-linha-label, .orc-linha.destaque.red-dest .orc-linha-val { color: ${COLORS.danger}; }
  .orc-section-sep { font-size: 10px; font-weight: 700; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 1px; margin: 14px 0 8px; padding-bottom: 6px; border-bottom: 1px solid ${COLORS.border}; }
  .orc-total-row { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 2px solid ${COLORS.border}; font-size: 13px; font-weight: 700; color: ${COLORS.textMuted}; }
  .orc-vtp { background: ${COLORS.accent}; border-radius: 12px; padding: 22px; color: #fff; }
  .orc-vtp-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px; }
  .orc-vtp-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.15); }
  .orc-vtp-row:last-of-type { border-bottom: none; }
  .orc-vtp-row.ideal { background: rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 12px; margin: 4px -12px; border: none; }
  .orc-vtp-label { font-size: 13px; font-weight: 600; opacity: 0.85; }
  .orc-vtp-val   { font-size: 18px; font-weight: 800; }
  .orc-vtp-row.ideal .orc-vtp-val { font-size: 22px; }
  .orc-vtp-sub   { font-size: 10px; opacity: 0.5; text-align: right; }
  .orc-vtp-meta  { margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.2); }
  .orc-vtp-meta-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
  .orc-vtp-meta-row span:first-child { opacity: 0.6; }
  .orc-save-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 15px; font-family: 'Sora', sans-serif; background: ${COLORS.accent}; color: #fff; transition: all 0.2s; }
  .orc-save-btn:hover:not(:disabled) { background: ${COLORS.accentHover}; }
  .orc-save-btn.saved { background: #059669; }
  .orc-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .orc-range { width: 100%; accent-color: ${COLORS.accent}; cursor: pointer; }
  .orc-range-labels { display: flex; justify-content: space-between; font-size: 11px; color: ${COLORS.textMuted}; margin-top: 4px; }
  .orc-nf-btn { flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; font-family: 'Sora', sans-serif; transition: all 0.15s; border: 1.5px solid ${COLORS.border}; background: ${COLORS.bg}; color: ${COLORS.textMuted}; }
  .orc-nf-btn.on  { border-color: #1d4ed8; background: #dbeafe; color: #1d4ed8; }
  .orc-nf-btn.off { border-color: ${COLORS.textMuted}; background: #f8fafc; color: ${COLORS.textMuted}; }
  .orc-fator { display: flex; justify-content: space-between; align-items: center; background: ${COLORS.bg}; border: 1px solid ${COLORS.border}; border-radius: 8px; padding: 10px 14px; margin-top: 10px; }
  .orc-fator-label { font-size: 12px; color: ${COLORS.textMuted}; }
  .orc-fator-val   { font-size: 22px; font-weight: 800; }
  .orc-ideal-badge { text-align: right; }
  .orc-ideal-badge-label { font-size: 10px; color: ${COLORS.textMuted}; }
  .orc-ideal-badge-val { font-size: 20px; font-weight: 800; color: ${COLORS.accent}; font-family: 'IBM Plex Mono', monospace; }
`;

// ============================================================
// CALCULADORA DE ORÇAMENTOS (Orcamentos.jsx integrado)
// ============================================================
const REGUA = {
  complexidade: [{ valor: 1, label: "Baixa", fator: -0.10 }, { valor: 2, label: "Normal", fator: 0.00 }, { valor: 3, label: "Alta", fator: 0.10 }],
  prazo:        [{ valor: 1, label: "Folgado", fator: -0.10 }, { valor: 2, label: "Normal", fator: 0.00 }, { valor: 3, label: "Apertado", fator: 0.10 }],
  risco:        [{ valor: 1, label: "Baixo", fator: 0.00 }, { valor: 2, label: "Normal", fator: 0.02 }, { valor: 3, label: "Alto", fator: 0.30 }],
  visibilidade: [{ valor: 1, label: "Alta", fator: -0.05 }, { valor: 2, label: "Normal", fator: 0.00 }, { valor: 3, label: "Baixa", fator: 0.05 }],
  pagamento:    [{ valor: 1, label: "Boa", fator: -0.02 }, { valor: 2, label: "Normal", fator: 0.00 }, { valor: 3, label: "Ruim", fator: 0.02 }],
};
const EQUIPE_DEFAULT = [
  { nome: "Lourenço", custo: 7000, horas: 8, dias: 20 },
  { nome: "Diego",    custo: 7000, horas: 8, dias: 20 },
  { nome: "Marcelo",  custo: 4700, horas: 8, dias: 20 },
  { nome: "Ajudante", custo: 1800, horas: 8, dias: 20 },
];
const CUSTOS_ESC_DEFAULT = [
  { item: "Softwares", valor: 4000 }, { item: "Aluguel", valor: 1700 }, { item: "Energia", valor: 250 },
  { item: "Contabilidade", valor: 450 }, { item: "Limpeza", valor: 200 }, { item: "Internet", valor: 100 },
  { item: "Depreciação Equipamento", valor: 500 }, { item: "Depreciação Computador", valor: 210 },
];
const DISCIPLINAS_DEFAULT = [
  { nome: "Levantamento Planialtimétrico", unidade: "m²", quantidade: "", preco: 0 },
  { nome: "Locação da Rede de Água", unidade: "m", quantidade: "", preco: 0 },
  { nome: "Locação da Rede de Esgoto", unidade: "m", quantidade: "", preco: 0 },
  { nome: "Locação da Rede de Drenagem Pluvial", unidade: "m", quantidade: "", preco: 0 },
  { nome: "Levantamento Planialtimétrico Cadastral", unidade: "m²", quantidade: "", preco: 0 },
  { nome: "Locação com estacas e piquetes para entrega", unidade: "m", quantidade: "", preco: 0 },
  { nome: "Locação com marco de concreto para entrega", unidade: "m", quantidade: "", preco: 0 },
  { nome: "Locação para marcação p/ nivelamento de lotes", unidade: "un.", quantidade: "", preco: 0 },
  { nome: "Locação para Pavimentação (asfalto)", unidade: "m", quantidade: "", preco: 0 },
  { nome: "Locação para Limpeza de Ruas (eixo da via)", unidade: "m", quantidade: "", preco: 0 },
  { nome: "Locação para Abertura de Ruas + Sub-leito", unidade: "m", quantidade: "", preco: 0 },
  { nome: "Locação p/ adaptação de greide e patamarização", unidade: "m", quantidade: "", preco: 0 },
  { nome: "Locação das BL's após implantação das redes", unidade: "un.", quantidade: "", preco: 0 },
  { nome: "Locação das Bocas de Lobo após pavimentação", unidade: "un.", quantidade: "", preco: 0 },
];
const ISS = 0.10;
const fmtBRL = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtPct = (n, dec = 1) => `${((n || 0) * 100).toFixed(dec)}%`;

function OrcCard({ title, accent = "default", children }) {
  const cls = accent === "blue" ? "blue" : accent === "purple" ? "purple" : accent === "warn" ? "warn" : accent === "danger" ? "danger" : "";
  return <div className="orc-card"><div className={`orc-card-title ${cls}`}>{title}</div>{children}</div>;
}
function ReguaItem({ label, icone, opcoes, valor, onChange }) {
  return (
    <div className="orc-regua">
      <div className="orc-regua-label"><span>{icone}</span><span>{label}</span></div>
      <div className="orc-regua-btns">
        {opcoes.map((op) => {
          const ativo = valor === op.valor;
          const cor   = op.fator < 0 ? COLORS.accent : op.fator > 0 ? COLORS.danger : COLORS.textMuted;
          const bgAct = op.fator < 0 ? COLORS.accentLight : op.fator > 0 ? "#fee2e2" : "#f1f5f9";
          return (
            <button key={op.valor} className="orc-regua-btn" onClick={() => onChange(op.valor)}
              style={{ border: `1.5px solid ${ativo ? cor : COLORS.border}`, background: ativo ? bgAct : COLORS.bg, color: ativo ? cor : COLORS.textMuted, fontWeight: ativo ? 700 : 400 }}>
              {op.label}
              <span style={{ fontSize: 10, opacity: 0.75 }}>{op.fator === 0 ? "—" : op.fator > 0 ? `+${(op.fator * 100).toFixed(0)}%` : `${(op.fator * 100).toFixed(0)}%`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function Linha({ label, valor, destaque, verde, vermelho, subitem }) {
  let cls = "orc-linha";
  if (destaque) cls += vermelho ? " destaque red-dest" : " destaque";
  if (subitem) cls += " subitem";
  return (
    <div className={cls}>
      <span className="orc-linha-label">{label}</span>
      <span className={`orc-linha-val${verde ? " green" : vermelho && !destaque ? " red" : ""}`}>{valor}</span>
    </div>
  );
}

// Calculadora principal — embutida como sub-aba
function Calculadora({ clientes, onSave, saving }) {
  const [tab, setTab] = useState("precificacao");
  const [cliente,  setCliente]  = useState("");
  const [empreend, setEmpreend] = useState("");
  const [local,    setLocal]    = useState("");
  const [clienteId, setClienteId] = useState("");
  const [margem,   setMargem]   = useState(30);
  const [emitirNF, setEmitirNF] = useState(true);
  const [regua, setRegua]       = useState({ complexidade: 2, prazo: 2, risco: 2, visibilidade: 2, pagamento: 2 });
  const [custosDir, setCustosDir] = useState({ emissaoART: 0, aluguelEquip: 0, gasolina: 0, hospedagem: 0, estacas: 0, alimentacao: 0 });
  const [diasCampo, setDiasCampo] = useState(0);
  const [disciplinas, setDisciplinas] = useState(DISCIPLINAS_DEFAULT.map(d => ({ ...d })));
  const [mapa, setMapa] = useState({
    lourenco:  { prospeccao: 0.2, organizacao: 0.2, topografia: 0 },
    diego:     { prospeccao: 0.2, organizacao: 0.2, topografia: 0 },
    topografo: { prospeccao: 0,   organizacao: 0,   topografia: 0 },
    ajudante:  { prospeccao: 0,   organizacao: 0,   topografia: 0 },
  });
  const [equipe,    setEquipe]    = useState(EQUIPE_DEFAULT.map(e => ({ ...e })));
  const [custosEsc, setCustosEsc] = useState(CUSTOS_ESC_DEFAULT.map(c => ({ ...c })));
  const [diasFunc,  setDiasFunc]  = useState(22);
  const [horasDia,  setHorasDia]  = useState(8);

  const totalDespFixas = useMemo(() => custosEsc.reduce((s, c) => s + (Number(c.valor) || 0), 0), [custosEsc]);
  const custosDiarios  = totalDespFixas / diasFunc;
  const custoMedioPes  = useMemo(() => equipe.reduce((s, e) => s + (Number(e.custo) || 0), 0) / equipe.length, [equipe]);
  const custoMedioDia  = custoMedioPes / diasFunc;
  const capProdutiva   = equipe.length;
  const custoDH        = totalDespFixas / capProdutiva;
  const hhtPessoa = useMemo(() => ({
    lourenco:  (equipe[0]?.custo || 7000) / (equipe[0]?.dias || diasFunc),
    diego:     (equipe[1]?.custo || 7000) / (equipe[1]?.dias || diasFunc),
    topografo: (equipe[2]?.custo || 4700) / (equipe[2]?.dias || diasFunc),
    ajudante:  (equipe[3]?.custo || 1800) / (equipe[3]?.dias || diasFunc),
  }), [equipe, diasFunc]);
  const mediaHHT = useMemo(() => Object.values(hhtPessoa).reduce((s, v) => s + v, 0) / 4, [hhtPessoa]);
  const vdi      = (mediaHHT + custoMedioDia) / 2;
  const maoObraIndireta = useMemo(() => {
    const ps = ["lourenco", "diego", "topografo", "ajudante"];
    let prospeccao = 0, organizacao = 0, topografia = 0;
    ps.forEach(p => {
      const hht = hhtPessoa[p] || custoMedioDia;
      prospeccao  += (Number(mapa[p]?.prospeccao)  || 0) * hht;
      organizacao += (Number(mapa[p]?.organizacao) || 0) * hht;
      topografia  += (Number(mapa[p]?.topografia)  || 0) * hht;
    });
    return { prospeccao, organizacao, topografia, total: prospeccao + organizacao + topografia };
  }, [mapa, hhtPessoa, custoMedioDia]);
  const totalCustosDir = useMemo(() => Object.values(custosDir).reduce((s, v) => s + (Number(v) || 0), 0), [custosDir]);
  const maoObraDireta  = (Number(diasCampo) || 0) * custoMedioDia;
  const maoObraTotal   = maoObraDireta + maoObraIndireta.total;
  const custoTotal     = totalCustosDir + maoObraTotal;
  const fatorRegua = useMemo(() => {
    const f = (k, arr) => arr.find(o => o.valor === k)?.fator || 0;
    return f(regua.complexidade, REGUA.complexidade)
         + f(regua.prazo,        REGUA.prazo)
         + f(regua.risco,        REGUA.risco)
         + f(regua.visibilidade, REGUA.visibilidade)
         + f(regua.pagamento,    REGUA.pagamento);
  }, [regua]);
  const mg             = margem / 100;
  const precoBaseSemNF = custoTotal > 0 ? (custoTotal / (1 - mg)) * (1 + fatorRegua) : 0;
  const lucro          = precoBaseSemNF * mg;
  const adicDesconto   = (custoTotal / (1 - mg)) * fatorRegua;
  const precoBaseComNF = precoBaseSemNF / (1 - ISS);
  const impostosNF     = precoBaseComNF * ISS;
  const vtpMinSemNF    = custoTotal / (1 - mg);
  const vtpIdealSemNF  = precoBaseSemNF;
  const vtpMaxSemNF    = custoTotal / (1 - Math.min(mg + 0.40, 0.85));
  const vtpMinComNF    = vtpMinSemNF   / (1 - ISS);
  const vtpIdealComNF  = vtpIdealSemNF / (1 - ISS);
  const vtpMaxComNF    = vtpMaxSemNF   / (1 - ISS);
  const precoAdotado   = emitirNF ? precoBaseComNF : precoBaseSemNF;
  const impostosFinal  = emitirNF ? impostosNF : 0;
  const lucroFinal     = precoAdotado - custoTotal - impostosFinal;
  const margemFinalPct = precoAdotado > 0 ? lucroFinal / precoAdotado : 0;
  const roiPct         = custoTotal   > 0 ? lucroFinal / custoTotal   : 0;
  const totalDisciplinas = disciplinas.reduce((s, d) => s + (Number(d.quantidade) || 0) * (Number(d.preco) || 0), 0);

  const TABS = [
    { id: "precificacao", label: "💰 Precificação" },
    { id: "mapeamento",   label: "🗺️ Mapeamento" },
    { id: "equipe",       label: "👷 Equipe" },
    { id: "escritorio",   label: "🏢 Escritório" },
    { id: "resultado",    label: "📊 Resultado" },
  ];

  const handleSave = () => {
    onSave({
      clienteId,
      cliente,
      empreend,
      local,
      custoTotal,
      precoAdotado,
      precoBaseSemNF,
      precoBaseComNF,
      fatorRegua,
      margem,
      emitirNF,
      diasCampo,
    });
  };

  return (
    <div className="orc-root">
      {/* TOPBAR */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "14px 0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📐</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>Calculadora de Orçamentos</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Precificação de Serviços Topográficos</div>
          </div>
        </div>
        {custoTotal > 0 && (
          <div className="orc-ideal-badge">
            <div className="orc-ideal-badge-label">Preço Ideal {emitirNF ? "c/ NF" : "s/ NF"}</div>
            <div className="orc-ideal-badge-val">{fmtBRL(precoAdotado)}</div>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="orc-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`orc-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="orc-body">

        {/* ── PRECIFICAÇÃO ── */}
        {tab === "precificacao" && (
          <div className="orc-g2">
            <div className="orc-col">
              <OrcCard title="Características do Empreendimento" accent="blue">
                <div className="orc-field">
                  <label className="orc-label">Cliente (Supabase)</label>
                  <select className="orc-select" value={clienteId} onChange={e => {
                    setClienteId(e.target.value);
                    const c = clientes.find(x => x.id === e.target.value);
                    if (c) setCliente(c.razao_social);
                  }}>
                    <option value="">Selecionar cadastro...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.razao_social}</option>)}
                  </select>
                </div>
                {[
                  { l: "Cliente (livre)", v: cliente, s: setCliente, ph: "Nome do cliente" },
                  { l: "Empreendimento", v: empreend, s: setEmpreend, ph: "Nome do projeto" },
                  { l: "Local", v: local, s: setLocal, ph: "Cidade / Estado" },
                ].map(({ l, v, s, ph }) => (
                  <div key={l} className="orc-field">
                    <label className="orc-label">{l}</label>
                    <input className="orc-input" value={v} onChange={e => s(e.target.value)} placeholder={ph} />
                  </div>
                ))}
              </OrcCard>

              <OrcCard title="Custos Diretos" accent="warn">
                <p className="orc-hint">Gastos específicos deste serviço (transporte, materiais, etc.)</p>
                {[
                  { k: "emissaoART", l: "Emissão de ART" }, { k: "aluguelEquip", l: "Aluguel de Equipamento" },
                  { k: "gasolina", l: "Gasolina / Pedágio" }, { k: "hospedagem", l: "Hospedagem" },
                  { k: "estacas", l: "Estacas / Piquetes" }, { k: "alimentacao", l: "Alimentação" },
                ].map(({ k, l }) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12 }}>
                    <span style={{ fontSize: 13, color: COLORS.textMuted, flex: 1 }}>{l}</span>
                    <input type="number" min="0" placeholder="0,00" className="orc-input orc-input-inline" style={{ width: 130, textAlign: "right" }}
                      value={custosDir[k] || ""}
                      onChange={e => setCustosDir(p => ({ ...p, [k]: Number(e.target.value) || 0 }))} />
                  </div>
                ))}
                <div className="orc-total-row">
                  <span>Total Custos Diretos</span>
                  <span style={{ color: COLORS.text }}>{fmtBRL(totalCustosDir)}</span>
                </div>
              </OrcCard>

              <OrcCard title="Dias em Campo">
                <div className="orc-field">
                  <label className="orc-label">Dias em Campo</label>
                  <input type="number" min="0" className="orc-input" value={diasCampo} onChange={e => setDiasCampo(Number(e.target.value) || 0)} />
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>M.O. campo: {fmtBRL(maoObraDireta)}</div>
              </OrcCard>
            </div>

            <div className="orc-col">
              <OrcCard title="Emissão de NF">
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ v: true, l: "📄 Com NF" }, { v: false, l: "🚫 Sem NF" }].map(({ v, l }) => (
                    <button key={String(v)} className={`orc-nf-btn${emitirNF === v ? (v ? " on" : " off") : ""}`} onClick={() => setEmitirNF(v)}>{l}</button>
                  ))}
                </div>
              </OrcCard>

              <OrcCard title="Margem de Lucro">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.accent }}>{margem}%</span>
                </div>
                <input type="range" min="5" max="80" value={margem} onChange={e => setMargem(Number(e.target.value))} className="orc-range" />
                <div className="orc-range-labels"><span>5%</span><span>40%</span><span>80%</span></div>
              </OrcCard>

              <OrcCard title="Régua de Precificação">
                {[
                  { label: "Complexidade do Projeto", icone: "🔧", key: "complexidade", opcoes: REGUA.complexidade },
                  { label: "Prazo de Entrega",        icone: "⏱️", key: "prazo",        opcoes: REGUA.prazo        },
                  { label: "Risco do Projeto",        icone: "⚠️", key: "risco",        opcoes: REGUA.risco        },
                  { label: "Visibilidade do Cliente", icone: "👁️", key: "visibilidade", opcoes: REGUA.visibilidade },
                  { label: "Histórico de Pagamento",  icone: "💳", key: "pagamento",    opcoes: REGUA.pagamento    },
                ].map(({ label, icone, key, opcoes }) => (
                  <ReguaItem key={key} label={label} icone={icone} opcoes={opcoes} valor={regua[key]}
                    onChange={v => setRegua(r => ({ ...r, [key]: v }))} />
                ))}
                <div className="orc-fator">
                  <span className="orc-fator-label">Fator Régua Total</span>
                  <span className="orc-fator-val" style={{ color: fatorRegua >= 0 ? COLORS.danger : COLORS.accent }}>
                    {fatorRegua >= 0 ? "+" : ""}{fmtPct(fatorRegua)}
                  </span>
                </div>
              </OrcCard>
            </div>
          </div>
        )}

        {/* ── MAPEAMENTO ── */}
        {tab === "mapeamento" && (
          <div className="orc-g2">
            <OrcCard title="Disciplinas e Quantitativos" accent="blue">
              <p className="orc-hint">Insira as quantidades e preços unitários de cada disciplina.</p>
              <table className="orc-table">
                <thead><tr><th>Disciplina</th><th>Un.</th><th>Qtd.</th><th>Preço</th><th>Total</th></tr></thead>
                <tbody>
                  {disciplinas.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12 }}>{d.nome}</td>
                      <td style={{ fontSize: 11, color: COLORS.textMuted }}>{d.unidade}</td>
                      <td><input type="number" min="0" className="orc-input" style={{ padding: "4px 6px", fontSize: 12 }} value={d.quantidade}
                        onChange={e => setDisciplinas(ds => ds.map((x, j) => j === i ? { ...x, quantidade: e.target.value } : x))} /></td>
                      <td><input type="number" min="0" className="orc-input" style={{ padding: "4px 6px", fontSize: 12, textAlign: "right" }} value={d.preco}
                        onChange={e => setDisciplinas(ds => ds.map((x, j) => j === i ? { ...x, preco: Number(e.target.value) } : x))} /></td>
                      <td style={{ fontWeight: 600, fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>
                        {fmtBRL((Number(d.quantidade) || 0) * (Number(d.preco) || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr><td colSpan={4}>Total Mapeamento</td><td style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{fmtBRL(totalDisciplinas)}</td></tr></tfoot>
              </table>
            </OrcCard>

            <OrcCard title="Mapeamento de Dedicação (%)" accent="purple">
              <p className="orc-hint">Percentual de dedicação de cada profissional por fase (0–100%).</p>
              {["lourenco", "diego", "topografo", "ajudante"].map((p, idx) => (
                <div key={p} style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: COLORS.text }}>{equipe[idx]?.nome || p}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {["prospeccao", "organizacao", "topografia"].map(fase => (
                      <div key={fase}>
                        <label className="orc-label">{fase}</label>
                        <input type="number" min="0" max="1" step="0.1" className="orc-input" style={{ padding: "5px 8px", fontSize: 12 }}
                          value={mapa[p][fase]}
                          onChange={e => setMapa(m => ({ ...m, [p]: { ...m[p], [fase]: Number(e.target.value) } }))} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="orc-total-row">
                <span>M.O. Indireta Total</span>
                <span style={{ color: COLORS.text }}>{fmtBRL(maoObraIndireta.total)}</span>
              </div>
            </OrcCard>
          </div>
        )}

        {/* ── EQUIPE ── */}
        {tab === "equipe" && (
          <div className="orc-g2">
            <OrcCard title="Equipe e Custo Mensal" accent="blue">
              <table className="orc-table">
                <thead><tr><th>Profissional</th><th>Custo/mês (R$)</th><th>Horas/dia</th><th>Dias/mês</th></tr></thead>
                <tbody>
                  {equipe.map((e, i) => (
                    <tr key={i}>
                      <td>{e.nome}</td>
                      {["custo","horas","dias"].map(f => (
                        <td key={f}><input type="number" min="0" className="orc-input" style={{ padding: "4px 8px", fontSize: 12 }}
                          value={e[f]} onChange={ev => setEquipe(eq => eq.map((x,j) => j===i ? { ...x, [f]: Number(ev.target.value)||0 } : x))} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </OrcCard>

            <OrcCard title="Indicadores da Equipe" accent="purple">
              {[
                { l: "Custo Médio / pessoa / mês", v: fmtBRL(custoMedioPes),  c: COLORS.text   },
                { l: "Custo Médio / dia",           v: fmtBRL(custoMedioDia), c: COLORS.accent },
                { l: "Custo / Dia-Homem (rateado)", v: fmtBRL(custoDH),       c: "#7c3aed"     },
                { l: "VDI (Valor Diário Indireto)", v: fmtBRL(vdi),           c: COLORS.accent },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 7, marginBottom: 7 }}>
                  <span style={{ color: COLORS.textMuted }}>{l}</span>
                  <span style={{ color: c, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span>
                </div>
              ))}
            </OrcCard>
          </div>
        )}

        {/* ── ESCRITÓRIO ── */}
        {tab === "escritorio" && (
          <div className="orc-g2">
            <OrcCard title="Despesas Fixas Mensais" accent="warn">
              <table className="orc-table">
                <thead><tr><th>Item</th><th>Valor (R$)</th></tr></thead>
                <tbody>
                  {custosEsc.map((c, i) => (
                    <tr key={i}>
                      <td>{c.item}</td>
                      <td><input type="number" min="0" className="orc-input" style={{ padding: "4px 8px", fontSize: 12, textAlign: "right" }}
                        value={c.valor} onChange={e => setCustosEsc(cs => cs.map((x,j) => j===i ? { ...x, valor: Number(e.target.value)||0 } : x))} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr><td>Total Despesas Fixas</td><td style={{ textAlign: "right", fontFamily: "'IBM Plex Mono',monospace" }}>{fmtBRL(totalDespFixas)}</td></tr></tfoot>
              </table>
            </OrcCard>

            <OrcCard title="Parâmetros Operacionais">
              {[
                { l: "Horas de funcionamento / dia", v: horasDia, s: setHorasDia },
                { l: "Dias de funcionamento / mês",  v: diasFunc,  s: setDiasFunc  },
              ].map(({ l, v, s }) => (
                <div key={l} className="orc-field">
                  <label className="orc-label">{l}</label>
                  <input type="number" min="1" className="orc-input" value={v} onChange={e => s(Number(e.target.value) || v)} />
                </div>
              ))}
              <OrcCard title="Indicadores Calculados">
                {[
                  { l: "Horas / mês",                  v: `${diasFunc * horasDia} h`, c: COLORS.text   },
                  { l: "Custo diário do escritório",    v: fmtBRL(custosDiarios),      c: "#1d4ed8"     },
                  { l: "Capacidade produtiva (DH/mês)", v: capProdutiva.toFixed(3),    c: COLORS.text   },
                  { l: "Custo por dia.homem (rateado)", v: fmtBRL(custoDH),            c: "#7c3aed"     },
                  { l: "Custo Médio / pessoa / dia",    v: fmtBRL(custoMedioDia),      c: COLORS.accent },
                  { l: "VDI",                           v: fmtBRL(vdi),                c: COLORS.accent },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 7, marginBottom: 7 }}>
                    <span style={{ color: COLORS.textMuted }}>{l}</span>
                    <span style={{ color: c, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span>
                  </div>
                ))}
              </OrcCard>
            </OrcCard>
          </div>
        )}

        {/* ── RESULTADO ── */}
        {tab === "resultado" && (
          <div className="orc-g2">
            <div className="orc-col">
              <OrcCard title="Balanço Financeiro do Projeto">
                <div className="orc-section-sep">(+) Receita</div>
                <Linha label="Valor Total do Projeto" valor={fmtBRL(precoAdotado)} verde />
                <div className="orc-section-sep" style={{ marginTop: 14 }}>(-) Custos</div>
                <Linha label="M.O. Interna Direta (campo)"     valor={fmtBRL(maoObraDireta)}         vermelho />
                <Linha label="M.O. Interna Indireta (escrit.)" valor={fmtBRL(maoObraIndireta.total)} vermelho />
                <Linha label="Custos Diretos"                   valor={fmtBRL(totalCustosDir)}        vermelho />
                <Linha label="Total Custos"                     valor={fmtBRL(custoTotal)}            vermelho />
                {emitirNF && (
                  <>
                    <div className="orc-section-sep" style={{ marginTop: 14 }}>(-) Impostos (NF)</div>
                    <Linha label={`ISS (${(ISS * 100).toFixed(0)}%)`} valor={fmtBRL(impostosNF)} vermelho />
                  </>
                )}
                <div style={{ marginTop: 14, paddingTop: 4, borderTop: `2px solid ${COLORS.accent}` }}>
                  <Linha label="MARGEM DE CONTRIBUIÇÃO" valor={fmtBRL(lucroFinal)} destaque verde={lucroFinal >= 0} vermelho={lucroFinal < 0} />
                </div>
              </OrcCard>

              <OrcCard title="Preço Base — Composição" accent="blue">
                {[
                  { l: "Custos do Serviço",                                             v: fmtBRL(custoTotal) },
                  { l: `Lucro (${margem}%)`,                                            v: fmtBRL(lucro) },
                  { l: `Adicional/Desconto Régua (${(fatorRegua * 100).toFixed(1)}%)`,  v: fmtBRL(adicDesconto) },
                  { l: "Preço Base Sem NF",                                             v: fmtBRL(precoBaseSemNF), bold: true },
                ].map(({ l, v, bold }) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 7, marginBottom: 7 }}>
                    <span style={{ color: COLORS.textMuted, fontWeight: bold ? 700 : 400 }}>{l}</span>
                    <span style={{ color: bold ? COLORS.text : COLORS.textMuted, fontWeight: bold ? 800 : 600, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span>
                  </div>
                ))}
                {emitirNF && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 7, marginBottom: 7 }}>
                      <span style={{ color: COLORS.danger }}>Impostos NF ({(ISS * 100).toFixed(0)}%)</span>
                      <span style={{ color: COLORS.danger, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace" }}>{fmtBRL(impostosNF)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: COLORS.text }}>
                      <span>Preço Base Com NF</span>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{fmtBRL(precoBaseComNF)}</span>
                    </div>
                  </>
                )}
              </OrcCard>

              <OrcCard title="Índices de Rentabilidade" accent="warn">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { l: "Margem de Lucro", v: fmtPct(margemFinalPct), c: COLORS.accent },
                    { l: "ROI",             v: fmtPct(roiPct),          c: "#1d4ed8"    },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ background: COLORS.bg, borderRadius: 10, padding: 16, border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{l}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: c, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </OrcCard>
            </div>

            <div className="orc-col">
              <div className="orc-vtp">
                <div className="orc-vtp-title">VTP — Valor Total do Projeto</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>Faixas de negociação — {emitirNF ? "Com" : "Sem"} emissão de NF</div>
                {[
                  { l: "MÍN",   sem: vtpMinSemNF,   com: vtpMinComNF   },
                  { l: "IDEAL", sem: vtpIdealSemNF, com: vtpIdealComNF, ideal: true },
                  { l: "MÁX",   sem: vtpMaxSemNF,   com: vtpMaxComNF   },
                ].map(({ l, sem, com, ideal }) => (
                  <div key={l} className={`orc-vtp-row${ideal ? " ideal" : ""}`}>
                    <div>
                      <div className="orc-vtp-label">{l}</div>
                      {!emitirNF && <div style={{ fontSize: 10, opacity: 0.5 }}>s/ NF</div>}
                    </div>
                    <div>
                      <div className="orc-vtp-val">{fmtBRL(emitirNF ? com : sem)}</div>
                      <div className="orc-vtp-sub">{emitirNF ? `s/NF: ${fmtBRL(sem)}` : `c/NF: ${fmtBRL(com)}`}</div>
                    </div>
                  </div>
                ))}
                <div className="orc-vtp-meta">
                  {[
                    { l: "Cliente",         v: cliente    || "—" },
                    { l: "Empreendimento",  v: empreend   || "—" },
                    { l: "Local",           v: local      || "—" },
                    { l: "Margem Aplicada", v: `${margem}%` },
                    { l: "Régua",           v: `${fatorRegua >= 0 ? "+" : ""}${(fatorRegua * 100).toFixed(1)}%` },
                  ].map(({ l, v }) => (
                    <div key={l} className="orc-vtp-meta-row"><span>{l}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
                  ))}
                </div>
              </div>

              <button className={`orc-save-btn${saving ? " saved" : ""}`} onClick={handleSave} disabled={custoTotal === 0 || saving}>
                {saving ? "✓ Salvo no Supabase!" : "💾 Salvar Orçamento"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
function Sidebar({ active, setActive, propostas }) {
  const badgeEnviadas = propostas.filter(p => p.status === "enviada").length;
  const nav = [
    { section: "Principal" },
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { section: "Comercial" },
    { id: "propostas",  icon: "📋", label: "Propostas",  badge: badgeEnviadas },
    { id: "orcamentos", icon: "🧾", label: "Orçamentos" },
    { id: "contratos",  icon: "📄", label: "Contratos" },
    { section: "Cadastros" },
    { id: "clientes",   icon: "🏢", label: "Clientes" },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, background:"linear-gradient(135deg,#0A0A0A,#1DB864)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:900, fontSize:13, flexShrink:0 }}>CC</div>
          <div>
            <div style={{ fontWeight:900, fontSize:17, color:"#0A0A0A", letterSpacing:"-0.3px" }}>Comercial<span style={{ color:"#1DB864" }}>Control</span></div>
            <div style={{ fontSize:9, color:"#1DB864", fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase" }}>Altitude Topografia</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section">{item.section}</div>
          ) : (
            <div key={item.id} className={`nav-item${active === item.id ? " active" : ""}`} onClick={() => setActive(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </div>
          )
        )}
      </nav>

    </aside>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ setActive, propostas, contratos, orcamentos }) {
  const propSent  = propostas.filter(p => p.status === "enviada").length;
  const propAprov = propostas.filter(p => p.status === "aprovada").length;
  const totalProp = propostas.reduce((s, p) => s + (p.valor_com_desconto || 0), 0);
  const totalCont = contratos.reduce((s, c) => s + (c.valor_total || 0), 0);
  const orcAbertos = orcamentos.filter(o => o.status === "aberto").length;

  return (
    <div className="content">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">📋</div>
          <div className="kpi-label">Propostas Abertas</div>
          <div className="kpi-value">{propSent}</div>
          <div className="kpi-sub">aguardando resposta</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-label">Propostas Aprovadas</div>
          <div className="kpi-value green">{propAprov}</div>
          <div className="kpi-sub">este período</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-label">Volume em Propostas</div>
          <div className="kpi-value green" style={{ fontSize: 18 }}>{fmt(totalProp)}</div>
          <div className="kpi-sub">total em aberto</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📄</div>
          <div className="kpi-label">Contratos Ativos</div>
          <div className="kpi-value">{contratos.filter(c => c.status === "ativo").length}</div>
          <div className="kpi-sub">{fmt(totalCont)} contratado</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Propostas Recentes</div>
          <button className="btn btn-primary btn-sm" onClick={() => setActive("propostas")}>Ver Todas →</button>
        </div>
        <table>
          <thead><tr><th>Código</th><th>Título</th><th>Valor</th><th>Validade</th><th>Status</th></tr></thead>
          <tbody>
            {propostas.slice(0, 5).map(p => (
              <tr key={p.id}>
                <td className="td-code">{p.codigo}</td>
                <td className="td-bold">{p.titulo}</td>
                <td>{fmt(p.valor_com_desconto)}</td>
                <td className="td-muted">{fmtDate(p.data_validade)}</td>
                <td><Badge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orcAbertos > 0 && (
        <div style={{ background: "#fef9ec", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e", marginBottom: 16 }}>
          🧾 <strong>{orcAbertos} orçamento{orcAbertos > 1 ? "s" : ""}</strong> em aberto aguardando aprovação.{" "}
          <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setActive("orcamentos")}>Ver orçamentos →</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CLIENTES
// ============================================================
function Clientes() {
  const { data: clientes, loading, error, insert, update, remove } = useTable("clientes", "clientes");
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = clientes.filter(c =>
    c.razao_social.toLowerCase().includes(search.toLowerCase()) ||
    (c.cnpj || "").includes(search) ||
    (c.contato || "").toLowerCase().includes(search.toLowerCase())
  );

  const openNew  = () => { setForm({ estado: "SP" }); setModal("new"); };
  const openEdit = (c) => { setForm({ ...c }); setModal(c); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "new") await insert(form);
      else await update(form.id, form);
      setModal(null);
    } finally { setSaving(false); }
  };
  const del = async (id) => {
    if (!confirm("Remover cliente?")) return;
    await remove(id);
  };

  return (
    <div className="content">
      {error && <div className="error-bar">⚠️ Erro Supabase: {error}</div>}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Clientes ({filtered.length})</div>
          <input className="search-input" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ Novo Cliente</button>
        </div>
        {filtered.length === 0 && !loading ? (
          <div className="empty"><div className="empty-icon">🏢</div><div className="empty-text">Nenhum cliente encontrado</div></div>
        ) : (
          <table>
            <thead><tr><th>Razão Social</th><th>CNPJ</th><th>Contato</th><th>Email</th><th>Cidade/UF</th><th></th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: COLORS.textMuted }}>Carregando...</td></tr>}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="td-bold">{c.razao_social}</td>
                  <td className="td-code">{c.cnpj || "—"}</td>
                  <td>{c.contato || "—"}</td>
                  <td className="td-muted">{c.email || "—"}</td>
                  <td className="td-muted">{c.cidade}{c.estado ? `/${c.estado}` : ""}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(c.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === "new" ? "Novo Cliente" : "Editar Cliente"}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group form-full">
                  <label className="form-label">Razão Social *</label>
                  <input className="form-input" value={form.razao_social || ""} onChange={e => setForm(f => ({ ...f, razao_social: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">CNPJ</label>
                  <input className="form-input" value={form.cnpj || ""} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contato (A/C)</label>
                  <input className="form-input" value={form.contato || ""} onChange={e => setForm(f => ({ ...f, contato: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input className="form-input" value={form.telefone || ""} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input className="form-input" value={form.cidade || ""} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado || "SP"} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                    {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROPOSTAS
// ============================================================
function Propostas() {
  const { data: clientes }                                              = useTable("clientes", "clientes");
  const { data: propostas, loading, error, insert, update, remove }    = useTable("propostas", "propostas");
  const { data: allItens,    setData: setAllItens }                    = useTable("proposta_itens", "proposta_itens");
  const { data: allParcelas, setData: setAllParcelas }                 = useTable("proposta_parcelas", "proposta_parcelas");

  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("todos");
  const [modal, setModal]           = useState(null);
  const [detailId, setDetailId]     = useState(null);
  const [form, setForm]             = useState({});
  const [formItens, setFormItens]   = useState([]);
  const [formParcelas, setFormParcelas] = useState([]);
  const [saving, setSaving]         = useState(false);

  const filtered = propostas.filter(p => {
    const cli = clientes.find(c => c.id === p.cliente_id);
    const match = p.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(search.toLowerCase()) ||
      (cli?.razao_social || "").toLowerCase().includes(search.toLowerCase());
    const statusOk = filterStatus === "todos" || p.status === filterStatus;
    return match && statusOk;
  });

  const openNew = () => {
    const codigo = nextCodigo(propostas);
    const today  = new Date().toISOString().split("T")[0];
    const val    = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    setForm({ codigo, data_emissao: today, data_validade: val, status: "rascunho", tipo: "topografia", revisoes_inclusas: 6, desconto: 0 });
    setFormItens([{ id: "tmp1", descricao: "", codigo_unidade: "m²", valor_unitario: "", quantidade: "", valor_total: 0 }]);
    setFormParcelas([{ id: "tmp_p1", numero: 1, valor: "", descricao: "Na assinatura do contrato" }]);
    setModal("new");
  };
  const openEdit = (p) => {
    setForm({ ...p });
    setFormItens(allItens.filter(i => i.proposta_id === p.id).map(i => ({ ...i })));
    setFormParcelas(allParcelas.filter(pa => pa.proposta_id === p.id).map(pa => ({ ...pa })));
    setModal(p);
  };
  const updateItem = (idx, field, val) => {
    setFormItens(prev => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: val };
      if (field === "valor_unitario" || field === "quantidade")
        arr[idx].valor_total = parseFloat(arr[idx].valor_unitario || 0) * parseFloat(arr[idx].quantidade || 0);
      const total = arr.reduce((s, i) => s + (i.valor_total || 0), 0);
      setForm(f => { const desc = parseFloat(f.desconto || 0); return { ...f, valor_total: total, valor_com_desconto: total - desc }; });
      return arr;
    });
  };
  const addItem    = () => setFormItens(p => [...p, { id: "tmp" + Date.now(), descricao: "", codigo_unidade: "m²", valor_unitario: "", quantidade: "", valor_total: 0 }]);
  const removeItem = (idx) => setFormItens(p => p.filter((_, i) => i !== idx));
  const addParcela    = () => setFormParcelas(p => [...p, { id: "tmp_pa" + Date.now(), numero: p.length + 1, valor: "", descricao: "" }]);
  const removeParcela = (idx) => setFormParcelas(p => p.filter((_, i) => i !== idx));
  const updateParcela = (idx, field, val) => setFormParcelas(p => { const a = [...p]; a[idx] = { ...a[idx], [field]: val }; return a; });

  const save = async () => {
    setSaving(true);
    try {
      const isNew = modal === "new";
      let proposta;
      if (isNew) {
        proposta = await (USE_SUPABASE
          ? sbInsert("propostas", form).then(r => Array.isArray(r) ? r[0] : r)
          : Promise.resolve({ ...form, id: "p" + Date.now() }));
        if (!USE_SUPABASE) propostas.unshift(proposta); // handled by insert below for mock
      } else {
        proposta = { ...form };
        if (!USE_SUPABASE) {/* handled by update */}
        else await sbUpdate("propostas", form.id, form);
      }
      const id = proposta.id || form.id;

      // Itens
      if (USE_SUPABASE) {
        await sbDeleteBy("proposta_itens", "proposta_id", id);
        for (const it of formItens) {
          const { id: _id, ...rest } = it;
          await sbInsert("proposta_itens", { ...rest, proposta_id: id });
        }
      } else {
        setAllItens(prev => [...prev.filter(i => i.proposta_id !== id), ...formItens.map(i => ({ ...i, proposta_id: id }))]);
      }

      // Parcelas
      if (USE_SUPABASE) {
        await sbDeleteBy("proposta_parcelas", "proposta_id", id);
        for (const pa of formParcelas) {
          const { id: _id, ...rest } = pa;
          await sbInsert("proposta_parcelas", { ...rest, proposta_id: id });
        }
      } else {
        setAllParcelas(prev => [...prev.filter(pa => pa.proposta_id !== id), ...formParcelas.map(pa => ({ ...pa, proposta_id: id }))]);
      }

      if (!USE_SUPABASE) {
        if (isNew) setAllItens && null; // already set above
      }
      setModal(null);
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    if (USE_SUPABASE) await sbUpdate("propostas", id, { status });
    // optimistic update via useTable is handled in update call
  };
  const del = async (id) => {
    if (!confirm("Remover proposta?")) return;
    await remove(id);
    setAllItens(prev => prev.filter(i => i.proposta_id !== id));
    setAllParcelas(prev => prev.filter(pa => pa.proposta_id !== id));
  };

  const detail = detailId ? propostas.find(p => p.id === detailId) : null;
  const detailItens    = detail ? allItens.filter(i => i.proposta_id === detail.id) : [];
  const detailParcelas = detail ? allParcelas.filter(pa => pa.proposta_id === detail.id) : [];
  const detailCli      = detail ? clientes.find(c => c.id === detail.cliente_id) : null;


  // ── GERAR PDF DA PROPOSTA ─────────────────────────────────
  const gerarPDF = async (proposta, itens, parcelas, cliente) => {
    const fmtBR = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const fmtDt = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

    const logoUrl = "/logo_altitude.png";
    const logoB64 = await fetch(logoUrl).then(r => r.blob()).then(b => new Promise(res => {
      const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b);
    })).catch(() => null);

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; color:#1e293b; background:#f1f3f5; }
  .page { width:210mm; min-height:297mm; background:white; margin:0 auto; position:relative; }
  .cover { width:210mm; height:297mm; background:#f1f3f5; display:flex; flex-direction:column; align-items:flex-end; justify-content:flex-end; padding:0; position:relative; page-break-after:always; }
  .cover-logo { position:absolute; top:50%; right:40mm; transform:translateY(-50%); width:60mm; }
  .cover-logo img { width:100%; }
  .cover-info { padding:20mm 20mm 18mm; width:100%; }
  .cover-title { font-size:18pt; font-weight:700; color:#1DB864; margin-bottom:8px; }
  .cover-sub { font-size:10pt; color:#334155; }
  .cover-sub strong { font-weight:600; }
  .header { display:flex; align-items:center; justify-content:space-between; padding:10mm 20mm 6mm; border-bottom:3px solid #1DB864; }
  .header-logo img { height:14mm; }
  .header-contact { text-align:right; font-size:7.5pt; color:#64748b; line-height:1.6; }
  .header-contact strong { color:#1DB864; }
  .footer { position:fixed; bottom:0; left:0; right:0; background:white; border-top:1px solid #e2e8f0; padding:5mm 20mm; display:flex; justify-content:space-between; align-items:center; }
  .footer-left { font-size:7pt; font-weight:700; color:#334155; }
  .footer-right { font-size:7pt; color:#94a3b8; }
  .footer-line { height:2px; background:linear-gradient(90deg,#1DB864,#8B4513); margin-bottom:3mm; }
  .content-page { padding:10mm 20mm 25mm; }
  .section-title { font-size:16pt; font-weight:700; color:#1e293b; margin:8mm 0 4mm; }
  .intro { font-size:9.5pt; line-height:1.7; color:#475569; text-align:justify; margin-bottom:6mm; }
  .address-block { margin-bottom:8mm; font-size:9.5pt; line-height:1.8; }
  .address-block .to { font-weight:700; }
  .ref { font-weight:700; }
  .signature { margin-top:12mm; }
  .sig-line { width:50mm; border-bottom:1px solid #334155; margin-bottom:2mm; }
  .sig-name { font-size:9pt; font-weight:700; }
  .sig-role { font-size:8pt; color:#64748b; }
  table.inv { width:100%; border-collapse:collapse; margin:4mm 0; font-size:9pt; }
  table.inv thead th { background:#f8fafc; padding:8px 10px; text-align:left; font-size:8pt; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; border-bottom:2px solid #e2e8f0; }
  table.inv thead th:not(:first-child) { text-align:right; }
  table.inv tbody td { padding:8px 10px; border-bottom:1px solid #f1f5f9; font-size:9pt; }
  table.inv tbody td:not(:first-child) { text-align:right; }
  table.inv tfoot td { padding:8px 10px; font-weight:700; font-size:9.5pt; background:#f8fafc; border-top:2px solid #e2e8f0; text-align:right; }
  table.inv tfoot td:first-child { text-align:left; color:#64748b; }
  .payment-title { font-size:13pt; font-weight:700; color:#1DB864; text-align:center; margin:6mm 0 4mm; }
  .payment-item { display:flex; align-items:center; gap:8px; margin-bottom:4mm; font-size:9.5pt; }
  .payment-bullet { width:8px; height:8px; border-radius:50%; background:#1DB864; flex-shrink:0; }
  .conditions { font-size:8.5pt; line-height:1.7; color:#475569; }
  .cond-title { font-size:10pt; font-weight:700; color:#1e293b; margin:6mm 0 2mm; }
  .divider { height:1px; background:#e2e8f0; margin:6mm 0; }
  @media print {
    body { background:white; }
    .page { margin:0; box-shadow:none; }
    .footer { position:fixed; bottom:0; }
  }
</style>
</head>
<body>

<!-- CAPA -->
<div class="page cover">
  <div class="cover-logo">
    ${logoB64 ? `<img src="${logoB64}" alt="Altitude"/>` : ''}
  </div>
  <div class="cover-info">
    <div class="cover-title">${proposta.codigo} Carta Proposta - ${proposta.titulo}</div>
    <div class="cover-sub">
      <strong>A/C:</strong> ${cliente?.contato || "—"} | ${cliente?.razao_social || "—"} | ${cliente?.cnpj || "—"}<br/>
      <strong>Data:</strong> ${fmtDt(proposta.data_emissao)}<br/>
      <strong>Validade:</strong> ${fmtDt(proposta.data_validade)}
    </div>
  </div>
</div>

<!-- CARTA -->
<div class="page">
  <div class="header">
    <div class="header-logo">${logoB64 ? `<img src="${logoB64}" alt="Altitude"/>` : '<strong>ALTITUDE</strong>'}</div>
    <div class="header-contact">
      <strong>Altitude Topografia e Engenharia</strong><br/>
      (34) 99880-2604 / (34) 99672-5798 - @altitude.te<br/>
      lourenco@altitudetopo.com.br / marcosdiego@altitudetopo.com.br
    </div>
  </div>
  <div class="content-page">
    <div class="address-block">
      <div class="to">À ${cliente?.razao_social || "—"}</div>
      <div>A/C.: ${cliente?.contato || "—"}</div>
      <div class="ref">Ref: Proposta ${proposta.codigo} ${proposta.titulo}</div>
    </div>
    <p class="intro">Prezados.</p>
    <p class="intro">Em resposta à solicitação, gostaríamos de agradecer a oportunidade e assegurar o nosso total empenho na obtenção de sua plena satisfação.</p>
    <p class="intro">A presente proposta compreende à <strong>${proposta.descricao_servico || proposta.titulo}</strong>${cliente?.cidade ? `. Obra situada na cidade de ${cliente.cidade}${cliente.estado ? "-" + cliente.estado : ""}` : ""}.</p>
    <p class="intro">Se considerar que alguma informação necessita de esclarecimentos, é omissa ou não está de acordo com o que foi solicitado, por gentileza, entre em contato conosco para procedermos aos ajustes e esclarecimentos necessários.</p>
    <p class="intro">Sem outro assunto de momento, reiteramos o nosso interesse em colaborar com seu projeto e apresentamos os nossos melhores cumprimentos.</p>
    <div class="signature">
      <p style="font-size:9.5pt;margin-bottom:10mm;">Atenciosamente,</p>
      <div class="sig-line"></div>
      <div class="sig-name">Lourenço Farias | Sócio-Proprietário</div>
      <div class="sig-role">lourenco@altitudetopo.com.br</div>
    </div>
  </div>
  <div class="footer">
    <div>
      <div class="footer-line"></div>
      <div class="footer-left">Altitude Topografia e Engenharia</div>
      <div style="font-size:7pt;color:#94a3b8;">(34) 99880-2604 / (34) 99672-5798 · lourenco@altitudetopo.com.br</div>
    </div>
    <div class="footer-right">Página 2</div>
  </div>
</div>

<!-- INVESTIMENTO -->
<div class="page">
  <div class="header">
    <div class="header-logo">${logoB64 ? `<img src="${logoB64}" alt="Altitude"/>` : '<strong>ALTITUDE</strong>'}</div>
    <div class="header-contact">
      <strong>Altitude Topografia e Engenharia</strong><br/>
      (34) 99880-2604 / (34) 99672-5798 - @altitude.te<br/>
      lourenco@altitudetopo.com.br / marcosdiego@altitudetopo.com.br
    </div>
  </div>
  <div class="content-page">
    <div class="section-title">Investimento</div>
    <p style="font-size:9.5pt;color:#64748b;margin-bottom:4mm;">Os valores para a execução dos serviços são:</p>
    <table class="inv">
      <thead><tr><th>Descrição</th><th>Código</th><th>Valor Unit.</th><th>Qtd.</th><th>Valor Total</th></tr></thead>
      <tbody>
        ${itens.map(i => `<tr>
          <td>${i.descricao}</td>
          <td>${i.codigo_unidade || "—"}</td>
          <td>${fmtBR(i.valor_unitario)}</td>
          <td>${(i.quantidade || 0).toLocaleString("pt-BR")}</td>
          <td><strong>${fmtBR(i.valor_total)}</strong></td>
        </tr>`).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">Subtotal</td>
          <td>${fmtBR(proposta.valor_total)}</td>
        </tr>
        ${proposta.desconto > 0 ? `<tr><td colspan="4" style="color:#dc2626;">Desconto</td><td style="color:#dc2626;">- ${fmtBR(proposta.desconto)}</td></tr>` : ""}
        <tr>
          <td colspan="4" style="color:#1DB864;font-size:10.5pt;">Total</td>
          <td style="color:#1DB864;font-size:10.5pt;">${fmtBR(proposta.valor_com_desconto || proposta.valor_total)}</td>
        </tr>
      </tfoot>
    </table>

    ${parcelas.length > 0 ? `
    <div class="payment-title">Plano de pagamentos</div>
    ${parcelas.map(pa => `
      <div class="payment-item">
        <div class="payment-bullet"></div>
        <span>${pa.descricao || "Parcela " + pa.numero} — <strong>${fmtBR(pa.valor)}</strong></span>
      </div>
    `).join("")}` : ""}

    ${proposta.revisoes_inclusas > 0 ? `
    <div style="margin-top:8mm;background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;font-size:8.5pt;color:#92400e;">
      ⚠️ Esta proposta inclui <strong>${proposta.revisoes_inclusas} revisões</strong> (desde que não alterados projetos da implantação arquitetônica).
    </div>` : ""}
  </div>
  <div class="footer">
    <div>
      <div class="footer-line"></div>
      <div class="footer-left">Altitude Topografia e Engenharia</div>
      <div style="font-size:7pt;color:#94a3b8;">(34) 99880-2604 / (34) 99672-5798 · lourenco@altitudetopo.com.br</div>
    </div>
    <div class="footer-right">Página 3</div>
  </div>
</div>

<!-- CONDIÇÕES GERAIS -->
<div class="page">
  <div class="header">
    <div class="header-logo">${logoB64 ? `<img src="${logoB64}" alt="Altitude"/>` : '<strong>ALTITUDE</strong>'}</div>
    <div class="header-contact">
      <strong>Altitude Topografia e Engenharia</strong><br/>
      (34) 99880-2604 / (34) 99672-5798 - @altitude.te<br/>
      lourenco@altitudetopo.com.br / marcosdiego@altitudetopo.com.br
    </div>
  </div>
  <div class="content-page">
    <div class="section-title">Condições Gerais</div>
    <p class="conditions">As seguintes condições complementam as restantes condições particulares apresentadas nesta proposta e que, no seu conjunto, constituem o acordo entre a <strong>${cliente?.razao_social || "CLIENTE"}</strong> e a <strong>Altitude Topografia e Engenharia</strong>.</p>
    <div class="cond-title">1. Validade da Proposta</div>
    <p class="conditions">A presente proposta é válida por um período de 30 (trinta) dias contados a partir da data de envio, depois dos quais a proposta é considerada sem efeito.</p>
    <div class="cond-title">2. Confidencialidade</div>
    <p class="conditions">Toda a informação contida neste documento e seus anexos é confidencial, e só poderá ser utilizada pelo CLIENTE no âmbito da avaliação desta proposta. O CLIENTE não poderá, direta ou indiretamente utilizar, apresentar, vender, copiar, reproduzir, divulgar ou publicar qualquer informação contida neste documento sem a autorização prévia e por escrito do FORNECEDOR.</p>
    <div class="cond-title">3. Aprovação de Proposta</div>
    <p class="conditions">A encomenda do serviço é aceite como válida, sempre que a aprovação seja efetuada dentro do prazo de validade da proposta, pelo FORNECEDOR ou por uma pessoa com poderes para o ato em representação deste.</p>
    <div class="cond-title">4. Comunicações e Notificações</div>
    <p class="conditions">Para assegurar clareza e objetividade entre as partes, todas as comunicações, incluindo pedidos, instruções, avisos, aprovações e respostas deverão ser efetuadas por email e através dos interlocutores que cada parte designou como responsável no início dos trabalhos.</p>
    <div class="cond-title">5. Alterações</div>
    <p class="conditions">Todos os pedidos de alteração ou outra forma de solicitação estão sujeitos à apreciação da FORNECEDOR. Se o pedido exigir uma reformulação estrutural de trabalho ou inclusão de serviços não definidos na proposta aprovada, o FORNECEDOR reserva-se o direito de não as implementar, ficando estas alterações sujeitas a apresentação de nova proposta comercial.</p>
  </div>
  <div class="footer">
    <div>
      <div class="footer-line"></div>
      <div class="footer-left">Altitude Topografia e Engenharia</div>
      <div style="font-size:7pt;color:#94a3b8;">(34) 99880-2604 / (34) 99672-5798 · lourenco@altitudetopo.com.br</div>
    </div>
    <div class="footer-right">Página 4</div>
  </div>
</div>

</body></html>`;

    // Open print window
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      setTimeout(() => {
        win.focus();
        win.print();
      }, 800);
    };
  };

  if (detail) return (
    <div className="content">
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setDetailId(null)}>← Voltar</button>
        <span style={{ fontSize: 13, color: COLORS.textMuted }}>Propostas /</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{detail.codigo}</span>
        <Badge status={detail.status} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { openEdit(detail); setDetailId(null); }}>✏️ Editar</button>
          <button className="btn btn-primary btn-sm" onClick={() => gerarPDF(detail, detailItens, detailParcelas, detailCli)}
            style={{ background: "linear-gradient(135deg,#1DB864,#17a358)", display:"flex", alignItems:"center", gap:5 }}>
            📄 Gerar PDF
          </button>
          <select className="status-select" value={detail.status} onChange={e => updateStatus(detail.id, e.target.value)}>
            {["rascunho","enviada","aprovada","recusada","expirada"].map(s => <option key={s} value={s}>{STATUS_COLORS[s]?.label}</option>)}
          </select>
        </div>
      </div>

      <div className="table-card" style={{ padding: 28, marginBottom: 16 }}>
        <div className="form-section-title">Identificação</div>
        <div className="detail-grid">
          <div className="detail-field"><span className="detail-label">Código</span><span className="detail-value" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16 }}>{detail.codigo}</span></div>
          <div className="detail-field"><span className="detail-label">Tipo</span><span className="detail-value" style={{ textTransform: "capitalize" }}>{detail.tipo}</span></div>
          <div className="detail-field"><span className="detail-label">Cliente</span><span className="detail-value">{detailCli?.razao_social || "—"}</span></div>
          <div className="detail-field"><span className="detail-label">A/C</span><span className="detail-value">{detailCli?.contato || "—"}</span></div>
          <div className="detail-field"><span className="detail-label">Emissão</span><span className="detail-value">{fmtDate(detail.data_emissao)}</span></div>
          <div className="detail-field"><span className="detail-label">Validade</span><span className="detail-value">{fmtDate(detail.data_validade)}</span></div>
        </div>
        <div style={{ marginTop: 16 }}>
          <span className="detail-label">Título</span>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{detail.titulo}</div>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: 16 }}>
        <div className="table-header"><div className="table-title">Itens do Serviço</div></div>
        <table>
          <thead><tr><th>Descrição</th><th>Un.</th><th style={{ textAlign: "right" }}>Valor Unit.</th><th style={{ textAlign: "right" }}>Qtd.</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
          <tbody>
            {detailItens.map(i => (
              <tr key={i.id}>
                <td className="td-bold">{i.descricao}</td>
                <td className="td-code">{i.codigo_unidade}</td>
                <td style={{ textAlign: "right" }}>{fmt(i.valor_unitario)}</td>
                <td style={{ textAlign: "right" }}>{i.quantidade?.toLocaleString("pt-BR")}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(i.valor_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "flex-end", gap: 24, fontSize: 13 }}>
          <span>Subtotal: <strong>{fmt(detail.valor_total)}</strong></span>
          {detail.desconto > 0 && <span style={{ color: COLORS.danger }}>Desconto: <strong>-{fmt(detail.desconto)}</strong></span>}
          <span style={{ fontSize: 15, color: COLORS.accent }}>Total: <strong>{fmt(detail.valor_com_desconto)}</strong></span>
        </div>
      </div>

      {detailParcelas.length > 0 && (
        <div className="table-card" style={{ marginBottom: 16 }}>
          <div className="table-header"><div className="table-title">Plano de Pagamento</div></div>
          <table>
            <thead><tr><th>#</th><th>Descrição</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
            <tbody>
              {detailParcelas.map(pa => (
                <tr key={pa.id}><td className="td-code">Parcela {pa.numero}</td><td>{pa.descricao}</td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(pa.valor)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail.revisoes_inclusas > 0 && (
        <div style={{ background: "#fef9ec", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e" }}>
          ⚠️ Esta proposta inclui <strong>{detail.revisoes_inclusas} revisões</strong> (desde que não alterados projetos da implantação arquitetônica).
        </div>
      )}
    </div>
  );

  return (
    <div className="content">
      {error && <div className="error-bar">⚠️ Erro Supabase: {error}</div>}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Propostas ({filtered.length})</div>
          <input className="search-input" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select" style={{ width: 140, padding: "7px 10px", fontSize: 12 }} value={filterStatus} onChange={e => setFilter(e.target.value)}>
            <option value="todos">Todos status</option>
            {["rascunho","enviada","aprovada","recusada","expirada"].map(s => <option key={s} value={s}>{STATUS_COLORS[s]?.label}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nova Proposta</button>
        </div>
        {filtered.length === 0 && !loading ? (
          <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">Nenhuma proposta</div></div>
        ) : (
          <table>
            <thead><tr><th>Código</th><th>Título</th><th>Cliente</th><th>Emissão</th><th>Validade</th><th style={{ textAlign: "right" }}>Valor</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: COLORS.textMuted }}>Carregando...</td></tr>}
              {filtered.map(p => {
                const cli = clientes.find(c => c.id === p.cliente_id);
                return (
                  <tr key={p.id} style={{ cursor: "pointer" }}>
                    <td className="td-code" onClick={() => setDetailId(p.id)}>{p.codigo}</td>
                    <td className="td-bold" onClick={() => setDetailId(p.id)}>{p.titulo}</td>
                    <td className="td-muted" onClick={() => setDetailId(p.id)}>{cli?.contato || cli?.razao_social || "—"}</td>
                    <td className="td-muted" onClick={() => setDetailId(p.id)}>{fmtDate(p.data_emissao)}</td>
                    <td className="td-muted" onClick={() => setDetailId(p.id)}>{fmtDate(p.data_validade)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }} onClick={() => setDetailId(p.id)}>{fmt(p.valor_com_desconto)}</td>
                    <td onClick={() => setDetailId(p.id)}><Badge status={p.status} /></td>
                    <td style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(p)}>✏️</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(p.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === "new" ? "Nova Proposta" : `Editar — ${form.codigo}`}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <div className="form-section-title">Identificação</div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Código *</label><input className="form-input" style={{ fontFamily: "'IBM Plex Mono', monospace" }} value={form.codigo || ""} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Tipo</label><select className="form-select" value={form.tipo || "topografia"} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}><option value="topografia">Topografia</option><option value="infraestrutura">Infraestrutura</option><option value="projeto">Projeto</option><option value="outro">Outro</option></select></div>
                  <div className="form-group form-full"><label className="form-label">Título *</label><input className="form-input" value={form.titulo || ""} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Cliente *</label><select className="form-select" value={form.cliente_id || ""} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}><option value="">Selecionar...</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.razao_social}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status || "rascunho"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{["rascunho","enviada","aprovada","recusada","expirada"].map(s => <option key={s} value={s}>{STATUS_COLORS[s]?.label}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Data Emissão</label><input type="date" className="form-input" value={form.data_emissao || ""} onChange={e => setForm(f => ({ ...f, data_emissao: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Validade</label><input type="date" className="form-input" value={form.data_validade || ""} onChange={e => setForm(f => ({ ...f, data_validade: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Revisões Inclusas</label><input type="number" className="form-input" value={form.revisoes_inclusas ?? 6} min={0} onChange={e => setForm(f => ({ ...f, revisoes_inclusas: parseInt(e.target.value) }))} /></div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Itens do Serviço</div>
                <table className="items-table">
                  <thead><tr><th style={{ width: "40%" }}>Descrição</th><th style={{ width: 70 }}>Un.</th><th style={{ width: 110 }}>Valor Unit.</th><th style={{ width: 90 }}>Qtd.</th><th style={{ width: 110 }}>Total</th><th style={{ width: 36 }}></th></tr></thead>
                  <tbody>
                    {formItens.map((item, idx) => (
                      <tr key={item.id}>
                        <td><input className="item-input" value={item.descricao} onChange={e => updateItem(idx, "descricao", e.target.value)} /></td>
                        <td><input className="item-input" value={item.codigo_unidade} onChange={e => updateItem(idx, "codigo_unidade", e.target.value)} style={{ textAlign: "center" }} /></td>
                        <td><input className="item-input" type="number" value={item.valor_unitario} onChange={e => updateItem(idx, "valor_unitario", e.target.value)} style={{ textAlign: "right" }} /></td>
                        <td><input className="item-input" type="number" value={item.quantidade} onChange={e => updateItem(idx, "quantidade", e.target.value)} style={{ textAlign: "right" }} /></td>
                        <td style={{ fontSize: 12, fontWeight: 600, paddingLeft: 10 }}>{fmt(item.valor_total || 0)}</td>
                        <td><button className="btn btn-danger btn-sm btn-icon" style={{ padding: "3px 6px" }} onClick={() => removeItem(idx)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn btn-ghost btn-sm" onClick={addItem}>+ Adicionar Item</button>
                <div style={{ marginTop: 12, display: "flex", gap: 20, justifyContent: "flex-end", alignItems: "center", fontSize: 13 }}>
                  <span>Subtotal: <strong>{fmt(form.valor_total || 0)}</strong></span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Desconto R$</label>
                    <input type="number" className="form-input" style={{ width: 110, padding: "5px 8px" }} value={form.desconto || 0} onChange={e => { const d = parseFloat(e.target.value || 0); setForm(f => ({ ...f, desconto: d, valor_com_desconto: (f.valor_total || 0) - d })); }} />
                  </div>
                  <span style={{ fontSize: 15, color: COLORS.accent, fontWeight: 700 }}>Total: {fmt(form.valor_com_desconto || form.valor_total || 0)}</span>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Plano de Pagamento</div>
                {formParcelas.map((pa, idx) => (
                  <div key={pa.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 32px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textAlign: "center" }}>P{pa.numero}</div>
                    <input className="form-input" style={{ padding: "6px 10px", fontSize: 12 }} placeholder="Descrição da parcela" value={pa.descricao} onChange={e => updateParcela(idx, "descricao", e.target.value)} />
                    <input type="number" className="form-input" style={{ padding: "6px 10px", fontSize: 12, textAlign: "right" }} placeholder="Valor" value={pa.valor} onChange={e => updateParcela(idx, "valor", e.target.value)} />
                    <button className="btn btn-danger btn-sm btn-icon" style={{ padding: "4px 7px" }} onClick={() => removeParcela(idx)}>✕</button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={addParcela}>+ Parcela</button>
              </div>

              <div className="form-section">
                <div className="form-section-title">Observações</div>
                <textarea className="form-textarea form-full" value={form.observacoes || ""} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={3} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar Proposta"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ORÇAMENTOS (lista + calculadora como sub-abas)
// ============================================================
function Orcamentos() {
  const { data: clientes }                                     = useTable("clientes", "clientes");
  const { data: orcamentos, loading, error, insert, update, remove } = useTable("orcamentos", "orcamentos");
  const [orcTab, setOrcTab]   = useState("lista");   // "lista" | "calculadora"
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [calcSaving, setCalcSaving] = useState(false);

  const filtered = orcamentos.filter(o =>
    (o.titulo || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.codigo || "").toLowerCase().includes(search.toLowerCase())
  );

  const openNew  = () => {
    setForm({ codigo: `ORC-${new Date().getFullYear()}-${String(orcamentos.length + 1).padStart(3, "0")}`, status: "aberto", data: new Date().toISOString().split("T")[0], desconto: 0 });
    setModal("new");
  };
  const openEdit = (o) => { setForm({ ...o }); setModal(o); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "new") await insert(form);
      else await update(form.id, form);
      setModal(null);
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (!confirm("Remover orçamento?")) return; await remove(id); };

  // Callback da calculadora — salva no Supabase
  const handleCalcSave = async ({ clienteId, cliente, empreend, custo_total, precoAdotado, precoBaseSemNF, precoBaseComNF, fatorRegua, margem, emitirNF, diasCampo }) => {
    setCalcSaving(true);
    try {
      const now  = new Date();
      const ano  = now.getFullYear();
      const seq  = String(orcamentos.length + 1).padStart(3, "0");
      const body = {
        codigo:             `ORC-${ano}-${seq}`,
        cliente_id:         clienteId || null,
        titulo:             empreend || cliente || "Orçamento sem título",
        status:             "aberto",
        data:               now.toISOString().split("T")[0],
        valor_total:        precoAdotado,
        desconto:           0,
        margem,
        emitir_nf:          emitirNF,
        custo_total,
        preco_ideal_sem_nf: precoBaseSemNF,
        preco_ideal_com_nf: precoBaseComNF,
        fator_regua:        fatorRegua,
        dias_campo:         diasCampo,
        observacoes:        cliente ? `Cliente: ${cliente}` : "",
      };
      await insert(body);
      alert("✅ Orçamento salvo com sucesso!");
      setOrcTab("lista");
    } finally { setCalcSaving(false); }
  };

  return (
    <div className="content">
      {/* SUB-NAVEGAÇÃO */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: `1px solid ${COLORS.border}` }}>
        {[
          { id: "lista",        label: "📋 Lista de Orçamentos" },
          { id: "calculadora",  label: "📐 Nova Calculadora"    },
        ].map(t => (
          <button key={t.id} className={`tab${orcTab === t.id ? " active" : ""}`} onClick={() => setOrcTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {orcTab === "calculadora" && (
        <Calculadora clientes={clientes} onSave={handleCalcSave} saving={calcSaving} />
      )}

      {orcTab === "lista" && (
        <>
          {error && <div className="error-bar">⚠️ Erro Supabase: {error}</div>}
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">Orçamentos ({filtered.length})</div>
              <input className="search-input" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-ghost btn-sm" onClick={() => setOrcTab("calculadora")}>📐 Nova Calculadora</button>
              <button className="btn btn-primary btn-sm" onClick={openNew}>+ Novo Manual</button>
            </div>
            {filtered.length === 0 && !loading ? (
              <div className="empty">
                <div className="empty-icon">🧾</div>
                <div className="empty-text">Nenhum orçamento</div>
                <div className="empty-sub" style={{ marginTop: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setOrcTab("calculadora")}>📐 Abrir Calculadora</button>
                </div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Código</th><th>Título</th><th>Cliente</th><th>Data</th>
                    <th style={{ textAlign: "right" }}>Valor Total</th>
                    <th style={{ textAlign: "right" }}>Custo</th>
                    <th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: COLORS.textMuted }}>Carregando...</td></tr>}
                  {filtered.map(o => {
                    const cli = clientes.find(c => c.id === o.cliente_id);
                    return (
                      <tr key={o.id}>
                        <td className="td-code">{o.codigo}</td>
                        <td className="td-bold">{o.titulo}</td>
                        <td className="td-muted">{cli?.contato || cli?.razao_social || "—"}</td>
                        <td className="td-muted">{fmtDate(o.data)}</td>
                        <td style={{ textAlign: "right", fontWeight: 600, color: COLORS.accent }}>{fmt(o.valor_total)}</td>
                        <td style={{ textAlign: "right", color: COLORS.textMuted, fontSize: 12 }}>{o.custo_total ? fmt(o.custo_total) : "—"}</td>
                        <td><Badge status={o.status} /></td>
                        <td style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(o)}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(o.id)}>🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === "new" ? "Novo Orçamento" : "Editar Orçamento"}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Código</label><input className="form-input" value={form.codigo || ""} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status || "aberto"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="aberto">Aberto</option><option value="aprovado">Aprovado</option><option value="reprovado">Reprovado</option></select></div>
                <div className="form-group form-full"><label className="form-label">Título</label><input className="form-input" value={form.titulo || ""} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Cliente</label><select className="form-select" value={form.cliente_id || ""} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}><option value="">Selecionar...</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.razao_social}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Data</label><input type="date" className="form-input" value={form.data || ""} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Valor Total (R$)</label><input type="number" className="form-input" value={form.valor_total || ""} onChange={e => setForm(f => ({ ...f, valor_total: parseFloat(e.target.value) }))} /></div>
                <div className="form-group"><label className="form-label">Desconto (R$)</label><input type="number" className="form-input" value={form.desconto || 0} onChange={e => setForm(f => ({ ...f, desconto: parseFloat(e.target.value) }))} /></div>
                <div className="form-group form-full"><label className="form-label">Observações</label><textarea className="form-textarea" value={form.observacoes || ""} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={3} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CONTRATOS
// ============================================================
function Contratos() {
  const { data: clientes }                                      = useTable("clientes", "clientes");
  const { data: propostas }                                     = useTable("propostas", "propostas");
  const { data: contratos, loading, error, insert, update, remove } = useTable("contratos", "contratos");
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = contratos.filter(c => (c.codigo || "").toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setForm({ codigo: `${new Date().getFullYear()}.CT.${String(contratos.length + 1).padStart(3, "0")}`, status: "ativo", data_assinatura: new Date().toISOString().split("T")[0] });
    setModal("new");
  };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "new") await insert(form);
      else await update(form.id, form);
      setModal(null);
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (!confirm("Remover contrato?")) return; await remove(id); };

  return (
    <div className="content">
      {error && <div className="error-bar">⚠️ Erro Supabase: {error}</div>}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Contratos ({filtered.length})</div>
          <input className="search-input" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ Novo Contrato</button>
        </div>
        {filtered.length === 0 && !loading ? (
          <div className="empty"><div className="empty-icon">📄</div><div className="empty-text">Nenhum contrato</div></div>
        ) : (
          <table>
            <thead><tr><th>Código</th><th>Cliente</th><th>Assinatura</th><th>Início</th><th>Prazo</th><th style={{ textAlign: "right" }}>Valor</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: COLORS.textMuted }}>Carregando...</td></tr>}
              {filtered.map(ct => {
                const cli = clientes.find(c => c.id === ct.cliente_id);
                return (
                  <tr key={ct.id}>
                    <td className="td-code">{ct.codigo}</td>
                    <td className="td-bold">{cli?.contato || cli?.razao_social || "—"}</td>
                    <td className="td-muted">{fmtDate(ct.data_assinatura)}</td>
                    <td className="td-muted">{fmtDate(ct.data_inicio)}</td>
                    <td className="td-muted">{ct.prazo_meses ? `${ct.prazo_meses} meses` : "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(ct.valor_total)}</td>
                    <td><Badge status={ct.status} /></td>
                    <td style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setForm({ ...ct }); setModal(ct); }}>✏️</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(ct.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === "new" ? "Novo Contrato" : "Editar Contrato"}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Código</label><input className="form-input" value={form.codigo || ""} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status || "ativo"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="ativo">Ativo</option><option value="concluido">Concluído</option><option value="cancelado">Cancelado</option></select></div>
                <div className="form-group"><label className="form-label">Cliente</label><select className="form-select" value={form.cliente_id || ""} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}><option value="">Selecionar...</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.razao_social}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Proposta Vinculada</label><select className="form-select" value={form.proposta_id || ""} onChange={e => setForm(f => ({ ...f, proposta_id: e.target.value }))}><option value="">Nenhuma</option>{propostas.map(p => <option key={p.id} value={p.id}>{p.codigo} — {p.titulo}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Data Assinatura</label><input type="date" className="form-input" value={form.data_assinatura || ""} onChange={e => setForm(f => ({ ...f, data_assinatura: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Data Início</label><input type="date" className="form-input" value={form.data_inicio || ""} onChange={e => setForm(f => ({ ...f, data_inicio: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Prazo (meses)</label><input type="number" className="form-input" value={form.prazo_meses || ""} onChange={e => setForm(f => ({ ...f, prazo_meses: parseInt(e.target.value) }))} /></div>
                <div className="form-group"><label className="form-label">Valor Total (R$)</label><input type="number" className="form-input" value={form.valor_total || ""} onChange={e => setForm(f => ({ ...f, valor_total: parseFloat(e.target.value) }))} /></div>
                <div className="form-group form-full"><label className="form-label">Observações</label><textarea className="form-textarea" value={form.observacoes || ""} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={3} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// APP ROOT — com WelcomeScreen e LoginScreen (padrão RHControl)
// ============================================================
export default function App() {
  const [appScreen, setAppScreen] = useState(() => {
    const saved = localStorage.getItem("comercial_screen") || "welcome";
    if (saved === "app" && localStorage.getItem("comercial_admin") !== "true") return "welcome";
    return saved;
  });
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("comercial_admin") === "true");

  function goToScreen(s) { localStorage.setItem("comercial_screen", s); setAppScreen(s); }

  function handleLogin() {
    localStorage.setItem("comercial_admin", "true");
    setIsAdmin(true);
    goToScreen("app");
  }

  function handleLogout() {
    localStorage.removeItem("comercial_admin");
    localStorage.setItem("comercial_screen", "welcome");
    setIsAdmin(false);
    setAppScreen("welcome");
  }

  if (appScreen === "welcome") return <WelcomeScreen onAcessar={() => goToScreen("login")} />;
  if (appScreen === "login" || (appScreen === "app" && !isAdmin)) {
    return <LoginScreen onLogin={handleLogin} onVoltar={() => goToScreen("welcome")} />;
  }

  return <ComercialApp isAdmin={isAdmin} onLogout={handleLogout} />;
}

function ComercialApp({ isAdmin, onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { data: propostas } = useTable("propostas", "propostas");
  const { data: contratos } = useTable("contratos", "contratos");
  const { data: orcamentos } = useTable("orcamentos", "orcamentos");

  const titles = { dashboard: "Dashboard", propostas: "Propostas", orcamentos: "Orçamentos", contratos: "Contratos", clientes: "Clientes" };

  const pages = {
    dashboard: <Dashboard setActive={setActive} propostas={propostas} contratos={contratos} orcamentos={orcamentos} />,
    propostas:  <Propostas />,
    orcamentos: <Orcamentos />,
    contratos:  <Contratos />,
    clientes:   <Clientes />,
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Sidebar active={active} setActive={setActive} propostas={propostas} />
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">Comercial<span>Control</span> — {titles[active]}</div>
            <span className="topbar-status online">🟢 Admin</span>
            <button onClick={() => setConfirmLogout(true)}
              style={{ padding:"6px 14px", border:"1.5px solid #E2E8F0", borderRadius:8, background:"white", cursor:"pointer", fontSize:12, fontWeight:700, color:"#64748B" }}>
              Sair
            </button>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
          {pages[active]}
        </div>
      </div>
      {confirmLogout && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"white", borderRadius:16, padding:"28px 32px", width:320, boxShadow:"0 24px 70px rgba(0,0,0,0.3)", textAlign:"center" }}>
            <div style={{ fontWeight:800, fontSize:16, color:"#0A0A0A", marginBottom:20 }}>Deseja sair do Comercial?</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmLogout(false)} style={{ flex:1, padding:"11px", border:"1.5px solid #E2E8F0", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, background:"white", color:"#475569" }}>Não</button>
              <button onClick={onLogout} style={{ flex:1, padding:"11px", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, background:"linear-gradient(135deg,#0A0A0A,#1DB864)", color:"white" }}>Sim</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
