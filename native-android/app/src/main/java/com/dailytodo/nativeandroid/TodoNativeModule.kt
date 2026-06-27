package com.dailytodo.nativeandroid

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject

/** TodoNativeModule 向 React Native JS 层暴露 Toast、提醒通知和震动能力。 */
class TodoNativeModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    /** Native Module 名称，需要与 JS 侧 NativeModules.TodoNative 保持一致。 */
    override fun getName(): String = "TodoNative"

    /** 接收 JS 侧传来的 JSON 字符串消息，并按 action 分发到不同 Native 能力。 */
    @ReactMethod
    fun postMessage(message: String) {
        try {
            val json = JSONObject(message)
            val action = json.optString("action")
            val payload = json.optJSONObject("payload") ?: JSONObject()

            when (action) {
                "remind" -> {
                    val text = payload.optString("message", "你还有今日任务未完成")
                    scheduleReminder(text)
                    showToast("已收到提醒请求")
                }

                "completeTodo" -> showToast("任务已完成")
                "reopenTodo" -> showToast("任务已恢复")
                "vibrate" -> vibrate()
                else -> showToast("未处理的动作：$action")
            }
        } catch (error: Exception) {
            showToast("Native 消息解析失败：${error.message}")
        }
    }

    /** 展示 Android Toast。 */
    @ReactMethod
    fun showToast(text: String) {
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(reactContext, text, Toast.LENGTH_SHORT).show()
        }
    }

    /** 发送一条简单本地通知；Android 13+ 需要用户授予通知权限。 */
    @ReactMethod
    fun scheduleReminder(text: String) {
        ensureNotificationChannel()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ActivityCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.POST_NOTIFICATIONS,
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            currentActivity?.requestPermissions(
                arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                NOTIFICATION_PERMISSION_REQUEST_CODE,
            )
            showToast("请允许通知权限后再次点击提醒")
            return
        }

        val notification = NotificationCompat.Builder(reactContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("今日待办")
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        NotificationManagerCompat.from(reactContext).notify(
            System.currentTimeMillis().toInt(),
            notification,
        )
    }

    /** 触发一次轻量震动反馈。 */
    @ReactMethod
    fun vibrate() {
        val vibrator = reactContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(80, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(80)
        }
    }

    /** 创建 Android 8.0+ 必需的通知 Channel。 */
    private fun ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val channel = NotificationChannel(
            CHANNEL_ID,
            "今日待办提醒",
            NotificationManager.IMPORTANCE_DEFAULT,
        )
        val manager = reactContext.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    private companion object {
        /** Android 通知 Channel ID。 */
        private const val CHANNEL_ID = "daily_todo_reminder"

        /** Android 13+ 通知权限请求码。 */
        private const val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001
    }
}
