import { render, screen, waitFor, within } from "@testing-library/react";
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

function todoItem(title: string) {
  const list = screen.getByRole("list", { name: "Todos" });
  const item = within(list)
    .getAllByRole("listitem")
    .find((li) => within(li).getByTestId("todo-title").textContent === title);
  if (!item) throw new Error(`No Todo titled "${title}"`);
  return item;
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

  describe("Completed", () => {
    it("marks a Todo Completed and Active again", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addTodo(user, "Buy milk");
      const toggle = screen.getByRole("checkbox", { name: "Completed: Buy milk" });
      expect(toggle).not.toBeChecked();

      await user.click(toggle);
      expect(toggle).toBeChecked();
      expect(todoItem("Buy milk")).toHaveClass("completed");

      await user.click(toggle);
      expect(toggle).not.toBeChecked();
      expect(todoItem("Buy milk")).not.toHaveClass("completed");
    });

    it("keeps the Completed state after a reload", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      await addTodo(user, "Buy milk");
      await user.click(screen.getByRole("checkbox", { name: "Completed: Buy milk" }));
      unmount();
      render(<App />);
      expect(screen.getByRole("checkbox", { name: "Completed: Buy milk" })).toBeChecked();
    });

    it("counts the Active Todos", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addTodo(user, "One");
      expect(screen.getByText("1 Active Todo")).toBeInTheDocument();
      await addTodo(user, "Two");
      await addTodo(user, "Three");
      expect(screen.getByText("3 Active Todos")).toBeInTheDocument();
      await user.click(screen.getByRole("checkbox", { name: "Completed: Two" }));
      expect(screen.getByText("2 Active Todos")).toBeInTheDocument();
    });
  });

  describe("Filter", () => {
    async function renderWithTodos() {
      const user = userEvent.setup();
      const result = render(<App />);
      await addTodo(user, "Walk dog");
      await addTodo(user, "Pay rent");
      await user.click(screen.getByRole("checkbox", { name: "Completed: Pay rent" }));
      return { user, ...result };
    }

    function filterLink(name: string) {
      return within(screen.getByRole("navigation", { name: "Filter" })).getByRole("link", { name });
    }

    it("shows only the Todos matching the chosen Filter and puts it in the URL hash", async () => {
      const { user } = await renderWithTodos();
      expect(filterLink("All")).toHaveAttribute("aria-current", "page");

      await user.click(filterLink("Active"));
      expect(window.location.hash).toBe("#/active");
      expect(todoTitles()).toEqual(["Walk dog"]);
      expect(filterLink("Active")).toHaveAttribute("aria-current", "page");
      expect(filterLink("All")).not.toHaveAttribute("aria-current");

      await user.click(filterLink("Completed"));
      expect(window.location.hash).toBe("#/completed");
      expect(todoTitles()).toEqual(["Pay rent"]);

      await user.click(filterLink("All"));
      expect(window.location.hash).toBe("#/");
      expect(todoTitles()).toEqual(["Walk dog", "Pay rent"]);
    });

    it("restores the Filter from the URL hash on load", async () => {
      const { unmount } = await renderWithTodos();
      unmount();
      window.location.hash = "#/completed";
      render(<App />);
      expect(todoTitles()).toEqual(["Pay rent"]);
      expect(filterLink("Completed")).toHaveAttribute("aria-current", "page");
    });

    it("falls back to All for an unknown hash", async () => {
      const { unmount } = await renderWithTodos();
      unmount();
      window.location.hash = "#/nope";
      render(<App />);
      expect(todoTitles()).toEqual(["Walk dog", "Pay rent"]);
      expect(filterLink("All")).toHaveAttribute("aria-current", "page");
    });

    it("follows browser back and forward", async () => {
      const { user } = await renderWithTodos();
      await user.click(filterLink("Active"));
      await user.click(filterLink("Completed"));

      window.history.back();
      await waitFor(() => expect(todoTitles()).toEqual(["Walk dog"]));
      window.history.forward();
      await waitFor(() => expect(todoTitles()).toEqual(["Pay rent"]));
    });

    it("hides a Todo from the Active Filter once it is marked Completed", async () => {
      const { user } = await renderWithTodos();
      await user.click(filterLink("Active"));
      await user.click(screen.getByRole("checkbox", { name: "Completed: Walk dog" }));
      expect(todoTitles()).toEqual([]);
      expect(screen.getByText("0 Active Todos")).toBeInTheDocument();
    });
  });

  describe("Clear completed", () => {
    it("is only offered when at least one Todo is Completed", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addTodo(user, "Walk dog");
      expect(screen.queryByRole("button", { name: "Clear completed" })).not.toBeInTheDocument();
      await user.click(screen.getByRole("checkbox", { name: "Completed: Walk dog" }));
      expect(screen.getByRole("button", { name: "Clear completed" })).toBeInTheDocument();
    });

    it("removes every Completed Todo, keeps the Active ones, and persists", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      await addTodo(user, "Walk dog");
      await addTodo(user, "Pay rent");
      await addTodo(user, "Call mum");
      await user.click(screen.getByRole("checkbox", { name: "Completed: Pay rent" }));
      await user.click(screen.getByRole("checkbox", { name: "Completed: Call mum" }));

      await user.click(screen.getByRole("button", { name: "Clear completed" }));
      expect(todoTitles()).toEqual(["Walk dog"]);
      expect(screen.queryByRole("button", { name: "Clear completed" })).not.toBeInTheDocument();
      unmount();

      render(<App />);
      expect(todoTitles()).toEqual(["Walk dog"]);
    });
  });

  describe("deleting", () => {
    it("removes a Todo, updates the Active count, and stays removed after a reload", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      await addTodo(user, "Keep");
      await addTodo(user, "Remove");
      await user.click(screen.getByRole("button", { name: "Delete: Remove" }));
      expect(todoTitles()).toEqual(["Keep"]);
      expect(screen.getByText("1 Active Todo")).toBeInTheDocument();
      unmount();

      render(<App />);
      expect(todoTitles()).toEqual(["Keep"]);
    });
  });

  describe("editing", () => {
    it("changes a Todo's Title", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addTodo(user, "Buy milk");
      await user.click(screen.getByRole("button", { name: "Edit: Buy milk" }));
      const title = screen.getByRole("textbox", { name: "Title" });
      await user.clear(title);
      await user.type(title, "Buy oat milk");
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(todoTitles()).toEqual(["Buy oat milk"]);
    });

    it("rejects saving an empty Title and keeps the previous one", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addTodo(user, "Buy milk");
      await user.click(screen.getByRole("button", { name: "Edit: Buy milk" }));
      await user.clear(screen.getByRole("textbox", { name: "Title" }));
      await user.type(screen.getByRole("textbox", { name: "Title" }), "   ");
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(screen.getByRole("alert")).toHaveTextContent("A Todo needs a Title");

      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(todoTitles()).toEqual(["Buy milk"]);
    });

    it("adds a multi-line Description that keeps its line breaks after a reload", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      await addTodo(user, "Pack");
      await user.click(screen.getByRole("button", { name: "Edit: Pack" }));
      await user.type(screen.getByRole("textbox", { name: "Description" }), "Passport{Enter}<b>Charger</b>");
      await user.click(screen.getByRole("button", { name: "Save" }));
      unmount();

      render(<App />);
      expect(within(todoItem("Pack")).getByTestId("todo-description").textContent).toBe(
        "Passport\n<b>Charger</b>",
      );
    });

    it("clears a Description", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addTodo(user, "Pack");
      await user.click(screen.getByRole("button", { name: "Edit: Pack" }));
      await user.type(screen.getByRole("textbox", { name: "Description" }), "Passport");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await user.click(screen.getByRole("button", { name: "Edit: Pack" }));
      expect(screen.getByRole("textbox", { name: "Description" })).toHaveValue("Passport");
      await user.clear(screen.getByRole("textbox", { name: "Description" }));
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(within(todoItem("Pack")).queryByTestId("todo-description")).not.toBeInTheDocument();
    });
  });
});
