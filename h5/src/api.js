const defaultApiBase = "http://localhost:8080"
const apiBaseStorageKey = "dailyTodoApiBase"

export function getInitialApiBase() {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get("apiBase")
    const fromStorage = window.localStorage.getItem(apiBaseStorageKey)
    return normalizeApiBase(fromQuery || fromStorage || defaultApiBase)
}

export function saveApiBase(apiBase) {
    const normalized = normalizeApiBase(apiBase)
    window.localStorage.setItem(apiBaseStorageKey, normalized)
    return normalized
}

export function normalizeApiBase(value) {
    return String(value || defaultApiBase).trim().replace(/\/$/, "")
}

export async function requestJSON(apiBase, path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null
    if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}`)
    }
    return data
}

export function listTodos(apiBase) {
    return requestJSON(apiBase, "/api/todos")
}

export function getSummary(apiBase) {
    return requestJSON(apiBase, "/api/todos/summary")
}

export function createTodo(apiBase, title) {
    return requestJSON(apiBase, "/api/todos", {
        method: "POST",
        body: JSON.stringify({ title }),
    })
}

export function updateTodoCompleted(apiBase, id, completed) {
    return requestJSON(apiBase, `/api/todos/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
    })
}
