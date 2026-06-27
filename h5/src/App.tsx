import type { FormEvent } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
    createTodo,
    getSummary,
    listTodos,
    type Todo,
    type TodoSummary,
    updateTodoCompleted,
} from "./api"
import { getInitialApiBase } from "./config"
import { notifyNative } from "./nativeBridge"

const emptySummary: TodoSummary = { total: 0, completed: 0, uncompleted: 0 }

export function App() {
    const [apiBase] = useState(getInitialApiBase)
    const [todos, setTodos] = useState<Todo[]>([])
    const [summary, setSummary] = useState<TodoSummary>(emptySummary)
    const [title, setTitle] = useState("")
    const [status, setStatus] = useState("准备同步任务数据")
    const [loading, setLoading] = useState(false)

    const loadTodos = useCallback(async () => {
        setLoading(true)
        try {
            const [todoList, todoSummary] = await Promise.all([
                listTodos(apiBase),
                getSummary(apiBase),
            ])
            setTodos(Array.isArray(todoList) ? todoList : [])
            setSummary(todoSummary || emptySummary)
            setStatus("任务数据已同步")
        } catch (error) {
            setStatus(`加载失败：${getErrorMessage(error)}`)
        } finally {
            setLoading(false)
        }
    }, [apiBase])

    useEffect(() => {
        loadTodos()
    }, [loadTodos])

    const uncompletedTodos = useMemo(() => todos.filter((todo) => !todo.completed), [todos])

    async function handleCreateTodo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const nextTitle = title.trim()
        if (!nextTitle) {
            setStatus("请输入任务标题")
            return
        }

        setLoading(true)
        try {
            await createTodo(apiBase, nextTitle)
            setTitle("")
            setStatus("任务已添加")
            await loadTodos()
        } catch (error) {
            setStatus(`添加失败：${getErrorMessage(error)}`)
        } finally {
            setLoading(false)
        }
    }

    async function handleToggleTodo(todo: Todo, completed: boolean) {
        setLoading(true)
        try {
            await updateTodoCompleted(apiBase, todo.id, completed)
            notifyNative(completed ? "completeTodo" : "reopenTodo", {
                id: todo.id,
                title: todo.title,
                completed,
            })
            setStatus(completed ? "任务已完成" : "任务已恢复为未完成")
            await loadTodos()
        } catch (error) {
            setStatus(`更新失败：${getErrorMessage(error)}`)
        } finally {
            setLoading(false)
        }
    }

    function handleRemind() {
        const message =
            uncompletedTodos.length > 0
                ? `你还有 ${uncompletedTodos.length} 个今日任务未完成`
                : "今天的任务都完成啦"

        notifyNative("remind", {
            message,
            uncompletedCount: uncompletedTodos.length,
        })
        setStatus(message)
    }

    return (
        <main className="app-shell">
            <HeroCard loading={loading} onRefresh={loadTodos} />

            <SummaryGrid summary={summary} />

            <AddTodoForm
                title={title}
                loading={loading}
                onTitleChange={setTitle}
                onSubmit={handleCreateTodo}
            />

            <TodoSection
                todos={todos}
                loading={loading}
                onToggleTodo={handleToggleTodo}
                onRemind={handleRemind}
            />

            <p className="status-text" role="status">
                {status}
            </p>
        </main>
    )
}

type HeroCardProps = {
    loading: boolean
    onRefresh: () => void
}

function HeroCard({ loading, onRefresh }: HeroCardProps) {
    return (
        <section className="hero-card">
            <div>
                <p className="eyebrow">React H5</p>
                <h1>今日待办</h1>
                <p className="subtitle">React 任务管理页，数据来自 Go Server。</p>
            </div>
            <button className="ghost-button" type="button" disabled={loading} onClick={onRefresh}>
                刷新
            </button>
        </section>
    )
}

type SummaryGridProps = {
    summary: TodoSummary
}

function SummaryGrid({ summary }: SummaryGridProps) {
    return (
        <section className="summary-grid" aria-label="今日任务统计">
            <SummaryItem count={summary.total} label="总任务" />
            <SummaryItem count={summary.completed} label="已完成" className="done" />
            <SummaryItem count={summary.uncompleted} label="未完成" className="pending" />
        </section>
    )
}

type SummaryItemProps = {
    count: number
    label: string
    className?: string
}

function SummaryItem({ count, label, className = "" }: SummaryItemProps) {
    return (
        <article className={`summary-item ${className}`}>
            <span>{count}</span>
            <p>{label}</p>
        </article>
    )
}

type AddTodoFormProps = {
    title: string
    loading: boolean
    onTitleChange: (title: string) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function AddTodoForm({ title, loading, onTitleChange, onSubmit }: AddTodoFormProps) {
    return (
        <form className="add-form" onSubmit={onSubmit}>
            <input
                type="text"
                value={title}
                maxLength={60}
                placeholder="添加一个今日任务"
                autoComplete="off"
                required
                onChange={(event) => onTitleChange(event.target.value)}
            />
            <button type="submit" disabled={loading}>
                添加
            </button>
        </form>
    )
}

type TodoSectionProps = {
    todos: Todo[]
    loading: boolean
    onToggleTodo: (todo: Todo, completed: boolean) => void
    onRemind: () => void
}

function TodoSection({ todos, loading, onToggleTodo, onRemind }: TodoSectionProps) {
    return (
        <section className="todo-section">
            <div className="section-title">
                <h2>任务列表</h2>
                <button className="text-button" type="button" onClick={onRemind}>
                    提醒我
                </button>
            </div>

            {todos.length === 0 ? (
                <div className="empty-state is-visible">
                    <p>暂无任务</p>
                    <span>添加一个任务开始今天的计划吧。</span>
                </div>
            ) : (
                <ul className="todo-list">
                    {todos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            disabled={loading}
                            onToggleTodo={onToggleTodo}
                        />
                    ))}
                </ul>
            )}
        </section>
    )
}

type TodoItemProps = {
    todo: Todo
    disabled: boolean
    onToggleTodo: (todo: Todo, completed: boolean) => void
}

function TodoItem({ todo, disabled, onToggleTodo }: TodoItemProps) {
    return (
        <li className={`todo-item ${todo.completed ? "is-completed" : ""}`}>
            <label className="todo-check">
                <input
                    type="checkbox"
                    checked={todo.completed}
                    disabled={disabled}
                    onChange={(event) => onToggleTodo(todo, event.target.checked)}
                />
                <span className="fake-checkbox" />
            </label>
            <div className="todo-content">
                <p className="todo-title">{todo.title}</p>
                <span className="todo-time">{formatTime(todo.createdAt)}</span>
            </div>
        </li>
    )
}

function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
        return "创建时间未知"
    }

    return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return "未知错误"
}
