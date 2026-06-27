import { useCallback, useEffect, useMemo, useState } from '@lynx-js/react';

import './App.css';
import {
    createTodo,
    getSummary,
    listTodos,
    type Todo,
    type TodoSummary,
    updateTodoCompleted,
} from './api.js';
import { getInitialApiBase } from './config.js';
import { notifyNative } from './nativeBridge.js';

// 空统计对象，用于接口返回前或异常时提供稳定的默认展示。
const emptySummary: TodoSummary = { total: 0, completed: 0, uncompleted: 0 };

// Lynx input 事件中用到的最小字段集合，兼容 value 直接挂在事件或 detail 上的场景。
type LynxInputEvent = {
    value?: string;
    detail?: {
        value?: string;
    };
};

// Lynx 版今日待办主页面，负责组织状态、接口请求、Native Bridge 和 UI 渲染。
export function App() {
    const [apiBase] = useState(getInitialApiBase);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [summary, setSummary] = useState<TodoSummary>(emptySummary);
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('准备同步任务数据');
    const [loading, setLoading] = useState(false);

    const loadTodos = useCallback(async () => {
        'background only';
        setLoading(true);
        try {
            const [todoList, todoSummary] = await Promise.all([
                listTodos(apiBase),
                getSummary(apiBase),
            ]);
            setTodos(Array.isArray(todoList) ? todoList : []);
            setSummary(todoSummary || emptySummary);
            setStatus('任务数据已同步');
        } catch (error) {
            setStatus(`加载失败：${getErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    }, [apiBase]);

    useEffect(() => {
        loadTodos();
    }, [loadTodos]);

    const uncompletedTodos = useMemo(
        () => todos.filter((todo) => !todo.completed),
        [todos],
    );

    function handleTitleInput(event: LynxInputEvent) {
        'background only';
        setTitle(getInputValue(event));
    }

    async function handleCreateTodo() {
        'background only';
        const nextTitle = title.trim();
        if (!nextTitle) {
            setStatus('请输入任务标题');
            return;
        }

        setLoading(true);
        try {
            await createTodo(apiBase, nextTitle);
            setTitle('');
            setStatus('任务已添加');
            await loadTodos();
        } catch (error) {
            setStatus(`添加失败：${getErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleTodo(todo: Todo) {
        'background only';
        const completed = !todo.completed;
        setLoading(true);
        try {
            await updateTodoCompleted(apiBase, todo.id, completed);
            notifyNative(completed ? 'completeTodo' : 'reopenTodo', {
                id: todo.id,
                title: todo.title,
                completed,
            });
            setStatus(completed ? '任务已完成' : '任务已恢复为未完成');
            await loadTodos();
        } catch (error) {
            setStatus(`更新失败：${getErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    }

    function handleRemind() {
        'background only';
        const message =
            uncompletedTodos.length > 0
                ? `你还有 ${uncompletedTodos.length} 个今日任务未完成`
                : '今天的任务都完成啦';

        notifyNative('remind', {
            message,
            uncompletedCount: uncompletedTodos.length,
        });
        setStatus(message);
    }

    return (
        <scroll-view scroll-y className="app-shell">
            <HeroCard loading={loading} onRefresh={loadTodos} />

            <SummaryGrid summary={summary} />

            <AddTodoForm
                title={title}
                loading={loading}
                onTitleInput={handleTitleInput}
                onSubmit={handleCreateTodo}
            />

            <TodoSection
                todos={todos}
                loading={loading}
                onToggleTodo={handleToggleTodo}
                onRemind={handleRemind}
            />

            <text className="status-text">{status}</text>
        </scroll-view>
    );
}

// HeroCard 组件的 Props：loading 控制刷新按钮禁用态，onRefresh 用于手动刷新任务。
type HeroCardProps = {
    loading: boolean;
    onRefresh: () => void;
};

// 顶部标题卡片，展示 Lynx 页面说明和刷新入口。
function HeroCard({ loading, onRefresh }: HeroCardProps) {
    return (
        <view className="hero-card">
            <view className="hero-copy">
                <text className="eyebrow">ReactLynx</text>
                <text className="title">今日待办</text>
                <text className="subtitle">
                    Lynx 任务管理页，数据来自 Go Server。
                </text>
            </view>
            <view
                className={
                    loading ? 'ghost-button is-disabled' : 'ghost-button'
                }
                bindtap={onRefresh}
            >
                <text className="ghost-button-text">刷新</text>
            </view>
        </view>
    );
}

// SummaryGrid 组件的 Props：接收今日任务统计数据。
type SummaryGridProps = {
    summary: TodoSummary;
};

// 任务统计网格，展示总任务、已完成和未完成数量。
function SummaryGrid({ summary }: SummaryGridProps) {
    return (
        <view className="summary-grid">
            <SummaryItem count={summary.total} label="总任务" />
            <SummaryItem
                count={summary.completed}
                label="已完成"
                className="done"
            />
            <SummaryItem
                count={summary.uncompleted}
                label="未完成"
                className="pending"
            />
        </view>
    );
}

// SummaryItem 组件的 Props：count 是数量，label 是说明，className 用于追加样式。
type SummaryItemProps = {
    count: number;
    label: string;
    className?: string;
};

// 单个统计卡片，便于复用不同任务状态的数量展示。
function SummaryItem({ count, label, className = '' }: SummaryItemProps) {
    return (
        <view className={`summary-item ${className}`}>
            <text className="summary-count">{count}</text>
            <text className="summary-label">{label}</text>
        </view>
    );
}

// AddTodoForm 组件的 Props：由父组件提供输入值、加载态和事件回调。
type AddTodoFormProps = {
    title: string;
    loading: boolean;
    onTitleInput: (event: LynxInputEvent) => void;
    onSubmit: () => void;
};

// 新增任务表单；Lynx 使用 bindinput / bindconfirm / bindtap 处理输入和点击。
function AddTodoForm({
    title,
    loading,
    onTitleInput,
    onSubmit,
}: AddTodoFormProps) {
    return (
        <view className="add-form">
            <input
                className="todo-input"
                type="text"
                maxlength={60}
                placeholder="添加一个今日任务"
                bindinput={onTitleInput}
                bindconfirm={onSubmit}
            />
            <view
                className={
                    loading || !title.trim()
                        ? 'primary-button is-disabled'
                        : 'primary-button'
                }
                bindtap={onSubmit}
            >
                <text className="primary-button-text">添加</text>
            </view>
        </view>
    );
}

// TodoSection 组件的 Props：接收任务列表、加载态、切换状态和提醒回调。
type TodoSectionProps = {
    todos: Todo[];
    loading: boolean;
    onToggleTodo: (todo: Todo) => void;
    onRemind: () => void;
};

// 任务列表区域，负责展示空状态或任务列表。
function TodoSection({
    todos,
    loading,
    onToggleTodo,
    onRemind,
}: TodoSectionProps) {
    return (
        <view className="todo-section">
            <view className="section-title">
                <text className="section-heading">任务列表</text>
                <view className="text-button" bindtap={onRemind}>
                    <text className="text-button-text">提醒我</text>
                </view>
            </view>

            {todos.length === 0 ? (
                <view className="empty-state">
                    <text className="empty-title">暂无任务</text>
                    <text className="empty-desc">
                        添加一个任务开始今天的计划吧。
                    </text>
                </view>
            ) : (
                <view className="todo-list">
                    {todos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            disabled={loading}
                            onToggleTodo={onToggleTodo}
                        />
                    ))}
                </view>
            )}
        </view>
    );
}

// TodoItem 组件的 Props：todo 是单条任务数据，disabled 控制点击可用性。
type TodoItemProps = {
    todo: Todo;
    disabled: boolean;
    onToggleTodo: (todo: Todo) => void;
};

// 单条任务项，展示完成状态、标题和创建时间。
function TodoItem({ todo, disabled, onToggleTodo }: TodoItemProps) {
    return (
        <view
            className={todo.completed ? 'todo-item is-completed' : 'todo-item'}
            bindtap={() => {
                'background only';
                if (!disabled) {
                    onToggleTodo(todo);
                }
            }}
        >
            <view
                className={
                    todo.completed
                        ? 'fake-checkbox is-checked'
                        : 'fake-checkbox'
                }
            >
                {todo.completed ? <text className="check-mark">✓</text> : null}
            </view>
            <view className="todo-content">
                <text className="todo-title">{todo.title}</text>
                <text className="todo-time">{formatTime(todo.createdAt)}</text>
            </view>
        </view>
    );
}

// 从 Lynx input 事件中提取当前输入值。
function getInputValue(event: LynxInputEvent): string {
    return event.detail?.value ?? event.value ?? '';
}

// 将后端毫秒时间戳格式化为中文日期时间。
function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return '创建时间未知';
    }

    return new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// 从 unknown 错误值中提取适合展示给用户的错误信息。
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return '未知错误';
}
