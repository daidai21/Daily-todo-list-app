package infra

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"

	"github.com/daidai21/Daily-todo-list-app/server/internal/domain"
)

// TodoRepository 是基于本地 JSON 文件的仓储实现。
//
// 仓储不再额外维护内存 Map 作为数据源：
// - 每次读操作都从 JSON 文件读取最新数据；
// - 每次写操作都直接改写本地 JSON 文件。
type TodoRepository struct {
	mu   sync.RWMutex
	path string
}

type storeFile struct {
	NextID int64       `json:"nextId"`
	Todos  []storeTodo `json:"todos"`
}

type storeTodo struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
	CreatedAt int64  `json:"createdAt"`
}

func NewTodoRepository(path string) (*TodoRepository, error) {
	if path == "" {
		return nil, fmt.Errorf("json store path cannot be empty")
	}

	repository := &TodoRepository{path: path}
	if err := repository.ensureStoreFile(); err != nil {
		return nil, err
	}

	return repository, nil
}

func (r *TodoRepository) NextID(ctx context.Context) (string, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	file, err := r.readFileLocked()
	if err != nil {
		return "", err
	}

	file.NextID++
	if err := r.writeFileLocked(file); err != nil {
		return "", err
	}

	return fmt.Sprintf("todo-%d", file.NextID), nil
}

func (r *TodoRepository) Save(ctx context.Context, entity domain.Todo) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	file, err := r.readFileLocked()
	if err != nil {
		return err
	}

	upsertTodo(&file, entity)
	return r.writeFileLocked(file)
}

func (r *TodoRepository) FindAll(ctx context.Context) ([]domain.Todo, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	file, err := r.readFileLocked()
	if err != nil {
		return nil, err
	}

	items := make([]domain.Todo, 0, len(file.Todos))
	for _, item := range file.Todos {
		items = append(items, toDomainTodo(item))
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].CreatedAt.Before(items[j].CreatedAt)
	})

	return items, nil
}

func (r *TodoRepository) FindByID(ctx context.Context, id string) (domain.Todo, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	file, err := r.readFileLocked()
	if err != nil {
		return domain.Todo{}, err
	}

	for _, item := range file.Todos {
		if item.ID == id {
			return toDomainTodo(item), nil
		}
	}

	return domain.Todo{}, domain.ErrNotFound
}

func (r *TodoRepository) ensureStoreFile() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if err := os.MkdirAll(filepath.Dir(r.path), 0o755); err != nil {
		return fmt.Errorf("create json store directory: %w", err)
	}

	if _, err := os.Stat(r.path); err != nil {
		if os.IsNotExist(err) {
			return r.writeFileLocked(storeFile{Todos: []storeTodo{}})
		}
		return fmt.Errorf("stat json store file: %w", err)
	}

	return nil
}

func (r *TodoRepository) readFileLocked() (storeFile, error) {
	data, err := os.ReadFile(r.path)
	if err != nil {
		return storeFile{}, fmt.Errorf("read json store file: %w", err)
	}

	if len(data) == 0 {
		return storeFile{Todos: []storeTodo{}}, nil
	}

	var file storeFile
	if err := json.Unmarshal(data, &file); err != nil {
		return storeFile{}, fmt.Errorf("decode json store file: %w", err)
	}
	if file.Todos == nil {
		file.Todos = []storeTodo{}
	}

	return file, nil
}

func (r *TodoRepository) writeFileLocked(file storeFile) error {
	sort.Slice(file.Todos, func(i, j int) bool {
		return file.Todos[i].CreatedAt < file.Todos[j].CreatedAt
	})

	data, err := json.MarshalIndent(file, "", "  ")
	if err != nil {
		return fmt.Errorf("encode json store file: %w", err)
	}
	data = append(data, '\n')

	if err := os.WriteFile(r.path, data, 0o644); err != nil {
		return fmt.Errorf("write json store file: %w", err)
	}

	return nil
}

func upsertTodo(file *storeFile, entity domain.Todo) {
	item := toStoreTodo(entity)
	for index, existing := range file.Todos {
		if existing.ID == entity.ID {
			file.Todos[index] = item
			return
		}
	}

	file.Todos = append(file.Todos, item)
}

func toDomainTodo(item storeTodo) domain.Todo {
	return domain.Todo{
		ID:        item.ID,
		Title:     item.Title,
		Completed: item.Completed,
		CreatedAt: time.UnixMilli(item.CreatedAt),
	}
}

func toStoreTodo(entity domain.Todo) storeTodo {
	return storeTodo{
		ID:        entity.ID,
		Title:     entity.Title,
		Completed: entity.Completed,
		CreatedAt: entity.CreatedAt.UnixMilli(),
	}
}
