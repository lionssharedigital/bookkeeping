"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AccountRow, CategoryRow } from "@/lib/types";
import { dollarsStringToCents } from "@/lib/money";

export default function TransactionForm() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  const [accountId, setAccountId] = useState<number | "">("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [matchedRuleId, setMatchedRuleId] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState<{ categoryName: string; categoryType: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((rows: AccountRow[]) => {
        setAccounts(rows);
        if (rows.length && !accountId) setAccountId(rows[0].id);
      });
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live category auto-suggest as the user types the payee, mirroring the
  // sheet's SEARCH-based Category Map lookup.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (!payee.trim()) {
        setSuggestion(null);
        return;
      }
      fetch(`/api/category-map/match?payee=${encodeURIComponent(payee)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.match) {
            setSuggestion({ categoryName: data.match.categoryName, categoryType: data.match.categoryType });
            setCategoryId(data.match.categoryId);
            setMatchedRuleId(data.match.ruleId);
          } else {
            setSuggestion(null);
            setMatchedRuleId(null);
          }
        });
    }, 250);
    return () => clearTimeout(handle);
  }, [payee]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!accountId || !payee.trim() || !amount.trim()) {
      setError("Account, payee, and amount are required.");
      return;
    }
    setSaving(true);
    try {
      const cents = dollarsStringToCents(amount);
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          date,
          payee: payee.trim(),
          amountCents: cents,
          description: description.trim() || null,
          reference: reference.trim() || null,
          categoryId: categoryId || null,
          matchedRuleId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? data.error ?? "Failed to create transaction.");
        return;
      }
      router.push("/transactions");
      router.refresh();
    } catch {
      setError("Invalid amount format.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-lg font-semibold">New transaction</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Amount (negative = expense)
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="-42.50"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Payee</label>
          <input
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Category</label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value ? Number(e.target.value) : "");
              setMatchedRuleId(null);
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
          {suggestion && (
            <p className="mt-1 text-xs text-emerald-700">
              Auto-suggested: {suggestion.categoryName} ({suggestion.categoryType})
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Reference</label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add transaction"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/transactions")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
