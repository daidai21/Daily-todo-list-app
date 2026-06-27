# Daily Todo Native iOS

今日待办 App 的 iOS Native 宿主工程骨架，用于加载 `lynx/dist/main.lynx.bundle`，并为 Lynx 页面提供 Native Bridge、Toast 和本地通知提醒能力。

## 1. 技术栈

- Swift
- UIKit
- CocoaPods
- XcodeGen
- Lynx iOS SDK
- UserNotifications

## 2. 目录结构

```text
native-ios/
├── Makefile
├── Podfile
├── project.yml                         # XcodeGen 工程描述
├── DailyTodoNative/
│   ├── AppDelegate.swift
│   ├── SceneDelegate.swift
│   ├── TodoAppConfig.swift             # Bundle URL / API Base 配置读取
│   ├── TodoLynxViewController.swift    # LynxView 容器页面
│   ├── Bridging/
│   │   └── DailyTodoNative-Bridging-Header.h
│   ├── Lynx/
│   │   ├── DailyTodoLynxProvider.swift # 本地 / 远程 Lynx bundle 加载器
│   │   └── TodoNativeModule.swift      # Lynx -> Native Bridge 模块
│   ├── Resources/
│   │   └── main.lynx.bundle            # 执行 make sync-bundle 后生成
│   └── Info.plist
```

## 3. 准备环境

需要在 macOS 上安装：

```bash
brew install xcodegen
sudo gem install cocoapods
```

并安装 Xcode。

## 4. 初始化工程

```bash
cd native-ios
make bootstrap
```

这个命令会执行：

1. `xcodegen generate` 生成 `DailyTodoNative.xcodeproj`
2. `pod install` 安装 Lynx iOS 依赖并生成 `DailyTodoNative.xcworkspace`

然后打开工程：

```bash
make open
```

## 5. 运行方式

### 5.1 开发模式：远程加载 Lynx bundle

先启动 Go Server：

```bash
cd ../server
make run
```

再启动 Lynx 开发服务：

```bash
cd ../lynx
make run LYNX_API_BASE_URL=http://127.0.0.1:8080 LYNX_PORT=3000
```

iOS 模拟器默认配置会加载：

```text
http://127.0.0.1:3000/main.lynx.bundle
```

并把 API Base 注入为：

```text
http://127.0.0.1:8080
```

配置位置：

```text
DailyTodoNative/Info.plist
```

字段：

| Key | 说明 |
| --- | --- |
| `LynxBundleURL` | Lynx bundle 地址，支持远程 URL 或本地资源名 |
| `TodoAPIBaseURL` | Go Server API Base |

### 5.2 离线模式：内置 main.lynx.bundle

执行：

```bash
make sync-bundle
```

它会构建 Lynx 工程，并复制：

```text
../lynx/dist/main.lynx.bundle
```

到：

```text
DailyTodoNative/Resources/main.lynx.bundle
```

然后把 `Info.plist` 中的 `LynxBundleURL` 改成：

```text
main.lynx
```

Native 侧会通过 `DailyTodoLynxProvider` 解析为：

```text
main.lynx.bundle
```

## 6. Native Bridge

iOS 侧注册了 Lynx Native Module：

```swift
TodoNativeModule
```

模块名：

```text
TodoNative
```

Lynx 侧会优先尝试：

```ts
NativeModules.TodoNative.postMessage(JSON.stringify(message))
```

消息格式：

```ts
{
  source: "daily-todo-lynx",
  action: string,
  payload: Record<string, unknown>
}
```

当前支持：

| action | Native 行为 |
| --- | --- |
| `remind` | 请求通知权限，并在 5 秒后发一条本地通知 |
| `completeTodo` | 展示「任务已完成」Toast |
| `reopenTodo` | 展示「任务已恢复」Toast |

## 7. 构建

```bash
make build
```

默认构建目标：

```text
platform=iOS Simulator,name=iPhone 16
```

可以覆盖：

```bash
make build DESTINATION='platform=iOS Simulator,name=iPhone 15'
```

## 8. 当前限制

- 该目录是最小 iOS Native 宿主骨架，必须在 macOS + Xcode 环境下生成和编译。
- 当前 Linux 环境无法执行 `xcodegen` / `pod install` / `xcodebuild` 完整验证。
- Native Module API 依赖 Lynx iOS SDK，若 SDK 方法签名变动，需要以实际 Xcode 编译结果为准微调。
- 真机运行时，`127.0.0.1` 指向 iPhone 自身；真机调试要把 `LynxBundleURL` 和 `TodoAPIBaseURL` 改成 Mac 的局域网 IP。

## 9. 推荐验证顺序

1. `cd lynx && make check`
2. `cd native-ios && make bootstrap`
3. `cd server && make run`
4. `cd lynx && make run LYNX_API_BASE_URL=http://127.0.0.1:8080`
5. `cd native-ios && make open`
6. 在 Xcode 中选择 iOS Simulator 运行 `DailyTodoNative`
