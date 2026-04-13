import { toLocalDateKey, addDaysLocalKey } from "../hooks/usePedidosHoy";

function parseLocalDateKey(key: string): Date {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
}

/** Lunes de la semana ISO-local que contiene `fechaKey` (lunes a domingo). */
export function mondayKeyFromAnyDay(fechaKey: string): string {
    const [y, m, d] = fechaKey.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const dow = dt.getDay();
    const delta = dow === 0 ? -6 : 1 - dow;
    dt.setDate(dt.getDate() + delta);
    return toLocalDateKey(dt);
}

export function sundayFromMonday(mondayKey: string): string {
    return addDaysLocalKey(mondayKey, 6);
}

export function monthRange(year: number, monthIndex: number): { desde: string; hasta: string } {
    const first = new Date(year, monthIndex, 1);
    const last = new Date(year, monthIndex + 1, 0);
    return { desde: toLocalDateKey(first), hasta: toLocalDateKey(last) };
}

export function yearRange(year: number): { desde: string; hasta: string } {
    return { desde: `${year}-01-01`, hasta: `${year}-12-31` };
}

export function labelRangoSemana(mondayKey: string, sundayKey: string): string {
    const a = parseLocalDateKey(mondayKey);
    const b = parseLocalDateKey(sundayKey);
    const p1 = a.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
    const p2 = b.toLocaleDateString("es-EC", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const raw = `${p1} – ${p2}`;
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function labelMesAncla(year: number, monthIndex: number): string {
    const raw = new Date(year, monthIndex, 1).toLocaleDateString("es-EC", {
        month: "long",
        year: "numeric",
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}
