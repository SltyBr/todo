import type { Todo } from "./todo";

// Versioned so a later move to a backend is a migration (ADR-0001).
const KEY = "todos:v1";

export function loadTodos(): Todo[] {
  try {
    const envelope: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (!isEnvelope(envelope)) return [];
    // Skip only the malformed Todos so one bad record can't wipe the rest.
    return envelope.todos.filter(isTodo);
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  localStorage.setItem(KEY, JSON.stringify({ version: 1, todos }));
}

function isEnvelope(value: unknown): value is { version: 1; todos: unknown[] } {
  return isRecord(value) && value.version === 1 && Array.isArray(value.todos);
}

function isTodo(value: unknown): value is Todo {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.completed === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
