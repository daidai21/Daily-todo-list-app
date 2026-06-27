import { getApiBase } from "./config"

// Todo 表示后端返回的一条待办任务。
export type Todo = {
    id: string
    title: string
    completed: boolean
    createdAt: number
}

// TodoSummary 表示今日任务统计数据。
export type TodoSummary = {
    total: number
    completed: number
    uncompleted: number
}

// CreateTodoRequest 表示创建任务时提交给后端的数据。
export type CreateTodoRequest = {
    title: string
}

// UpdateTodoRequest 表示更新任务完成状态时提交给后端的数据。
export type UpdateTodoRequest = {
    completed: boolean
}

// apiRequest 是 React Native Android 侧复用的 HTTP 请求封装。
async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${getApiBase()}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    })

    if (!response.ok) {
        throw new Error(`请求失败：${response.status}`)
    }

    return (await response.json()) as T
}

// fetchTodos 查询今日任务列表。
export function fetchTodos(): Promise<Todo[]> {
    return apiRequest<Todo[]>("/api/todos")
}

// fetchSummary 查询今日任务统计。
export function fetchSummary(): Promise<TodoSummary> {
    return apiRequest<TodoSummary>("/api/todos/summary")
}

// createTodo 创建一条新的待办任务。
export function createTodo(data: CreateTodoRequest): Promise<Todo> {
    return apiRequest<Todo>("/api/todos", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

// updateTodo 更新指定待办任务的完成状态。
export function updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo> {
    return apiRequest<Todo>(`/api/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}
