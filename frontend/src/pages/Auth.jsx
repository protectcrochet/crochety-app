import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (modo === "login") await login(email, password);
      else await register(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Error. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <div className="auth__logo">Crochety</div>
        <h1>{modo === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>
        <p className="auth__sub">
          {modo === "login" ? "Accede a tu biblioteca de patrones" : "Únete a Crochety"}
        </p>
        {error && <div className="auth__error">{error}</div>}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
        <label>Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
        <button className="btn btn--play auth__submit" disabled={loading}>
          {loading ? "Cargando…" : modo === "login" ? "Entrar" : "Crear cuenta"}
        </button>
        <button type="button" className="auth__switch" onClick={() => { setModo(modo === "login" ? "register" : "login"); setError(""); }}>
          {modo === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </form>
    </div>
  );
}
