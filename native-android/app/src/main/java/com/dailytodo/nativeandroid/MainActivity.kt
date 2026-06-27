package com.dailytodo.nativeandroid

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/** Android 主 Activity，负责承载 React Native 根组件。 */
class MainActivity : ReactActivity() {
    /** 返回 JS 侧注册的根组件名称，需要与 app.json / index.js 保持一致。 */
    override fun getMainComponentName(): String = "DailyTodoNativeAndroid"

    /** 创建 ReactActivityDelegate，用于接入 React Native 新架构配置。 */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
