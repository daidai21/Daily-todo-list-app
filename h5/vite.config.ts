import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, ".", "")

    // 这里的环境变量只给 Vite 开发代理使用，不再直接暴露给浏览器请求。
    // 浏览器请求同源 /api，Vite 再转发到真实 Go Server，从而规避跨域 OPTIONS 预检。
    const apiTarget = env.VITE_API_BASE_URL || "http://localhost:8080"

    return {
        plugins: [react()],
        server: {
            host: "0.0.0.0",
            port: 5173,
            proxy: {
                // 将 http://localhost:5173/api/* 转发到 apiTarget/api/*。
                // 对浏览器来说这是同源请求；对开发服务来说只是一次服务端代理转发。
                "/api": {
                    target: apiTarget,
                    changeOrigin: true,
                },
            },
        },
    }
})
