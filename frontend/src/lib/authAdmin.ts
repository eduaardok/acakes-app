// Lectura del rol del Usuario admin logueado, decodificando el JWT ya
// guardado — mismo patrón que getUsuarioClienteId() en public/lib/publicApi.
//
// IMPORTANTE: esto es UX, no seguridad. La firma del token no se verifica acá
// y cualquiera puede editar su localStorage para "verse" como SYSTEM_ADMIN.
// La seguridad real la da el backend con requireRole(SYSTEM_ADMIN) sobre
// /admin/*: sin el rol en el token firmado, la API responde 403 aunque la UI
// muestre la sección. Acá solo decidimos qué mostrar para no ofrecer botones
// que van a fallar.

export const ROLES_USUARIO = ["ADMIN", "SYSTEM_ADMIN"] as const;
export type RolUsuario = (typeof ROLES_USUARIO)[number];

export const ROL_LABEL: Record<RolUsuario, string> = {
    ADMIN: "Administrador",
    SYSTEM_ADMIN: "Admin del sistema",
};

function base64UrlDecode(segmento: string): string {
    const base64 = segmento.replace(/-/g, "+").replace(/_/g, "/");
    const relleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return atob(relleno);
}

/** Rol del admin logueado según su JWT, o null si no hay token o es ilegible. */
export function getRolAdmin(): RolUsuario | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payloadB64 = token.split(".")[1];
    if (!payloadB64) return null;

    try {
        const payload = JSON.parse(base64UrlDecode(payloadB64)) as { role?: unknown };
        const role = payload.role;
        return typeof role === "string" && (ROLES_USUARIO as readonly string[]).includes(role)
            ? (role as RolUsuario)
            : null;
    } catch {
        return null;
    }
}

export function esSystemAdmin(): boolean {
    return getRolAdmin() === "SYSTEM_ADMIN";
}
