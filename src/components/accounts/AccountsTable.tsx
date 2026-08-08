"use client";

import { useEffect, useState } from "react";
import type { AccountRow, AccountType } from "@/lib/types";
import { centsToDollarsString, dollarsStringToCents } from "@/lib/money";

const ACCOUNT_TYPES: AccountType[] = ["bank", "credit_card"];

export default function AccountsTable() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("bank");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [openingDate, setOpeningDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/accounts");
      setAccounts(await res.json());
    } catch {
      setError("Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load() only sets state after its internal awaits resolve; it's shared
    // with the add/update/archive handlers so isn't inlined here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function addAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !institution.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          institution: institution.trim(),
          accountType,
          openingBalanceCents: dollarsStringToCents(openingBalance || "0"),
          openingBalanceDate: openingDate,
        }),
      });
      if (!res.ok) throw new Error();
      setName("");
      setInstitution("");
      setOpeningBalance("0");
      await load();
    } catch {
      setError("Failed to add account. Check the opening balance format.");
    } finally {
      setSaving(false);
    }
  }

  async function updateAccount(id: number, updates: Record<string, unknown>) {
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Failed to update account.");
    }
  }

  async function archiveAccount(id: number) {
    if (!confirm("Archive this account? It will be hidden but its transactions are kept.")) return;
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    await load();
  }

  const visibleAccounts = accounts.filter((a) => showArchived || !a.isArchived);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Accounts</h1>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
      </div>

      <form
        onSubmit={addAccount}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Operating Expenses"
            className="w-48 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Institution</label>
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. Relay"
            className="w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AccountType)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "bank" ? "Bank" : "Credit Card"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Opening balance
          </label>
          <input
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            placeholder="0.00"
            className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">As of</label>
          <input
            type="date"
            value={openingDate}
            onChange={(e) => setOpeningDate(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Add account
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
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Institution</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Opening balance</th>
                <th className="px-4 py-2">As of</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleAccounts.map((a) => (
                <AccountRowItem
                  key={a.id}
                  account={a}
                  onUpdate={(updates) => updateAccount(a.id, updates)}
                  onArchive={() => archiveAccount(a.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AccountRowItem({
  account,
  onUpdate,
  onArchive,
}: {
  account: AccountRow;
  onUpdate: (updates: Record<string, unknown>) => void;
  onArchive: () => void;
}) {
  const [balance, setBalance] = useState(centsToDollarsString(account.openingBalanceCents));

  function commitBalance() {
    try {
      const cents = dollarsStringToCents(balance);
      if (cents !== account.openingBalanceCents) onUpdate({ openingBalanceCents: cents });
    } catch {
      setBalance(centsToDollarsString(account.openingBalanceCents));
    }
  }

  return (
    <tr className={`hover:bg-slate-50 ${account.isArchived ? "opacity-50" : ""}`}>
      <td className="px-4 py-2 font-medium">{account.name}</td>
      <td className="px-4 py-2 text-slate-500">{account.institution}</td>
      <td className="px-4 py-2 text-slate-500">
        {account.accountType === "bank" ? "Bank" : "Credit Card"}
      </td>
      <td className="px-4 py-2">
        <input
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          onBlur={commitBalance}
          className="w-28 rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-400 focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="date"
          defaultValue={account.openingBalanceDate}
          onBlur={(e) => {
            if (e.target.value !== account.openingBalanceDate) {
              onUpdate({ openingBalanceDate: e.target.value });
            }
          }}
          className="rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-400 focus:outline-none"
        />
      </td>
      <td className="px-4 py-2 text-right">
        {!account.isArchived && (
          <button onClick={onArchive} className="text-xs text-red-600 hover:underline">
            Archive
          </button>
        )}
      </td>
    </tr>
  );
}
