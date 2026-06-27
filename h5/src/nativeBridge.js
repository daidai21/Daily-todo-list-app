export function notifyNative(action, payload) {
    const message = {
        source: "daily-todo-h5-react",
        action,
        payload,
    }

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
