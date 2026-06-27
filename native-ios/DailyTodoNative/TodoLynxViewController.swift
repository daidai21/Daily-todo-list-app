import UIKit

final class TodoLynxViewController: UIViewController {
    private var lynxView: LynxView?

    override func viewDidLoad() {
        super.viewDidLoad()

        title = "今日待办"
        view.backgroundColor = .systemBackground
        loadLynxPage()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        layoutLynxView()
    }

    private func loadLynxPage() {
        let config = LynxConfig(provider: DailyTodoLynxProvider())
        config.registerModule(TodoNativeModule.self)

        let lynxView = LynxView { builder in
            builder.config = config
            builder.screenSize = self.view.bounds.size
            builder.fontScale = 1.0
        }

        self.lynxView = lynxView
        view.addSubview(lynxView)
        layoutLynxView()

        lynxView.loadTemplate(fromURL: TodoAppConfig.bundleURL, initData: TodoAppConfig.initialData)
    }

    private func layoutLynxView() {
        guard let lynxView else {
            return
        }

        let size = view.bounds.size
        lynxView.frame = view.bounds
        lynxView.preferredLayoutWidth = size.width
        lynxView.preferredLayoutHeight = size.height
        lynxView.layoutWidthMode = .exact
        lynxView.layoutHeightMode = .exact
    }
}
