import { useEffect, useState } from "react";

export default function HeroCarousel({ items = [], onOpen }) {
  const [index, setIndex] = useState(0);
  const [imgOk, setImgOk] = useState(false);
  const current = items[index];

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex(i => (i + 1) % items.length), 8000);
    return () => clearInterval(t);
  }, [items.length]);

  useEffect(() => {
    setImgOk(false);
    if (!current || !("/api/patrones/portada/" + current.id)) return;
    const img = new Image();
    img.onload = () => setImgOk(true);
    img.onerror = () => setImgOk(false);
    img.src = ("/api/patrones/portada/" + current.id);
  }, [current]);

  if (!current) return null;

  const anio = (current.created_at || "2026").substring(0, 4);

  return (
    <section
      className={"hero" + (imgOk ? "" : " hero--noimg")}
      style={imgOk ? { backgroundImage: "url(" + ("/api/patrones/portada/" + current.id) + ")" } : {}}
    >
      <div className="hero__content">
        <h1 className="hero__title">{current.titulo}</h1>
        <div className="hero__meta">
          <span className="match">98% para ti</span>
          <span>{anio}</span>
          <span>{current.paginas ? current.paginas + " páginas" : "Patrón PDF"}</span>
          <span>{current.tiempo_minutos ? Math.round(current.tiempo_minutos / 60) + " h aprox." : ""}</span>
          <span className={"badge " + (current.es_preview ? "badge--free" : "badge--premium")}>
            {current.es_preview ? "GRATIS" : "PRO"}
          </span>
        </div>
        <p className="hero__desc">{current.descripcion || "Patrón de crochet disponible en la biblioteca."}</p>
        <div className="hero__buttons">
          <button className="btn btn--play" onClick={() => onOpen(current)}>▶ Ver patrón</button>
          <button className="btn btn--ghost" onClick={() => onOpen(current, true)}>+ Mi lista</button>
        </div>
      </div>
    </section>
  );
}
