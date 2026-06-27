package domain

// TodoDTO 是对外输出的任务数据结构。
type TodoDTO struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
	CreatedAt int64  `json:"createdAt"`
}

// CreateTodoCommand 表示创建任务用例的输入。
type CreateTodoCommand struct {
	Title string `json:"title"`
}

// UpdateTodoCommand 表示更新任务用例的输入。
type UpdateTodoCommand struct {
	Completed bool `json:"completed"`
}

// SummaryDTO 是今日任务统计信息。
type SummaryDTO struct {
	Total       int `json:"total"`
	Completed   int `json:"completed"`
	Uncompleted int `json:"uncompleted"`
}
