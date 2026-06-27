import { NativeModules } from "react-native"

// NativeBridgeMessage 表示 JS 发送给 Android Native Module 的统一消息结构。
export type NativeBridgeMessage = {
    source: "daily-todo-react-native"
    action: "remind" | "completeTodo" | "reopenTodo" | "vibrate"
    payload?: Record<string, unknown>
}

// TodoNativeModule 表示 Android 侧暴露给 React Native 的原生模块能力。
type TodoNativeModule = {
    postMessage?: (message: string) => void
    showToast?: (text: string) => void
    scheduleReminder?: (text: string) => void
    vibrate?: () => void
}

// NativeModulesWithTodo 给 React Native NativeModules 增加 TodoNative 类型声明。
type NativeModulesWithTodo = typeof NativeModules & {
    TodoNative?: TodoNativeModule
}

// postNativeMessage 向 Android Native Module 发送业务消息。
export function postNativeMessage(message: NativeBridgeMessage): void {
    const nativeModules = NativeModules as NativeModulesWithTodo
    const todoNative = nativeModules.TodoNative

    if (todoNative?.postMessage) {
        todoNative.postMessage(JSON.stringify(message))
        return
    }

    console.warn("TodoNative native module is not available", message)
}

// showNativeToast 通过 Android Toast 展示轻量提示。
export function showNativeToast(text: string): void {
    const nativeModules = NativeModules as NativeModulesWithTodo

    if (nativeModules.TodoNative?.showToast) {
        nativeModules.TodoNative.showToast(text)
    }
}
