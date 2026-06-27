import { createRoot } from "react-dom/client"
import { App } from "./App"

// 全局样式入口：Vite 会通过 Sass 把这里导入的 SCSS 编译成 CSS，并一起打包到页面中。
import "./styles.scss"

// index.html 中预留了 <div id="root"></div>，React 会把整个 App 挂载到这个节点下。
const root = document.querySelector("#root")

if (!root) {
    // 如果 HTML 入口被误改导致 root 节点不存在，直接抛错，方便开发阶段快速定位问题。
    throw new Error("Root element #root not found")
}

// createRoot 是 React 18+ 的挂载方式；这里渲染应用的顶层组件 App。
createRoot(root).render(<App />)
