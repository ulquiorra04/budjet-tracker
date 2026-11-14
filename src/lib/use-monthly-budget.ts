"use client";

import { useCallback, useSyncExternalStore } from "react";

const BUDGET_KEY = "budjet-tracker:monthly-budget";
const DEFAULT_BUDGET = 2500;

let value = DEFAULT_BUDGET;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(BUDGET_KEY);
    const parsed = raw ? Number(JSON.parse(raw)) : NaN;
    if (Number.isFinite(parsed) && parsed >= 0) value = parsed;
  } catch {
    // Ignore unavailable storage.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => value;
const getServerSnapshot = () => DEFAULT_BUDGET;

export function useMonthlyBudget(): [number, (next: number) => void] {
  const budget = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setBudget = useCallback((next: number) => {
    value = Math.max(0, next);
    try {
      window.localStorage.setItem(BUDGET_KEY, JSON.stringify(value));
    } catch {
      // Ignore unavailable storage.
    }
    emit();
  }, []);
  return [budget, setBudget];
}
