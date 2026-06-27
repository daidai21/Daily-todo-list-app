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

// 应用顶层组件，负责组织页面状态、接口调用和子组件渲染。
export function App() {
    // apiBase 初始化一次即可：默认是空字符串，表示请求同源 /api；也支持通过 URL Query 临时覆盖。
    const [apiBase] = useState(getInitialApiBase)

    // 页面核心状态：任务列表、统计数据、输入框内容、状态提示和全局加载态。
    const [todos, setTodos] = useState<Todo[]>([])
    const [summary, setSummary] = useState<TodoSummary>(emptySummary)
    const [title, setTitle] = useState("")
    const [status, setStatus] = useState("准备同步任务数据")
    const [loading, setLoading] = useState(false)

    const loadTodos = useCallback(async () => {
        setLoading(true)
        try {
            // 列表和统计互不依赖，可以并发请求，减少首屏等待时间。
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
        // 组件首次挂载后自动拉取任务数据。
        loadTodos()
    }, [loadTodos])

    // 未完成任务是从 todos 派生出来的数据，用 useMemo 避免每次渲染都重复过滤。
    const uncompletedTodos = useMemo(() => todos.filter((todo) => !todo.completed), [todos])

    // 处理新增任务表单提交：校验标题、调用创建接口，并刷新列表和统计。
    async function handleCreateTodo(event: FormEvent<HTMLFormElement>) {
        // 阻止浏览器默认表单提交刷新页面，改为 React 内部异步提交。
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

            // 创建成功后重新拉取列表和统计，保证页面状态与 Server 数据一致。
            await loadTodos()
        } catch (error) {
            setStatus(`添加失败：${getErrorMessage(error)}`)
        } finally {
            setLoading(false)
        }
    }

    // 处理任务完成状态切换：更新后端数据、通知 Native，并重新同步页面数据。
    async function handleToggleTodo(todo: Todo, completed: boolean) {
        setLoading(true)
        try {
            await updateTodoCompleted(apiBase, todo.id, completed)

            // 通知 Native 宿主任务状态变化；普通浏览器环境下会 fallback 到 console.info。
            notifyNative(completed ? "completeTodo" : "reopenTodo", {
                id: todo.id,
                title: todo.title,
                completed,
            })
            setStatus(completed ? "任务已完成" : "任务已恢复为未完成")

            // 更新成功后重新同步，避免本地乐观更新和后端实际结果不一致。
            await loadTodos()
        } catch (error) {
            setStatus(`更新失败：${getErrorMessage(error)}`)
        } finally {
            setLoading(false)
        }
    }

    // 处理「提醒我」按钮点击：根据未完成任务数量生成提醒，并发送给 Native 宿主。
    function handleRemind() {
        // 根据当前未完成任务数生成提醒文案，并通过 Native Bridge 预留入口发给宿主。
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

// HeroCard 组件的 Props：loading 控制按钮禁用态，onRefresh 用于手动刷新任务数据。
type HeroCardProps = {
    loading: boolean
    onRefresh: () => void
}

// 顶部标题卡片组件，展示页面标题和刷新按钮。
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

// SummaryGrid 组件的 Props：接收今日任务统计数据。
type SummaryGridProps = {
    summary: TodoSummary
}

// 任务统计网格组件，展示总任务、已完成和未完成数量。
function SummaryGrid({ summary }: SummaryGridProps) {
    return (
        <section className="summary-grid" aria-label="今日任务统计">
            <SummaryItem count={summary.total} label="总任务" />
            <SummaryItem count={summary.completed} label="已完成" className="done" />
            <SummaryItem count={summary.uncompleted} label="未完成" className="pending" />
        </section>
    )
}

// SummaryItem 组件的 Props：count 是数量，label 是说明，className 用于附加样式。
type SummaryItemProps = {
    count: number
    label: string
    className?: string
}

// 单个统计项组件，用于复用展示不同类型的任务数量。
function SummaryItem({ count, label, className = "" }: SummaryItemProps) {
    return (
        <article className={`summary-item ${className}`}>
            <span>{count}</span>
            <p>{label}</p>
        </article>
    )
}

// AddTodoForm 组件的 Props：由父组件传入输入框值、加载态和事件回调。
type AddTodoFormProps = {
    title: string
    loading: boolean
    onTitleChange: (title: string) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

// 新增任务表单组件，使用受控输入框把用户输入同步回父组件状态。
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

// TodoSection 组件的 Props：接收任务列表、加载态、切换任务状态和提醒回调。
type TodoSectionProps = {
    todos: Todo[]
    loading: boolean
    onToggleTodo: (todo: Todo, completed: boolean) => void
    onRemind: () => void
}

// 任务列表区域组件，负责在空状态和任务列表之间切换展示。
function TodoSection({ todos, loading, onToggleTodo, onRemind }: TodoSectionProps) {
    return (
        <section className="todo-section">
            <div className="section-title">
                <h2>任务列表</h2>
                <button className="text-button" type="button" onClick={onRemind}>
                    提醒我
                </button>
            </div>

            {/* 任务为空时展示空状态；有任务时渲染列表。 */}
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

// TodoItem 组件的 Props：todo 是单条任务数据，disabled 控制复选框禁用态。
type TodoItemProps = {
    todo: Todo
    disabled: boolean
    onToggleTodo: (todo: Todo, completed: boolean) => void
}

// 单条任务组件，展示任务标题、创建时间和完成状态复选框。
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

// 将后端返回的毫秒时间戳格式化为适合中文用户阅读的日期时间。
function formatTime(timestamp: number): string {
    const date = new Date(timestamp)

    // 后端时间异常时给用户一个可读兜底，避免页面展示 Invalid Date。
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

// 从 unknown 错误值中提取可展示的错误信息。
function getErrorMessage(error: unknown): string {
    // catch 到的值在 TypeScript 中是 unknown，需要先缩小类型再读取 message。
    if (error instanceof Error) {
        return error.message
    }
    return "未知错误"
}
