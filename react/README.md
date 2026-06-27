# Daily Todo React Native

今日待办 App 的 React Native JS/TS 工程，用于实现 Android 侧跨端业务页面、API 请求、状态管理和 JS Bridge 调用封装。Android 原生工程已拆分到 `native-android/`。

## 1. 技术栈

- React Native
- React + TypeScript
- Metro
- React Native CLI

## 2. 目录结构

```text
react/
├── Makefile
├── package.json
├── app.json
├── index.js
├── react-native.config.js     # 指向 ../native-android 原生工程
├── src/
│   ├── App.tsx               # React Native 今日待办主页面
│   ├── api.ts                # Todo API 请求封装
│   ├── config.ts             # Android API Base 配置
│   └── nativeBridge.ts       # JS -> Android Native Module 调用封装
└── tsconfig.json
```

## 3. 准备环境

需要安装：

```bash
node >= 18
npm
```

Android 运行还需要参考 [../native-android/README.md](../native-android/README.md) 准备 JDK、Android Studio、Android SDK 和 Gradle。

`react/react-native.config.js` 已配置 Android 原生工程路径为：

```text
../native-android
```

## 4. 安装依赖

```bash
cd react
make install
```

## 5. 运行方式

先启动 Go Server：

```bash
cd ../server
make run
```

再启动 Metro：

```bash
cd ../react
make start
```

然后在另一个终端安装到 Android 模拟器或真机，实际原生工程来自 `../native-android`：

```bash
make android
```

Android 模拟器访问宿主机的 Go Server 默认使用：

```text
http://10.0.2.2:8080
```

配置位置：

```text
src/config.ts
```

真机调试时，需要把 API Base 改为电脑的局域网 IP，例如：

```text
http://10.37.45.2:8080
```

## 6. Native Module

Android 侧在 `native-android/` 中注册了 Native Module：

```text
TodoNative
```

JS 侧通过：

```ts
NativeModules.TodoNative.postMessage(JSON.stringify(message))
```

当前支持：

| action | Android Native 行为 |
| --- | --- |
| `remind` | 发送本地通知提醒；Android 13+ 需要通知权限 |
| `completeTodo` | 展示「任务已完成」Toast |
| `reopenTodo` | 展示「任务已恢复」Toast |
| `vibrate` | 触发一次轻量震动反馈 |

## 7. 构建 APK

构建 Debug APK：

```bash
make build-debug
```

该命令会进入：

```text
../native-android
```

并执行 Android Gradle 构建。

复制 Debug APK 到 `artifacts/android/`：

```bash
make copy-debug-apk
```

默认生成文件名类似：

```text
artifacts/android/DailyTodoNativeAndroid-v0.1.0-debug-20260627.apk
```

构建 Release APK：

```bash
make build-release
```

当前 Release 仍使用 debug keystore，正式发布前需要补充正式签名配置。

## 8. 推荐验证顺序

1. `cd server && make run`
2. `cd react && make install`
3. `cd react && make typecheck`
4. `cd react && make start`
5. `cd react && make android`
6. 在 Android 页面中验证任务查询、创建、完成、提醒和 Toast

## 9. 当前限制

- 该工程是 React Native + Android 学习 Demo，Release 签名、渠道包和 CI 构建后续再补充。
- 当前 Linux 环境没有完整 Android SDK / Gradle 依赖缓存时，可能无法直接完成 APK 构建。
- Android 13+ 的通知权限需要用户在系统弹窗或设置中授权后，本地通知才会展示。
