"use client";

import { useEffect, useState } from "react";
import { centsToDollarsString } from "@/lib/money";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface CategoryPnlRow {
  categoryId: number;
  categoryName: string;
  monthly: number[];
  total: number;
}

interface ProfitLossReport {
  year: number;
  income: CategoryPnlRow[];
  expenses: CategoryPnlRow[];
  incomeMonthly: number[];
  incomeTotal: number;
  expenseMonthly: number[];
  expenseTotal: number;
  netMonthly: number[];
  netTotal: number;
}

export default function PnlTable() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<ProfitLossReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/profit-loss?year=${year}`)
      .then((r) => r.json())
      .then(setReport)
      .finally(() => setLoading(false));
  }, [year]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Profit &amp; Loss</h1>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
          >
            &larr;
          </button>
          <span className="font-medium">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
          >
            &rarr;
          </button>
        </div>
      </div>

      {loading || !report ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="sticky left-0 bg-slate-50 px-3 py-2">Category</th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="px-3 py-2 text-right">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2 text-right">YTD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <SectionHeader label="INCOME" />
              {report.income.map((c) => (
                <CategoryRow key={c.categoryId} row={c} />
              ))}
              <TotalRow label="TOTAL INCOME" monthly={report.incomeMonthly} total={report.incomeTotal} />

              <SectionHeader label="EXPENSES" />
              {report.expenses.map((c) => (
                <CategoryRow key={c.categoryId} row={c} />
              ))}
              <TotalRow
                label="TOTAL EXPENSES"
                monthly={report.expenseMonthly}
                total={report.expenseTotal}
              />

              <TotalRow label="NET PROFIT / LOSS" monthly={report.netMonthly} total={report.netTotal} bold />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <tr className="bg-slate-100">
      <td colSpan={14} className="px-3 py-1.5 text-xs font-semibold text-slate-600">
        {label}
      </td>
    </tr>
  );
}

function CategoryRow({ row }: { row: CategoryPnlRow }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="sticky left-0 bg-white px-3 py-1.5">{row.categoryName}</td>
      {row.monthly.map((v, i) => (
        <td key={i} className="px-3 py-1.5 text-right text-slate-600">
          {v === 0 ? "—" : centsToDollarsString(v)}
        </td>
      ))}
      <td className="px-3 py-1.5 text-right font-medium">{centsToDollarsString(row.total)}</td>
    </tr>
  );
}

function TotalRow({
  label,
  monthly,
  total,
  bold,
}: {
  label: string;
  monthly: number[];
  total: number;
  bold?: boolean;
}) {
  return (
    <tr className={bold ? "bg-slate-50 font-semibold" : "font-medium"}>
      <td className="sticky left-0 bg-inherit px-3 py-1.5">{label}</td>
      {monthly.map((v, i) => (
        <td key={i} className="px-3 py-1.5 text-right">
          {centsToDollarsString(v)}
        </td>
      ))}
      <td className="px-3 py-1.5 text-right">{centsToDollarsString(total)}</td>
    </tr>
  );
}
