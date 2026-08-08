"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryMapRuleRow, CategoryRow, CategoryType } from "@/lib/types";

const TYPES: CategoryType[] = ["Income", "Expense", "Transfer", "Credit Card"];

export default function CategoryMapTable() {
  const [rules, setRules] = useState<CategoryMapRuleRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const [newKeyword, setNewKeyword] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState<CategoryType>("Expense");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [rulesRes, catsRes] = await Promise.all([
        fetch("/api/category-map"),
        fetch("/api/categories"),
      ]);
      setRules(await rulesRes.json());
      setCategories(await catsRes.json());
    } catch {
      setError("Failed to load category map.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load() only sets state after its internal awaits resolve; it's shared
    // with the add/update/delete handlers so isn't inlined here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const categoryNames = useMemo(
    () => Array.from(new Set(categories.map((c) => c.name))).sort(),
    [categories],
  );

  const filteredRules = useMemo(() => {
    const f = filter.toLowerCase();
    return rules.filter(
      (r) =>
        r.keyword.toLowerCase().includes(f) || r.categoryName.toLowerCase().includes(f),
    );
  }, [rules, filter]);

  async function addRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyword.trim() || !newCategory.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/category-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          categoryName: newCategory.trim(),
          categoryType: newType,
        }),
      });
      if (!res.ok) throw new Error();
      setNewKeyword("");
      setNewCategory("");
      await load();
    } catch {
      setError("Failed to add rule.");
    } finally {
      setSaving(false);
    }
  }

  async function updateRule(id: number, updates: Record<string, unknown>) {
    setError(null);
    try {
      const res = await fetch(`/api/category-map/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Failed to update rule.");
    }
  }

  async function deleteRule(id: number) {
    if (!confirm("Delete this category map rule?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/category-map/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete rule.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Category Map</h1>
        <input
          placeholder="Filter by keyword or category..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-72 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <form
        onSubmit={addRule}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Payee keyword
          </label>
          <input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="e.g. FRESHBOOKS"
            className="w-48 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Category</label>
          <input
            list="category-name-options"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Software"
            className="w-48 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <datalist id="category-name-options">
            {categoryNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as CategoryType)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Add rule
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Keyword</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  onUpdate={(updates) => updateRule(rule.id, updates)}
                  onDelete={() => deleteRule(rule.id)}
                />
              ))}
              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    No rules match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RuleRow({
  rule,
  onUpdate,
  onDelete,
}: {
  rule: CategoryMapRuleRow;
  onUpdate: (updates: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const [keyword, setKeyword] = useState(rule.keyword);
  const [categoryName, setCategoryName] = useState(rule.categoryName);
  const [categoryType, setCategoryType] = useState<CategoryType>(rule.categoryType);
  const [priority, setPriority] = useState(rule.priority);

  function commitKeyword() {
    if (keyword !== rule.keyword) onUpdate({ keyword });
  }
  function commitCategory() {
    if (categoryName !== rule.categoryName || categoryType !== rule.categoryType) {
      onUpdate({ categoryName, categoryType });
    }
  }
  function commitPriority() {
    if (priority !== rule.priority) onUpdate({ priority });
  }

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onBlur={commitKeyword}
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-400 focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <input
          list="category-name-options"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          onBlur={commitCategory}
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-400 focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={categoryType}
          onChange={(e) => {
            setCategoryType(e.target.value as CategoryType);
          }}
          onBlur={commitCategory}
          className="rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-400 focus:outline-none"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          onBlur={commitPriority}
          className="w-16 rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-400 focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="checkbox"
          checked={rule.isActive}
          onChange={(e) => onUpdate({ isActive: e.target.checked })}
        />
      </td>
      <td className="px-4 py-2 text-right">
        <button onClick={onDelete} className="text-xs text-red-600 hover:underline">
          Delete
        </button>
      </td>
    </tr>
  );
}
