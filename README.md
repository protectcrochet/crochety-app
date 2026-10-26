# Crochety — Rediseño estilo Netflix (Crochety.app)

Estructura de archivos para copiar sobre el proyecto crochety:

```
crochety-redesign/
├── README.md
└── frontend/src/
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── TopBar.jsx
    │   ├── HeroCarousel.jsx
    │   └── ContentRow.jsx
    └── pages/
        └── Home.jsx
```

## Instalación

```bash
cd ~/Downloads/crochety-redesign
cp README.md ~/Desktop/flix/crochety/
cp frontend/src/index.css ~/Desktop/flix/crochety/frontend/src/
cp frontend/src/components/TopBar.jsx ~/Desktop/flix/crochety/frontend/src/components/
cp frontend/src/components/HeroCarousel.jsx ~/Desktop/flix/crochety/frontend/src/components/
cp frontend/src/components/ContentRow.jsx ~/Desktop/flix/crochety/frontend/src/components/
cp frontend/src/pages/Home.jsx ~/Desktop/flix/crochety/frontend/src/pages/
cp frontend/src/App.jsx ~/Desktop/flix/crochety/frontend/src/
```

Después, en el proyecto:
```bash
cd ~/Desktop/flix/crochety/frontend
npm install
npm run dev
```

## Qué incluye

- **TopBar**: barra fija estilo Netflix con logo, navegación y avatar.
- **HeroCarousel**: destacado principal con botones "Ver ahora" / "Mi lista".
- **ContentRow**: filas horizontales de patrones con scroll y hover zoom.
- **Home**: compone las filas por categoría (Amigurumis, Ropa, Hogar...).
- **index.css**: sistema de estilos dark, variables y utilidades.
