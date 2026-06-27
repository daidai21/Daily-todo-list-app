.PHONY: help test run

PORT ?= 8080
TODO_STORE_FILE ?= data/todos.json

help:
	@echo "可用命令："
	@echo "  make test  运行 Server 单元测试"
	@echo "  make run   启动 Server 项目"

test:
	go test ./...

run:
	PORT=$(PORT) TODO_STORE_FILE=$(TODO_STORE_FILE) go run ./cmd/server
