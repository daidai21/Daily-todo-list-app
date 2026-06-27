# Daily Todo Lynx

今日待办 App 的 Lynx 页面，使用 **ReactLynx + TypeScript + Rspeedy** 实现，用于移动端 Lynx 容器或 Lynx Explorer 预览。

## 技术栈

- ReactLynx
- TypeScript / TSX
- Rspeedy
- ESLint
- Prettier
- Fetch API

## 目录结构

```text
lynx/
├── Makefile              # Lynx 常用工程命令
├── .env                  # Lynx 本地环境变量配置
├── lynx.config.ts        # Rspeedy / ReactLynx 构建配置
├── package.json
├── tsconfig.json
└── src/
    ├── App.tsx           # Lynx 主页面和组件拆分
    ├── App.css           # Lynx 页面样式
    ├── api.ts            # Go Server API 调用封装
    ├── config.ts         # API Base 配置读取
    ├── index.tsx         # ReactLynx 挂载入口
    ├── nativeBridge.ts   # Lynx -> Native 通信封装
    └── rspeedy-env.d.ts  # Rspeedy / Lynx 类型声明
```

## 安装依赖

```bash
make install
```

## 启动开发服务

```bash
make run
```

启动后使用 Lynx Explorer 扫描终端中的二维码预览页面。

## 环境变量配置

Lynx 本地配置位于：

```text
.env
```

当前支持：

```env
LYNX_API_BASE_URL=http://localhost:8080
LYNX_PORT=3000
```

含义：

| 变量                | 说明                        |
| ------------------- | --------------------------- |
| `LYNX_API_BASE_URL` | Go Server API 地址          |
| `LYNX_PORT`         | Lynx / Rspeedy 开发服务端口 |

`make run` 会默认读取 `.env`：

```bash
make run
```

也可以通过命令行临时覆盖：

```bash
make run LYNX_API_BASE_URL=http://你的电脑局域网IP:8080 LYNX_PORT=3001
```

## 联调 Server

请先启动 Go Server：

```bash
cd ../server
make run
```

再启动 Lynx：

```bash
cd ../lynx
make run LYNX_API_BASE_URL=http://你的电脑局域网IP:8080
```

如果在电脑本机环境预览，也可以使用默认值：

```text
http://localhost:8080
```

注意：手机上的 Lynx Explorer 访问 `localhost` 时通常指向手机自身，不是电脑，所以真机联调建议显式配置局域网 IP。

## 可用命令

```bash
make run          # 启动开发服务
make build        # 构建 Lynx 产物
make preview      # 预览构建产物
make typecheck    # TypeScript 类型检查
make lint         # ESLint 代码检查
make format       # Prettier 格式化
make format-check # Prettier 格式检查
make check        # 一次性运行格式检查、类型检查、ESLint 和构建
```

## 已实现功能

- 查看今日任务列表
- 查看今日任务统计
- 添加新任务
- 标记任务完成
- 标记任务未完成
- 点击「提醒我」触发 Native Bridge 预留逻辑

## Native Bridge

Lynx 页面会向 Native 发送统一消息：

```ts
{
  source: "daily-todo-lynx",
  action: string,
  payload: Record<string, unknown>
}
```

当前会在以下场景触发：

- 点击「提醒我」：`remind`
- 标记任务完成：`completeTodo`
- 标记任务未完成：`reopenTodo`

普通 Lynx Explorer 调试环境如果没有 Native Bridge，会 fallback 到 `console.info`。
