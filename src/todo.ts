export type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

/** The parts of a Todo the user edits together. */
export type TodoChanges = Pick<Todo, "title" | "description">;

/** A Title is required and one line: returns the cleaned Title, or null if there is none. */
export function cleanTitle(raw: string): string | null {
  const title = raw.replace(/\s+/g, " ").trim();
  return title === "" ? null : title;
}
