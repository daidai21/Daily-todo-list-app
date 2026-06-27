# Daily Todo Native Android

Daily Todo Native Android 是「今日待办」应用的 Android 原生宿主工程。它负责把 `react/` 目录中的 React Native 页面运行在 Android App 中，并通过原生能力补充移动端体验，例如本地通知、Toast 提示和震动反馈。

这个工程的定位不是单独实现一套待办业务，而是作为 React Native 应用在 Android 平台上的原生外壳：业务界面和交互主要由 React Native 承担，Android 侧负责应用启动、原生模块注册、系统能力调用和 APK 构建发布。

## 1. 项目亮点

- **React Native + Android Native 混合架构**：复用 `react/` 中的 JS/TS 页面，同时保留 Android 原生扩展能力。
- **原生提醒能力**：待办提醒可触发 Android 本地通知，适配 Android 13+ 通知权限要求。
- **轻量原生反馈**：任务完成、恢复等操作可通过 Toast 和震动提供即时反馈。
- **独立 Android 构建入口**：通过 Gradle 与 Makefile 管理 Debug / Release APK 构建和产物复制。
- **适合学习与扩展**：工程结构清晰，便于理解 React Native Android 宿主、Native Module 注册和系统 API 调用方式。

## 2. 应用能力

| 能力 | 说明 |
| --- | --- |
| 待办页面承载 | 加载并运行 `react/` 中的 React Native 页面 |
| 本地通知 | 支持待办提醒场景，Android 13+ 需要用户授权通知权限 |
| Toast 提示 | 在完成、恢复任务等场景展示 Android 原生 Toast |
| 震动反馈 | 支持轻量震动，增强移动端操作反馈 |
| APK 构建 | 支持 Debug / Release APK 构建，并可复制到统一产物目录 |

## 3. 技术栈

- Android Kotlin
- Gradle / Android Gradle Plugin
- React Native Android Gradle Plugin
- Android Native Module
- Toast / Notification / Vibrator

## 4. 工程结构

```text
native-android/
├── Makefile
├── build.gradle
├── settings.gradle
├── gradle.properties
├── gradlew
└── app/
    ├── build.gradle
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/com/dailytodo/nativeandroid/
        │   ├── MainActivity.kt
        │   ├── MainApplication.kt
        │   ├── TodoNativePackage.kt
        │   └── TodoNativeModule.kt
        └── res/values/
            ├── strings.xml
            └── styles.xml
```

## 5. 与 React Native 工程的关系

React Native JS/TS 代码位于仓库的 `react/` 目录：

```text
../react
```

Android 工程通过 `settings.gradle` 引用 React Native Gradle 插件：

```text
../react/node_modules/@react-native/gradle-plugin
```

`app/build.gradle` 中配置 React Native 根目录、入口文件和依赖目录：

```text
root = ../../react
entryFile = ../../react/index.js
reactNativeDir = ../../react/node_modules/react-native
```

## 6. Native Module

Android 侧注册了名为 `TodoNative` 的 Native Module，React Native 页面可以通过它调用 Android 原生能力：

```ts
NativeModules.TodoNative.postMessage(JSON.stringify(message))
```

当前支持的消息类型：

| action | Android Native 行为 |
| --- | --- |
| `remind` | 发送本地通知提醒；Android 13+ 需要通知权限 |
| `completeTodo` | 展示「任务已完成」Toast |
| `reopenTodo` | 展示「任务已恢复」Toast |
| `vibrate` | 触发一次轻量震动反馈 |

## 7. 运行前准备

本地开发需要先准备：

```bash
JDK 17+
Android Studio
Android SDK / Platform Tools
Gradle
```

React Native 依赖需要先在 `react/` 中安装：

```bash
cd ../react
make install
```

## 8. 构建 APK

构建 Debug APK：

```bash
cd native-android
make build-debug
```

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

## 9. 推荐验证顺序

1. `cd react && make install`
2. `cd react && make typecheck`
3. `cd server && make run`
4. `cd react && make start`
5. `cd react && make android`
6. 在 Android 页面中验证任务查询、创建、完成、提醒、Toast 和震动反馈

## 10. 当前限制

- 该工程是 Android Native 学习 Demo，Release 签名、渠道包和 CI 构建后续再补充。
- 当前 Linux 环境没有完整 Android SDK / Gradle 依赖缓存时，可能无法直接完成 APK 构建。
- Android 13+ 的通知权限需要用户在系统弹窗或设置中授权后，本地通知才会展示。
