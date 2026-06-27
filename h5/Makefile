.PHONY: help install run typecheck lint format format-check build check

PORT ?= 5173

help:
	@echo "可用命令："
	@echo "  make install  安装 H5 依赖"
	@echo "  make run      启动 React H5 开发服务"
	@echo "  make typecheck 运行 TypeScript 类型检查"
	@echo "  make lint     运行 ESLint 代码检查"
	@echo "  make format   使用 Prettier 格式化代码"
	@echo "  make format-check 检查 Prettier 格式"
	@echo "  make build    构建 React H5 产物"
	@echo "  make check    运行类型检查、ESLint、Prettier 检查和构建"

install:
	npm install

node_modules: package.json package-lock.json
	npm install

run: node_modules
	npm run dev -- --host 0.0.0.0 --port $(PORT)

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

check: typecheck lint format-check build
