import Foundation
import UIKit
import UserNotifications

@objcMembers
final class TodoNativeModule: NSObject, LynxModule {
    static var name: String {
        "TodoNative"
    }

    static var methodLookup: [String: String] {
        [
            "postMessage": NSStringFromSelector(#selector(postMessage(_:))),
            "showToast": NSStringFromSelector(#selector(showToast(_:))),
            "scheduleReminder": NSStringFromSelector(#selector(scheduleReminder(_:))),
        ]
    }

    func postMessage(_ message: String) {
        guard let data = message.data(using: .utf8) else {
            print("[TodoNative] invalid message: \(message)")
            return
        }

        do {
            let payload = try JSONSerialization.jsonObject(with: data) as? [String: Any]
            handleBridgeMessage(payload ?? [:])
        } catch {
            print("[TodoNative] failed to parse message: \(error)")
        }
    }

    func showToast(_ text: String) {
        DispatchQueue.main.async {
            ToastPresenter.show(text)
        }
    }

    func scheduleReminder(_ text: String) {
        ReminderScheduler.schedule(message: text)
    }

    private func handleBridgeMessage(_ message: [String: Any]) {
        let action = message["action"] as? String ?? ""
        let payload = message["payload"] as? [String: Any] ?? [:]

        switch action {
        case "remind":
            let message = payload["message"] as? String ?? "你还有今日任务未完成"
            ReminderScheduler.schedule(message: message)
            showToast("已收到提醒请求")
        case "completeTodo":
            showToast("任务已完成")
        case "reopenTodo":
            showToast("任务已恢复")
        default:
            print("[TodoNative] unhandled action: \(action), payload: \(payload)")
        }
    }
}

enum ToastPresenter {
    static func show(_ text: String) {
        guard
            let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
            let window = windowScene.windows.first(where: { $0.isKeyWindow })
        else {
            return
        }

        let label = PaddingLabel()
        label.text = text
        label.textColor = .white
        label.font = .systemFont(ofSize: 14, weight: .semibold)
        label.textAlignment = .center
        label.numberOfLines = 0
        label.backgroundColor = UIColor.black.withAlphaComponent(0.78)
        label.layer.cornerRadius = 12
        label.layer.masksToBounds = true
        label.alpha = 0
        label.translatesAutoresizingMaskIntoConstraints = false

        window.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: window.centerXAnchor),
            label.bottomAnchor.constraint(equalTo: window.safeAreaLayoutGuide.bottomAnchor, constant: -32),
            label.widthAnchor.constraint(lessThanOrEqualTo: window.widthAnchor, multiplier: 0.78),
        ])

        label.layoutIfNeeded()
        label.textInsets = UIEdgeInsets(top: 10, left: 16, bottom: 10, right: 16)

        UIView.animate(withDuration: 0.2) {
            label.alpha = 1
        } completion: { _ in
            UIView.animate(withDuration: 0.2, delay: 1.6) {
                label.alpha = 0
            } completion: { _ in
                label.removeFromSuperview()
            }
        }
    }
}

enum ReminderScheduler {
    static func schedule(message: String) {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if let error = error {
                print("[TodoNative] notification permission error: \(error)")
                return
            }

            guard granted else {
                print("[TodoNative] notification permission denied")
                return
            }

            let content = UNMutableNotificationContent()
            content.title = "今日待办"
            content.body = message
            content.sound = .default

            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
            let request = UNNotificationRequest(
                identifier: "daily-todo-reminder-\(Date().timeIntervalSince1970)",
                content: content,
                trigger: trigger
            )

            center.add(request) { error in
                if let error = error {
                    print("[TodoNative] schedule notification failed: \(error)")
                }
            }
        }
    }
}

private final class PaddingLabel: UILabel {
    var textInsets = UIEdgeInsets.zero

    override func drawText(in rect: CGRect) {
        super.drawText(in: rect.inset(by: textInsets))
    }

    override var intrinsicContentSize: CGSize {
        let size = super.intrinsicContentSize
        return CGSize(
            width: size.width + textInsets.left + textInsets.right,
            height: size.height + textInsets.top + textInsets.bottom
        )
    }
}
