import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./styles.css"

const root = document.querySelector("#root")

if (!root) {
    throw new Error("Root element #root not found")
}

createRoot(root).render(<App />)
