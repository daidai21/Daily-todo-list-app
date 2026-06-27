# Daily Todo H5

今日待办 App 的 H5 页面，使用 **React + TypeScript + Vite + ESLint + Prettier** 实现，用于学习入门 React 页面开发、接口调用、状态管理、工程化检查和 Native Bridge 预留能力。

## 1. 技术栈

- React
- Vite
- TypeScript / TSX
- ESLint
- Prettier
- 原生 CSS
- Fetch API

## 2. 目录结构

```text
h5/
├── Makefile
├── README.md
├── dist/                   # 构建产物目录，执行 make build 后生成，不需要手写维护
├── .env                    # Server API 域名配置示例
├── .prettierignore         # Prettier 忽略规则
├── .prettierrc.json        # Prettier 格式化配置
├── eslint.config.js        # ESLint 配置
├── index.html              # Vite HTML 入口
├── node_modules/           # 依赖安装目录，执行 make install / make run / make build 后生成
├── package.json
├── package-lock.json
├── tsconfig.json           # TypeScript 工程引用配置
├── tsconfig.app.json       # 浏览器端 TypeScript 配置
├── tsconfig.node.json      # Node 配置文件 TypeScript 配置
├── vite.config.ts
└── src/
    ├── App.tsx             # React 主页面与组件拆分
    ├── api.ts              # Go Server API 调用封装和数据类型
    ├── config.ts           # Server API 域名配置读取逻辑
    ├── main.tsx            # React 挂载入口
    ├── nativeBridge.ts     # Native Bridge 调用封装
    └── styles.css          # 页面样式
```

## 3. 安装依赖

```bash
make install
```

等价于：

```bash
npm install
```

## 4. 启动开发服务

```bash
make run
```

默认访问地址：

```text
http://localhost:5173
```

也可以自定义 H5 端口：

```bash
make run PORT=3000
```

## 5. 构建产物

```bash
make build
```

构建产物会输出到：

```text
dist/
```

## 6. 工程化检查

### 6.1 TypeScript 类型检查

```bash
make typecheck
```

### 6.2 ESLint 代码检查

```bash
make lint
```

### 6.3 Prettier 格式化

```bash
make format
```

### 6.4 Prettier 格式检查

```bash
make format-check
```

### 6.5 一次性完整检查

```bash
make check
```

也可以通过环境变量指定本地开发代理转发的 Server API 地址：

```bash
VITE_API_BASE_URL=http://localhost:8080 make run
```

## 7. Server 域名配置

H5 页面不提供 Server 地址输入模块，本地开发时通过 Vite 代理把 `/api` 转发到 Go Server。

默认代理目标是：

```text
http://localhost:8080
```

也可以在启动时指定代理目标：

```bash
VITE_API_BASE_URL=http://localhost:8080 make run
```

当前 API Base 读取优先级：

1. URL Query：`?apiBase=http://localhost:8080`
2. 兜底默认值：空字符串，即同源请求 `/api`

正常本地开发建议使用同源 `/api`，由 Vite 代理转发到 Go Server，这样浏览器不会发起跨域 `OPTIONS` 预检请求。

配置读取逻辑位于：

```text
src/config.ts
```

## 8. 联调 Server

请先启动 Go Server：

```bash
cd ../server
make run
```

再启动 H5：

```bash
cd ../h5
make run
```

也可以通过 URL Query 指定：

```text
http://localhost:5173/?apiBase=http://localhost:8080
```

## 9. 已实现功能

- 查看今日任务列表
- 添加新任务
- 标记任务完成
- 标记任务未完成
- 查看今日任务统计
- 点击「提醒我」触发 Native Bridge 预留逻辑

## 10. API 调用

H5 调用的接口来自 Go Server：

| Method  | Path                 | 说明             |
| ------- | -------------------- | ---------------- |
| `GET`   | `/api/todos`         | 获取任务列表     |
| `POST`  | `/api/todos`         | 创建任务         |
| `PATCH` | `/api/todos/{id}`    | 更新任务完成状态 |
| `GET`   | `/api/todos/summary` | 获取任务统计     |

API 封装位置：

```text
src/api.ts
```

## 11. React 学习点

这个 H5 页面适合学习 React 入门常见知识：

- JSX 页面描述
- TypeScript 类型建模
- 组件拆分
- `useState` 管理状态
- `useEffect` 处理初始化请求
- `useCallback` 封装异步行为
- `useMemo` 计算派生数据
- 受控表单
- 列表渲染
- 条件渲染
- 组件 Props 传递
- Fetch 请求后端接口
- ESLint 代码质量检查
- Prettier 代码格式化

## 12. Native Bridge 预留

Native Bridge 封装在：

```text
src/nativeBridge.ts
```

当前支持两种调用形式：

```js
window.TodoNative.postMessage(...)
```

以及 iOS WebView 常见形式：

```js
window.webkit.messageHandlers.TodoNative.postMessage(...)
```

目前会在以下场景触发：

- 点击「提醒我」
- 标记任务完成
- 标记任务未完成

如果当前不是 Native 宿主环境，会 fallback 到 `console.info`。

## 13. 推荐学习顺序

1. 先阅读 `src/main.tsx`，了解 React 如何挂载到页面。
2. 再阅读 `src/App.tsx`，理解页面组件、状态和 Props 类型如何组织。
3. 阅读 `src/api.ts`，理解 H5 如何请求 Go Server，以及如何定义接口数据类型。
4. 阅读 `src/config.ts`，理解环境变量如何进入前端代码。
5. 阅读 `src/nativeBridge.ts`，理解 H5 如何预留 Native 通信入口。
6. 阅读 `eslint.config.js` 和 `.prettierrc.json`，理解代码检查和格式化配置。
7. 最后阅读 `src/styles.css`，理解移动端页面样式如何组织。
