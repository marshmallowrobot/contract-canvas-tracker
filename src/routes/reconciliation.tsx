import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Filter, Search, Split, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { contracts, numberFmt, type RinCode } from "@/lib/contracts-data";
import { pendingBuys, type PendingBuy } from "@/lib/reconciliation-data";

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

function Fuel({ buy }: { buy: PendingBuy }) {
  return <div className="flex items-center gap-2 whitespace-nowrap">
    <span className={`inline-flex min-w-8 items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold ${fuelClass[buy.fuel]}`}>{buy.fuel}</span>
    <span className="text-xs text-subtle">{buy.year}</span>
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
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fuel, setFuel] = useState("all");
  const [selected, setSelected] = useState<PendingBuy | null>(null);
  /** Selection lives only while the review panel is open; closing the panel discards it. */
  const [chosenContract, setChosenContract] = useState<string | null>(null);
  const openReview = (buy: PendingBuy) => { setSelected(buy); setChosenContract(null); };
  const closeReview = () => { setSelected(null); setChosenContract(null); };
  const counts = {
    matched: pendingBuys.filter((buy) => buy.match === "matched").length,
    "needs-review": pendingBuys.filter((buy) => buy.match === "needs-review").length,
    unmatched: pendingBuys.filter((buy) => buy.match === "unmatched").length,
  };
  const visible = useMemo(() => pendingBuys.filter((buy) =>
    (view === "all" || buy.match === view) &&
    (fuel === "all" || buy.fuel === fuel) &&
    (!query.trim() || [buy.id, buy.contractId, buy.dealNumber, buy.partner, buy.invoice, buy.ptd, buy.bol]
      .some((value) => value?.toLowerCase().includes(query.trim().toLowerCase())))
  ), [view, fuel, query]);

  return <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
    <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-subtle hover:text-primary"><ArrowLeft className="size-4" /> Buy Contract Balances</Link>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-2xl font-bold">RIN Buy Reconciliation</h1><p className="mt-1 text-sm text-subtle">Evergreen Fuels Group (48217) · Pending buys</p></div>
        <div className="text-xs font-medium text-subtle">Awaiting review · No RIN balances affected</div>
      </header>

      <div className="mb-6" role="group" aria-label="Filter pending buys by status">
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

      <section className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair px-5 py-3">
          <div className="flex items-baseline gap-3"><h2 className="font-display text-base font-bold">Pending Buys</h2><span className="text-xs text-subtle">{visible.length} results</span></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative"><Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-subtle" /><Input aria-label="Search pending buys" placeholder="Search buys or contracts" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-52 bg-panel pl-8 text-xs sm:w-60" /></div>
            <Button variant="ghost" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} className="text-primary"><Filter className="size-4" /> Filters <ChevronDown className="size-3" /></Button>
          </div>
        </div>
        {filtersOpen && <div className="flex flex-wrap items-end gap-3 border-b border-hair bg-table-head px-5 py-4">
          <div><label className="text-[11px] font-bold uppercase text-subtle">Fuel code</label><Select value={fuel} onValueChange={setFuel}><SelectTrigger aria-label="Filter by fuel code" className="mt-1 w-36 bg-panel"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All fuels</SelectItem>{(["D3", "D4", "D5", "D6", "D7"] as const).map((code) => <SelectItem key={code} value={code}>{code}</SelectItem>)}</SelectContent></Select></div>
          <Button variant="ghost" size="sm" onClick={() => { setFuel("all"); setQuery(""); setView("all"); }}>Clear all</Button>
          <Button variant="ghost" size="icon" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="ml-auto"><X className="size-4" /></Button>
        </div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase text-subtle"><th className="px-5 py-2">Pending buy</th><th className="px-3 py-2">Trading partner</th><th className="px-3 py-2">Fuel</th><th className="px-3 py-2">PTD</th><th className="px-3 py-2 text-right">RINs / Gal</th><th className="px-3 py-2 text-right">Price</th><th className="px-5 py-2">Match</th></tr>
            </thead>
            <tbody>{visible.map((buy) => <tr key={buy.id} className="border-b border-hair last:border-0 hover:bg-table-head">
              <td className="px-5 py-3"><div className="font-semibold">{buy.id}</div><div className="mt-0.5 text-[11px] text-subtle">{buy.received}</div>{buy.contractId && <div className="mt-0.5 text-[11px] font-semibold text-primary">{buy.contractId} · {buy.dealNumber}</div>}</td>
              <td className="max-w-44 px-3 py-3 text-xs font-medium">{buy.partner}</td><td className="px-3 py-3"><Fuel buy={buy} /></td><td className="px-3 py-3 text-xs">{buy.ptd}</td><td className="px-3 py-3 text-right tabular-nums"><div className="font-semibold">{numberFmt.format(buy.rins)}</div><div className="text-[11px] text-subtle">{numberFmt.format(buy.gallons)} gal</div></td><td className="px-3 py-3 text-right text-xs font-semibold tabular-nums">{buy.price}</td>
              <td className="px-5 py-3"><div className="flex items-center justify-between gap-2"><span className={`whitespace-nowrap text-xs font-semibold ${buy.match === "matched" ? "text-moss" : "text-amber"}`}>{matchLabel[buy.match]}</span><Button variant="ghost" size="icon" className="size-7 text-primary" title={`Review ${buy.id}`} aria-label={`Review ${buy.id}`} onClick={() => openReview(buy)}><ChevronRight className="size-4" /></Button></div></td>
            </tr>)}</tbody>
          </table>
          {visible.length === 0 && <div className="py-12 text-center text-sm text-subtle">No pending buys match these filters.</div>}
        </div>
        <div className="border-t border-hair px-5 py-3 text-xs text-subtle">Showing {visible.length} of {pendingBuys.length} pending buys</div>
      </section>
    </main>

    <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) closeReview(); }}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-canvas p-0 sm:max-w-[560px]">
        {selected && <>
          <SheetHeader className="border-b border-hair bg-panel px-6 py-5 text-left"><div className="flex items-start justify-between gap-3 pr-4"><div><SheetTitle className="font-display text-xl text-ink">Review {selected.id}</SheetTitle><SheetDescription>{selected.partner} · Received {selected.received}</SheetDescription></div><span className={`mt-1 shrink-0 whitespace-nowrap rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${selected.match === "matched" ? "bg-moss-soft text-moss" : "bg-amber-soft text-amber"}`}>{matchLabel[selected.match]}</span></div></SheetHeader>
          <div className="space-y-5 p-6">
            <section><h3 className="mb-3 font-display text-sm font-bold">Incoming RIN buy</h3><dl className="grid grid-cols-2 gap-4 rounded-md border border-hair bg-panel p-4"><Detail label="Pending buy" value={selected.id} /><Detail label="Trading partner" value={selected.partner} /><Detail label="RIN quantity" value={numberFmt.format(selected.rins)} /><Detail label="Gallons" value={numberFmt.format(selected.gallons)} /><Detail label="Price" value={selected.price} /><div><dt className="text-[10px] font-bold uppercase text-subtle">Fuel / assignment</dt><dd className="mt-2"><span className={`inline-flex min-w-8 items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold ${fuelClass[selected.fuel]}`}>{selected.fuel}</span> <span className="text-xs text-subtle">{selected.year}</span> <span title={selected.assignment === "assigned" ? "Assigned" : "Separated"} aria-label={selected.assignment === "assigned" ? "Assigned" : "Separated"} className={`ml-1 inline-flex size-5 items-center justify-center rounded-sm border ${selected.assignment === "assigned" ? "border-assigned-border bg-assigned text-assigned-foreground" : "border-hair bg-panel text-ink"}`}>{selected.assignment === "assigned" ? <ArrowRight className="size-3" /> : <Split className="size-3" />}</span></dd></div><Detail label="Invoice number" value={selected.invoice} /><Detail label="PTD number" value={selected.ptd} /><Detail label="Bill of lading" value={selected.bol} /><Detail label="Received" value={selected.received} /></dl></section>

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
                        <span className="mt-1 block text-xs text-subtle">{candidate.partner} · Due {candidate.dueDate ?? "—"}</span>
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
                          <span className="mt-1 block text-xs text-subtle">{selected.partner} · Due {selected.dueDate ?? "—"}</span>
                          <span className="mt-1 block text-xs text-subtle">Outstanding {numberFmt.format(selected.contractOutstandingRins ?? match?.outstandingRins ?? 0)} RINs</span>
                          <span className="mt-1 block text-[11px] font-semibold text-amber">Matched on trading partner</span>
                        </span>
                      </button>;
                    })()}
                  </div>
                </div>}

                <div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-subtle">Choose any open contract</div>
                  <Select value={chosenContract && !selected.candidateContracts?.some((c) => c.contractId === chosenContract) && chosenContract !== selected.contractId ? chosenContract : ""} onValueChange={(value) => setChosenContract(value)}>
                    <SelectTrigger aria-label="Choose from all open contracts" className="w-full bg-panel"><SelectValue placeholder="Select an open contract…" /></SelectTrigger>
                    <SelectContent>
                      {openContracts.map((contract) => <SelectItem key={contract.contractId} value={contract.contractId}>
                        {contract.contractId} · {contract.dealNumber} · {contract.counterparty}
                      </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

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
              return <div role="alert" className="rounded-md border border-amber bg-amber-soft p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber">Contract would settle</p>
                <p className="mt-1 text-xs leading-relaxed text-ink">
                  {overflow > 0
                    ? `The buy's ${numberFmt.format(selected.rins)} RINs exceed ${chosenContract}'s outstanding balance of ${numberFmt.format(outstanding)} RINs. Approving settles the contract and moves the extra ${numberFmt.format(overflow)} RINs to the Unassigned pool.`
                    : overflow === 0
                      ? `The buy's ${numberFmt.format(selected.rins)} RINs exactly match ${chosenContract}'s outstanding balance. Approving settles the contract.`
                      : `The buy's ${numberFmt.format(selected.rins)} RINs are within 1% of ${chosenContract}'s outstanding balance of ${numberFmt.format(outstanding)} RINs. Approving settles the contract.`}
                </p>
              </div>;
            })()}

            <div className="flex items-center justify-between gap-3 border-t border-hair pt-4">
              <Button variant="outline" onClick={closeReview}>Back to pending buys</Button>
              <Button disabled={chosenContract === null}>{chosenContract === "unreconciled" ? "Approve as Unreconciled" : chosenContract ? `Approve for ${chosenContract}` : "Approve"}</Button>
            </div>
          </div>
        </>}
      </SheetContent>
    </Sheet>
  </div>;
}
