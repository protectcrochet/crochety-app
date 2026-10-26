import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroCarousel from "../components/HeroCarousel";
import ContentRow, { normalizarCat } from "../components/ContentRow";

export default function Home({ user }) {
  const [patrones, setPatrones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/patrones")
      .then(r => r.json())
      .then(data => {
        const lista = data.patrones || data || [];
        setPatrones(lista);
        // Guardar versión ligera para la ficha y similares
        const ligero = lista.map(p => ({
          id: p.id, titulo: p.titulo, categoria: p.categoria,
          subcategoria: p.subcategoria, dificultad: p.dificultad,
          es_preview: p.es_preview, thumbnail_path: p.thumbnail_path,
          created_at: p.created_at, paginas: p.paginas,
          tiempo_minutos: p.tiempo_minutos, autor: p.autor, pdf_hash: p.pdf_hash,
          descripcion: p.descripcion, idioma: p.idioma
        }));
        try { sessionStorage.setItem("catalogo", JSON.stringify(ligero)); } catch (e) {}
      })
      .catch(() => setPatrones([]));
  }, []);

  const abrir = (p) => navigate("/patron/" + p.id, { state: { patron: p } });

  const destacados = patrones.filter(p => p.destacado).slice(0, 5);
  const tendencias = patrones.filter(p => p.tendencia);
  const porSub = (sub) => patrones.filter(p =>
    normalizarCat(p.categoria) === "amigurumi" &&
    (p.subcategoria || "").toLowerCase().trim() === sub
  );
  const porCat = (cat) => patrones.filter(p => normalizarCat(p.categoria) === cat);
  const recientes = [...patrones]
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
    .slice(0, 20);

  return (
    <div className="home">
      <HeroCarousel
        items={destacados.length ? destacados : patrones.slice(0, 5)}
        onOpen={abrir}
      />
      <div className="home__rows">
        <ContentRow title="Tendencias" items={tendencias} onOpen={abrir} />
        <ContentRow title="Amigurumis · Animales" items={porSub("animales")} onOpen={abrir} />
        <ContentRow title="Amigurumis · Personajes y fantasía" items={porSub("personajes y fantasía")} onOpen={abrir} />
        <ContentRow title="Amigurumis · Muñecas y muñecos" items={porSub("personas y muñecos")} onOpen={abrir} />
        <ContentRow title="Halloween" items={porCat("halloween")} onOpen={abrir} />
        <ContentRow title="Navidad" items={porCat("navidad")} onOpen={abrir} />
        <ContentRow title="Hogar y decoración" items={porCat("decoracion")} onOpen={abrir} />
        <ContentRow title="Accesorios" items={porCat("accesorios")} onOpen={abrir} />
        <ContentRow title="Recién agregados" items={recientes} onOpen={abrir} />
      </div>
    </div>
  );
}
