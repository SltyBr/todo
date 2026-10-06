import { useState, type FormEvent } from "react";
import { cleanTitle, type Todo } from "./todo";

type Props = {
  todo: Todo;
  onToggle: () => void;
  onSave: (changes: { title: string; description: string }) => void;
};

export function TodoItem({ todo, onToggle, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setTitle(todo.title);
    setDescription(todo.description);
    setError(null);
    setEditing(true);
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    const cleaned = cleanTitle(title);
    if (cleaned === null) {
      setError("A Todo needs a Title");
      return;
    }
    onSave({ title: cleaned, description: description.trim() });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="todo editing">
        <form className="edit-todo" onSubmit={handleSave}>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Description
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="actions">
            <button type="submit" className="primary">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={todo.completed ? "todo completed" : "todo"}>
      <input
        type="checkbox"
        aria-label={`Completed: ${todo.title}`}
        checked={todo.completed}
        onChange={onToggle}
      />
      <div className="todo-text">
        <span className="todo-title" data-testid="todo-title">
          {todo.title}
        </span>
        {todo.description && (
          <p className="todo-description" data-testid="todo-description">
            {todo.description}
          </p>
        )}
      </div>
      <button type="button" aria-label={`Edit: ${todo.title}`} onClick={startEditing}>
        Edit
      </button>
    </li>
  );
}
