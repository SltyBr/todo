import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

function todoTitles() {
  const list = screen.queryByRole("list", { name: "Todos" });
  if (!list) return [];
  return within(list)
    .queryAllByRole("listitem")
    .map((item) => within(item).getByTestId("todo-title").textContent);
}

async function addTodo(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.type(screen.getByRole("textbox", { name: "New Todo" }), `${title}{Enter}`);
}

describe("App", () => {
  it("shows the app heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Todos" })).toBeInTheDocument();
  });

  it("adds a Todo from its Title", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTodo(user, "Buy milk");
    expect(todoTitles()).toEqual(["Buy milk"]);
    expect(screen.getByRole("textbox", { name: "New Todo" })).toHaveValue("");
  });

  it("rejects an empty or whitespace-only Title", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTodo(user, "   ");
    await user.type(screen.getByRole("textbox", { name: "New Todo" }), "{Enter}");
    expect(todoTitles()).toEqual([]);
  });

  it("trims the Title and lists Todos in the order they were added", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTodo(user, "  First  ");
    await addTodo(user, "Second");
    expect(todoTitles()).toEqual(["First", "Second"]);
  });

  it("keeps added Todos after a reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await addTodo(user, "Buy milk");
    unmount();
    render(<App />);
    expect(todoTitles()).toEqual(["Buy milk"]);
  });
});
