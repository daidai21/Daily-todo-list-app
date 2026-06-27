.PHONY: help bootstrap install generate open build clean sync-bundle

SCHEME ?= DailyTodoNative
CONFIGURATION ?= Debug
DESTINATION ?= platform=iOS Simulator,name=iPhone 16

help:
	@echo "可用命令："
	@echo "  make bootstrap   生成 Xcode 工程并安装 CocoaPods 依赖"
	@echo "  make install     安装 CocoaPods 依赖"
	@echo "  make generate    使用 XcodeGen 生成 Xcode 工程"
	@echo "  make open        打开 Xcode Workspace"
	@echo "  make build       使用 xcodebuild 构建 iOS App"
	@echo "  make sync-bundle 构建 Lynx 并同步 main.lynx.bundle 到 iOS 资源目录"
	@echo "  make clean       清理构建产物"

bootstrap: generate install

install:
	pod install

generate:
	xcodegen generate

open:
	open DailyTodoNative.xcworkspace

build: sync-bundle
	xcodebuild -workspace DailyTodoNative.xcworkspace -scheme $(SCHEME) -configuration $(CONFIGURATION) -destination '$(DESTINATION)' build

sync-bundle:
	$(MAKE) -C ../lynx build
	cp ../lynx/dist/main.lynx.bundle DailyTodoNative/Resources/main.lynx.bundle

clean:
	rm -rf build DerivedData DailyTodoNative.xcodeproj DailyTodoNative.xcworkspace Pods
