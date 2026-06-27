// Native 可以通过全局变量注入 API 地址，方便正式 App 宿主动态控制 Server 环境。
type DailyTodoGlobalConfig = {
    __DAILY_TODO_API_BASE__?: string;
};

// Lynx Explorer 在手机上预览时，localhost 指向手机自身；真实联调建议设置 LYNX_API_BASE_URL 为电脑局域网 IP。
const fallbackApiBase =
    import.meta.env.LYNX_API_BASE_URL || 'http://localhost:8080';

// 读取 Lynx 页面启动时使用的 API Base，优先使用 Native 注入值，其次使用构建环境变量。
export function getInitialApiBase(): string {
    const globalConfig = globalThis as typeof globalThis &
        DailyTodoGlobalConfig;

    return normalizeApiBase(
        globalConfig.__DAILY_TODO_API_BASE__ || fallbackApiBase,
    );
}

// 规范化 API Base，去掉空白和末尾斜杠，方便后续与 /api 路径拼接。
export function normalizeApiBase(value: string | null | undefined): string {
    return String(value || fallbackApiBase)
        .trim()
        .replace(/\/$/, '');
}
