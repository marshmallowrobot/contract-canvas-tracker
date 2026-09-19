import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Funnel, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { numberFmt, type RinCode } from "@/lib/contracts-data";
import {
  CLIENT_ID,
  CLIENT_NAME,
  formatLedgerDate,
  ledgerItemTypeMeta,
  ledgerItems,
  qapServiceTypeLabel,
  type LedgerItemType,
} from "@/lib/ledger-data";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "Client Ledger — Verdant Ledger" },
      { name: "description", content: "Chronological RIN ledger entries with running balance for a client." },
      { property: "og:title", content: "Client Ledger — Verdant Ledger" },
      { property: "og:description", content: "Chronological RIN ledger entries with running balance for a client." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LedgerPage,
});

const PAGE_SIZE_OPTIONS = [50, 100] as const;

const rinCodeClass: Record<RinCode, string> = {
  D3: "bg-rin-d3 text-rin-on-color",
  D4: "bg-rin-d4 text-rin-on-color",
  D5: "bg-rin-d5 text-rin-on-color",
  D6: "bg-rin-d6 text-rin-on-color",
  D7: "bg-rin-d7 text-rin-on-color",
};

function TypePill({ type }: { type: LedgerItemType }) {
  const meta = ledgerItemTypeMeta[type];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}>
      <i className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
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

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-bold uppercase text-ink">{children}</span>;
}

const inputClass =
  "mt-1 h-9 w-full rounded-md border border-input bg-panel px-3 text-sm shadow-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20";

function LedgerPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [contractFilter, setContractFilter] = useState("");
  const [externalFilter, setExternalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [transactionFilter, setTransactionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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

  const visibleRows = useMemo(() => {
    const contract = contractFilter.trim().toLowerCase();
    const external = externalFilter.trim().toLowerCase();
    const transaction = transactionFilter.trim().toLowerCase();
    return rows.filter((row) => {
      if (contract && !(row.buyContractId ?? "unassigned").toLowerCase().includes(contract)) return false;
      if (external && !(row.sourceSystemContractId ?? "").toLowerCase().includes(external)) return false;
      if (typeFilter !== "all" && row.ledgerItemType !== typeFilter) return false;
      if (transaction && !(row.transactionId ?? "").toLowerCase().includes(transaction)) return false;
      if (fromDate && row.timestamp < fromDate) return false;
      if (toDate && row.timestamp > toDate) return false;
      return true;
    });
  }, [contractFilter, externalFilter, fromDate, rows, toDate, transactionFilter, typeFilter]);

  const activeFilterCount =
    (contractFilter.trim() ? 1 : 0) +
    (externalFilter.trim() ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (transactionFilter.trim() ? 1 : 0) +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0);

  useEffect(() => {
    setPage(1);
  }, [contractFilter, externalFilter, typeFilter, transactionFilter, fromDate, toDate, pageSize]);

  const totalPages = Math.max(Math.ceil(visibleRows.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  // Newest first on screen; the running balance was already computed chronologically.
  const pageRows = [...visibleRows].reverse().slice(startIndex, startIndex + pageSize);
  const endIndex = Math.min(startIndex + pageRows.length, visibleRows.length);

  const credits = visibleRows.filter((r) => r.quantity > 0).reduce((s, r) => s + r.quantity, 0);
  const debits = visibleRows.filter((r) => r.quantity < 0).reduce((s, r) => s + Math.abs(r.quantity), 0);
  const closingBalance = rows.length ? rows[rows.length - 1]!.runningBalance : 0;

  const clearFilters = () => {
    setContractFilter("");
    setExternalFilter("");
    setTypeFilter("all");
    setTransactionFilter("");
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
          <h1 className="font-display text-2xl font-bold">Client Ledger</h1>
          <p className="mt-1 text-sm text-subtle">{CLIENT_NAME} · Client {CLIENT_ID} · all RIN ledger entries</p>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ledger summary">
          <StatCard label="Closing RIN balance" value={numberFmt.format(closingBalance)} note="All entries to date" tone="text-primary" />
          <StatCard label="RINs added" value={`+${numberFmt.format(credits)}`} note="Starting balances in view" />
          <StatCard label="RINs drawn down" value={`−${numberFmt.format(debits)}`} note="Buys, cancellations, write-offs" tone="text-rose" />
          <StatCard label="Ledger entries" value={numberFmt.format(visibleRows.length)} note={`of ${rows.length} total`} />
        </section>

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
                      placeholder="e.g. CT-4821"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <FilterLabel>External Contract ID</FilterLabel>
                    <input
                      value={externalFilter}
                      onChange={(event) => setExternalFilter(event.target.value)}
                      aria-label="Filter by external contract ID"
                      placeholder="e.g. EXT-88120"
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
                      placeholder="e.g. TX-91002"
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead>
                <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase text-subtle">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Ledger item</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Contract</th>
                  <th className="px-4 py-2 font-medium">Transaction</th>
                  <th className="px-4 py-2 font-medium">Fuel / year</th>
                  <th className="px-4 py-2 font-medium">Assignment</th>
                  <th className="px-4 py-2 font-medium">QAP</th>
                  <th className="px-4 py-2 text-right font-medium">Added</th>
                  <th className="px-4 py-2 text-right font-medium">Drawn down</th>
                  <th className="px-4 py-2 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.ledgerItemId} className="border-b border-hair last:border-0 hover:bg-table-head">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-subtle">{formatLedgerDate(row.timestamp)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold">{row.ledgerItemId}</div>
                      {row.notes && <div className="mt-0.5 max-w-[260px] text-[11px] text-subtle">{row.notes}</div>}
                    </td>
                    <td className="px-4 py-3"><TypePill type={row.ledgerItemType} /></td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold">
                        {row.buyContractId ? (
                          <Link to="/contracts/$contractId" params={{ contractId: row.buyContractId }} className="text-primary hover:underline">
                            {row.buyContractId}
                          </Link>
                        ) : (
                          <span className="text-subtle">Unassigned</span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-subtle">{row.sourceSystemContractId ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-subtle">{row.transactionId ?? "—"}</td>
                    <td className="px-4 py-3">
                      {row.fuelCode ? (
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rinCodeClass[row.fuelCode]}`}>{row.fuelCode}</span>
                          <span className="text-[11px] font-semibold text-subtle">{row.fuelYear ?? ""}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-subtle">{row.fuelYear ?? "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-subtle">
                      {row.assignmentType ? (row.assignmentType === "assigned" ? "Assigned" : "Separated") : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-subtle">
                      {row.qapServiceType ? qapServiceTypeLabel[row.qapServiceType] : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums text-moss">
                      {row.quantity > 0 ? numberFmt.format(row.quantity) : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums text-rose">
                      {row.quantity < 0 ? numberFmt.format(Math.abs(row.quantity)) : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-ink">
                      {numberFmt.format(row.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {visibleRows.length > 0 && (
                <tfoot>
                  <tr className="border-t border-hair bg-table-head text-[11px] font-bold uppercase text-subtle">
                    <td className="px-4 py-3" colSpan={8}>Totals in view</td>
                    <td className="px-4 py-3 text-right tabular-nums text-moss">{numberFmt.format(credits)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-rose">{numberFmt.format(debits)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">{numberFmt.format(closingBalance)}</td>
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
