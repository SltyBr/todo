import { useState, type FormEvent } from "react";
import { FILTERS, matchesFilter, useFilter } from "./filter";
import { loadTodos, saveTodos } from "./storage";
import { TodoRow } from "./TodoRow";
import { cleanTitle, type Todo } from "./todo";

export function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [newTitle, setNewTitle] = useState("");
  const filter = useFilter();
  const visibleTodos = todos.filter((todo) => matchesFilter(todo, filter));
  const activeCount = todos.filter((todo) => !todo.completed).length;

  function updateTodos(next: Todo[]) {
    setTodos(next);
    saveTodos(next);
  }

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    const title = cleanTitle(newTitle);
    if (title === null) return;
    updateTodos([...todos, { id: crypto.randomUUID(), title, description: "", completed: false }]);
    setNewTitle("");
  }

  function updateTodo(id: string, changes: Partial<Omit<Todo, "id">>) {
    updateTodos(todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo)));
  }

  function handleDelete(id: string) {
    updateTodos(todos.filter((todo) => todo.id !== id));
  }

  function handleClearCompleted() {
    updateTodos(todos.filter((todo) => !todo.completed));
  }

  return (
    <main className="app">
      <h1>Todos</h1>
      <form className="new-todo" onSubmit={handleAdd}>
        <input
          aria-label="New Todo"
          placeholder="What needs doing?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <ul className="todo-list" aria-label="Todos">
        {visibleTodos.map((todo) => (
          <TodoRow
            key={todo.id}
            todo={todo}
            onToggle={() => updateTodo(todo.id, { completed: !todo.completed })}
            onSave={(changes) => updateTodo(todo.id, changes)}
            onDelete={() => handleDelete(todo.id)}
          />
        ))}
      </ul>
      {todos.length > 0 && (
        <footer className="footer">
          <span>
            {activeCount} Active {activeCount === 1 ? "Todo" : "Todos"}
          </span>
          <nav className="filters" aria-label="Filter">
            {FILTERS.map((f) => (
              <a key={f.filter} href={f.hash} aria-current={f.filter === filter ? "page" : undefined}>
                {f.label}
              </a>
            ))}
          </nav>
          {activeCount < todos.length && (
            <button type="button" onClick={handleClearCompleted}>
              Clear completed
            </button>
          )}
        </footer>
      )}
    </main>
  );
}
