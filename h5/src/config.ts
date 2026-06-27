const fallbackApiBase = ""

export function getInitialApiBase(): string {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get("apiBase")

    return normalizeApiBase(fromQuery || fallbackApiBase)
}

export function normalizeApiBase(value: string | null | undefined): string {
    return String(value || fallbackApiBase)
        .trim()
        .replace(/\/$/, "")
}
