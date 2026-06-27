import { useCallback, useEffect, useMemo, useState } from "react"
import {
    createTodo,
    getInitialApiBase,
    getSummary,
    listTodos,
    saveApiBase,
    updateTodoCompleted,
} from "./api.js"
import { notifyNative } from "./nativeBridge.js"

export function App() {
    const [apiBase, setApiBase] = useState(getInitialApiBase)
    const [apiBaseDraft, setApiBaseDraft] = useState(apiBase)
    const [todos, setTodos] = useState([])
    const [summary, setSummary] = useState({ total: 0, completed: 0, uncompleted: 0 })
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
            setSummary(todoSummary || { total: 0, completed: 0, uncompleted: 0 })
            setStatus("任务数据已同步")
        } catch (error) {
            setStatus(`加载失败：${error.message}`)
        } finally {
            setLoading(false)
        }
    }, [apiBase])

    useEffect(() => {
        loadTodos()
    }, [loadTodos])

    const uncompletedTodos = useMemo(
        () => todos.filter((todo) => !todo.completed),
        [todos],
    )

    async function handleCreateTodo(event) {
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
            setStatus(`添加失败：${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    async function handleToggleTodo(todo, completed) {
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
            setStatus(`更新失败：${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    function handleSaveApiBase() {
        const nextApiBase = saveApiBase(apiBaseDraft)
        setApiBase(nextApiBase)
        setApiBaseDraft(nextApiBase)
        setStatus("Server 地址已保存")
    }

    function handleRemind() {
        const message = uncompletedTodos.length > 0
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

            <ServerConfig
                value={apiBaseDraft}
                loading={loading}
                onChange={setApiBaseDraft}
                onSave={handleSaveApiBase}
            />

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

            <p className="status-text" role="status">{status}</p>
        </main>
    )
}

function HeroCard({ loading, onRefresh }) {
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

function ServerConfig({ value, loading, onChange, onSave }) {
    return (
        <section className="server-card">
            <label htmlFor="apiBaseInput">Server 地址</label>
            <div className="server-row">
                <input
                    id="apiBaseInput"
                    type="url"
                    value={value}
                    autoComplete="off"
                    onChange={(event) => onChange(event.target.value)}
                />
                <button type="button" disabled={loading} onClick={onSave}>保存</button>
            </div>
        </section>
    )
}

function SummaryGrid({ summary }) {
    return (
        <section className="summary-grid" aria-label="今日任务统计">
            <SummaryItem count={summary.total} label="总任务" />
            <SummaryItem count={summary.completed} label="已完成" className="done" />
            <SummaryItem count={summary.uncompleted} label="未完成" className="pending" />
        </section>
    )
}

function SummaryItem({ count, label, className = "" }) {
    return (
        <article className={`summary-item ${className}`}>
            <span>{count}</span>
            <p>{label}</p>
        </article>
    )
}

function AddTodoForm({ title, loading, onTitleChange, onSubmit }) {
    return (
        <form className="add-form" onSubmit={onSubmit}>
            <input
                type="text"
                value={title}
                maxLength="60"
                placeholder="添加一个今日任务"
                autoComplete="off"
                required
                onChange={(event) => onTitleChange(event.target.value)}
            />
            <button type="submit" disabled={loading}>添加</button>
        </form>
    )
}

function TodoSection({ todos, loading, onToggleTodo, onRemind }) {
    return (
        <section className="todo-section">
            <div className="section-title">
                <h2>任务列表</h2>
                <button className="text-button" type="button" onClick={onRemind}>提醒我</button>
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

function TodoItem({ todo, disabled, onToggleTodo }) {
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

function formatTime(timestamp) {
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
