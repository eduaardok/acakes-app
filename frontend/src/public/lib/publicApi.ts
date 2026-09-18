// Cliente HTTP para la capa pública (/api/public/...). Separado de lib/api.ts
// (admin): usa su propio token ("clienteToken") y no redirige a /login (admin)
// en un 401 — el catálogo es público y las rutas protegidas manejan el error
// donde corresponda.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PUBLIC_BASE = "/api/public";

// Cold-start de Render puede tardar varios segundos en responder al primer
// request — sin esto, un fetch colgado deja la UI cargando indefinidamente.
const REQUEST_TIMEOUT_MS = 15000;

const CLIENTE_TOKEN_KEY = "clienteToken";

export function getClienteToken(): string | null {
    return localStorage.getItem(CLIENTE_TOKEN_KEY);
}

export function setClienteToken(token: string): void {
    localStorage.setItem(CLIENTE_TOKEN_KEY, token);
}

export function clearClienteToken(): void {
    localStorage.removeItem(CLIENTE_TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getClienteToken();

    // AbortController propio para el timeout, combinado con un signal del
    // caller si trae uno (ningún caller lo usa hoy, pero no lo rompe si se
    // agrega después).
    const controller = new AbortController();
    const externalSignal = options.signal;
    if (externalSignal) {
        if (externalSignal.aborted) controller.abort();
        else externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    let timedOut = false;
    const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
        res = await fetch(`${API_URL}${PUBLIC_BASE}${path}`, {
            ...options,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });
    } catch (err) {
        // Solo el abort disparado por nuestro propio timeout se traduce a
        // este mensaje — un abort externo (signal del caller) se relanza tal cual.
        if (timedOut && err instanceof DOMException && err.name === "AbortError") {
            throw new Error("La conexión tardó demasiado. Intenta de nuevo.");
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(
            (error as { error?: string; message?: string }).error ||
                (error as { message?: string }).message ||
                "Error del servidor"
        );
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

export const publicApi = {
    get: <T,>(path: string) => request<T>(path),
    post: <T,>(path: string, body?: unknown, extraHeaders?: Record<string, string>) =>
        request<T>(path, {
            method: "POST",
            body: body !== undefined ? JSON.stringify(body) : undefined,
            headers: extraHeaders,
        }),
    del: <T,>(path: string, extraHeaders?: Record<string, string>) =>
        request<T>(path, { method: "DELETE", headers: extraHeaders }),
};
