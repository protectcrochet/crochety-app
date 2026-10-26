import { useState, useEffect } from "react";

const CPX_URL = "https://offers.cpx-research.com/?user_id=USER_ID";
const AMAZON_TAG = "crochety-20";

export default function DesbloqueoModal({ patron, onClose, onDesbloqueado }) {
  const [email, setEmail] = useState(localStorage.getItem("crochety_email") || "");
  // fases: email -> encuesta -> video (solo si no califico)
  const [fase, setFase] = useState(email ? "encuesta" : "email");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [videoSeg, setVideoSeg] = useState(0);
  const [misPuntos, setMisPuntos] = useState(null);

  useEffect(() => {
    if (fase === "encuesta" && email) {
      fetch("/api/monetizacion/puntos?email=" + encodeURIComponent(email))
        .then(r => r.json())
        .then(d => { if (typeof d.puntos === "number") setMisPuntos(d); })
        .catch(() => {});
    }
  }, [fase, email]);

  const guardarEmail = async () => {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Escribe un email valido"); return; }
    setCargando(true);
    try {
      await fetch("/api/monetizacion/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, origen: "desbloqueo" })
      });
      localStorage.setItem("crochety_email", email);
      setFase("encuesta");
    } catch { setError("Error de conexion"); }
    setCargando(false);
  };

  const verificar = async () => {
    setCargando(true); setError("");
    try {
      const r = await fetch("/api/monetizacion/desbloqueo/" + patron.id + "?email=" + encodeURIComponent(email));
      const d = await r.json();
      if (d.desbloqueado) {
        fetch("/api/monetizacion/puntos/ganar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, cantidad: 80, motivo: "encuesta" })
        }).catch(() => {});
        onDesbloqueado();
        return;
      }
      setFase("video");
    } catch { setError("Error de conexion"); }
    setCargando(false);
  };

  useEffect(() => {
    if (videoSeg <= 0) return;
    if (videoSeg === 1) {
      fetch("/api/monetizacion/desbloqueo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patron_id: patron.id, email, minutos: 120 })
      }).then(() => {
        fetch("/api/monetizacion/puntos/ganar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, cantidad: 10, motivo: "video" })
        }).catch(() => {});
        setVideoSeg(0);
        onDesbloqueado();
      });
      return;
    }
    const t = setTimeout(() => setVideoSeg(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [videoSeg]);

  const trackClick = (tipo) => {
    fetch("/api/monetizacion/click?patron_id=" + patron.id + "&tipo=" + tipo).catch(() => {});
  };

  const amazon = (q) => "https://www.amazon.com/s?k=" + encodeURIComponent(q) + "&tag=" + AMAZON_TAG;

  const premiumBtn = (
    <button className="btn btn--ghost" style={{ width: "100%", justifyContent: "center" }}
            onClick={() => alert("Pagos: lo conectamos con NOWPayments/Stripe en el siguiente paso")}>
      ⭐ Hazte usuario PRO — todo ilimitado
    </button>
  );

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__card" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>

        {fase === "email" && (
          <>
            <h2>🔒 {patron.titulo}</h2>
            <p className="modal__sub">Patron PRO. Desbloquealo GRATIS con 2 minutos de tu tiempo — solo necesitamos tu email:</p>
            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            {error && <p className="modal__error">{error}</p>}
            <button className="btn btn--play" style={{ justifyContent: "center", width: "100%" }}
                    onClick={guardarEmail} disabled={cargando}>
              {cargando ? "Guardando…" : "Continuar"}
            </button>
          </>
        )}

        {fase === "encuesta" && (
          <>
            <h2>🔓 Desbloquea "{patron.titulo}"</h2>
            <div className="modal__op modal__op--best" style={{ marginBottom: 14 }}>
              <div className="modal__opTitulo">📝 Encuesta rápida <span className="modal__reco">✨ 2-4 min</span></div>
              <div className="modal__opDesc">Una sola encuesta corta y el patrón es tuyo por 24 horas. Sin pagos, sin trampas.</div>
              <div className="modal__opBtns">
                <a className="btn btn--play" target="_blank" rel="noreferrer"
                   href={CPX_URL.replace("USER_ID", encodeURIComponent(email))}
                   onClick={() => trackClick("cpx")}>Abrir encuesta</a>
                <button className="btn btn--ghost" onClick={verificar} disabled={cargando}>
                  {cargando ? "Verificando…" : "Ya la hice, verificar"}
                </button>
              </div>
            </div>
            {error && <p className="modal__error">{error}</p>}
            {misPuntos && (
              <div className="puntosBar">
                <div className="puntosBar__top">
                  <span>🧶 {misPuntos.puntos} pts {misPuntos.checkin_hoy && misPuntos.bonus ? "· +" + (misPuntos.bonus === "bienvenida" ? 20 : misPuntos.bonus === "checkin_semanal" ? 60 : 10) + " hoy ✓" : ""}</span>
                  <span>🔥 racha {misPuntos.racha} día{misPuntos.racha !== 1 ? "s" : ""}</span>
                </div>
                <div className="puntosBar__track">
                  <div className="puntosBar__fill" style={{ width: Math.min(misPuntos.puntos / 10, 100) + "%" }} />
                </div>
                <div className="puntosBar__meta">{misPuntos.puntos >= 1000 ? "🎉 ¡Canjea tu PRO 7 días!" : (1000 - misPuntos.puntos) + " pts para PRO 7 días gratis"}</div>
              </div>
            )}
            {premiumBtn}
          </>
        )}

        {fase === "video" && (
          <>
            <h2>😅 Casi…</h2>
            <p className="modal__sub">No calificaste para esa encuesta (les pasa al 70% de las personas). <b>Pero igual ganas:</b> mira este video de 15 segundos y el patrón es tuyo por 2 horas.</p>
            <div className="modal__op modal__op--best" style={{ marginBottom: 14 }}>
              <div className="modal__opTitulo">🎥 Video de 15 segundos</div>
              {videoSeg > 0 ? (
                <div className="modal__video">
                  <div className="modal__videoNum">{videoSeg}</div>
                  <div className="modal__videoBar">
                    <div style={{ width: ((15 - videoSeg) / 15 * 100) + "%" }} />
                  </div>
                  <p className="modal__videoTxt">Espera unos segundos…</p>
                </div>
              ) : (
                <button className="btn btn--play" style={{ justifyContent: "center" }} onClick={() => setVideoSeg(15)}>Ver video</button>
              )}
            </div>
            <button className="btn btn--ghost" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}
                    onClick={() => setFase("encuesta")}>
              📝 Reintentar con otra encuesta
            </button>
            {premiumBtn}
          </>
        )}

        {/* Materiales afiliados siempre visibles */}
        <div className="modal__mats">
          <div className="modal__matsTit">📦 Materiales para este patrón</div>
          <div className="modal__matsLinks">
            <a href={amazon("hilo algodon amigurumi")} target="_blank" rel="noreferrer" onClick={() => trackClick("amazon")}>🧵 Hilo de algodón → Amazon</a>
            <a href={amazon("ganchos crochet set")} target="_blank" rel="noreferrer" onClick={() => trackClick("amazon")}>🪝 Set de ganchos → Amazon</a>
            <a href={amazon("ojos seguridad amigurumi")} target="_blank" rel="noreferrer" onClick={() => trackClick("amazon")}>👀 Ojos de seguridad → Amazon</a>
          </div>
        </div>
      </div>
    </div>
  );
}
