import { useState } from "react";
import ComercialControl from "./ComercialControl";

const SYSTEMS = [
  { id: "geocontrol", name: "Geocontrol",  desc: "Gestão de topografia",            icon: "🗺️", color: "#0f766e", external: "https://altitudetopo.vercel.app/" },
  { id: "rhcontrol",  name: "RHControl",   desc: "Gestão de equipe",                icon: "👥", color: "#1d4ed8", external: "https://rhaltitude.vercel.app/"   },
  { id: "comercial",  name: "Comercial",   desc: "Clientes, propostas e contratos", icon: "💼", color: "#1DB864", external: null },
];

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #EEF2F7; color: #1E293B; }
  .central { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 230px; height: 100vh; background: #EEF2F7; border-right: 1px solid #E2E8F0; padding: 20px; flex-shrink: 0; display: flex; flex-direction: column; }
  .logo { display: flex; gap: 10px; margin-bottom: 30px; align-items: center; }
  .logo-box { width: 40px; height: 40px; background: linear-gradient(135deg,#334155,#64748B); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; flex-shrink: 0; }
  .logo-text strong { display: block; font-size: 15px; }
  .logo-text small { font-size: 11px; color: #64748b; }
  .menu { list-style: none; display: flex; flex-direction: column; gap: 4px; }
  .menu li { padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .menu li:hover { background: rgba(51,65,85,0.08); }
  .menu li.active { background: rgba(51,65,85,0.15); font-weight: 600; }
  .menu-sep { height: 1px; background: #E2E8F0; margin: 8px 0; }
  .main { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
  .back-bar { height: 52px; background: #fff; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; padding: 0 20px; gap: 12px; flex-shrink: 0; }
  .back-btn { padding: 7px 14px; border: none; border-radius: 8px; background: #334155; color: white; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; }
  .back-btn:hover { background: #1E293B; }
  .back-title { font-size: 14px; font-weight: 600; color: #64748b; }
  .dashboard { flex: 1; overflow-y: auto; padding: 40px; position: relative; }
  .watermark { position: absolute; width: 500px; height: 500px; background: url('/logo.png') no-repeat center; background-size: contain; opacity: 0.035; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; animation: respirar 6s ease-in-out infinite; }
  @keyframes respirar { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.03; } 50% { transform: translate(-50%,-50%) scale(1.03); opacity: 0.05; } }
  .dashboard h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; position: relative; z-index: 1; }
  .dashboard p { color: #64748b; font-size: 14px; margin-bottom: 32px; position: relative; z-index: 1; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; position: relative; z-index: 1; }
  .card { background: white; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; cursor: pointer; transition: 0.25s; }
  .card:hover { transform: translateY(-6px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
  .card:active { transform: scale(0.97); }
  .card-icon { font-size: 28px; margin-bottom: 12px; }
  .card-name { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
  .card-desc { font-size: 13px; color: #64748b; margin-bottom: 14px; }
  .card-tag { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; }
  .card-tag.interno { background: #dcfce7; color: #15803d; }
  .card-tag.externo { background: #dbeafe; color: #1d4ed8; }
  .iframe-wrap { flex: 1; overflow: hidden; }
  .iframe-wrap iframe { width: 100%; height: 100%; border: none; }
  .embedded-wrap { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
`;

export default function Central() {
  const [active, setActive] = useState("dashboard");
  const [iframeUrl, setIframeUrl] = useState("");

  const openSystem = (sys) => {
    setActive(sys.id);
    if (sys.external) setIframeUrl(sys.external);
  };

  const goHome = () => { setActive("dashboard"); setIframeUrl(""); };
  const activeSystem = SYSTEMS.find(s => s.id === active);

  return (
    <>
      <style>{css}</style>
      <div className="central">
        <div className="sidebar">
          <div className="logo">
            <div className="logo-box">ALT</div>
            <div className="logo-text"><strong>Altitude</strong><small>Central de Sistemas</small></div>
          </div>
          <ul className="menu">
            <li className={active === "dashboard" ? "active" : ""} onClick={goHome}>🏠 Dashboard</li>
            <div className="menu-sep" />
            {SYSTEMS.map(s => (
              <li key={s.id} className={active === s.id ? "active" : ""} onClick={() => openSystem(s)}>
                {s.icon} {s.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="main">
          {active === "dashboard" && (
            <div className="dashboard">
              <div className="watermark" />
              <h1>Central de Sistemas</h1>
              <p>Selecione um sistema para começar</p>
              <div className="cards">
                {SYSTEMS.map(s => (
                  <div className="card" key={s.id} onClick={() => openSystem(s)}>
                    <div className="card-icon">{s.icon}</div>
                    <div className="card-name" style={{ color: s.color }}>{s.name}</div>
                    <div className="card-desc">{s.desc}</div>
                    <span className={`card-tag ${s.external ? "externo" : "interno"}`}>
                      {s.external ? "Sistema externo" : "✦ Integrado"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active !== "dashboard" && (
            <>
              <div className="back-bar">
                <button className="back-btn" onClick={goHome}>← Voltar</button>
                <span className="back-title">{activeSystem?.icon} {activeSystem?.name} — {activeSystem?.desc}</span>
              </div>
              {activeSystem?.external && (
                <div className="iframe-wrap">
                  <iframe src={iframeUrl} title={activeSystem.name} />
                </div>
              )}
              {active === "comercial" && !activeSystem?.external && (
                <div className="embedded-wrap">
                  <ComercialControl />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
