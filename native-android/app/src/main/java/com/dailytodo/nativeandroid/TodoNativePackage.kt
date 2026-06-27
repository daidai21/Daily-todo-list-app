package com.dailytodo.nativeandroid

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/** React Native 包声明，用于把 TodoNativeModule 注册给 JS 层使用。 */
class TodoNativePackage : ReactPackage {
    /** 创建 Native Module 列表。 */
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(TodoNativeModule(reactContext))

    /** 当前 Demo 不提供自定义原生 View，因此返回空列表。 */
    override fun createViewManagers(
        reactContext: ReactApplicationContext,
    ): List<ViewManager<*, *>> = emptyList()
}
