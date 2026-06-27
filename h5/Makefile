.PHONY: help install run build

PORT ?= 5173

help:
	@echo "可用命令："
	@echo "  make install  安装 H5 依赖"
	@echo "  make run      启动 React H5 开发服务"
	@echo "  make build    构建 React H5 产物"

install:
	npm install

run:
	npm run dev -- --host 0.0.0.0 --port $(PORT)

build:
	npm run build
