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

function base64UrlDecode(segmento: string): string {
    const base64 = segmento.replace(/-/g, "+").replace(/_/g, "/");
    const relleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return atob(relleno);
}

// Lee el usuarioId del payload del JWT de cliente sin verificar su firma — el
// backend ya la verificó al emitirlo; acá solo se usa para UI ("esta reseña
// es mía"), nunca para autorizar una acción. No hay un GET /me del lado
// cliente hoy, así que decodificar el token ya guardado es la fuente más
// simple disponible.
export function getUsuarioClienteId(): number | null {
    const token = getClienteToken();
    if (!token) return null;

    const payloadB64 = token.split(".")[1];
    if (!payloadB64) return null;

    try {
        const payload = JSON.parse(base64UrlDecode(payloadB64)) as { usuarioId?: unknown };
        return typeof payload.usuarioId === "number" ? payload.usuarioId : null;
    } catch {
        return null;
    }
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
        const mensaje =
            (error as { error?: string; message?: string }).error ||
            (error as { message?: string }).message ||
            "Error del servidor";
        const err = new Error(mensaje) as Error & { status: number };
        err.status = res.status;
        throw err;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

export const publicApi = {
    get: <T,>(path: string, extraHeaders?: Record<string, string>) =>
        request<T>(path, { headers: extraHeaders }),
    post: <T,>(path: string, body?: unknown, extraHeaders?: Record<string, string>) =>
        request<T>(path, {
            method: "POST",
            body: body !== undefined ? JSON.stringify(body) : undefined,
            headers: extraHeaders,
        }),
    del: <T,>(path: string, extraHeaders?: Record<string, string>) =>
        request<T>(path, { method: "DELETE", headers: extraHeaders }),
};
