/** "2026-07-10" -> "10/07/2026" */
export function formatDateBR(iso: string): string {
    const [y, m, d] = String(iso || "").split("-");
    if (!y || !m || !d) return String(iso || "");
    return `${d}/${m}/${y}`;
}

/** Data de hoje no formato ISO "YYYY-MM-DD" (fuso local). */
export function todayISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

/** Normaliza texto para busca: minúsculas e sem acentos. */
export function normalizeSearch(s: string): string {
    return String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}

/**
 * "aula1" -> "1ª Aula", "aula2" -> "2ª Aula".
 * Mantém "manha"/"tarde" para chamadas antigas já salvas no banco.
 */
export function shiftLabel(shift: string): string {
    const s = String(shift || "").toLowerCase();
    if (s === "aula1") return "1ª Aula";
    if (s === "aula2") return "2ª Aula";
    if (s === "manha") return "Manhã";
    if (s === "tarde") return "Tarde";
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
