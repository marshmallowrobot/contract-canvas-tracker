import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, Funnel, MessageSquareText, Split, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getContract, numberFmt, type AssignmentType, type RinCode } from "@/lib/contracts-data";
import {
  EPA_ID,
  CLIENT_NAME,
  formatLedgerDate,
  ledgerItemTypeMeta,
  ledgerItems,
  type LedgerItemType,
} from "@/lib/ledger-data";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "RIN Balance Ledger — Verdant Ledger" },
      { name: "description", content: "Chronological RIN ledger entries with running balance for a client." },
      { property: "og:title", content: "RIN Balance Ledger — Verdant Ledger" },
      { property: "og:description", content: "Chronological RIN ledger entries with running balance for a client." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LedgerPage,
});

const PAGE_SIZE_OPTIONS = [50, 100] as const;

type SortDirection = "asc" | "desc";

const rinCodeClass: Record<RinCode, string> = {
  D3: "bg-rin-d3 text-rin-on-color",
  D4: "bg-rin-d4 text-rin-on-color",
  D5: "bg-rin-d5 text-rin-on-color",
  D6: "bg-rin-d6 text-rin-on-color",
  D7: "bg-rin-d7 text-rin-on-color",
};

function AssignmentMark({ type }: { type: AssignmentType }) {
  const assigned = type === "assigned";
  return (
    <span
      title={assigned ? "Assigned" : "Separated"}
      aria-label={assigned ? "Assigned" : "Separated"}
      className={`inline-flex size-5 items-center justify-center rounded-sm border ${assigned ? "border-assigned-border bg-assigned text-assigned-foreground" : "border-hair bg-panel text-ink"}`}
    >
      {assigned ? <ArrowUp className="size-3" strokeWidth={2.6} /> : <Split className="size-3" strokeWidth={2.6} />}
    </span>
  );
}

function TypePill({ type }: { type: LedgerItemType }) {
  const meta = ledgerItemTypeMeta[type];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}>
      <i className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}


function FilterLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-bold uppercase text-ink">{children}</span>;
}

const inputClass =
  "mt-1 h-9 w-full rounded-md border border-input bg-panel px-3 text-sm shadow-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20";

function LedgerPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [contractFilter, setContractFilter] = useState("");
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [dealFilter, setDealFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [transactionFilter, setTransactionFilter] = useState("");
  const [ledgerItemFilter, setLedgerItemFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateSort, setDateSort] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);

  /** Running balance is computed over the full ledger, oldest first, so it
   * stays correct no matter which rows the filters reveal. */
  const rows = useMemo(() => {
    const ordered = [...ledgerItems].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    let balance = 0;
    return ordered.map((item) => {
      balance += item.quantity;
      return { ...item, runningBalance: balance };
    });
  }, []);

  /** Filtering by contract or deal number is a special case: the Balance
   * column then shows that contract's own running balance instead of the
   * client-wide one. */
  const contractScopeActive = Boolean(contractFilter.trim() || dealFilter.trim());

  const scopedBalances = useMemo(() => {
    if (!contractScopeActive) return new Map<string, number>();
    const contract = contractFilter.trim().toLowerCase();
    const deal = dealFilter.trim().toLowerCase();
    let balance = 0;
    const map = new Map<string, number>();
    for (const row of rows) {
      const inScope =
        (contract && (row.buyContractId ?? "").toLowerCase() === contract) ||
        (deal && (row.buyContractId ? (getContract(row.buyContractId)?.dealNumber ?? "").toLowerCase() === deal : false));
      if (inScope) {
        balance += row.quantity;
        map.set(row.ledgerItemId, balance);
      }
    }
    return map;
  }, [contractScopeActive, contractFilter, dealFilter, rows]);

  const visibleRows = useMemo(() => {
    const contract = contractFilter.trim().toLowerCase();
    const deal = dealFilter.trim().toLowerCase();
    const transaction = transactionFilter.trim().toLowerCase();
    const ledgerItem = ledgerItemFilter.trim().toLowerCase();
    return rows.filter((row) => {
      if (contract && (row.buyContractId ?? "").toLowerCase() !== contract) return false;
      if (deal) {
        const dealNumber = row.buyContractId ? getContract(row.buyContractId)?.dealNumber ?? "" : "";
        if (dealNumber.toLowerCase() !== deal) return false;
      }
      if (typeFilter !== "all" && row.ledgerItemType !== typeFilter) return false;
      if (transaction && !(row.transactionId ?? "").toLowerCase().includes(transaction)) return false;
      if (ledgerItem && !row.ledgerItemId.toLowerCase().includes(ledgerItem)) return false;
      if (fromDate && row.timestamp < fromDate) return false;
      if (toDate && row.timestamp > toDate) return false;
      return true;
    });
  }, [contractFilter, dealFilter, fromDate, ledgerItemFilter, rows, toDate, transactionFilter, typeFilter]);

  const activeFilterCount =
    (contractFilter.trim() ? 1 : 0) +
    (dealFilter.trim() ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (transactionFilter.trim() ? 1 : 0) +
    (ledgerItemFilter.trim() ? 1 : 0) +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0);

  useEffect(() => {
    setPage(1);
  }, [contractFilter, dealFilter, ledgerItemFilter, typeFilter, transactionFilter, fromDate, toDate, dateSort, pageSize]);

  const totalPages = Math.max(Math.ceil(visibleRows.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  // Date sort drives the on-screen order (newest first by default); the
  // running balance was already computed chronologically.
  const pageRows = [...visibleRows]
    .sort((a, b) => (dateSort === "asc" ? a.timestamp.localeCompare(b.timestamp) : b.timestamp.localeCompare(a.timestamp)))
    .slice(startIndex, startIndex + pageSize);
  const endIndex = Math.min(startIndex + pageRows.length, visibleRows.length);

  const credits = visibleRows.filter((r) => r.quantity > 0).reduce((s, r) => s + r.quantity, 0);
  const debits = visibleRows.filter((r) => r.quantity < 0).reduce((s, r) => s + Math.abs(r.quantity), 0);

  /** With filters active, anchor the slice: the running balance of the last
   * row hidden just before the first visible one (0 when the slice starts
   * at the very beginning of the ledger). Only meaningful when the Balance
   * column is shown — unfiltered, or scoped to a contract/deal. */
  const openingBalance = useMemo(() => {
    if (activeFilterCount === 0 || visibleRows.length === 0) return null;
    const firstIndex = rows.findIndex((row) => row.ledgerItemId === visibleRows[0]!.ledgerItemId);
    if (contractScopeActive) {
      const prior = rows.slice(0, firstIndex).filter((row) => scopedBalances.has(row.ledgerItemId));
      return prior.length ? scopedBalances.get(prior[prior.length - 1]!.ledgerItemId)! : 0;
    }
    return firstIndex > 0 ? rows[firstIndex - 1]!.runningBalance : 0;
  }, [activeFilterCount, contractScopeActive, rows, scopedBalances, visibleRows]);

  /** Balance column: shown unfiltered (client-wide) or when scoped to a
   * contract/deal (that contract's balance); hidden for any other filter. */
  const showBalance = activeFilterCount === 0 || contractScopeActive;

  const clearFilters = () => {
    setContractFilter("");
    setDealFilter("");
    setTypeFilter("all");
    setTransactionFilter("");
    setLedgerItemFilter("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3 text-subtle">
          <Link to="/"><ArrowLeft />Buy Contract Balances</Link>
        </Button>

        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold">RIN Balance Ledger</h1>
          <p className="mt-1 text-sm text-subtle">{CLIENT_NAME} ({EPA_ID})</p>
        </header>


        <section className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm">
          <div className="border-b border-hair px-5 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-base font-bold">Ledger Items</h2>
                <span className="text-xs text-subtle">{visibleRows.length} results</span>
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block">
                    <FilterLabel>Buy Contract ID</FilterLabel>
                    <input
                      value={contractFilter}
                      onChange={(event) => setContractFilter(event.target.value)}
                      aria-label="Filter by buy contract ID"
                      placeholder="Exact match, e.g. CT-4821"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <FilterLabel>Deal Number</FilterLabel>
                    <input
                      value={dealFilter}
                      onChange={(event) => setDealFilter(event.target.value)}
                      aria-label="Filter by deal number"
                      placeholder="Exact match, e.g. CONTI26TP0002"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <FilterLabel>Ledger Item Type</FilterLabel>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger aria-label="Filter by ledger item type" className="mt-1 bg-panel">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {(Object.keys(ledgerItemTypeMeta) as LedgerItemType[]).map((key) => (
                          <SelectItem key={key} value={key}>{ledgerItemTypeMeta[key].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="block">
                    <FilterLabel>Transaction ID</FilterLabel>
                    <input
                      value={transactionFilter}
                      onChange={(event) => setTransactionFilter(event.target.value)}
                      aria-label="Filter by transaction ID"
                      placeholder="e.g. 91002"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <FilterLabel>Ledger Item ID</FilterLabel>
                    <input
                      value={ledgerItemFilter}
                      onChange={(event) => setLedgerItemFilter(event.target.value)}
                      aria-label="Filter by ledger item ID"
                      placeholder="e.g. LI-100001"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <FilterLabel>From date</FilterLabel>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                      aria-label="Filter from date"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <FilterLabel>To date</FilterLabel>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(event) => setToDate(event.target.value)}
                      aria-label="Filter to date"
                      className={inputClass}
                    />
                  </label>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={() => setFiltersOpen(false)}>
                    Apply filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {showBalance && openingBalance !== null && (
            <div className="flex items-center justify-between border-b border-hair bg-canvas px-5 py-2 text-xs">
              <span className="text-subtle">Balance before this view</span>
              <span className="font-bold tabular-nums text-ink">{numberFmt.format(openingBalance)}</span>
            </div>
          )}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[840px] text-left">
              <thead>
                <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase text-subtle">
                  <th className="px-5 py-2.5 font-medium" aria-sort={dateSort === "asc" ? "ascending" : "descending"}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 h-7 px-2 text-[10px] font-bold uppercase text-subtle hover:text-ink"
                      onClick={() => setDateSort((dir) => (dir === "asc" ? "desc" : "asc"))}
                      aria-label={`Sort by date, currently ${dateSort === "asc" ? "oldest first" : "newest first"}`}
                    >
                      Ledger item
                      {dateSort === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    </Button>
                  </th>
                  <th className="px-5 py-2.5 font-medium">Type</th>
                  <th className="px-5 py-2.5 font-medium">Contract</th>
                  <th className="px-5 py-2.5 font-medium">Transaction</th>
                  <th className="px-5 py-2.5 font-medium">Fuel</th>
                  <th className="px-5 py-2.5 text-right font-medium">Quantity</th>
                  {showBalance && <th className="px-5 py-2.5 text-right font-medium">Balance</th>}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const dealNumber = row.buyContractId
                    ? getContract(row.buyContractId)?.dealNumber ?? null
                    : null;
                  return (
                  <tr key={row.ledgerItemId} className="border-b border-hair last:border-0 hover:bg-table-head">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="text-xs font-semibold">{formatLedgerDate(row.timestamp)}</div>
                        {row.notes && (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <button type="button" aria-label={`Note for ${row.ledgerItemId}`} className="text-subtle hover:text-primary">
                                <MessageSquareText className="size-3.5" />
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent align="start" side="top" className="w-72 max-w-[280px] border-hair bg-panel p-3">
                              <div className="text-[10px] font-bold uppercase text-subtle">Note</div>
                              <div className="mt-1 text-xs text-ink">{row.notes}</div>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-subtle">{row.ledgerItemId}</div>
                    </td>
                    <td className="px-5 py-3.5"><TypePill type={row.ledgerItemType} /></td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="text-xs font-semibold">
                        {row.buyContractId ? (
                          <Link to="/contracts/$contractId" params={{ contractId: row.buyContractId }} className="text-primary hover:underline">
                            {row.buyContractId}
                          </Link>
                        ) : (
                          <span className="text-subtle">Unassigned</span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-subtle">{dealNumber ?? "—"}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-subtle">
                      {row.transactionId ?? "—"}
                      <div className="mt-0.5 text-[11px]">{row.createdBy}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      {row.fuelCode ? (
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rinCodeClass[row.fuelCode]}`}>{row.fuelCode}</span>
                          <span className="rounded-full border border-hair bg-panel px-2 py-0.5 text-[10px] font-bold text-ink">{row.fuelYear}</span>
                          {row.assignmentType && <AssignmentMark type={row.assignmentType} />}
                        </div>
                      ) : (
                        <span className="text-xs text-subtle">—</span>
                      )}
                    </td>
                    <td className={`px-5 py-3.5 text-right text-xs font-bold tabular-nums ${row.quantity >= 0 ? "text-ink" : "text-rose"}`}>
                      {row.quantity > 0 ? `+${numberFmt.format(row.quantity)}` : numberFmt.format(row.quantity)}
                    </td>
                    {showBalance && (
                      <td className="px-5 py-3.5 text-right text-xs font-bold tabular-nums text-ink">
                        {numberFmt.format(contractScopeActive ? scopedBalances.get(row.ledgerItemId) ?? row.runningBalance : row.runningBalance)}
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
              {visibleRows.length > 0 && (
                <tfoot>
                  <tr className="border-t border-hair bg-table-head text-[11px] font-bold uppercase text-subtle">
                    <td className="px-5 py-3" colSpan={5}>Totals in view</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${credits - debits >= 0 ? "text-ink" : "text-rose"}`}>
                      {credits - debits > 0 ? `+${numberFmt.format(credits - debits)}` : numberFmt.format(credits - debits)}
                    </td>
                    {showBalance && (
                      <td className="px-4 py-3 text-right tabular-nums text-ink">
                        {numberFmt.format(
                          contractScopeActive
                            ? scopedBalances.get(visibleRows[visibleRows.length - 1]!.ledgerItemId) ?? 0
                            : visibleRows[visibleRows.length - 1]?.runningBalance ?? 0,
                        )}
                      </td>
                    )}
                  </tr>
                </tfoot>
              )}
            </table>
            {!visibleRows.length && (
              <div className="px-5 py-12 text-center">
                <div className="text-sm font-semibold">No matching ledger items</div>
                <div className="mt-1 text-xs text-subtle">Adjust the filters or clear them to see every entry.</div>
                <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Clear filters</Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-hair px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-subtle">
              {visibleRows.length === 0
                ? "No ledger items"
                : `Showing ${startIndex + 1}–${endIndex} of ${visibleRows.length} ledger items`}
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
                <Button variant="outline" size="icon" className="size-8" onClick={() => setPage((c) => Math.max(1, c - 1))} disabled={currentPage <= 1} aria-label="Previous page">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-8" onClick={() => setPage((c) => Math.min(totalPages, c + 1))} disabled={currentPage >= totalPages} aria-label="Next page">
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
