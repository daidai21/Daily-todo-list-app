# Daily Todo Native Android

今日待办 App 的 Android Native 宿主工程，用于承载 `react/` 中的 React Native 页面，并提供 Android Native Module、Toast、本地通知和震动能力。

## 1. 技术栈

- Android Kotlin
- Gradle / Android Gradle Plugin
- React Native Android Gradle Plugin
- Android Native Module
- Toast / Notification / Vibrator

## 2. 目录结构

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

## 3. 与 React Native 工程的关系

React Native JS/TS 代码位于：

```text
../react
```

Android 工程通过 `settings.gradle` 引用 React Native Gradle 插件：

```text
../react/node_modules/@react-native/gradle-plugin
```

`app/build.gradle` 中配置了 React Native 根目录、入口文件和依赖目录：

```text
root = ../../react
entryFile = ../../react/index.js
reactNativeDir = ../../react/node_modules/react-native
```

## 4. 准备环境

需要安装：

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

## 5. 构建 APK

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

## 6. Native Module

Android 侧注册了 Native Module：

```text
TodoNative
```

React Native JS 侧通过：

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

## 7. 推荐验证顺序

1. `cd react && make install`
2. `cd react && make typecheck`
3. `cd server && make run`
4. `cd react && make start`
5. `cd react && make android`
6. 在 Android 页面中验证任务查询、创建、完成、提醒和 Toast

## 8. 当前限制

- 该工程是 Android Native 学习 Demo，Release 签名、渠道包和 CI 构建后续再补充。
- 当前 Linux 环境没有完整 Android SDK / Gradle 依赖缓存时，可能无法直接完成 APK 构建。
- Android 13+ 的通知权限需要用户在系统弹窗或设置中授权后，本地通知才会展示。
