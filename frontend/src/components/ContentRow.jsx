import { useState } from "react";

export function normalizarCat(c) {
  if (!c) return "otros";
  let s = String(c).toLowerCase().trim();
  const mapa = {
    "famigurumi": "amigurumi", "amigurumis": "amigurumi", "amigurumi": "amigurumi",
    "muñecos": "amigurumi", "munecos": "amigurumi", "dolls": "amigurumi", "doll": "amigurumi",
    "ropa": "ropa", "ropas": "ropa", "clothes": "ropa",
    "accesorios": "accesorios", "accessorios": "accesorios", "accesorio": "accesorios",
    "bolsos": "accesorios", "bolso": "accesorios", "bags": "accesorios",
    "decoracion": "decoracion", "decoración": "decoracion", "hogar": "decoracion", "home": "decoracion",
    "juguetes": "juguetes", "toys": "juguetes",
    "animales": "animales", "animal": "animales",
    "flores": "flores", "flower": "flores",
    "navidad": "navidad", "christmas": "navidad",
    "bebe": "bebe", "bebé": "bebe", "baby": "bebe",
    "otro": "otros", "general": "otros"
  };
  return mapa[s] || s;
}

export function catNombreBonito(c) {
  const n = {
    amigurumi: "Amigurumis", ropa: "Ropa", accesorios: "Accesorios",
    decoracion: "Hogar y decoración", juguetes: "Juguetes", animales: "Animales",
    flores: "Flores", navidad: "Navidad", bebe: "Bebé", otros: "Otros"
  };
  const key = normalizarCat(c);
  return n[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

function Card({ p, onOpen }) {
  const [imgNivel, setImgNivel] = useState(0);
  const hash16 = p.pdf_hash ? String(p.pdf_hash).slice(0, 16) : null;
  const urls = ["/api/patrones/portada/" + p.id]
    .concat(hash16 ? ["/uploads/patrones/" + hash16 + "/page-01.png"] : []);
  const thumbUrl = imgNivel < urls.length ? urls[imgNivel] : null;

  return (
    <article className="acard" onClick={() => onOpen(p)}>
      {thumbUrl ? (
        <img className="acard__img" src={thumbUrl} alt={p.titulo} loading="lazy"
             onError={() => setImgNivel(n => n + 1)} />
      ) : (
        <div className="acard__placeholder">{(p.titulo || "?")[0].toUpperCase()}</div>
      )}
      <div className="acard__overlay">
        <div className="acard__top">
          <span className={"badge " + (p.es_preview ? "badge--free" : "badge--premium")}>
            {p.es_preview ? "FREE" : "PRO"}
          </span>
        </div>
        <div>
          <div className="acard__title">{p.titulo}</div>
          <div className="acard__meta">{catNombreBonito(p.categoria)} · {p.dificultad || "Todos los niveles"}</div>
        </div>
      </div>
    </article>
  );
}

export default function ContentRow({ title, items = [], onOpen }) {
  const visibles = items.slice(0, 20);
  if (!visibles.length) return null;

  return (
    <section className="row">
      <h2 className="row__title">{title}</h2>
      <div className="row__scroll">
        {visibles.map(p => <Card key={p.id} p={p} onOpen={onOpen} />)}
      </div>
    </section>
  );
}
