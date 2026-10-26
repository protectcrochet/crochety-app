import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar__logo">Crochety</Link>
      <nav className="sidebar__nav">
        <NavLink to="/" end><span className="sidebar__ico">⌂</span>Inicio</NavLink>
        <NavLink to="/categorias"><span className="sidebar__ico">▦</span>Categorías</NavLink>
        <NavLink to="/nuevos"><span className="sidebar__ico">✦</span>Nuevos</NavLink>
        <NavLink to="/milista"><span className="sidebar__ico">❤</span>Mi lista</NavLink>
      </nav>
      <div className="sidebar__spacer" />
      {user ? (
        <div className="sidebar__user">
          <div className="topbar__avatar">{(user.email?.[0] || "C").toUpperCase()}</div>
          <button className="topbar__logout" onClick={handleLogout}>Salir</button>
        </div>
      ) : (
        <Link to="/auth" className="topbar__loginbtn">Iniciar sesión</Link>
      )}
    </aside>
  );
}
