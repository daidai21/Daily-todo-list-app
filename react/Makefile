.PHONY: help install start android typecheck build-debug build-release clean copy-debug-apk

APP_NAME ?= DailyTodoNativeAndroid
VERSION ?= v0.1.0
BUILD_TYPE ?= debug
DATE ?= $(shell date +%Y%m%d)
ANDROID_ARTIFACT_DIR ?= ../artifacts/android

help:
	@echo "可用命令："
	@echo "  make install        安装 React Native 依赖"
	@echo "  make start          启动 Metro 开发服务"
	@echo "  make android        使用 native-android 工程编译并安装到 Android 设备 / 模拟器"
	@echo "  make typecheck      执行 TypeScript 类型检查"
	@echo "  make build-debug    通过 native-android 构建 Debug APK"
	@echo "  make build-release  通过 native-android 构建 Release APK"
	@echo "  make copy-debug-apk 复制 Debug APK 到 artifacts/android"
	@echo "  make clean          清理 Android 构建产物"

install:
	npm install

start:
	npm run start

android:
	npm run android

typecheck:
	npm run typecheck

build-debug:
	npm run build:debug

build-release:
	npm run build:release

copy-debug-apk: build-debug
	mkdir -p $(ANDROID_ARTIFACT_DIR)
	cp ../native-android/app/build/outputs/apk/debug/app-debug.apk $(ANDROID_ARTIFACT_DIR)/$(APP_NAME)-$(VERSION)-$(BUILD_TYPE)-$(DATE).apk

clean:
	npm run clean
