// 默认使用空字符串，让浏览器请求同源的 /api。
// 本地开发时由 Vite proxy 转发到 Go Server，避免浏览器因为跨域触发 OPTIONS 预检。
const fallbackApiBase = ""

// 读取页面启动时使用的 API Base，优先支持 URL Query 临时覆盖。
export function getInitialApiBase(): string {
    const params = new URLSearchParams(window.location.search)

    // 保留 query 参数主要用于临时调试，例如：?apiBase=http://localhost:8080。
    // 注意：一旦传入完整跨域地址，浏览器仍然可能重新触发 OPTIONS 预检。
    const fromQuery = params.get("apiBase")

    return normalizeApiBase(fromQuery || fallbackApiBase)
}

// 规范化 API Base，去掉空白和末尾斜杠，方便后续与 /api 路径拼接。
export function normalizeApiBase(value: string | null | undefined): string {
    // 去掉末尾斜杠，避免拼接接口路径时出现 //api/todos。
    return String(value || fallbackApiBase)
        .trim()
        .replace(/\/$/, "")
}
