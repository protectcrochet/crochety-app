import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export default function Visor() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [patron, setPatron] = useState(location.state?.patron || null);
  const [pdf, setPdf] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (patron) return;
    const c = sessionStorage.getItem("patron_" + id);
    if (c) { try { setPatron(JSON.parse(c)); return; } catch (e) {} }
    const buscar = (l) => {
      const found = (l || []).find(p => p.id === id);
      if (found) setPatron(found);
    };
    let lista = [];
    try { lista = JSON.parse(sessionStorage.getItem("catalogo") || "[]"); } catch (e) {}
    if (lista.length) {
      buscar(lista);
    } else {
      fetch("/api/patrones")
        .then(r => r.json())
        .then(data => buscar(data.patrones || data || []))
        .catch(() => {});
    }
  }, [id, patron]);

  const hash = patron?.pdf_hash ? String(patron.pdf_hash).slice(0, 16) : null;

  useEffect(() => {
    if (!hash) { setError("Este patron no tiene archivo asociado."); return; }
    let cancelado = false;
    setCargando(true);
    setError(null);
    fetch("/api/patrones/archivo/" + hash)
      .then(r => {
        if (!r.ok) throw new Error("no-disponible");
        return r.arrayBuffer();
      })
      .then(async data => {
        const doc = await pdfjsLib.getDocument({ data }).promise;
        if (cancelado) return;
        setPdf(doc);
        setTotal(doc.numPages);
        setPagina(1);
      })
      .catch(() => { if (!cancelado) setError("Este PDF aun no esta disponible localmente. Prueba con otro patron."); })
      .finally(() => { if (!cancelado) setCargando(false); });
    return () => { cancelado = true; };
  }, [hash]);

  const render = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;
    try {
      const page = await pdf.getPage(pagina);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const base = page.getViewport({ scale: 1 });
      const dpr = window.devicePixelRatio || 1;
      const anchoMax = Math.min(window.innerWidth - 40, 860);
      const escala = (anchoMax / base.width) * dpr;
      const viewport = page.getViewport({ scale: escala });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = (viewport.width / dpr) + "px";
      canvas.style.height = (viewport.height / dpr) + "px";

      // pdfjs v6: se pasa el canvas directo; fallback a canvasContext por si acaso
      let task;
      try {
        task = page.render({ canvas, viewport });
      } catch (e1) {
        task = page.render({ canvasContext: ctx, viewport });
      }
      await task.promise;

      // Marca de agua diagonal
      ctx.save();
      ctx.rotate(-Math.PI / 9);
      ctx.font = "600 " + Math.round(viewport.width / 24) + "px -apple-system, sans-serif";
      ctx.fillStyle = "rgba(41, 151, 255, 0.09)";
      ctx.textAlign = "center";
      for (let y = viewport.height * 0.15; y < viewport.height * 1.2; y += viewport.height * 0.22) {
        ctx.fillText("Crochety · " + (patron?.titulo || "patron"), viewport.width / 2, y);
      }
      ctx.restore();
    } catch (e) {
      setError("Error al renderizar: " + (e?.message || e));
    }
  }, [pdf, pagina, patron]);

  useEffect(() => { render(); }, [render]);

  return (
    <div className="visor" onContextMenu={(e) => e.preventDefault()}>
      <div className="visor__bar">
        <button onClick={() => navigate(-1)}>← Volver</button>
        <span className="visor__titulo">{patron?.titulo || "Patron"}</span>
        <div className="visor__pager">
          <button disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)}>‹</button>
          <span>{pagina} / {total || "–"}</span>
          <button disabled={!total || pagina >= total} onClick={() => setPagina(p => p + 1)}>›</button>
        </div>
      </div>
      <div className="visor__stage">
        {error ? (
          <p className="visor__msg">{error}</p>
        ) : cargando ? (
          <p className="visor__msg">Cargando patron…</p>
        ) : (
          <canvas ref={canvasRef} className="visor__canvas" />
        )}
      </div>
    </div>
  );
}
