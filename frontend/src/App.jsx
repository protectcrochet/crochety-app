import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import TopBar from "./components/TopBar";
import Home from "./pages/Home";
import PatronDetail from "./pages/PatronDetail";
import Visor from "./pages/Visor";
import Auth from "./pages/Auth";

export default function App() {
  return (
    <AuthProvider>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patron/:id" element={<PatronDetail />} />
        <Route path="/visor/:id" element={<Visor />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </AuthProvider>
  );
}
