package httpapi

import "net/http"

// WithCORS 使用标准库手写 CORS 响应头，方便本地 H5 调试访问 Go API。
func WithCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// H5 默认通过 Vite /api 代理同源访问，不会触发浏览器 OPTIONS 预检。
		// 这里保留 OPTIONS 处理，作为直接跨域调试 Go API 时的兼容兜底。
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
