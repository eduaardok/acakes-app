import { useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { IconButton } from "./IconButton";

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
            <IconButton
                variant="solid"
                onClick={() => navigate("/pedidos/nuevo")}
                className="fixed bottom-20 right-5 z-20 h-14 w-14 text-3xl shadow-lg"
                aria-label="Nuevo pedido"
            >
                +
            </IconButton>
        </div>
    );
}