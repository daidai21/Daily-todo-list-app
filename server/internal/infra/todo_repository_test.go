package infra

import (
	"context"
	"path/filepath"
	"testing"
	"time"

	"github.com/daidai21/Daily-todo-list-app/server/internal/domain"
)

func TestTodoRepositoryPersistsTodosToJSONFile(t *testing.T) {
	ctx := context.Background()
	path := filepath.Join(t.TempDir(), "todos.json")

	repository, err := NewTodoRepository(path)
	if err != nil {
		t.Fatalf("new repository: %v", err)
	}

	id, err := repository.NextID(ctx)
	if err != nil {
		t.Fatalf("next id: %v", err)
	}

	entity, err := domain.NewTodo(id, "学习 JSON 文件存储", time.UnixMilli(1782537600000))
	if err != nil {
		t.Fatalf("new todo: %v", err)
	}
	entity.SetCompleted(true)

	if err := repository.Save(ctx, entity); err != nil {
		t.Fatalf("save todo: %v", err)
	}

	reloaded, err := NewTodoRepository(path)
	if err != nil {
		t.Fatalf("reload repository: %v", err)
	}

	items, err := reloaded.FindAll(ctx)
	if err != nil {
		t.Fatalf("find all: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 todo, got %d", len(items))
	}
	if items[0].ID != "todo-1" || items[0].Title != "学习 JSON 文件存储" || !items[0].Completed {
		t.Fatalf("unexpected todo: %+v", items[0])
	}

	nextID, err := reloaded.NextID(ctx)
	if err != nil {
		t.Fatalf("next id after reload: %v", err)
	}
	if nextID != "todo-2" {
		t.Fatalf("expected next id todo-2, got %s", nextID)
	}
}
