import { useState, type FormEvent } from "react";
import { loadTodos, saveTodos } from "./storage";
import { cleanTitle, type Todo } from "./todo";

export function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [newTitle, setNewTitle] = useState("");

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
          <li key={todo.id} className="todo">
            <span className="todo-title" data-testid="todo-title">
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
