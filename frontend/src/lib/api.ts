const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken(): string | null {
    return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            // El backend usa este offset para interpretar "YYYY-MM-DD" según el calendario local del dispositivo.
            // new Date().getTimezoneOffset(): minutos a sumar a la hora local para obtener UTC (ej. Ecuador = 300).
            "X-TZ-Offset-Minutes": String(new Date().getTimezoneOffset()),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("No autorizado");
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

async function requestFormData<T>(
    path: string,
    method: "POST" | "PATCH",
    formData: FormData
): Promise<T> {
    const token = getToken();

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            // Sin Content-Type: el navegador lo arma con el boundary correcto para FormData.
            "X-TZ-Offset-Minutes": String(new Date().getTimezoneOffset()),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("No autorizado");
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

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
        request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
    postForm: <T>(path: string, formData: FormData) => requestFormData<T>(path, "POST", formData),
};