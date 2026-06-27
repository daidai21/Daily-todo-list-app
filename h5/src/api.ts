export type Todo = {
    id: string
    title: string
    completed: boolean
    createdAt: number
}

export type TodoSummary = {
    total: number
    completed: number
    uncompleted: number
}

export async function requestJSON<T>(
    apiBase: string,
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
    }

    const response = await fetch(`${apiBase}${path}`, {
        ...options,
        headers,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null
    if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}`)
    }
    return data as T
}

export function listTodos(apiBase: string): Promise<Todo[]> {
    return requestJSON<Todo[]>(apiBase, "/api/todos")
}

export function getSummary(apiBase: string): Promise<TodoSummary> {
    return requestJSON<TodoSummary>(apiBase, "/api/todos/summary")
}

export function createTodo(apiBase: string, title: string): Promise<Todo> {
    return requestJSON<Todo>(apiBase, "/api/todos", {
        method: "POST",
        body: JSON.stringify({ title }),
    })
}

export function updateTodoCompleted(
    apiBase: string,
    id: string,
    completed: boolean,
): Promise<Todo> {
    return requestJSON<Todo>(apiBase, `/api/todos/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
    })
}
