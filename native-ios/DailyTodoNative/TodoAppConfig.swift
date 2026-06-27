import Foundation

enum TodoAppConfig {
    static var bundleURL: String {
        stringValue(for: "LynxBundleURL", fallback: "main.lynx")
    }

    static var apiBaseURL: String {
        stringValue(for: "TodoAPIBaseURL", fallback: "http://127.0.0.1:8080")
    }

    static var initialData: [String: Any] {
        [
            "apiBase": apiBaseURL,
            "source": "native-ios",
        ]
    }

    private static func stringValue(for key: String, fallback: String) -> String {
        Bundle.main.object(forInfoDictionaryKey: key) as? String ?? fallback
    }
}
