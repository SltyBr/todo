export type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

/** A Title is required and one line: returns the cleaned Title, or null if there is none. */
export function cleanTitle(raw: string): string | null {
  const title = raw.replace(/\s+/g, " ").trim();
  return title === "" ? null : title;
}
