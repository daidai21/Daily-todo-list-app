package domain

import (
	"context"
	"time"
)

// Service 编排待办任务相关用例，连接接口层与领域层。
type Service struct {
	repository Repository
	now        func() time.Time
}

func NewService(repository Repository) *Service {
	return &Service{
		repository: repository,
		now:        time.Now,
	}
}

func (s *Service) Create(ctx context.Context, command CreateTodoCommand) (TodoDTO, error) {
	id, err := s.repository.NextID(ctx)
	if err != nil {
		return TodoDTO{}, err
	}

	entity, err := NewTodo(id, command.Title, s.now())
	if err != nil {
		return TodoDTO{}, err
	}

	if err := s.repository.Save(ctx, entity); err != nil {
		return TodoDTO{}, err
	}

	return toDTO(entity), nil
}

func (s *Service) List(ctx context.Context) ([]TodoDTO, error) {
	entities, err := s.repository.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	items := make([]TodoDTO, 0, len(entities))
	for _, entity := range entities {
		items = append(items, toDTO(entity))
	}
	return items, nil
}

func (s *Service) UpdateCompleted(ctx context.Context, id string, command UpdateTodoCommand) (TodoDTO, error) {
	entity, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return TodoDTO{}, err
	}

	entity.SetCompleted(command.Completed)
	if err := s.repository.Save(ctx, entity); err != nil {
		return TodoDTO{}, err
	}

	return toDTO(entity), nil
}

func (s *Service) Summary(ctx context.Context) (SummaryDTO, error) {
	entities, err := s.repository.FindAll(ctx)
	if err != nil {
		return SummaryDTO{}, err
	}

	summary := SummaryDTO{Total: len(entities)}
	for _, entity := range entities {
		if entity.Completed {
			summary.Completed++
		}
	}
	summary.Uncompleted = summary.Total - summary.Completed

	return summary, nil
}

func toDTO(entity Todo) TodoDTO {
	return TodoDTO{
		ID:        entity.ID,
		Title:     entity.Title,
		Completed: entity.Completed,
		CreatedAt: entity.CreatedAt.UnixMilli(),
	}
}
