"use client";

import { useEffect, useState } from "react";
import { centsToDollarsString } from "@/lib/money";

interface AccountRow {
  accountId: number;
  name: string;
  openingBalanceCents: number;
  activityCents: number;
  endingBalanceCents: number;
}

interface BalanceSheetReport {
  asOfDate: string;
  assets: AccountRow[];
  liabilities: AccountRow[];
  totalAssetsOpening: number;
  totalAssetsActivity: number;
  totalAssetsEnding: number;
  totalLiabilitiesOpening: number;
  totalLiabilitiesActivity: number;
  totalLiabilitiesEnding: number;
  beginningEquity: number;
  netChangeInCash: number;
  totalEquity: number;
  totalLiabilitiesPlusEquity: number;
}

export default function BalanceSheetTable() {
  const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<BalanceSheetReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/balance-sheet?asOfDate=${asOfDate}`)
      .then((r) => r.json())
      .then(setReport)
      .finally(() => setLoading(false));
  }, [asOfDate]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Balance Sheet</h1>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-slate-500">As of</label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5"
          />
        </div>
      </div>

      {loading || !report ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Account</th>
                <th className="px-4 py-2 text-right">Opening</th>
                <th className="px-4 py-2 text-right">Activity</th>
                <th className="px-4 py-2 text-right">Ending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-slate-100">
                <td colSpan={4} className="px-4 py-1.5 text-xs font-semibold text-slate-600">
                  ASSETS (Cash)
                </td>
              </tr>
              {report.assets.map((a) => (
                <BalanceRow key={a.accountId} row={a} />
              ))}
              <TotalRow
                label="TOTAL ASSETS"
                opening={report.totalAssetsOpening}
                activity={report.totalAssetsActivity}
                ending={report.totalAssetsEnding}
              />

              <tr className="bg-slate-100">
                <td colSpan={4} className="px-4 py-1.5 text-xs font-semibold text-slate-600">
                  LIABILITIES
                </td>
              </tr>
              {report.liabilities.map((a) => (
                <BalanceRow key={a.accountId} row={a} />
              ))}
              <TotalRow
                label="TOTAL LIABILITIES"
                opening={report.totalLiabilitiesOpening}
                activity={report.totalLiabilitiesActivity}
                ending={report.totalLiabilitiesEnding}
              />

              <tr className="bg-slate-100">
                <td colSpan={4} className="px-4 py-1.5 text-xs font-semibold text-slate-600">
                  EQUITY
                </td>
              </tr>
              <tr>
                <td className="px-4 py-1.5">Beginning Equity</td>
                <td colSpan={2}></td>
                <td className="px-4 py-1.5 text-right">
                  {centsToDollarsString(report.beginningEquity)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-1.5">Net Change in Cash Position</td>
                <td colSpan={2}></td>
                <td className="px-4 py-1.5 text-right">
                  {centsToDollarsString(report.netChangeInCash)}
                </td>
              </tr>
              <tr className="bg-slate-50 font-semibold">
                <td className="px-4 py-1.5">TOTAL EQUITY</td>
                <td colSpan={2}></td>
                <td className="px-4 py-1.5 text-right">{centsToDollarsString(report.totalEquity)}</td>
              </tr>
              <tr className="font-semibold">
                <td className="px-4 py-1.5">TOTAL LIABILITIES + EQUITY</td>
                <td colSpan={2}></td>
                <td className="px-4 py-1.5 text-right">
                  {centsToDollarsString(report.totalLiabilitiesPlusEquity)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BalanceRow({ row }: { row: AccountRow }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-1.5">{row.name}</td>
      <td className="px-4 py-1.5 text-right text-slate-600">
        {centsToDollarsString(row.openingBalanceCents)}
      </td>
      <td className="px-4 py-1.5 text-right text-slate-600">
        {centsToDollarsString(row.activityCents)}
      </td>
      <td className="px-4 py-1.5 text-right font-medium">
        {centsToDollarsString(row.endingBalanceCents)}
      </td>
    </tr>
  );
}

function TotalRow({
  label,
  opening,
  activity,
  ending,
}: {
  label: string;
  opening: number;
  activity: number;
  ending: number;
}) {
  return (
    <tr className="bg-slate-50 font-semibold">
      <td className="px-4 py-1.5">{label}</td>
      <td className="px-4 py-1.5 text-right">{centsToDollarsString(opening)}</td>
      <td className="px-4 py-1.5 text-right">{centsToDollarsString(activity)}</td>
      <td className="px-4 py-1.5 text-right">{centsToDollarsString(ending)}</td>
    </tr>
  );
}
