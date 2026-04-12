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

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/pedidos/nuevo"
                    element={
                        <PrivateRoute>
                            <NuevoPedido />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/pedidos/:id"
                    element={
                        <PrivateRoute>
                            <DetallePedido />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/clientes"
                    element={<PrivateRoute><Clientes /></PrivateRoute>}
                />
                <Route
                    path="/clientes/:id"
                    element={<PrivateRoute><DetalleCliente /></PrivateRoute>}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);