package domain

import (
	"strings"
	"time"
)

// Todo 是今日待办领域实体，封装任务的核心状态与业务行为。
type Todo struct {
	ID        string
	Title     string
	Completed bool
	CreatedAt time.Time
}

// NewTodo 创建一个未完成的待办任务。
func NewTodo(id string, title string, createdAt time.Time) (Todo, error) {
	title = strings.TrimSpace(title)
	if id == "" {
		return Todo{}, ErrEmptyID
	}
	if title == "" {
		return Todo{}, ErrEmptyTitle
	}

	return Todo{
		ID:        id,
		Title:     title,
		Completed: false,
		CreatedAt: createdAt,
	}, nil
}

// SetCompleted 标记任务完成状态。
func (t *Todo) SetCompleted(completed bool) {
	t.Completed = completed
}
