import { describe, expect, it } from "vitest";
import { loadTodos, saveTodos } from "./storage";

describe("storage", () => {
  it("round-trips Todos through the todos:v1 envelope", () => {
    const todos = [{ id: "a", title: "Buy milk", description: "", completed: false }];
    saveTodos(todos);
    expect(JSON.parse(localStorage.getItem("todos:v1")!)).toEqual({ version: 1, todos });
    expect(loadTodos()).toEqual(todos);
  });

  it("loads an empty list when nothing is stored", () => {
    expect(loadTodos()).toEqual([]);
  });

  it.each([
    ["invalid JSON", "{not json"],
    ["a different version", JSON.stringify({ version: 2, todos: [{ id: "a", title: "x", description: "", completed: false }] })],
    ["todos that are not an array", JSON.stringify({ version: 1, todos: "nope" })],
    ["null", "null"],
  ])("loads an empty list when stored data is %s", (_, raw) => {
    localStorage.setItem("todos:v1", raw);
    expect(loadTodos()).toEqual([]);
  });

  it("keeps the valid Todos when some stored Todos are malformed", () => {
    const good = { id: "b", title: "Buy milk", description: "", completed: true };
    localStorage.setItem(
      "todos:v1",
      JSON.stringify({ version: 1, todos: [{ id: "a", title: 3 }, good, null] }),
    );
    expect(loadTodos()).toEqual([good]);
  });
});
