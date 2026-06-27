type NativeMessage = {
    source: "daily-todo-h5-react"
    action: string
    payload: Record<string, unknown>
}

declare global {
    interface Window {
        TodoNative?: {
            postMessage: (message: string) => void
        }
        webkit?: {
            messageHandlers?: {
                TodoNative?: {
                    postMessage: (message: NativeMessage) => void
                }
            }
        }
    }
}

export function notifyNative(action: string, payload: Record<string, unknown>): void {
    const message = {
        source: "daily-todo-h5-react",
        action,
        payload,
    } satisfies NativeMessage

    if (window.TodoNative?.postMessage) {
        window.TodoNative.postMessage(JSON.stringify(message))
        return
    }

    if (window.webkit?.messageHandlers?.TodoNative) {
        window.webkit.messageHandlers.TodoNative.postMessage(message)
        return
    }

    console.info("Native bridge fallback", message)
}

export {}
