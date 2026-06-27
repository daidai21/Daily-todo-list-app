package httpapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/daidai21/Daily-todo-list-app/server/internal/domain"
	"github.com/daidai21/Daily-todo-list-app/server/internal/infra"
)

func TestTodoAPI(t *testing.T) {
	repository, err := infra.NewTodoRepository(filepath.Join(t.TempDir(), "todos.json"))
	if err != nil {
		t.Fatalf("new repository: %v", err)
	}
	service := domain.NewService(repository)
	handler := NewTodoHandler(service)
	server := httptest.NewServer(WithCORS(handler.Routes()))
	defer server.Close()

	createBody := bytes.NewBufferString(`{"title":"学习 Go Server"}`)
	createResp, err := http.Post(server.URL+"/api/todos", "application/json", createBody)
	if err != nil {
		t.Fatalf("create todo: %v", err)
	}
	defer createResp.Body.Close()

	if createResp.StatusCode != http.StatusCreated {
		t.Fatalf("expected status 201, got %d", createResp.StatusCode)
	}

	var created domain.TodoDTO
	if err := json.NewDecoder(createResp.Body).Decode(&created); err != nil {
		t.Fatalf("decode created todo: %v", err)
	}
	if created.ID != "todo-1" || created.Title != "学习 Go Server" || created.Completed {
		t.Fatalf("unexpected created todo: %+v", created)
	}

	patchBody := bytes.NewBufferString(`{"completed":true}`)
	patchReq, err := http.NewRequest(http.MethodPatch, server.URL+"/api/todos/"+created.ID, patchBody)
	if err != nil {
		t.Fatalf("new patch request: %v", err)
	}
	patchReq.Header.Set("Content-Type", "application/json")

	patchResp, err := http.DefaultClient.Do(patchReq)
	if err != nil {
		t.Fatalf("patch todo: %v", err)
	}
	defer patchResp.Body.Close()
	if patchResp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", patchResp.StatusCode)
	}

	summaryResp, err := http.Get(server.URL + "/api/todos/summary")
	if err != nil {
		t.Fatalf("get summary: %v", err)
	}
	defer summaryResp.Body.Close()

	var summary domain.SummaryDTO
	if err := json.NewDecoder(summaryResp.Body).Decode(&summary); err != nil {
		t.Fatalf("decode summary: %v", err)
	}
	if summary.Total != 1 || summary.Completed != 1 || summary.Uncompleted != 0 {
		t.Fatalf("unexpected summary: %+v", summary)
	}
}
