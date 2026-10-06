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
    ["a malformed Todo", JSON.stringify({ version: 1, todos: [{ id: "a", title: 3 }] })],
    ["null", "null"],
  ])("loads an empty list when stored data is %s", (_, raw) => {
    localStorage.setItem("todos:v1", raw);
    expect(loadTodos()).toEqual([]);
  });
});
