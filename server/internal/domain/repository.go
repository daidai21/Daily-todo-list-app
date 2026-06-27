package domain

import "context"

// Repository 定义待办任务仓储端口，由 infra 层提供具体实现。
type Repository interface {
	NextID(ctx context.Context) (string, error)
	Save(ctx context.Context, todo Todo) error
	FindAll(ctx context.Context) ([]Todo, error)
	FindByID(ctx context.Context, id string) (Todo, error)
}
