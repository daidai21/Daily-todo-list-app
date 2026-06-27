import Foundation

final class DailyTodoLynxProvider: NSObject, LynxTemplateProvider {
    func loadTemplate(
        withUrl url: String!,
        onComplete callback: LynxTemplateLoadBlock!
    ) {
        guard let url else {
            callback(nil, makeError(message: "Lynx template url is empty"))
            return
        }

        if let remoteURL = URL(string: url), remoteURL.scheme?.hasPrefix("http") == true {
            loadRemoteTemplate(from: remoteURL, callback: callback)
            return
        }

        loadLocalTemplate(named: url, callback: callback)
    }

    private func loadLocalTemplate(named name: String, callback: LynxTemplateLoadBlock!) {
        let resourceName = name.replacingOccurrences(of: ".bundle", with: "")

        guard let path = Bundle.main.path(forResource: resourceName, ofType: "bundle") else {
            callback(nil, makeError(message: "Cannot find local Lynx bundle: \(resourceName).bundle"))
            return
        }

        do {
            let data = try Data(contentsOf: URL(fileURLWithPath: path))
            callback(data, nil)
        } catch {
            callback(nil, error)
        }
    }

    private func loadRemoteTemplate(from url: URL, callback: LynxTemplateLoadBlock!) {
        URLSession.shared.dataTask(with: url) { data, _, error in
            if let error {
                callback(nil, error)
                return
            }

            guard let data else {
                callback(nil, self.makeError(message: "Remote Lynx bundle response is empty"))
                return
            }

            callback(data, nil)
        }.resume()
    }

    private func makeError(message: String) -> NSError {
        NSError(
            domain: "com.dailytodo.native.lynx",
            code: 400,
            userInfo: [NSLocalizedDescriptionKey: message]
        )
    }
}
