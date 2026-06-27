/// <reference types="vite/client" />

// Vite 暴露给前端代码的环境变量类型声明。
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
}

// 扩展 ImportMeta，使 TypeScript 能识别 import.meta.env。
interface ImportMeta {
    readonly env: ImportMetaEnv
}
