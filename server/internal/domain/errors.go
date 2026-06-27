package domain

import "errors"

var (
	ErrEmptyID    = errors.New("todo id cannot be empty")
	ErrEmptyTitle = errors.New("todo title cannot be empty")
	ErrNotFound   = errors.New("todo not found")
)
