"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "jws-saved-strolls";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useSavedStrolls() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readIds());
    setReady(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current];
      writeIds(next);
      return next;
    });
  }, []);

  return { ids, ready, toggle, saved: (id: string) => ids.includes(id) };
}
