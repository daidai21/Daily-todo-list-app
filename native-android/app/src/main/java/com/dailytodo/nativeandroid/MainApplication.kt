package com.dailytodo.nativeandroid

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

/** Android Application 入口，负责初始化 React Native 和注册 Native Module。 */
class MainApplication : Application(), ReactApplication {
    /** React Native 宿主对象，提供包列表、入口文件和开发模式配置。 */
    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            /** 返回自动链接包和手动注册的 TodoNativePackage。 */
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    add(TodoNativePackage())
                }

            /** 返回 Metro / Bundle 中的 JS 入口模块名。 */
            override fun getJSMainModuleName(): String = "index"

            /** Debug 包开启开发者支持，Release 包关闭。 */
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            /** 是否启用 React Native 新架构。 */
            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

            /** 是否启用 Hermes JS 引擎。 */
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    /** ReactHost 是新架构下供系统获取 RN 宿主能力的入口。 */
    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    /** 应用启动时初始化 SoLoader，并在新架构开启时加载入口。 */
    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            load()
        }
    }
}
