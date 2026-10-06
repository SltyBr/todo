import { useSyncExternalStore } from "react";
import type { Todo } from "./todo";

// The Filter lives in the URL hash because GitHub Pages has no SPA fallback (ADR-0002).
export const FILTERS = [
  { filter: "all", label: "All", hash: "#/" },
  { filter: "active", label: "Active", hash: "#/active" },
  { filter: "completed", label: "Completed", hash: "#/completed" },
] as const;

export type Filter = (typeof FILTERS)[number]["filter"];

function filterFromHash(hash: string): Filter {
  return FILTERS.find((f) => f.hash === hash)?.filter ?? "all";
}

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function useFilter(): Filter {
  return useSyncExternalStore(subscribe, () => filterFromHash(window.location.hash));
}

export function matchesFilter(todo: Todo, filter: Filter): boolean {
  if (filter === "active") return !todo.completed;
  if (filter === "completed") return todo.completed;
  return true;
}
