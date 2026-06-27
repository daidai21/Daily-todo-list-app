// Todo 表示后端返回的一条待办任务。
export type Todo = {
    id: string
    title: string
    completed: boolean
    createdAt: number
}

// TodoSummary 表示今日任务统计信息。
export type TodoSummary = {
    total: number
    completed: number
    uncompleted: number
}

// 通用 JSON 请求封装：负责拼接 API 地址、发送请求、解析响应和处理错误。
export async function requestJSON<T>(
    apiBase: string,
    path: string,
    options: RequestInit = {},
): Promise<T> {
    // 有请求体时才补 JSON Content-Type，GET 请求保持简单请求头。
    // 是否触发 OPTIONS 主要取决于是否跨域；当前默认 apiBase 为空，配合 Vite proxy 走同源 /api。
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

// 获取今日任务列表。
export function listTodos(apiBase: string): Promise<Todo[]> {
    return requestJSON<Todo[]>(apiBase, "/api/todos")
}

// 获取今日任务统计信息。
export function getSummary(apiBase: string): Promise<TodoSummary> {
    return requestJSON<TodoSummary>(apiBase, "/api/todos/summary")
}

// 创建一条新的待办任务。
export function createTodo(apiBase: string, title: string): Promise<Todo> {
    return requestJSON<Todo>(apiBase, "/api/todos", {
        method: "POST",
        body: JSON.stringify({ title }),
    })
}

// 更新指定任务的完成状态。
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
