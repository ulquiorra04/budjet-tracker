"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { BudgetSummary, Transaction } from "./types";

const TX_KEY = "budjet-tracker:transactions";
const BUDGET_KEY = "budjet-tracker:monthly-budget";
const DEFAULT_BUDGET = 2500;

const SEED: Transaction[] = [
  { id: "seed-1", type: "income", amount: 3200, category: "Salary", description: "Monthly salary", date: "2026-11-01" },
  { id: "seed-2", type: "expense", amount: 950, category: "Housing", description: "Rent", date: "2026-11-02" },
  { id: "seed-3", type: "expense", amount: 120.5, category: "Utilities", description: "Electricity and water", date: "2026-11-05" },
  { id: "seed-4", type: "expense", amount: 64.2, category: "Food", description: "Groceries", date: "2026-11-08" },
  { id: "seed-5", type: "income", amount: 450, category: "Freelance", description: "Landing page project", date: "2026-11-10" },
  { id: "seed-6", type: "expense", amount: 35, category: "Transport", description: "Fuel", date: "2026-11-12" },
];

interface State {
  hydrated: boolean;
  transactions: Transaction[];
  monthlyBudget: number;
}

// Module-level external store so SSR renders a stable empty snapshot and the
// client hydrates from localStorage without setState-in-effect patterns.
const serverState: State = { hydrated: false, transactions: [], monthlyBudget: DEFAULT_BUDGET };
let state: State = serverState;
const listeners = new Set<() => void>();

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode, quota). Ignore.
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  if (state.hydrated) {
    writeJSON(TX_KEY, state.transactions);
    writeJSON(BUDGET_KEY, state.monthlyBudget);
  }
  emit();
}

function hydrate() {
  if (state.hydrated || typeof window === "undefined") return;
  setState({
    hydrated: true,
    transactions: readJSON<Transaction[]>(TX_KEY, SEED),
    monthlyBudget: readJSON<number>(BUDGET_KEY, DEFAULT_BUDGET),
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => serverState;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useBudgetStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setState({ transactions: [{ ...tx, id: newId() }, ...state.transactions] });
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setState({ transactions: state.transactions.filter((t) => t.id !== id) });
  }, []);

  const setMonthlyBudget = useCallback((value: number) => {
    setState({ monthlyBudget: Math.max(0, value) });
  }, []);

  const summary = useMemo<BudgetSummary>(() => {
    const income = snapshot.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = snapshot.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [snapshot.transactions]);

  return {
    hydrated: snapshot.hydrated,
    transactions: snapshot.transactions,
    summary,
    monthlyBudget: snapshot.monthlyBudget,
    addTransaction,
    removeTransaction,
    setMonthlyBudget,
  };
}
