package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/daidai21/Daily-todo-list-app/server/internal/domain"
	"github.com/daidai21/Daily-todo-list-app/server/internal/httpapi"
	"github.com/daidai21/Daily-todo-list-app/server/internal/infra"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	storeFile := os.Getenv("TODO_STORE_FILE")
	if storeFile == "" {
		storeFile = "data/todos.json"
	}

	repository, err := infra.NewTodoRepository(storeFile)
	if err != nil {
		log.Fatalf("init todo repository: %v", err)
	}
	service := domain.NewService(repository)
	handler := httpapi.NewTodoHandler(service)

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           httpapi.WithCORS(handler.Routes()),
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("daily todo server is running at http://localhost:%s", port)
	log.Printf("todo json store file: %s", storeFile)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
