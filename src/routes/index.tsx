import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  contracts,
  currencyFmt,
  numberFmt,
  summary,
  type Contract,
  type DueStatus,
} from "@/lib/contracts-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Contract Balances — Verdant Ledger" },
      {
        name: "description",
        content:
          "Outstanding RIN balances and accounting positions across active fuel and RIN purchase contracts.",
      },
      { property: "og:title", content: "Contract Balances — Verdant Ledger" },
      {
        property: "og:description",
        content:
          "Outstanding RIN balances and accounting positions across active fuel and RIN purchase contracts.",
      },
    ],
  }),
  component: ContractBalances,
});

const statusDot: Record<DueStatus, string> = {
  overdue: "bg-rose",
  soon: "bg-amber",
  ontime: "bg-ice",
  settled: "bg-hair",
};

const statusChip: Record<DueStatus, string> = {
  overdue: "bg-rose-soft text-rose",
  soon: "bg-amber-soft text-amber",
  ontime: "bg-ice-soft text-ice",
  settled: "bg-canvas text-subtle",
};

function IdChips({ values, max = 2 }: { values: string[]; max?: number }) {
  const shown = values.slice(0, max);
  const rest = values.length - shown.length;
  return (
    <>
      {shown.map((v) => (
        <span key={v} className="rounded-md bg-ice-soft px-2 py-1 font-mono text-[10px] text-ice">
          {v}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded-md bg-canvas px-2 py-1 font-mono text-[10px] text-subtle">
          +{rest}
        </span>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: string;
}) {
  return (
    <div className="glass rounded-2xl border border-white/60 p-4 ring-1 ring-black/5">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${tone ?? ""}`}>
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] text-subtle">{note}</div>
    </div>
  );
}

function ContractBalances() {
  const [selectedId, setSelectedId] = useState(contracts[0]!.contractId);
  const selected = contracts.find((c) => c.contractId === selectedId) as Contract;

  return (
    <div className="relative min-h-screen bg-canvas font-sans text-ink antialiased">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-ice/25 blur-[120px]" />
        <div className="absolute -right-24 top-24 h-[460px] w-[460px] rounded-full bg-amber/15 blur-[130px]" />
        <div className="absolute bottom-0 left-10 h-[380px] w-[380px] rounded-full bg-ice-soft/60 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 pb-16 pt-5">
        <header className="glass animate-[rise_.5s_ease-out_both] rounded-2xl border border-white/60 px-5 py-4 ring-1 ring-black/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-ink font-mono text-xs font-semibold text-panel">
                VR
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-tight">Verdant Ledger</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                  Contract Balances
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-subtle">
                  /
                </span>
                <input
                  placeholder="Search contract, deal, PTD, B/L, invoice"
                  className="glass w-72 rounded-xl border border-white/60 py-2 pl-7 pr-3 text-[13px] outline-none ring-1 ring-black/5 placeholder:text-subtle/70 focus:ring-2 focus:ring-ice/50"
                />
              </div>
              <button className="rounded-xl border border-white/60 bg-panel/60 px-3 py-2 font-mono text-[11px] ring-1 ring-black/5">
                All statuses
              </button>
              <button className="rounded-xl bg-ink px-3.5 py-2 font-mono text-[11px] text-panel">
                Export
              </button>
            </div>
          </div>
        </header>

        <div className="mt-4 grid animate-[rise_.5s_ease-out_both] grid-cols-2 gap-3 [animation-delay:80ms] lg:grid-cols-4">
          <StatCard
            label="Outstanding RINs"
            value={numberFmt.format(summary.totalRins)}
            note={`${summary.openCount} open contracts`}
          />
          <StatCard
            label="Overdue RINs"
            value={numberFmt.format(summary.overdueRins)}
            note={`${summary.overdueCount} contracts`}
            tone="text-rose"
          />
          <StatCard
            label="RINs due within 30d"
            value={numberFmt.format(summary.dueSoonRins)}
            note={`${summary.dueSoonCount} contracts`}
            tone="text-amber"
          />
          <StatCard
            label="RINs applied this month"
            value={numberFmt.format(summary.appliedRins)}
            note={`${summary.appliedTxns} buy txns`}
            tone="text-ice"
          />
        </div>

        <div className="mt-5 grid items-start gap-4 lg:grid-cols-[1fr_360px]">
          <div className="glass animate-[rise_.5s_ease-out_both] overflow-hidden rounded-2xl border border-white/60 ring-1 ring-black/5 [animation-delay:140ms]">
            <div className="flex items-center justify-between border-b border-hair px-4 py-3">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                Contracts <span className="text-ink/40">/ {contracts.length}</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                <span className="flex items-center gap-1.5">
                  <i className="size-1.5 rounded-full bg-rose" />
                  Overdue
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-1.5 rounded-full bg-amber" />
                  Soon
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-1.5 rounded-full bg-ice" />
                  On time
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[150px_1fr_130px_120px_150px] gap-3 border-b border-hair px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
              <span>Contract</span>
              <span>Identifiers</span>
              <span>Due date</span>
              <span className="text-right">RINs</span>
              <span className="text-right">Outstanding</span>
            </div>

            {contracts.map((c) => {
              const active = c.contractId === selectedId;
              return (
                <button
                  key={c.contractId}
                  onClick={() => setSelectedId(c.contractId)}
                  className={`w-full border-b border-hair px-4 py-3 text-left transition-colors ${
                    active ? "bg-ice/8 ring-1 ring-ice/20" : "hover:bg-ice/5"
                  }`}
                >
                  <div className="grid grid-cols-[150px_1fr_130px_120px_150px] items-center gap-3">
                    <div>
                      <div className="font-mono text-[13px] font-semibold">{c.contractId}</div>
                      <div className="font-mono text-[11px] text-subtle">
                        #{c.dealNumber} / {c.product.split(" · ")[0]}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <IdChips values={c.ptd} />
                      <span className="rounded-md bg-canvas px-2 py-1 font-mono text-[10px] text-subtle">
                        {c.billOfLading.length} B/L
                      </span>
                      <span className="rounded-md bg-canvas px-2 py-1 font-mono text-[10px] text-subtle">
                        {c.invoices.length} INV
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${statusDot[c.status]}`} />
                      <span className="font-mono text-[12px]">{c.dueDate}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${statusChip[c.status]}`}
                      >
                        {c.dueNote}
                      </span>
                    </div>
                    <div className="text-right font-mono text-[13px] tabular-nums text-ice">
                      {numberFmt.format(c.outstandingRins)}
                    </div>
                    <div className="text-right font-mono text-[14px] font-semibold tabular-nums">
                      {currencyFmt.format(c.outstandingBalance)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <aside className="glass animate-[rise_.5s_ease-out_both] rounded-2xl border border-white/60 p-5 ring-1 ring-black/5 [animation-delay:200ms]">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              Drill-down
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Buy Transactions</h2>
            <p className="mb-4 mt-1 font-mono text-[11px] text-subtle">
              {selected.counterparty} · {selected.contractId}
            </p>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-canvas px-3 py-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-subtle">
                  RINs outstanding
                </div>
                <div className="font-mono text-[15px] font-semibold tabular-nums text-ice">
                  {numberFmt.format(selected.outstandingRins)}
                </div>
              </div>
              <div className="rounded-xl bg-canvas px-3 py-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-subtle">
                  Balance
                </div>
                <div className="font-mono text-[15px] font-semibold tabular-nums">
                  {currencyFmt.format(selected.outstandingBalance)}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {selected.transactions.map((t) => (
                <div key={t.id} className="rounded-xl border border-hair bg-panel/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-subtle">{t.reference}</span>
                    <span className="font-mono text-[13px] font-semibold tabular-nums">
                      −{currencyFmt.format(t.amountApplied)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-subtle">
                    <span>
                      {t.date} · {t.description}
                    </span>
                    <span className="text-ice">{numberFmt.format(t.rinApplied)} RIN</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-subtle">
                    Balance after {currencyFmt.format(t.balanceAfter)} ·{" "}
                    {numberFmt.format(t.rinBalanceAfter)} RIN
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/contracts/$contractId"
              params={{ contractId: selected.contractId }}
              className="mt-4 block rounded-xl bg-ink py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-panel"
            >
              Open full history
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
