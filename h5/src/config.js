const fallbackApiBase = "http://localhost:8080"
const apiBaseStorageKey = "dailyTodoApiBase"

export function getInitialApiBase() {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get("apiBase")
    const fromStorage = window.localStorage.getItem(apiBaseStorageKey)
    const fromViteEnv = import.meta.env.VITE_API_BASE_URL

    return normalizeApiBase(fromQuery || fromStorage || fromViteEnv || fallbackApiBase)
}

export function saveApiBase(apiBase) {
    const normalized = normalizeApiBase(apiBase)
    window.localStorage.setItem(apiBaseStorageKey, normalized)
    return normalized
}

export function normalizeApiBase(value) {
    return String(value || fallbackApiBase).trim().replace(/\/$/, "")
}
