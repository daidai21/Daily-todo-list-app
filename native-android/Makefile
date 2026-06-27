.PHONY: help build-debug build-release clean copy-debug-apk

APP_NAME ?= DailyTodoNativeAndroid
VERSION ?= v0.1.0
BUILD_TYPE ?= debug
DATE ?= $(shell date +%Y%m%d)
ANDROID_ARTIFACT_DIR ?= ../artifacts/android

help:
	@echo "可用命令："
	@echo "  make build-debug    构建 Debug APK"
	@echo "  make build-release  构建 Release APK"
	@echo "  make copy-debug-apk 复制 Debug APK 到 artifacts/android"
	@echo "  make clean          清理 Android 构建产物"

build-debug:
	./gradlew assembleDebug

build-release:
	./gradlew assembleRelease

copy-debug-apk: build-debug
	mkdir -p $(ANDROID_ARTIFACT_DIR)
	cp app/build/outputs/apk/debug/app-debug.apk $(ANDROID_ARTIFACT_DIR)/$(APP_NAME)-$(VERSION)-$(BUILD_TYPE)-$(DATE).apk

clean:
	./gradlew clean
