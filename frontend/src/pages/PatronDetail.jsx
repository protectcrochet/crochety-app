import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import ContentRow, { normalizarCat, catNombreBonito } from "../components/ContentRow";
import DesbloqueoModal from "../components/DesbloqueoModal";
import { useAuth } from "../hooks/useAuth";

export default function PatronDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [patron, setPatron] = useState(location.state?.patron || null);
  const [imgRota, setImgRota] = useState(false);
  const [modalDesbloqueo, setModalDesbloqueo] = useState(false);
  const { user } = useAuth();
  const [similares, setSimilares] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setImgRota(false);
  }, [id]);

  // Entrada directa por URL: buscar en caché o en la API
  useEffect(() => {
    if (patron) return;
    const cacheado = sessionStorage.getItem("patron_" + id);
    if (cacheado) {
      try { setPatron(JSON.parse(cacheado)); return; } catch (e) {}
    }
    fetch("/api/patrones")
      .then(r => r.json())
      .then(data => {
        const lista = data.patrones || data || [];
        const found = lista.find(p => p.id === id);
        if (found) setPatron(found);
      })
      .catch(() => {});
  }, [id, patron]);

  // Guardar en caché + calcular similares
  useEffect(() => {
    if (!patron) return;
    try { sessionStorage.setItem("patron_" + patron.id, JSON.stringify(patron)); } catch (e) {}

    const cat = normalizarCat(patron.categoria);
    const sub = (patron.subcategoria || "").toLowerCase().trim();

    const filtrar = (l) => {
      const sims = l.filter(p => p.id !== patron.id)
        .filter(p => (p.subcategoria || "").toLowerCase().trim() === sub || normalizarCat(p.categoria) === cat)
        .slice(0, 20);
      setSimilares(sims);
    };

    let lista = [];
    try { lista = JSON.parse(sessionStorage.getItem("catalogo") || "[]"); } catch (e) {}
    if (lista.length) {
      filtrar(lista);
    } else {
      fetch("/api/patrones")
        .then(r => r.json())
        .then(data => filtrar(data.patrones || data || []))
        .catch(() => {});
    }
  }, [patron]);

  const coverUrl = patron ? ("/api/patrones/portada/" + patron.id) : null;

  if (!patron) {
    return <p style={{ padding: "40vh 4vw", color: "#86868b" }}>Cargando patrón…</p>;
  }

  const leerPatron = async () => {
    const email = (user && user.email) || localStorage.getItem("crochety_email") || "";
    if (!email) { setModalDesbloqueo(true); return; }
    try {
      const r = await fetch("/api/monetizacion/desbloqueo/" + patron.id + "?email=" + encodeURIComponent(email));
      const d = await r.json();
      if (d.desbloqueado) { navigate("/visor/" + patron.id, { state: { patron } }); return; }
    } catch (e) {}
    setModalDesbloqueo(true);
  };

  const anio = (patron.created_at || "2026").substring(0, 4);
  const horas = patron.tiempo_minutos ? Math.round(patron.tiempo_minutos / 60) + " h aprox." : null;
  const esGratis = patron.es_preview === 1 || patron.es_preview === true;

  return (
    <div className="detail">
      <Link to="/" className="detail__back">← Volver</Link>

      <div className="detail__hero">
        {(coverUrl && !imgRota) ? (
          <img className="detail__cover" src={coverUrl} alt={patron.titulo} onError={() => setImgRota(true)} />
        ) : (
          <div className="detail__placeholder">{(patron.titulo || "?")[0].toUpperCase()}</div>
        )}
        <div className="detail__fade" />
      </div>

      <div className="detail__info">
        <h1>{patron.titulo}</h1>
        <div className="detail__meta">
          <span className="match">98% para ti</span>
          <span>{anio}</span>
          <span>{patron.paginas ? patron.paginas + " páginas" : "PDF"}</span>
          <span>{patron.dificultad || "Todos los niveles"}</span>
          {horas && <span>{horas}</span>}
          <span className={"badge " + (esGratis ? "badge--free" : "badge--premium")}>
            {esGratis ? "GRATIS" : "PRO"}
          </span>
        </div>
        <p className="detail__desc">
          {patron.descripcion || "Patrón de crochet disponible en la biblioteca."}
        </p>
        <div className="detail__buttons">
          <button className="btn btn--play" onClick={leerPatron}>▶ Leer ahora</button>
          <button className="btn btn--ghost">+ Mi lista</button>
        </div>
        <div className="detail__grid">
          <div><span>Autor</span><b>{patron.autor || "—"}</b></div>
          <div><span>Categoría</span><b>{catNombreBonito(patron.categoria)}</b></div>
          {patron.subcategoria && <div><span>Tipo</span><b>{patron.subcategoria}</b></div>}
          <div><span>Idioma</span><b>{(patron.idioma || "es").toUpperCase()}</b></div>
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <ContentRow
          title="Más como este"
          items={similares}
          onOpen={(p) => navigate("/patron/" + p.id, { state: { patron: p } })}
        />
      </div>

      {modalDesbloqueo && patron && (
        <DesbloqueoModal
          patron={patron}
          onClose={() => setModalDesbloqueo(false)}
          onDesbloqueado={() => {
            setModalDesbloqueo(false);
            navigate("/visor/" + patron.id, { state: { patron } });
          }}
        />
      )}
    </div>
  );
}
