// Lynx 发给 Native 宿主的统一消息格式。
type NativeMessage = {
    source: 'daily-todo-lynx';
    action: string;
    payload: Record<string, unknown>;
};

// Native 宿主可以注入的最小 Bridge 形态。
type NativeBridgeHost = {
    TodoNative?: {
        postMessage: (message: string) => void;
    };
};

// 统一封装 Lynx -> Native 的通信，业务组件只需要关心 action 和 payload。
export function notifyNative(
    action: string,
    payload: Record<string, unknown>,
): void {
    const message = {
        source: 'daily-todo-lynx',
        action,
        payload,
    } satisfies NativeMessage;

    const nativeHost = globalThis as typeof globalThis & NativeBridgeHost;
    if (nativeHost.TodoNative?.postMessage) {
        nativeHost.TodoNative.postMessage(JSON.stringify(message));
        return;
    }

    console.info('Native bridge fallback', message);
}
