import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NuevoPedido from "./pages/NuevoPedido";
import DetallePedido from "./pages/DetallePedido";
import Clientes from "./pages/Clientes";
import NuevoCliente from "./pages/NuevoCliente";
import DetalleCliente from "./pages/DetalleCliente";
import Ingresos from "./pages/Ingresos";
import Cuenta from "./pages/Cuenta";
import Calendario from "./pages/Calendario";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import Catalogo from "./public/pages/Catalogo";
import ProductoDetalle from "./public/pages/ProductoDetalle";
import LoginCliente from "./public/pages/LoginCliente";
import RegistroCliente from "./public/pages/RegistroCliente";
import MisFavoritos from "./public/pages/MisFavoritos";
import Landing from "./public/pages/Landing";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

// Rutas con bottom nav
function PrivateLayout({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    return <Layout>{children}</Layout>;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                {/* Admin — login */}
                <Route path="/login" element={<Login />} />

                {/* Admin — con bottom nav */}
                <Route path="/panel" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
                <Route path="/panel/clientes" element={<PrivateLayout><Clientes /></PrivateLayout>} />
                <Route path="/panel/calendario" element={<PrivateLayout><Calendario /></PrivateLayout>} />
                <Route path="/panel/ingresos" element={<PrivateLayout><Ingresos /></PrivateLayout>} />
                <Route path="/panel/cuenta" element={<PrivateLayout><Cuenta /></PrivateLayout>} />

                {/* Admin — sin bottom nav */}
                <Route path="/panel/pedidos/nuevo" element={<PrivateRoute><NuevoPedido /></PrivateRoute>} />
                <Route path="/panel/pedidos/:id" element={<PrivateRoute><DetallePedido /></PrivateRoute>} />
                <Route path="/panel/clientes/nuevo" element={<PrivateRoute><NuevoCliente /></PrivateRoute>} />
                <Route path="/panel/clientes/:id" element={<PrivateRoute><DetalleCliente /></PrivateRoute>} />

                {/* UI pública (catálogo/clientes finales) — sin auth de admin */}
                <Route path="/" element={<Landing />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/producto/:id" element={<ProductoDetalle />} />
                <Route path="/login-cliente" element={<LoginCliente />} />
                <Route path="/registro-cliente" element={<RegistroCliente />} />
                <Route path="/mis-favoritos" element={<MisFavoritos />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);