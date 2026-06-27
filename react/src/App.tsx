import { useCallback, useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native"
import { createTodo, fetchSummary, fetchTodos, updateTodo } from "./api"
import type { Todo, TodoSummary } from "./api"
import { postNativeMessage, showNativeToast } from "./nativeBridge"

// 空统计对象，用于接口返回前提供稳定 UI 数据。
const emptySummary: TodoSummary = { total: 0, completed: 0, uncompleted: 0 }

// App 是 React Native + Android 组合的今日待办主页面。
export function App() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [summary, setSummary] = useState<TodoSummary>(emptySummary)
    const [title, setTitle] = useState("")
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState("准备加载今日任务")

    // loadTodos 同时加载任务列表和统计数据。
    const loadTodos = useCallback(async () => {
        setLoading(true)
        setStatus("正在加载今日任务...")

        try {
            const [todoList, todoSummary] = await Promise.all([fetchTodos(), fetchSummary()])
            setTodos(todoList)
            setSummary(todoSummary)
            setStatus("今日任务已同步")
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "任务加载失败")
        } finally {
            setLoading(false)
        }
    }, [])

    // handleCreateTodo 创建新任务，并在成功后刷新列表。
    const handleCreateTodo = useCallback(async () => {
        const nextTitle = title.trim()

        if (!nextTitle) {
            showNativeToast("请先输入任务内容")
            return
        }

        setLoading(true)
        try {
            await createTodo({ title: nextTitle })
            setTitle("")
            showNativeToast("任务已创建")
            await loadTodos()
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "任务创建失败")
        } finally {
            setLoading(false)
        }
    }, [loadTodos, title])

    // handleToggleTodo 切换任务完成状态，并通知 Native 展示反馈。
    const handleToggleTodo = useCallback(
        async (todo: Todo) => {
            setLoading(true)
            try {
                const nextCompleted = !todo.completed
                await updateTodo(todo.id, { completed: nextCompleted })
                postNativeMessage({
                    source: "daily-todo-react-native",
                    action: nextCompleted ? "completeTodo" : "reopenTodo",
                    payload: { id: todo.id, title: todo.title },
                })
                await loadTodos()
            } catch (error) {
                setStatus(error instanceof Error ? error.message : "任务状态更新失败")
            } finally {
                setLoading(false)
            }
        },
        [loadTodos],
    )

    // handleReminder 调用 Android Native Module 触发本地提醒。
    const handleReminder = useCallback(() => {
        postNativeMessage({
            source: "daily-todo-react-native",
            action: "remind",
            payload: { message: `你还有 ${summary.uncompleted} 个今日任务未完成` },
        })
    }, [summary.uncompleted])

    // progressText 根据统计数据生成完成进度文案。
    const progressText = useMemo(() => {
        if (summary.total === 0) {
            return "今天还没有任务，先添加一条吧"
        }

        return `已完成 ${summary.completed}/${summary.total} 个任务`
    }, [summary])

    useEffect(() => {
        void loadTodos()
    }, [loadTodos])

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.heroCard}>
                    <Text style={styles.eyebrow}>React Native + Android</Text>
                    <Text style={styles.title}>今日待办</Text>
                    <Text style={styles.subtitle}>{progressText}</Text>
                    <View style={styles.heroActions}>
                        <Pressable style={styles.primaryButton} onPress={loadTodos} disabled={loading}>
                            <Text style={styles.primaryButtonText}>刷新</Text>
                        </Pressable>
                        <Pressable style={styles.secondaryButton} onPress={handleReminder}>
                            <Text style={styles.secondaryButtonText}>提醒我</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.summaryGrid}>
                    <SummaryCard label="全部" value={summary.total} />
                    <SummaryCard label="已完成" value={summary.completed} />
                    <SummaryCard label="未完成" value={summary.uncompleted} />
                </View>

                <View style={styles.inputCard}>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="输入一条今日任务"
                        maxLength={60}
                    />
                    <Pressable style={styles.addButton} onPress={handleCreateTodo} disabled={loading}>
                        <Text style={styles.addButtonText}>添加</Text>
                    </Pressable>
                </View>

                <View style={styles.todoCard}>
                    <Text style={styles.sectionTitle}>任务列表</Text>
                    {loading ? <ActivityIndicator color="#2563eb" /> : null}
                    {todos.map((todo) => (
                        <Pressable
                            key={todo.id}
                            style={styles.todoItem}
                            onPress={() => void handleToggleTodo(todo)}
                        >
                            <Text style={todo.completed ? styles.todoDone : styles.todoTitle}>
                                {todo.completed ? "✓" : "○"} {todo.title}
                            </Text>
                        </Pressable>
                    ))}
                    {todos.length === 0 && !loading ? (
                        <Text style={styles.emptyText}>暂无任务，添加一条开始今天的计划。</Text>
                    ) : null}
                </View>

                <Text style={styles.statusText}>{status}</Text>
            </ScrollView>
        </SafeAreaView>
    )
}

// SummaryCardProps 表示统计卡片组件的属性。
type SummaryCardProps = {
    label: string
    value: number
}

// SummaryCard 展示一个任务统计指标。
function SummaryCard({ label, value }: SummaryCardProps) {
    return (
        <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{value}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
    )
}

// styles 定义 React Native 页面所需的全部样式。
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#eef2ff",
    },
    container: {
        padding: 20,
        gap: 16,
    },
    heroCard: {
        padding: 22,
        borderRadius: 28,
        backgroundColor: "#1d4ed8",
        gap: 10,
    },
    eyebrow: {
        color: "#bfdbfe",
        fontSize: 13,
        fontWeight: "700",
    },
    title: {
        color: "#ffffff",
        fontSize: 32,
        fontWeight: "800",
    },
    subtitle: {
        color: "#dbeafe",
        fontSize: 16,
    },
    heroActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    primaryButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 999,
        backgroundColor: "#ffffff",
    },
    primaryButtonText: {
        color: "#1d4ed8",
        fontWeight: "700",
    },
    secondaryButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 999,
        backgroundColor: "rgba(255, 255, 255, 0.18)",
    },
    secondaryButtonText: {
        color: "#ffffff",
        fontWeight: "700",
    },
    summaryGrid: {
        flexDirection: "row",
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        backgroundColor: "#ffffff",
    },
    summaryValue: {
        color: "#111827",
        fontSize: 24,
        fontWeight: "800",
    },
    summaryLabel: {
        color: "#6b7280",
        marginTop: 4,
    },
    inputCard: {
        flexDirection: "row",
        gap: 10,
        padding: 12,
        borderRadius: 22,
        backgroundColor: "#ffffff",
    },
    input: {
        flex: 1,
        minHeight: 44,
        color: "#111827",
        fontSize: 16,
    },
    addButton: {
        justifyContent: "center",
        paddingHorizontal: 18,
        borderRadius: 16,
        backgroundColor: "#2563eb",
    },
    addButtonText: {
        color: "#ffffff",
        fontWeight: "800",
    },
    todoCard: {
        padding: 18,
        borderRadius: 24,
        backgroundColor: "#ffffff",
        gap: 12,
    },
    sectionTitle: {
        color: "#111827",
        fontSize: 18,
        fontWeight: "800",
    },
    todoItem: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e5e7eb",
    },
    todoTitle: {
        color: "#111827",
        fontSize: 16,
    },
    todoDone: {
        color: "#9ca3af",
        fontSize: 16,
        textDecorationLine: "line-through",
    },
    emptyText: {
        color: "#6b7280",
        lineHeight: 22,
    },
    statusText: {
        color: "#4b5563",
        textAlign: "center",
    },
})
