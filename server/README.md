# Daily Todo Server

今日待办 App 的 Go Server，负责提供 Todo 数据 API，并使用本地 JSON 文件做简单持久化存储。

## 1. 技术栈

- Go
- 标准库 `net/http`
- 标准库 `encoding/json`
- 本地 JSON 文件存储
- 手写 CORS 响应头
- 零三方依赖

## 2. 目录结构

```text
server/
├── Makefile
├── README.md
├── cmd/
│   └── server/
│       └── main.go          # Server 启动入口
├── data/
│   └── todos.json           # 默认本地 JSON 数据文件
├── go.mod
└── internal/
    ├── domain/              # 领域模型、用例服务、Repository 接口
    ├── httpapi/             # HTTP Handler、CORS、JSON Response
    └── infra/               # JSON 文件仓储实现
```

## 3. 启动服务

```bash
make run
```

默认监听：

```text
http://localhost:8080
```

默认 JSON 存储文件：

```text
data/todos.json
```

也可以自定义端口和存储文件：

```bash
make run PORT=9000 TODO_STORE_FILE=data/dev-todos.json
```

## 4. 运行单测

```bash
make test
```

等价于：

```bash
go test ./...
```

## 5. API 列表

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/healthz` | 健康检查 |
| `GET` | `/api/todos` | 获取任务列表 |
| `POST` | `/api/todos` | 创建任务 |
| `PATCH` | `/api/todos/{id}` | 更新任务完成状态 |
| `GET` | `/api/todos/summary` | 获取任务统计 |

## 6. curl 调用示例

以下示例默认 Server 已经启动在：

```text
http://localhost:8080
```

### 6.1 健康检查

```bash
curl http://localhost:8080/healthz
```

响应示例：

```json
{
  "status": "ok"
}
```

### 6.2 创建任务

```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"学习 H5 + Lynx + Native + Go Server"}'
```

响应示例：

```json
{
  "id": "todo-1",
  "title": "学习 H5 + Lynx + Native + Go Server",
  "completed": false,
  "createdAt": 1782537600000
}
```

### 6.3 查询任务列表

```bash
curl http://localhost:8080/api/todos
```

响应示例：

```json
[
  {
    "id": "todo-1",
    "title": "学习 H5 + Lynx + Native + Go Server",
    "completed": false,
    "createdAt": 1782537600000
  }
]
```

### 6.4 标记任务完成

```bash
curl -X PATCH http://localhost:8080/api/todos/todo-1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

响应示例：

```json
{
  "id": "todo-1",
  "title": "学习 H5 + Lynx + Native + Go Server",
  "completed": true,
  "createdAt": 1782537600000
}
```

### 6.5 标记任务未完成

```bash
curl -X PATCH http://localhost:8080/api/todos/todo-1 \
  -H "Content-Type: application/json" \
  -d '{"completed":false}'
```

### 6.6 查询任务统计

```bash
curl http://localhost:8080/api/todos/summary
```

响应示例：

```json
{
  "total": 1,
  "completed": 0,
  "uncompleted": 1
}
```

## 7. 本地 JSON 存储说明

Server 默认会把 Todo 数据写入：

```text
data/todos.json
```

当前仓储实现位于：

```text
internal/infra/todo_repository.go
```

读写策略：

- 每次查询都读取本地 JSON 文件。
- 每次创建 / 更新都直接改写本地 JSON 文件。
- Demo 阶段不引入数据库，方便理解最小后端链路。

JSON 文件结构示例：

```json
{
  "nextId": 1,
  "todos": [
    {
      "id": "todo-1",
      "title": "学习 H5 + Lynx + Native + Go Server",
      "completed": false,
      "createdAt": 1782537600000
    }
  ]
}
```
