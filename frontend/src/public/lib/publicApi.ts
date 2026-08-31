// Cliente HTTP para la capa pública (/api/public/...). Separado de lib/api.ts
// (admin): usa su propio token ("clienteToken") y no redirige a /login (admin)
// en un 401 — el catálogo es público y las rutas protegidas manejan el error
// donde corresponda.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PUBLIC_BASE = "/api/public";

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

    const res = await fetch(`${API_URL}${PUBLIC_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

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
