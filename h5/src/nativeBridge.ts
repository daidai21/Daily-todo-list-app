// H5 发给 Native 宿主的统一消息格式。
// source 用来标识消息来源，方便 Native 侧区分不同 H5 页面或业务模块。
type NativeMessage = {
    source: "daily-todo-h5-react"
    action: string
    payload: Record<string, unknown>
}

declare global {
    // 扩展浏览器 Window 类型，声明 Native WebView 可能注入的 Bridge 对象。
    interface Window {
        // Android WebView 常见注入方式：Native 在 window 上挂一个对象给 H5 调用。
        // 这里约定 postMessage 接收字符串，因此发送前需要 JSON.stringify。
        TodoNative?: {
            postMessage: (message: string) => void
        }

        // iOS WKWebView 常见注入方式：通过 window.webkit.messageHandlers.xxx.postMessage 通信。
        // iOS 侧通常可以直接接收对象，不需要手动 stringify。
        webkit?: {
            messageHandlers?: {
                TodoNative?: {
                    postMessage: (message: NativeMessage) => void
                }
            }
        }
    }
}

// 统一封装 Native Bridge 调用，业务代码只需要关心 action 和 payload。
// 当前会在「提醒我」「完成任务」「恢复未完成」等场景调用。
export function notifyNative(action: string, payload: Record<string, unknown>): void {
    // satisfies 可以校验 message 满足 NativeMessage 类型，同时保留对象字面量的精确类型。
    const message = {
        source: "daily-todo-h5-react",
        action,
        payload,
    } satisfies NativeMessage

    // 优先尝试 Android 风格 bridge。
    if (window.TodoNative?.postMessage) {
        window.TodoNative.postMessage(JSON.stringify(message))
        return
    }

    // 再尝试 iOS WKWebView 风格 bridge。
    if (window.webkit?.messageHandlers?.TodoNative) {
        window.webkit.messageHandlers.TodoNative.postMessage(message)
        return
    }

    // 普通浏览器开发调试时没有 Native 宿主，打印日志即可，不影响页面正常使用。
    console.info("Native bridge fallback", message)
}

// 让这个文件保持模块作用域，避免 declare global 被当成全局脚本声明。
export {}
