.PHONY: help install run preview typecheck lint format format-check build check

-include .env

export LYNX_API_BASE_URL
export LYNX_PORT

help:
	@echo "可用命令："
	@echo "  make install      安装 Lynx 依赖"
	@echo "  make run          启动 Lynx 开发服务"
	@echo "  make preview      预览 Lynx 构建产物"
	@echo "  make typecheck    运行 TypeScript 类型检查"
	@echo "  make lint         运行 ESLint 代码检查"
	@echo "  make format       使用 Prettier 格式化代码"
	@echo "  make format-check 检查 Prettier 格式"
	@echo "  make build        构建 Lynx 产物"
	@echo "  make check        运行格式检查、类型检查、ESLint 和构建"
	@echo ""
	@echo "环境变量来自 .env："
	@echo "  LYNX_API_BASE_URL Go Server 地址"
	@echo "  LYNX_PORT         Lynx 开发服务端口"

install:
	npm install

node_modules: package.json package-lock.json
	npm install

run: node_modules
	npm run dev

preview: node_modules
	npm run preview

typecheck: node_modules
	npm run typecheck

lint: node_modules
	npm run lint

format: node_modules
	npm run format

format-check: node_modules
	npm run format:check

build: node_modules
	npm run build

check: format-check typecheck lint build
