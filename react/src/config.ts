// Android 模拟器访问宿主机 localhost 需要使用 10.0.2.2。
const fallbackApiBase = "http://10.0.2.2:8080"

// 返回 React Native Android 页面默认使用的 API Base。
export function getApiBase(): string {
    return normalizeApiBase(fallbackApiBase)
}

// 规范化 API Base，去掉空白和末尾斜杠，方便后续拼接 /api 路径。
export function normalizeApiBase(value: string | null | undefined): string {
    return String(value || fallbackApiBase)
        .trim()
        .replace(/\/$/, "")
}
