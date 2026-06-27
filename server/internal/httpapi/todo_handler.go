package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/daidai21/Daily-todo-list-app/server/internal/domain"
)

type TodoHandler struct {
	service *domain.Service
}

func NewTodoHandler(service *domain.Service) *TodoHandler {
	return &TodoHandler{service: service}
}

func (h *TodoHandler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", h.handleHealthz)
	mux.HandleFunc("/api/todos", h.handleTodos)
	mux.HandleFunc("/api/todos/", h.handleTodoByID)
	return mux
}

func (h *TodoHandler) handleHealthz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *TodoHandler) handleTodos(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listTodos(w, r)
	case http.MethodPost:
		h.createTodo(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (h *TodoHandler) handleTodoByID(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/todos/")
	if path == "summary" {
		h.handleSummary(w, r)
		return
	}

	id := strings.Trim(path, "/")
	if id == "" || strings.Contains(id, "/") {
		writeError(w, http.StatusNotFound, "not found")
		return
	}

	if r.Method != http.MethodPatch {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var command domain.UpdateTodoCommand
	if err := json.NewDecoder(r.Body).Decode(&command); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	item, err := h.service.UpdateCompleted(r.Context(), id, command)
	if err != nil {
		h.writeDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, item)
}

func (h *TodoHandler) listTodos(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.List(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list todos")
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *TodoHandler) createTodo(w http.ResponseWriter, r *http.Request) {
	var command domain.CreateTodoCommand
	if err := json.NewDecoder(r.Body).Decode(&command); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	item, err := h.service.Create(r.Context(), command)
	if err != nil {
		h.writeDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, item)
}

func (h *TodoHandler) handleSummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	summary, err := h.service.Summary(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get todo summary")
		return
	}

	writeJSON(w, http.StatusOK, summary)
}

func (h *TodoHandler) writeDomainError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrEmptyTitle):
		writeError(w, http.StatusBadRequest, "todo title cannot be empty")
	case errors.Is(err, domain.ErrNotFound):
		writeError(w, http.StatusNotFound, "todo not found")
	default:
		writeError(w, http.StatusInternalServerError, "internal server error")
	}
}
