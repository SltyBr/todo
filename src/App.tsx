import { useState, type FormEvent } from "react";
import { loadTodos, saveTodos } from "./storage";
import { TodoItem } from "./TodoItem";
import { cleanTitle, type Todo } from "./todo";

export function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [newTitle, setNewTitle] = useState("");
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

  function handleToggle(id: string) {
    updateTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  }

  function handleSave(id: string, changes: { title: string; description: string }) {
    updateTodos(todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo)));
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
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => handleToggle(todo.id)}
            onSave={(changes) => handleSave(todo.id, changes)}
          />
        ))}
      </ul>
      {todos.length > 0 && (
        <footer className="footer">
          <span>
            {activeCount} Active {activeCount === 1 ? "Todo" : "Todos"}
          </span>
        </footer>
      )}
    </main>
  );
}
