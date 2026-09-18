import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Split, ExternalLink, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buyTxStatusMeta,
  contracts,
  contractStatusMeta,
  numberFmt,
  summary,
  type AssignmentType,
  type BuyTransactionStatus,
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

function TxStatusPill({ status }: { status: BuyTransactionStatus }) {
  const meta = buyTxStatusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}>
      <i className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

type SortKey = "contractId" | "counterparty" | "dueDate";
type SortDirection = "asc" | "desc";

function SortHeader({
  label,
  field,
  sortKey,
  sortDirection,
  onSort,
}: {
  label: string;
  field: SortKey;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (field: SortKey) => void;
}) {
  const active = sortKey === field;
  const Icon = active ? (sortDirection === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 justify-start px-2 text-[10px] font-bold uppercase text-subtle hover:text-ink"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label}${active ? `, currently ${sortDirection === "asc" ? "ascending" : "descending"}` : ""}`}
    >
      {label}<Icon className="size-3" />
    </Button>
  );
}

function TransactionFuel({
  rinCode,
  vintageYear,
  assignmentType,
}: {
  rinCode: RinCode;
  vintageYear: number;
  assignmentType: AssignmentType;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rinCodeClass[rinCode]}`}>{rinCode}</span>
      <span className="text-[11px] font-semibold text-subtle">{vintageYear}</span>
      <AssignmentMark type={assignmentType} />
    </div>
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [counterpartyFilter, setCounterpartyFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("contractId");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const counterparties = useMemo(
    () => [...new Set(contracts.map((contract) => contract.counterparty))].sort(),
    [],
  );
  const visibleContracts = useMemo(() => {
    const normalizedId = contractFilter.trim().toLowerCase();
    return contracts
      .filter((contract) => statusFilter === "all" || contract.contractStatus === statusFilter)
      .filter((contract) => counterpartyFilter === "all" || contract.counterparty === counterpartyFilter)
      .filter((contract) => !normalizedId || contract.contractId.toLowerCase().includes(normalizedId))
      .sort((a, b) => {
        if (sortKey === "dueDate") {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          const comparison = Date.parse(`${a.dueDate}, 2026`) - Date.parse(`${b.dueDate}, 2026`);
          return sortDirection === "asc" ? comparison : -comparison;
        }
        const comparison = a[sortKey].localeCompare(b[sortKey], undefined, { numeric: true });
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [contractFilter, counterpartyFilter, sortDirection, sortKey, statusFilter]);
  const selected = visibleContracts.find((contract) => contract.contractId === selectedId) ?? visibleContracts[0];
  const previewTransactions = selected?.transactions.slice(0, 10) ?? [];
  const hasFilters = statusFilter !== "all" || counterpartyFilter !== "all" || contractFilter !== "";

  const handleSort = (field: SortKey) => {
    if (sortKey === field) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(field);
    setSortDirection("asc");
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setCounterpartyFilter("all");
    setContractFilter("");
  };

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold">Contract Balances</h1>
            <p className="mt-1 text-sm text-subtle">RIN obligations and applied buy transactions</p>
          </div>
          <Button variant="outline" size="sm"><Download />Export</Button>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Contract summary">
          <StatCard label="Outstanding RINs" value={numberFmt.format(summary.totalRins)} note={`${summary.openCount} open contracts`} />
          <StatCard label="Overdue RINs" value={numberFmt.format(summary.overdueRins)} note={`${summary.overdueCount} contracts`} tone="text-rose" />
          <StatCard label="Due within 30 days" value={numberFmt.format(summary.dueSoonRins)} note={`${summary.dueSoonCount} contracts`} tone="text-amber" />
          <StatCard label="RINs applied this month" value={numberFmt.format(summary.appliedRins)} note={`${summary.appliedTxns} buy transactions`} tone="text-primary" />
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm">
            <div className="border-b border-hair px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-bold">Contracts</h2>
                <span className="text-xs text-subtle">{visibleContracts.length} results</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[160px_minmax(190px,1fr)_180px_auto]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger aria-label="Filter by status" className="bg-panel"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="settled">Settled</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={counterpartyFilter} onValueChange={setCounterpartyFilter}>
                  <SelectTrigger aria-label="Filter by counterparty" className="bg-panel"><SelectValue placeholder="All counterparties" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All counterparties</SelectItem>
                    {counterparties.map((counterparty) => <SelectItem key={counterparty} value={counterparty}>{counterparty}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input
                  value={contractFilter}
                  onChange={(event) => setContractFilter(event.target.value)}
                  aria-label="Filter by contract ID"
                  placeholder="Contract ID"
                  className="h-9 w-full rounded-md border border-input bg-panel px-3 text-sm shadow-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
                {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X />Clear</Button>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[190px_220px_minmax(180px,1fr)_120px_125px] items-center gap-3 border-b border-hair bg-table-head px-5 py-2 text-[10px] font-bold uppercase text-subtle">
                  <SortHeader label="Contract" field="contractId" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                  <SortHeader label="Counterparty" field="counterparty" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                  <span>Identifiers</span>
                  <SortHeader label="Due date" field="dueDate" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                  <span className="text-right">RIN balance</span>
                </div>
                {visibleContracts.map((contract) => {
                  const active = contract.contractId === selected?.contractId;
                  return (
                    <button key={contract.contractId} onClick={() => setSelectedId(contract.contractId)} className={`grid w-full grid-cols-[190px_220px_minmax(180px,1fr)_120px_125px] items-center gap-3 border-b border-hair px-5 py-3 text-left transition-colors last:border-0 ${active ? "bg-selected" : "hover:bg-table-head"}`}>
                      <div>
                        <div className="flex items-center gap-2"><span className="text-sm font-semibold">{contract.contractId}</span><StatusPill status={contract.contractStatus} /></div>
                        <div className="mt-1 text-xs text-subtle">Deal {contract.dealNumber}</div>
                      </div>
                      <div className="text-sm font-medium">{contract.counterparty}</div>
                      {identifiers(contract)}
                      <div><div className="text-sm font-medium">{contract.dueDate ?? "—"}</div><div className={`mt-1 text-xs ${contract.status === "overdue" ? "text-rose" : "text-subtle"}`}>{contract.dueDate ? contract.dueNote : "No due date"}</div></div>
                      <div className="text-right text-base font-bold tabular-nums text-primary">{numberFmt.format(contract.outstandingRins)}</div>
                    </button>
                  );
                })}
                {!visibleContracts.length && (
                  <div className="px-5 py-12 text-center">
                    <div className="text-sm font-semibold">No matching contracts</div>
                    <div className="mt-1 text-xs text-subtle">Adjust the filters or clear them to see all contracts.</div>
                    <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Clear filters</Button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {selected ? <aside className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm xl:sticky xl:top-5">
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
                  <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">{transaction.reference}</span><TxStatusPill status={transaction.txStatus} /></div>
                  <div className="mt-1 flex items-center justify-between gap-3"><span className="text-xs text-subtle">{transaction.date} · {transaction.description}</span><span className="text-sm font-bold tabular-nums text-primary">{numberFmt.format(transaction.rinApplied)} RIN</span></div>
                  <TransactionFuel rinCode={transaction.rinCode} vintageYear={transaction.vintageYear} assignmentType={transaction.assignmentType} />
                  <div className="mt-1 text-xs text-subtle">RIN balance after: {numberFmt.format(transaction.rinBalanceAfter)}</div>
                </div>
              ))}
            </div>
          </aside> : (
            <aside className="rounded-md border border-hair bg-panel p-6 text-center text-sm text-subtle shadow-sm">No contract selected</aside>
          )}
        </div>
      </main>
    </div>
  );
}
