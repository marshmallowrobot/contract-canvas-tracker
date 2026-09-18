import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUp, Download, Search, Split, ExternalLink } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  contracts,
  contractStatusMeta,
  numberFmt,
  summary,
  type AssignmentType,
  type Contract,
  type ContractStatus,
  type RinCode,
} from "@/lib/contracts-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Contract Balances — Verdant Ledger" },
      { name: "description", content: "Outstanding RIN balances across fuel and RIN purchase contracts." },
      { property: "og:title", content: "Contract Balances — Verdant Ledger" },
      { property: "og:description", content: "Outstanding RIN balances across fuel and RIN purchase contracts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContractBalances,
});

const rinCodeClass: Record<RinCode, string> = {
  D3: "bg-rin-d3 text-rin-on-color",
  D4: "bg-rin-d4 text-rin-on-color",
  D5: "bg-rin-d5 text-rin-on-color",
  D6: "bg-rin-d6 text-rin-on-color",
  D7: "bg-rin-d7 text-rin-on-color",
};

function StatusPill({ status }: { status: ContractStatus }) {
  const meta = contractStatusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}>
      <i className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function AssignmentMark({ type }: { type: AssignmentType }) {
  const assigned = type === "assigned";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[10px] font-bold uppercase ${assigned ? "border-assigned-border bg-assigned text-assigned-foreground" : "border-hair bg-panel text-subtle"}`}>
      {assigned ? "Assigned" : "Separated"}
      {assigned ? <ArrowUp className="size-3" strokeWidth={2.2} /> : <Split className="size-3" strokeWidth={2.2} />}
    </span>
  );
}

function StatCard({ label, value, note, tone }: { label: string; value: string; note: string; tone?: string }) {
  return (
    <div className="rounded-md border border-hair bg-panel px-5 py-4 shadow-sm">
      <div className="text-xs font-semibold text-subtle">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold tabular-nums ${tone ?? "text-ink"}`}>{value}</div>
      <div className="mt-1 text-xs text-subtle">{note}</div>
    </div>
  );
}

function identifiers(contract: Contract) {
  const firstPtd = contract.ptd[0];
  const remainingPtd = Math.max(contract.ptd.length - 1, 0);
  return (
    <div className="space-y-1 text-xs text-subtle">
      <div className="font-medium text-ink">{firstPtd ?? "No PTD"}{remainingPtd ? ` +${remainingPtd}` : ""}</div>
      <div>{contract.billOfLading.length} B/L · {contract.invoices.length} invoices</div>
    </div>
  );
}

function ContractBalances() {
  const [selectedId, setSelectedId] = useState(contracts[0]?.contractId ?? "");
  const selected = contracts.find((contract) => contract.contractId === selectedId) ?? contracts[0];
  if (!selected) return null;
  const previewTransactions = selected.transactions.slice(0, 10);

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold">Contract Balances</h1>
            <p className="mt-1 text-sm text-subtle">RIN obligations and applied buy transactions</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-64 flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <input aria-label="Search contracts" placeholder="Contract, deal, PTD, B/L, invoice" className="h-9 w-full rounded-md border border-input bg-panel pl-9 pr-3 text-sm shadow-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20" />
            </div>
            <Button variant="outline" size="sm"><Download />Export</Button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Contract summary">
          <StatCard label="Outstanding RINs" value={numberFmt.format(summary.totalRins)} note={`${summary.openCount} open contracts`} />
          <StatCard label="Overdue RINs" value={numberFmt.format(summary.overdueRins)} note={`${summary.overdueCount} contracts`} tone="text-rose" />
          <StatCard label="Due within 30 days" value={numberFmt.format(summary.dueSoonRins)} note={`${summary.dueSoonCount} contracts`} tone="text-amber" />
          <StatCard label="RINs applied this month" value={numberFmt.format(summary.appliedRins)} note={`${summary.appliedTxns} buy transactions`} tone="text-primary" />
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm">
            <div className="flex items-center justify-between border-b border-hair px-5 py-3">
              <h2 className="font-display text-base font-bold">Contracts</h2>
              <span className="text-xs text-subtle">{contracts.length} results</span>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[950px]">
                <div className="grid grid-cols-[190px_220px_120px_135px_minmax(180px,1fr)_110px_125px] gap-3 border-b border-hair bg-table-head px-5 py-3 text-[10px] font-bold uppercase text-subtle">
                  <span>Contract</span><span>Counterparty</span><span>RIN</span><span>Assignment</span><span>Identifiers</span><span>Due date</span><span className="text-right">RIN balance</span>
                </div>
                {contracts.map((contract) => {
                  const active = contract.contractId === selectedId;
                  return (
                    <button key={contract.contractId} onClick={() => setSelectedId(contract.contractId)} className={`grid w-full grid-cols-[190px_220px_120px_135px_minmax(180px,1fr)_110px_125px] items-center gap-3 border-b border-hair px-5 py-3 text-left transition-colors last:border-0 ${active ? "bg-selected" : "hover:bg-table-head"}`}>
                      <div>
                        <div className="flex items-center gap-2"><span className="text-sm font-semibold">{contract.contractId}</span><StatusPill status={contract.contractStatus} /></div>
                        <div className="mt-1 text-xs text-subtle">Deal {contract.dealNumber}</div>
                      </div>
                      <div><div className="text-sm font-medium">{contract.counterparty}</div><div className="mt-1 text-xs text-subtle">{contract.product}</div></div>
                      <div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-xs font-bold ${rinCodeClass[contract.rinCode]}`}>{contract.rinCode}</span><span className="text-xs font-semibold text-subtle">{contract.vintageYear}</span></div>
                      <AssignmentMark type={contract.assignmentType} />
                      {identifiers(contract)}
                      <div><div className="text-sm font-medium">{contract.dueDate ?? "—"}</div><div className={`mt-1 text-xs ${contract.status === "overdue" ? "text-rose" : "text-subtle"}`}>{contract.dueDate ? contract.dueNote : "No due date"}</div></div>
                      <div className="text-right text-base font-bold tabular-nums text-primary">{numberFmt.format(contract.outstandingRins)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm xl:sticky xl:top-5">
            <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
              <div><h2 className="font-display text-base font-bold">Buy Transactions</h2><p className="mt-1 text-xs text-subtle">{selected.contractId} · showing up to 10 recent</p></div>
              <Button asChild variant="outline" size="sm"><Link to="/contracts/$contractId" params={{ contractId: selected.contractId }}>Full history<ExternalLink /></Link></Button>
            </div>
            <div className="flex items-center justify-between border-b border-hair bg-table-head px-5 py-3">
              <span className="text-xs font-medium text-subtle">Outstanding RINs</span>
              <span className="font-display text-xl font-bold tabular-nums text-primary">{numberFmt.format(selected.outstandingRins)}</span>
            </div>
            <div>
              {previewTransactions.map((transaction) => (
                <div key={transaction.id} className="border-b border-hair px-5 py-3 last:border-0">
                  <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">{transaction.reference}</span><span className="text-sm font-bold tabular-nums text-primary">{numberFmt.format(transaction.rinApplied)} RIN</span></div>
                  <div className="mt-1 text-xs text-subtle">{transaction.date} · {transaction.description}</div>
                  <div className="mt-1 text-xs text-subtle">RIN balance after: {numberFmt.format(transaction.rinBalanceAfter)}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
