const fallbackApiBase = "http://localhost:8080"

export function getInitialApiBase() {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get("apiBase")
    const fromViteEnv = import.meta.env.VITE_API_BASE_URL

    return normalizeApiBase(fromQuery || fromViteEnv || fallbackApiBase)
}

export function normalizeApiBase(value) {
    return String(value || fallbackApiBase).trim().replace(/\/$/, "")
}
