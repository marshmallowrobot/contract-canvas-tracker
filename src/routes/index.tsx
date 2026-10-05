import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Funnel, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  contracts,
  contractStatusMeta,
  numberFmt,
  summary,
  type Contract,
  type ContractStatus,
} from "@/lib/contracts-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Buy Contract Balances — Verdant Ledger" },
      { name: "description", content: "Outstanding RIN balances across fuel and RIN purchase contracts." },
      { property: "og:title", content: "Buy Contract Balances — Verdant Ledger" },
      { property: "og:description", content: "Outstanding RIN balances across fuel and RIN purchase contracts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContractBalances,
});

function StatusPill({ status }: { status: ContractStatus }) {
  const meta = contractStatusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}>
      <i className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

type SortKey = "contractId" | "counterparty" | "dealNumber" | "dueDate" | "rinBalance";
type SortDirection = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [50, 100] as const;

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

function StatCard({ label, value, note, tone }: { label: string; value: string; note: string; tone?: string }) {
  return (
    <div className="rounded-md border border-hair bg-panel px-5 py-4 shadow-sm">
      <div className="text-xs font-semibold text-subtle">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold tabular-nums ${tone ?? "text-ink"}`}>{value}</div>
      <div className="mt-1 text-xs text-subtle">{note}</div>
    </div>
  );
}


function ContractBalances() {
  const [statusFilter, setStatusFilter] = useState("open");
  const [counterpartyFilter, setCounterpartyFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("");
  const [dealFilter, setDealFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("contractId");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const counterparties = useMemo(
    () => [...new Set(contracts.map((contract) => contract.counterparty))].sort(),
    [],
  );
  const visibleContracts = useMemo(() => {
    const normalizedId = contractFilter.trim().toLowerCase();
    const normalizedDeal = dealFilter.trim().toLowerCase();
    return contracts
      .filter((contract) => statusFilter === "all" || contract.contractStatus === statusFilter)
      .filter((contract) => counterpartyFilter === "all" || contract.counterparty === counterpartyFilter)
      .filter((contract) => !normalizedId || contract.contractId.toLowerCase().includes(normalizedId))
      .filter((contract) => !normalizedDeal || contract.dealNumber.toLowerCase().includes(normalizedDeal))
      .sort((a, b) => {
        if (sortKey === "dueDate") {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          const comparison = Date.parse(`${a.dueDate}, 2026`) - Date.parse(`${b.dueDate}, 2026`);
          return sortDirection === "asc" ? comparison : -comparison;
        }
        if (sortKey === "rinBalance") {
          const comparison = a.outstandingRins - b.outstandingRins;
          return sortDirection === "asc" ? comparison : -comparison;
        }
        const comparison = a[sortKey].localeCompare(b[sortKey], undefined, { numeric: true });
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [contractFilter, counterpartyFilter, dealFilter, sortDirection, sortKey, statusFilter]);
  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (counterpartyFilter !== "all" ? 1 : 0) + (contractFilter.trim() !== "" ? 1 : 0) + (dealFilter.trim() !== "" ? 1 : 0);

  // Reset to first page whenever the result set or page size changes.
  useEffect(() => { setPage(1); }, [statusFilter, counterpartyFilter, contractFilter, dealFilter, sortKey, sortDirection, pageSize]);

  const totalPages = Math.max(Math.ceil(visibleContracts.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageContracts = visibleContracts.slice(startIndex, startIndex + pageSize);
  const endIndex = Math.min(startIndex + pageContracts.length, visibleContracts.length);

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
    setDealFilter("");
  };

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Buy Contract Balances</h1>
            <p className="mt-1 text-sm text-subtle">RIN obligations and applied buy transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Import Buy Contracts
            </Button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Contract summary">
          <StatCard label="RINs held — all contracts" value={numberFmt.format(summary.totalRins)} note="Across every buy contract" />
          <StatCard label="Overdue RINs" value={numberFmt.format(summary.overdueRins)} note={`${summary.overdueCount} contracts`} tone="text-rose" />
          <StatCard label="Due within 30 days" value={numberFmt.format(summary.dueSoonRins)} note={`${summary.dueSoonCount} contracts`} tone="text-amber" />
          <StatCard label="RINs applied this month" value={numberFmt.format(summary.appliedRins)} note={`${summary.appliedTxns} buy transactions`} tone="text-primary" />
        </section>

        <section className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm">
          <div className="border-b border-hair px-5 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-base font-bold">Buy Contracts</h2>
                <span className="text-xs text-subtle">{visibleContracts.length} results</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiltersOpen((open) => !open)}
                  className="text-primary hover:text-primary"
                  aria-expanded={filtersOpen}
                >
                  <Funnel className="size-4" />
                  {activeFilterCount > 0 ? `${activeFilterCount} ${activeFilterCount === 1 ? "filter" : "filters"}` : "Filters"}
                </Button>
                <span className="h-4 w-px bg-hair" aria-hidden />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0}
                  className="text-subtle disabled:opacity-50"
                >
                  Clear all
                </Button>
              </div>
            </div>
            {filtersOpen && (
              <div className="relative mt-3 rounded-md border border-hair bg-table-head p-4">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="absolute right-3 top-3 rounded p-1 text-subtle hover:bg-panel hover:text-ink"
                >
                  <X className="size-4" />
                </button>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase text-ink">Status</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger aria-label="Filter by status" className="mt-1 bg-panel"><SelectValue placeholder="All statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="settled">Settled</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                          <SelectItem value="cancelled">Canceled</SelectItem>
                        </SelectContent>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase text-ink">Trading Partner</span>
                    <Select value={counterpartyFilter} onValueChange={setCounterpartyFilter}>
                      <SelectTrigger aria-label="Filter by trading partner" className="mt-1 bg-panel"><SelectValue placeholder="All trading partners" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All trading partners</SelectItem>
                        {counterparties.map((counterparty) => <SelectItem key={counterparty} value={counterparty}>{counterparty}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase text-ink">Contract ID</span>
                    <input
                      value={contractFilter}
                      onChange={(event) => setContractFilter(event.target.value)}
                      aria-label="Filter by contract ID"
                      placeholder="Filter by contract ID"
                      className="mt-1 h-9 w-full rounded-md border border-input bg-panel px-3 text-sm shadow-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase text-ink">Source Key</span>
                    <input
                      value={dealFilter}
                      onChange={(event) => setDealFilter(event.target.value)}
                      aria-label="Filter by source key"
                      placeholder="Filter by source key"
                      className="mt-1 h-9 w-full rounded-md border border-input bg-panel px-3 text-sm shadow-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20"
                    />
                  </label>
                  <div className="flex items-end">
                    <Button size="sm" className="w-full" onClick={() => setFiltersOpen(false)}>
                      Apply filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[180px_170px_150px_120px_120px_120px] items-center gap-3 border-b border-hair bg-table-head px-5 py-2 text-[10px] font-bold uppercase text-subtle">
                <SortHeader label="Contract" field="contractId" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                <SortHeader label="Trading Partner" field="counterparty" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                <SortHeader label="Source Key" field="dealNumber" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                <span>Buys</span>
                <SortHeader label="Due date" field="dueDate" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                <div className="flex justify-end">
                  <SortHeader label="RIN balance" field="rinBalance" sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                </div>
              </div>
              {pageContracts.map((contract) => {
                const completedCount = contract.transactions.filter((t) => t.txStatus === "completed").length;
                return (
                <Link
                  key={contract.contractId}
                  to="/contracts/$contractId"
                  params={{ contractId: contract.contractId }}
                  className="grid w-full grid-cols-[180px_170px_150px_120px_120px_120px] items-center gap-3 border-b border-hair px-5 py-3 text-left transition-colors last:border-0 hover:bg-table-head"
                >
                  <div>
                    <div className="flex items-center gap-2"><span className="text-sm font-semibold">{contract.contractId}</span><StatusPill status={contract.contractStatus} /></div>
                  </div>
                  <div className="text-sm font-medium">{contract.counterparty}</div>
                  <div className="text-xs text-subtle">{contract.dealNumber}</div>
                  <div className="text-sm font-medium">{completedCount} {completedCount === 1 ? "buy" : "buys"}</div>
                  <div><div className={`text-sm font-medium ${contract.status === "overdue" ? "text-rose" : contract.status === "soon" ? "text-amber" : ""}`}><span className={contract.status === "overdue" || contract.status === "soon" ? "font-semibold" : undefined}>{contract.dueDate ?? "—"}</span></div><div className={`mt-1 text-xs ${contract.status === "overdue" ? "text-rose" : contract.status === "soon" ? "text-amber" : "text-subtle"}`}>{contract.dueDate ? (contract.contractStatus === "terminated" ? "terminated" : contract.contractStatus === "cancelled" ? "canceled" : contract.contractStatus === "settled" ? "settled" : contract.dueNote) : "No due date"}</div></div>
                  <div className="text-right text-base font-bold tabular-nums text-primary">{numberFmt.format(contract.outstandingRins)}</div>
                </Link>
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
          <div className="flex flex-col gap-3 border-t border-hair px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-subtle">
              {visibleContracts.length === 0
                ? "No contracts"
                : `Showing ${startIndex + 1}–${endIndex} of ${visibleContracts.length} contracts`}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-subtle">Rows</span>
                <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger aria-label="Rows per page" className="h-8 w-[72px] bg-panel"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((option) => <SelectItem key={option} value={String(option)}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-xs text-subtle">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
