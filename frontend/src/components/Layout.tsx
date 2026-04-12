import { useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";

interface Props {
    children: React.ReactNode;
}

export function Layout({ children }: Props) {
    const navigate = useNavigate();

    return (
        <div className="pb-20"> {/* padding para que el contenido no quede bajo la nav */}
            {children}
            <BottomNav />
            {/* Botón flotante + siempre visible en las páginas principales */}
            <button
                onClick={() => navigate("/pedidos/nuevo")}
                className="fixed bottom-20 right-5 w-14 h-14 bg-pink-600 text-white rounded-full shadow-lg text-3xl flex items-center justify-center active:scale-90 transition-transform z-20"
                aria-label="Nuevo pedido"
            >
                +
            </button>
        </div>
    );
}