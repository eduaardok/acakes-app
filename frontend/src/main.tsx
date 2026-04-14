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
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";

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
                {/* Pública */}
                <Route path="/login" element={<Login />} />

                {/* Con bottom nav */}
                <Route path="/" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
                <Route path="/clientes" element={<PrivateLayout><Clientes /></PrivateLayout>} />
                <Route path="/ingresos" element={<PrivateLayout><Ingresos /></PrivateLayout>} />
                <Route path="/cuenta" element={<PrivateLayout><Cuenta /></PrivateLayout>} />

                {/* Sin bottom nav */}
                <Route path="/pedidos/nuevo" element={<PrivateRoute><NuevoPedido /></PrivateRoute>} />
                <Route path="/pedidos/:id" element={<PrivateRoute><DetallePedido /></PrivateRoute>} />
                <Route path="/clientes/nuevo" element={<PrivateRoute><NuevoCliente /></PrivateRoute>} />
                <Route path="/clientes/:id" element={<PrivateRoute><DetalleCliente /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);