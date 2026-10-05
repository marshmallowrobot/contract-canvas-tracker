import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Layers, ArrowRight, Check, ChevronRight, Funnel, Split, TriangleAlert, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSettlementSuggestions } from "@/lib/reconciliation.functions";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { contracts, numberFmt, type RinCode } from "@/lib/contracts-data";
import { matchSignals, pendingBuys, SIGNAL_FIELDS, type PendingBuy, type SettlementGroup } from "@/lib/reconciliation-data";

const openContracts = contracts.filter((contract) => contract.contractStatus === "open");

export const Route = createFileRoute("/reconciliation")({
  head: () => ({ meta: [
    { title: "RIN Buy Reconciliation — Verdant Ledger" },
    { name: "description", content: "Compare pending RIN buys with imported buy contracts before review." },
    { property: "og:title", content: "RIN Buy Reconciliation — Verdant Ledger" },
    { property: "og:description", content: "Compare pending RIN buys with imported buy contracts before review." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ReconciliationPage,
});

const fuelClass: Record<RinCode, string> = {
  D3: "bg-rin-d3 text-rin-on-color", D4: "bg-rin-d4 text-rin-on-color",
  D5: "bg-rin-d5 text-rin-on-color", D6: "bg-rin-d6 text-rin-on-color", D7: "bg-rin-d7 text-rin-on-color",
};
const matchLabel = { matched: "Matched", "needs-review": "Needs Review", unmatched: "Unmatched" } as const;

/** Why the engine selected the matched contract: one chip per search field, hit / miss / fuzzy. */
function MatchSignalChips({ buy }: { buy: PendingBuy }) {
  const signals = matchSignals[buy.id];
  if (!signals) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1" aria-label={`Match signals for ${buy.id}`}>
      {SIGNAL_FIELDS.map(({ key, label }) => {
        const value = signals[key];
        const hit = value === true;
        const fuzzy = value === "fuzzy";
        const title = hit
          ? `${label} found on ${buy.contractId}`
          : fuzzy
            ? `Partner differs slightly from ${buy.contractId} (fuzzy match)`
            : `${label} not found on ${buy.contractId ?? "any contract"}`;
        return (
          <span
            key={key}
            title={title}
            className={`rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide ${hit ? "border border-moss/40 bg-moss-soft text-moss" : fuzzy ? "border border-amber/40 bg-amber-soft text-amber" : "border border-hair text-subtle"}`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

/** Relative expiration label, e.g. "5 hours", "1 day", "5 days". */
function expirationLabel(days: number) {
  if (days <= 0) return "5 hours";
  return days === 1 ? "1 day" : `${days} days`;
}

/** Matched buy whose RINs land within 1% of the matched contract's balance — approving settles it. */
function wouldSettle(buy: PendingBuy) {
  return buy.match === "matched" && buy.contractOutstandingRins != null && buy.rins >= buy.contractOutstandingRins * 0.99;
}

function Fuel({ buy }: { buy: PendingBuy }) {
  return <div className="flex items-center gap-2 whitespace-nowrap">
    <span className={`inline-flex min-w-8 items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold ${fuelClass[buy.fuel]}`}>{buy.fuel}</span>
    <span className="rounded-full border border-hair bg-panel px-2 py-0.5 text-[10px] font-bold text-ink">{buy.year}</span>
    <span title={buy.assignment === "assigned" ? "Assigned" : "Separated"} aria-label={buy.assignment === "assigned" ? "Assigned" : "Separated"} className={`inline-flex size-5 items-center justify-center rounded-sm border ${buy.assignment === "assigned" ? "border-assigned-border bg-assigned text-assigned-foreground" : "border-hair bg-panel text-ink"}`}>
      {buy.assignment === "assigned" ? <ArrowRight className="size-3" /> : <Split className="size-3" />}
    </span>
  </div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] font-bold uppercase text-subtle">{label}</dt><dd className="mt-1 text-sm font-semibold text-ink">{value}</dd></div>;
}

function ReconciliationPage() {
  const [view, setView] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fuel, setFuel] = useState("all");
  const [partner, setPartner] = useState("all");
  const [ptdFilter, setPtdFilter] = useState("");
  const [contractFilter, setContractFilter] = useState("");
  const [dealFilter, setDealFilter] = useState("");
  const [selected, setSelected] = useState<PendingBuy | null>(null);
  /** Selection lives only while the review panel is open; closing the panel discards it. */
  const [chosenContract, setChosenContract] = useState<string | null>(null);
  const openReview = (buy: PendingBuy) => { setSelected(buy); setChosenContract(null); };
  const closeReview = () => { setSelected(null); setChosenContract(null); };
  const [group, setGroup] = useState<SettlementGroup | null>(null);
  const openGroup = (g: SettlementGroup) => { closeReview(); setGroup(g); };
  /** Computed server-side on demand, only for the buy being reviewed. */
  const fetchSuggestions = useServerFn(getSettlementSuggestions);
  const { data: suggestions = [] } = useQuery({
    queryKey: ["settlement-suggestions", selected?.id],
    queryFn: () => fetchSuggestions({ data: { buyId: selected!.id } }),
    enabled: !!selected && selected.match !== "matched",
  });
  const counts = {
    matched: pendingBuys.filter((buy) => buy.match === "matched").length,
    "needs-review": pendingBuys.filter((buy) => buy.match === "needs-review").length,
    unmatched: pendingBuys.filter((buy) => buy.match === "unmatched").length,
  };
  const partners = useMemo(() => [...new Set(pendingBuys.map((buy) => buy.partner))].sort(), []);
  const activeFilterCount = (fuel !== "all" ? 1 : 0) + (partner !== "all" ? 1 : 0) + (ptdFilter.trim() !== "" ? 1 : 0) + (contractFilter.trim() !== "" ? 1 : 0) + (dealFilter.trim() !== "" ? 1 : 0);
  const clearFilters = () => { setFuel("all"); setPartner("all"); setPtdFilter(""); setContractFilter(""); setDealFilter(""); setView("all"); };
  const visible = useMemo(() => pendingBuys.filter((buy) =>
    (view === "all" || buy.match === view) &&
    (fuel === "all" || buy.fuel === fuel) &&
    (partner === "all" || buy.partner === partner) &&
    (!ptdFilter.trim() || buy.ptd.toLowerCase().includes(ptdFilter.trim().toLowerCase())) &&
    (!contractFilter.trim() || buy.contractId?.toLowerCase().includes(contractFilter.trim().toLowerCase())) &&
    (!dealFilter.trim() || buy.dealNumber?.toLowerCase().includes(dealFilter.trim().toLowerCase()))
  ), [view, fuel, partner, ptdFilter, contractFilter, dealFilter]);
  /** Bulk-approve selection — Matched buys only; Needs Review and Unmatched must go through the Review panel. */
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const matchedVisible = visible.filter((buy) => buy.match === "matched");
  const allMatchedChecked = matchedVisible.length > 0 && matchedVisible.every((buy) => checkedIds.has(buy.id));
  const toggleBuy = (buy: PendingBuy) => setCheckedIds((prev) => {
    const next = new Set(prev);
    if (next.has(buy.id)) next.delete(buy.id); else next.add(buy.id);
    return next;
  });
  const toggleAllMatched = () => setCheckedIds((prev) => {
    const next = new Set(prev);
    if (allMatchedChecked) matchedVisible.forEach((buy) => next.delete(buy.id));
    else matchedVisible.forEach((buy) => next.add(buy.id));
    return next;
  });
  const approveSelected = () => setCheckedIds(new Set());
  const bulkApproveButton = (key: string) => checkedIds.size > 0 && (
    <Button key={key} size="sm" onClick={approveSelected}>
      Approve {checkedIds.size} matched {checkedIds.size === 1 ? "buy" : "buys"}
    </Button>
  );

  return <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
    <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-subtle hover:text-primary"><ArrowLeft className="size-4" /> Buy Contract Balances</Link>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-2xl font-bold">RIN Buy Reconciliation</h1><p className="mt-1 text-sm text-subtle">Evergreen Fuels Group (48217) · Pending buys</p></div>
        <div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" className="bg-panel text-primary hover:text-primary">Export</Button><Button size="sm" variant="outline" className="bg-panel text-primary hover:text-primary">Advanced Export</Button></div>
      </header>

      <div className={bulkApproveButton("top") ? "mb-4" : "mb-6"} role="group" aria-label="Filter pending buys by status">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-subtle">Filter by status</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {([ ["all", pendingBuys.length, "All pending buys"], ["matched", counts.matched, "Matched"], ["needs-review", counts["needs-review"], "Needs review"], ["unmatched", counts.unmatched, "Unmatched"] ] as const).map(([key, count, label]) =>
          <button key={key} type="button" onClick={() => setView(key)} aria-pressed={view === key}
            className={`group flex min-h-14 items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-left shadow-sm transition-colors ${view === key ? "border-primary bg-selected" : "border-hair bg-panel hover:border-primary/50"}`}>
            <span>
              <span className="block text-xs font-semibold text-ink">{label}</span>
              <span className={`font-display text-lg font-bold tabular-nums ${key === "needs-review" || key === "unmatched" ? "text-amber" : key === "matched" ? "text-moss" : "text-ink"}`}>{count}</span>
            </span>
            <span aria-hidden="true" className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${view === key ? "border-primary bg-primary" : "border-subtle group-hover:border-primary"}`}>
              {view === key && <Check className="size-2.5 text-primary-foreground" strokeWidth={3.5} />}
            </span>
          </button>
        )}
        </div>
      </div>
      {bulkApproveButton("top") && <div className="mb-4 flex justify-end">{bulkApproveButton("top")}</div>}

      <section className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-baseline gap-3"><h2 className="font-display text-base font-bold">Pending Buys</h2><span className="text-xs text-subtle">{visible.length} results</span></div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setFiltersOpen((open) => !open)} className="text-primary hover:text-primary" aria-expanded={filtersOpen}>
              <Funnel className="size-4" />
              {activeFilterCount > 0 ? `${activeFilterCount} ${activeFilterCount === 1 ? "filter" : "filters"}` : "Filters"}
            </Button>
            <span className="h-4 w-px bg-hair" aria-hidden />
            <Button variant="ghost" size="sm" onClick={clearFilters} disabled={activeFilterCount === 0} className="text-subtle disabled:opacity-50">Clear all</Button>
          </div>
        </div>
        {filtersOpen && <div className="relative mx-5 mb-5 mt-1 rounded-md border border-hair bg-table-head p-6">
          <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="absolute right-4 top-4 rounded p-1 text-subtle hover:bg-panel hover:text-ink"><X className="size-4" /></button>
          <div className="grid gap-x-6 gap-y-5 pr-8 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block"><span className="text-[11px] font-bold uppercase text-ink">Trading partner</span><Select value={partner} onValueChange={setPartner}><SelectTrigger aria-label="Filter by trading partner" className="mt-1 bg-panel"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All partners</SelectItem>{partners.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select></label>
            <label className="block"><span className="text-[11px] font-bold uppercase text-ink">Fuel code</span><Select value={fuel} onValueChange={setFuel}><SelectTrigger aria-label="Filter by fuel code" className="mt-1 bg-panel"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All fuels</SelectItem>{(["D3", "D4", "D5", "D6", "D7"] as const).map((code) => <SelectItem key={code} value={code}>{code}</SelectItem>)}</SelectContent></Select></label>
            <label className="block"><span className="text-[11px] font-bold uppercase text-ink">PTD</span><input aria-label="Filter by PTD" placeholder="Filter by PTD" value={ptdFilter} onChange={(event) => setPtdFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-panel px-3 text-sm shadow-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20" /></label>
            <label className="block"><span className="text-[11px] font-bold uppercase text-ink">Buy contract id</span><input aria-label="Filter by buy contract id" placeholder="Filter by buy contract ID" value={contractFilter} onChange={(event) => setContractFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-panel px-3 text-sm shadow-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20" /></label>
            <label className="block"><span className="text-[11px] font-bold uppercase text-ink">Source Key</span><input aria-label="Filter by source key" placeholder="Filter by source key" value={dealFilter} onChange={(event) => setDealFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-panel px-3 text-sm shadow-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20" /></label>
          </div>
          <div className="mt-6 flex justify-end"><Button size="sm" onClick={() => setFiltersOpen(false)}>Apply filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</Button></div>
        </div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-10" />
              <col className="w-[32%]" />
              <col className="w-[104px]" />
              <col className="w-[112px]" />
              <col className="w-[88px]" />
              <col className="w-[28%]" />
              <col className="w-[168px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase text-subtle"><th className="px-3 py-2"><input type="checkbox" aria-label="Select all matched buys" checked={allMatchedChecked} onChange={toggleAllMatched} disabled={matchedVisible.length === 0} className="size-4 accent-primary disabled:opacity-40" /></th><th className="px-5 py-2">Buy details</th><th className="px-2 py-2">Fuel</th><th className="px-2 py-2 text-right">RINs / Gal</th><th className="px-2 py-2 text-right">Price</th><th className="px-5 py-2">Auto-matched contract</th><th className="px-5 py-2">Match</th></tr>
            </thead>
            <tbody>{visible.map((buy) => <tr key={buy.id} className="border-b border-hair last:border-0 hover:bg-table-head">
              <td className="px-3 py-3">{buy.match === "matched" ? <input type="checkbox" aria-label={`Select matched buy from ${buy.partner}`} checked={checkedIds.has(buy.id)} onChange={() => toggleBuy(buy)} className="size-4 accent-primary" /> : <span className="text-subtle" aria-hidden="true">—</span>}</td>
              <td className="px-5 py-3 align-top">
                <div className="text-xs font-semibold">{buy.partner}</div>
                <div className="mt-1 text-[11px] text-subtle"><span className="break-all">{buy.ptd}</span> · <span className="break-all">{buy.bol}</span></div>
                <div className="break-all text-[11px] text-subtle">{buy.invoice}</div>
                <div className={`mt-1 text-[11px] font-semibold ${buy.expiresInDays <= 1 ? "text-rose" : buy.expiresInDays <= 5 ? "text-amber" : "text-ink"}`}>Expires in {expirationLabel(buy.expiresInDays)}</div>
              </td>
              <td className="px-2 py-3"><Fuel buy={buy} /></td>
              <td className="px-2 py-3 text-right tabular-nums"><div className="font-semibold">{numberFmt.format(buy.rins)}</div><div className="text-[11px] text-subtle">{numberFmt.format(buy.gallons)} gal</div></td>
              <td className="px-2 py-3 text-right text-xs font-semibold tabular-nums">{buy.price}</td>
              <td className="px-5 py-3 align-top">
                {buy.contractId ? (
                  <div>
                    <div className="text-xs font-medium">{buy.contractPartner ?? buy.partner}</div>
                    <div className="mt-0.5 text-[11px] text-subtle">{buy.dealNumber}</div>
                    <div className="mt-0.5 text-[11px] text-subtle">Balance {numberFmt.format(buy.contractOutstandingRins ?? 0)} RINs</div>
                  </div>
                ) : (
                  <span className="text-subtle" aria-hidden="true">—</span>
                )}
              </td>
              <td className="px-5 py-3"><div className="flex items-start justify-between gap-2"><div><span className={`whitespace-nowrap text-xs font-semibold ${buy.match === "matched" ? "text-moss" : "text-amber"}`}>{matchLabel[buy.match]}</span>{wouldSettle(buy) && <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-settle" title="Contract would settle"><TriangleAlert className="size-3" /> Would settle</span>}<MatchSignalChips buy={buy} /></div><Button variant="ghost" size="icon" className="size-7 shrink-0 text-primary" title={`Review ${buy.id}`} aria-label={`Review ${buy.id}`} onClick={() => openReview(buy)}><ChevronRight className="size-4" /></Button></div></td>
            </tr>)}</tbody>
          </table>
          {visible.length === 0 && <div className="py-12 text-center text-sm text-subtle">No pending buys match these filters.</div>}
        </div>
          <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3 text-xs text-subtle"><span>Showing {visible.length} of {pendingBuys.length} pending buys</span></div>
        </section>
        {bulkApproveButton("bottom") && <div className="mt-3 flex justify-end">{bulkApproveButton("bottom")}</div>}
      </main>

    <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) closeReview(); }}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto bg-canvas p-0 sm:max-w-[560px]">
        {selected && <>
          <SheetHeader className="border-b border-hair bg-panel px-6 py-5 text-left"><SheetDescription className="sr-only">Review pending buy {selected.id}</SheetDescription><div className="flex items-start justify-between gap-3 pr-4"><SheetTitle className="font-display text-xl text-ink">Review Incoming Buy</SheetTitle><span className={`mt-1 shrink-0 whitespace-nowrap rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${selected.match === "matched" ? "bg-moss-soft text-moss" : "bg-amber-soft text-amber"}`}>{matchLabel[selected.match]}</span></div></SheetHeader>
          <div className="flex-1 space-y-5 px-6 pb-6 pt-4">
            <section><h3 className="mb-3 font-display text-sm font-bold">Incoming RIN buy</h3><dl className="grid grid-cols-2 gap-4 rounded-md border border-hair bg-panel p-4"><Detail label="Trading partner" value={selected.partner} /><Detail label="RIN quantity" value={numberFmt.format(selected.rins)} /><Detail label="Gallons" value={numberFmt.format(selected.gallons)} /><Detail label="Price" value={selected.price} /><div><dt className="text-[10px] font-bold uppercase text-subtle">Fuel / assignment</dt><dd className="mt-2 flex items-center gap-1.5"><span className={`inline-flex min-w-8 items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold ${fuelClass[selected.fuel]}`}>{selected.fuel}</span> <span className="rounded-full border border-hair bg-panel px-2 py-0.5 text-[10px] font-bold text-ink">{selected.year}</span> <span title={selected.assignment === "assigned" ? "Assigned" : "Separated"} aria-label={selected.assignment === "assigned" ? "Assigned" : "Separated"} className={`inline-flex size-5 items-center justify-center rounded-sm border ${selected.assignment === "assigned" ? "border-assigned-border bg-assigned text-assigned-foreground" : "border-hair bg-panel text-ink"}`}>{selected.assignment === "assigned" ? <ArrowRight className="size-3" /> : <Split className="size-3" />}</span></dd></div><Detail label="Invoice number" value={selected.invoice} /><Detail label="PTD number" value={selected.ptd} /><Detail label="Bill of lading" value={selected.bol} /><Detail label="Received" value={selected.received} /><div><dt className="text-[10px] font-bold uppercase text-subtle">Expires in</dt><dd className={`mt-2 text-sm font-semibold ${selected.expiresInDays <= 1 ? "text-rose" : selected.expiresInDays <= 5 ? "text-amber" : "text-ink"}`}>{expirationLabel(selected.expiresInDays)}</dd></div></dl></section>

            {suggestions.length > 0 && <div className="rounded-md bg-settle-soft p-4"><p className="text-xs font-semibold text-ink"><Layers className="mr-1 inline size-3.5 text-settle" />Possible settlement {suggestions.length === 1 ? "group" : "groups"}</p><p className="mt-1 text-[11px] text-subtle">Buys that together land within 1% of the contracts' outstanding balance</p><ul className="mt-3 space-y-2">{suggestions.map((g) => <li key={g.key} className="flex items-center justify-between gap-3 rounded border border-hair bg-panel px-3 py-2"><div className="text-xs"><span className="font-bold text-ink">{g.contractId}</span> <span className="text-subtle">· {g.partner}</span><div className="mt-0.5 text-[11px] text-subtle">This buy + {g.buys.length - 1} other{g.buys.length > 2 ? "s" : ""} · {numberFmt.format(g.total)} / {numberFmt.format(g.outstandingRins)} RINs</div></div><Button size="sm" variant="outline" className="shrink-0" onClick={() => openGroup(g)}>Review group</Button></li>)}</ul></div>}

            <section>
              <h3 className="mb-1 font-display text-sm font-bold">Apply this buy to a contract</h3>
              <p className="mb-3 text-xs text-subtle">Choose one option below. Your choice is not saved if you close this panel.</p>
              <div className="space-y-4" role="radiogroup" aria-label="Contract selection">

                {(selected.candidateContracts?.length || selected.contractId) && <div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-subtle">
                    {selected.candidateContracts?.length ? `Matching contracts (${selected.candidateContracts.length})` : "Matching contract"}
                  </div>
                  <div className="space-y-2">
                    {(selected.candidateContracts ?? []).map((candidate) => <button key={candidate.contractId} type="button" role="radio" aria-checked={chosenContract === candidate.contractId} onClick={() => setChosenContract(candidate.contractId)}
                      className={`flex w-full items-start gap-3 rounded-md border p-4 text-left shadow-sm transition-colors ${chosenContract === candidate.contractId ? "border-primary bg-selected" : "border-hair bg-panel hover:border-primary/50"}`}>
                      <span aria-hidden="true" className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${chosenContract === candidate.contractId ? "border-primary bg-primary" : "border-subtle"}`}>
                        {chosenContract === candidate.contractId && <Check className="size-2.5 text-primary-foreground" strokeWidth={3.5} />}
                      </span>
                      <span className="flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm font-bold text-ink">{candidate.contractId}</span><span className="text-xs font-semibold text-primary">{candidate.dealNumber}</span></span>
                        <span className="mt-1 block text-xs text-subtle">{candidate.partner} · {candidate.dueDate ? `Due ${candidate.dueDate}` : "No due date"}</span>
                        <span className="mt-1 block text-xs text-subtle">Outstanding {numberFmt.format(candidate.outstandingRins)} RINs</span>
                        <span className="mt-1 block text-[11px] font-semibold text-amber">Matched on {candidate.matchedOn}</span>
                      </span>
                    </button>)}
                    {!selected.candidateContracts?.length && selected.contractId && (() => {
                      const match = openContracts.find((contract) => contract.contractId === selected.contractId);
                      return <button type="button" role="radio" aria-checked={chosenContract === selected.contractId} onClick={() => setChosenContract(selected.contractId)}
                        className={`flex w-full items-start gap-3 rounded-md border p-4 text-left shadow-sm transition-colors ${chosenContract === selected.contractId ? "border-primary bg-selected" : "border-hair bg-panel hover:border-primary/50"}`}>
                        <span aria-hidden="true" className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${chosenContract === selected.contractId ? "border-primary bg-primary" : "border-subtle"}`}>
                          {chosenContract === selected.contractId && <Check className="size-2.5 text-primary-foreground" strokeWidth={3.5} />}
                        </span>
                        <span className="flex-1">
                          <span className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm font-bold text-ink">{selected.contractId}</span><span className="text-xs font-semibold text-primary">{selected.dealNumber}</span></span>
                          <span className="mt-1 block text-xs text-subtle">{selected.contractPartner ?? selected.partner} · {selected.dueDate ? `Due ${selected.dueDate}` : "No due date"}</span>
                          <span className="mt-1 block text-xs text-subtle">Outstanding {numberFmt.format(selected.contractOutstandingRins ?? match?.outstandingRins ?? 0)} RINs</span>
                          <span className="mt-1 block text-[11px] font-semibold text-amber">{selected.fuzzy ? "Fuzzy match on trading partner" : "Matched on trading partner"}</span>
                        </span>
                      </button>;
                    })()}
                  </div>
                </div>}

                {openContracts.length > 0 && <div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-subtle">Choose any open contract</div>
                  <Select value={chosenContract && !selected.candidateContracts?.some((c) => c.contractId === chosenContract) && chosenContract !== selected.contractId ? chosenContract : ""} onValueChange={(value) => setChosenContract(value)}>
                    <SelectTrigger aria-label="Choose from all open contracts" className="w-full bg-panel"><SelectValue placeholder="Select an open contract…" /></SelectTrigger>
                    <SelectContent>
                      {openContracts.map((contract) => <SelectItem key={contract.contractId} value={contract.contractId}>
                        {contract.contractId} · {contract.dealNumber} · {contract.counterparty}
                      </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>}

                <div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-subtle">Or leave unassigned</div>
                  <button type="button" role="radio" aria-checked={chosenContract === "unreconciled"} onClick={() => setChosenContract("unreconciled")}
                    className={`flex w-full items-start gap-3 rounded-md border p-4 text-left shadow-sm transition-colors ${chosenContract === "unreconciled" ? "border-primary bg-selected" : "border-hair bg-panel hover:border-primary/50"}`}>
                    <span aria-hidden="true" className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${chosenContract === "unreconciled" ? "border-primary bg-primary" : "border-subtle"}`}>
                      {chosenContract === "unreconciled" && <Check className="size-2.5 text-primary-foreground" strokeWidth={3.5} />}
                    </span>
                    <span className="flex-1">
                      <span className="text-sm font-bold text-ink">Approve as Unreconciled Buy</span>
                      <span className="mt-1 block text-xs text-subtle">The {numberFmt.format(selected.rins)} RINs are added to the Unassigned pool instead of a contract.</span>
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {(() => {
              if (!chosenContract || chosenContract === "unreconciled") return null;
              const candidate = selected.candidateContracts?.find((c) => c.contractId === chosenContract);
              const outstanding = candidate?.outstandingRins
                ?? (selected.contractId === chosenContract ? selected.contractOutstandingRins ?? openContracts.find((c) => c.contractId === chosenContract)?.outstandingRins : undefined)
                ?? openContracts.find((c) => c.contractId === chosenContract)?.outstandingRins;
              if (outstanding == null) return null;
              if (selected.rins < outstanding * 0.99) return null;
              const overflow = selected.rins - outstanding;
              return <div role="alert" className="rounded-md bg-settle-soft p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-settle">Contract would settle</p>
                <p className="mt-1 text-xs leading-relaxed text-ink">
                  {overflow > 0
                    ? `The buy's ${numberFmt.format(selected.rins)} RINs exceed ${chosenContract}'s outstanding balance of ${numberFmt.format(outstanding)} RINs. Approving settles the contract and moves the extra ${numberFmt.format(overflow)} RINs to the Unassigned pool.`
                    : overflow === 0
                      ? `The buy's ${numberFmt.format(selected.rins)} RINs exactly match ${chosenContract}'s outstanding balance. Approving settles the contract.`
                      : `The buy's ${numberFmt.format(selected.rins)} RINs are within 1% of ${chosenContract}'s outstanding balance of ${numberFmt.format(outstanding)} RINs. Approving settles the contract.`}
                </p>
              </div>;
            })()}

          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-hair bg-panel px-6 py-4">
            <Button variant="outline" onClick={closeReview}>Back to pending buys</Button>
            <Button disabled={chosenContract === null}>{chosenContract === "unreconciled" ? "Approve as Unreconciled" : chosenContract ? `Approve for ${chosenContract}` : "Approve"}</Button>
          </div>
        </>}
      </SheetContent>
    </Sheet>

    <Sheet open={group !== null} onOpenChange={(open) => { if (!open) setGroup(null); }}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto bg-canvas p-0 sm:max-w-[560px]">
        {group && <>
          <SheetHeader className="border-b border-hair bg-panel px-6 py-5 text-left"><SheetDescription className="sr-only">Review a group of buys that together settle {group.contractId}</SheetDescription><SheetTitle className="font-display text-xl text-ink">Review Settlement Group</SheetTitle></SheetHeader>
          <div className="flex-1 space-y-5 px-6 pb-6 pt-4">
            <section><h3 className="mb-3 font-display text-sm font-bold">Contract to settle</h3>
              <div className="rounded-md border border-hair bg-panel p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm font-bold text-ink">{group.contractId}</span><span className="text-xs font-semibold text-primary">{group.dealNumber}</span></div>
                <p className="mt-1 text-xs text-subtle">Contract partner: {group.partner}</p>
                <div className="mt-3 flex items-baseline justify-between text-xs"><span className="text-subtle">Group total / outstanding</span><span className="font-bold tabular-nums text-ink">{numberFmt.format(group.total)} / {numberFmt.format(group.outstandingRins)} RINs</span></div>
                <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-table-head">{group.buys.map((b, i) => <div key={b.id} className={`h-full bg-settle ${i > 0 ? "border-l-2 border-panel" : ""}`} style={{ width: `${(b.rins / group.outstandingRins) * 100}%`, opacity: 1 - i * 0.2 }} />)}</div>
              </div>
            </section>
            <section><h3 className="mb-3 font-display text-sm font-bold">Buys in this group ({group.buys.length})</h3>
              <div className="overflow-hidden rounded-md border border-hair bg-panel">
                {group.buys.map((b) => <div key={b.id} className="flex items-center justify-between gap-3 border-b border-hair px-4 py-3 last:border-0">
                  <div><div className="text-xs font-semibold text-ink">{b.partner}</div><div className="mt-1 flex items-center gap-2"><Fuel buy={b} /></div><p className="mt-1 text-[11px] text-subtle">{b.ptd} · {b.invoice} · {b.received}</p></div>
                  <div className="text-right"><div className="text-sm font-semibold tabular-nums">{numberFmt.format(b.rins)}</div><div className={`text-[11px] font-semibold ${b.expiresInDays <= 1 ? "text-rose" : b.expiresInDays <= 5 ? "text-amber" : "text-subtle"}`}>Expires in {expirationLabel(b.expiresInDays)}</div></div>
                </div>)}
                <div className="flex items-center justify-between bg-table-head px-4 py-2.5 text-xs font-bold"><span>Total</span><span className="tabular-nums">{numberFmt.format(group.total)} RINs</span></div>
              </div>
            </section>
            <div role="alert" className="rounded-md bg-settle-soft p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-settle">Contract would settle</p>
              <p className="mt-1 text-xs leading-relaxed text-ink">Approving all {group.buys.length} buys applies {numberFmt.format(group.total)} RINs to {group.contractId}{group.total === group.outstandingRins ? ", exactly matching its outstanding balance" : `, within 1% of its ${numberFmt.format(group.outstandingRins)} outstanding RINs`}. The contract settles. To handle a buy differently, review it on its own instead.</p>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-hair bg-panel px-6 py-4">
            <Button variant="outline" onClick={() => setGroup(null)}>Back to pending buys</Button>
            <Button>Approve all {group.buys.length} for {group.contractId}</Button>
          </div>
        </>}
      </SheetContent>
    </Sheet>
  </div>;
}
