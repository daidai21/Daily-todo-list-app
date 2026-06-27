# Daily Todo H5

今日待办 App 的 H5 页面，使用 **React + Vite** 实现，用于学习入门 React 页面开发、接口调用、状态管理和 Native Bridge 预留能力。

## 1. 技术栈

- React
- Vite
- JavaScript / JSX
- 原生 CSS
- Fetch API
- LocalStorage

## 2. 目录结构

```text
h5/
├── Makefile
├── README.md
├── index.html              # Vite HTML 入口
├── package.json
├── package-lock.json
├── vite.config.js
└── src/
    ├── App.jsx             # React 主页面与组件拆分
    ├── api.js              # Go Server API 调用封装
    ├── main.jsx            # React 挂载入口
    ├── nativeBridge.js     # Native Bridge 调用封装
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

也可以自定义端口：

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

## 6. 联调 Server

H5 默认请求的 Server 地址是：

```text
http://localhost:8080
```

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

如果 Server 地址不是默认值，可以在 H5 页面顶部的「Server 地址」输入框中修改并保存。

也可以通过 URL Query 指定：

```text
http://localhost:5173/?apiBase=http://localhost:8080
```

## 7. 已实现功能

- 查看今日任务列表
- 添加新任务
- 标记任务完成
- 标记任务未完成
- 查看今日任务统计
- 配置 Server API 地址
- 点击「提醒我」触发 Native Bridge 预留逻辑

## 8. API 调用

H5 调用的接口来自 Go Server：

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/api/todos` | 获取任务列表 |
| `POST` | `/api/todos` | 创建任务 |
| `PATCH` | `/api/todos/{id}` | 更新任务完成状态 |
| `GET` | `/api/todos/summary` | 获取任务统计 |

API 封装位置：

```text
src/api.js
```

## 9. React 学习点

这个 H5 页面适合学习 React 入门常见知识：

- JSX 页面描述
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

## 10. Native Bridge 预留

Native Bridge 封装在：

```text
src/nativeBridge.js
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

## 11. 推荐学习顺序

1. 先阅读 `src/main.jsx`，了解 React 如何挂载到页面。
2. 再阅读 `src/App.jsx`，理解页面组件和状态如何组织。
3. 阅读 `src/api.js`，理解 H5 如何请求 Go Server。
4. 阅读 `src/nativeBridge.js`，理解 H5 如何预留 Native 通信入口。
5. 最后阅读 `src/styles.css`，理解移动端页面样式如何组织。
