import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NuevoPedido from "./pages/NuevoPedido";
import DetallePedido from "./pages/DetallePedido";
import Clientes from "./pages/Clientes";
import DetalleCliente from "./pages/DetalleCliente";
import Ingresos from "./pages/Ingresos";
import { Layout } from "./components/Layout";

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
            <Routes>
                {/* Pública */}
                <Route path="/login" element={<Login />} />

                {/* Con bottom nav */}
                <Route path="/" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
                <Route path="/clientes" element={<PrivateLayout><Clientes /></PrivateLayout>} />
                <Route path="/ingresos" element={<PrivateLayout><Ingresos /></PrivateLayout>} />

                {/* Sin bottom nav */}
                <Route path="/pedidos/nuevo" element={<PrivateRoute><NuevoPedido /></PrivateRoute>} />
                <Route path="/pedidos/:id" element={<PrivateRoute><DetallePedido /></PrivateRoute>} />
                <Route path="/clientes/:id" element={<PrivateRoute><DetalleCliente /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);