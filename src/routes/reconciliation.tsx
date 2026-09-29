import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Filter, Search, Split, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { numberFmt, type RinCode } from "@/lib/contracts-data";
import { pendingBuys, type PendingBuy } from "@/lib/reconciliation-data";

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
const matchLabel = { matched: "Matched", "needs-review": "Needs review", unmatched: "No contract" } as const;

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

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Reconciliation status">
        {([ ["all", pendingBuys.length, "All pending buys"], ["matched", counts.matched, "Matched"], ["needs-review", counts["needs-review"], "Needs review"], ["unmatched", counts.unmatched, "No contract match"] ] as const).map(([key, count, label]) =>
          <Button key={key} variant="outline" onClick={() => setView(key)} aria-pressed={view === key} className={`h-auto min-h-20 flex-col items-start rounded-md border px-4 py-3 text-left shadow-sm ${view === key ? "border-primary bg-selected" : "border-hair bg-panel"}`}>
            <span className={`font-display text-2xl font-bold tabular-nums ${key === "needs-review" || key === "unmatched" ? "text-amber" : key === "matched" ? "text-moss" : "text-ink"}`}>{count}</span>
            <span className="text-xs font-semibold text-subtle">{label}</span>
          </Button>
        )}
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
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase text-subtle"><th colSpan={5} className="px-5 py-2">Imported buy contract</th><th colSpan={4} className="border-l border-hair px-5 py-2 text-primary">Incoming RIN buy</th><th className="px-5 py-2">Review</th></tr>
              <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase text-subtle"><th className="px-5 py-2">Contract / deal</th><th className="px-3 py-2">Trading partner</th><th className="px-3 py-2">Due date</th><th className="px-3 py-2">Invoice</th><th className="px-3 py-2 text-right">Expected RINs</th><th className="border-l border-hair px-3 py-2">Pending buy</th><th className="px-3 py-2">Fuel</th><th className="px-3 py-2">PTD</th><th className="px-3 py-2 text-right">Incoming RINs</th><th className="px-5 py-2">Match</th></tr>
            </thead>
            <tbody>{visible.map((buy) => <tr key={buy.id} className="border-b border-hair last:border-0 hover:bg-table-head">
              <td className="px-5 py-3"><div className="font-semibold">{buy.contractId ?? "Unassigned"}</div><div className="mt-0.5 text-[11px] text-subtle">{buy.dealNumber ?? "No contract found"}</div></td>
              <td className="max-w-44 px-3 py-3 text-xs font-medium">{buy.partner}</td><td className="px-3 py-3 text-xs text-subtle">{buy.dueDate ?? "—"}</td><td className="px-3 py-3 text-xs">{buy.invoice}</td><td className="px-3 py-3 text-right font-semibold tabular-nums">{buy.expectedRins === null ? "—" : numberFmt.format(buy.expectedRins)}</td>
              <td className="border-l border-hair px-3 py-3"><div className="font-semibold">{buy.id}</div><div className="mt-0.5 text-[11px] text-subtle">{buy.received}</div></td><td className="px-3 py-3"><Fuel buy={buy} /></td><td className="px-3 py-3 text-xs">{buy.ptd}</td><td className="px-3 py-3 text-right font-semibold tabular-nums">{numberFmt.format(buy.rins)}</td>
              <td className="px-5 py-3"><div className="flex items-center justify-between gap-2"><span className={`whitespace-nowrap text-xs font-semibold ${buy.match === "matched" ? "text-moss" : "text-amber"}`}>{matchLabel[buy.match]}</span><Button variant="ghost" size="icon" className="size-7 text-primary" title={`Review ${buy.id}`} aria-label={`Review ${buy.id}`} onClick={() => setSelected(buy)}><ChevronRight className="size-4" /></Button></div></td>
            </tr>)}</tbody>
          </table>
          {visible.length === 0 && <div className="py-12 text-center text-sm text-subtle">No pending buys match these filters.</div>}
        </div>
        <div className="border-t border-hair px-5 py-3 text-xs text-subtle">Showing {visible.length} of {pendingBuys.length} pending buys</div>
      </section>
    </main>

    <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-canvas p-0 sm:max-w-[560px]">
        {selected && <>
          <SheetHeader className="border-b border-hair bg-panel px-6 py-5 text-left"><SheetTitle className="font-display text-xl text-ink">Review {selected.id}</SheetTitle><SheetDescription>{selected.partner} · Received {selected.received}</SheetDescription></SheetHeader>
          <div className="space-y-5 p-6">
            <div className={`rounded-md border p-4 ${selected.match === "matched" ? "border-assigned-border bg-moss-soft" : "border-amber bg-amber-soft"}`}><div className={`text-sm font-bold ${selected.match === "matched" ? "text-moss" : "text-amber"}`}>{matchLabel[selected.match]}</div><p className="mt-1 text-xs leading-relaxed text-ink">{selected.reason}</p></div>
            <section><h3 className="mb-3 font-display text-sm font-bold">Imported buy contract</h3><dl className="grid grid-cols-2 gap-4 rounded-md border border-hair bg-panel p-4"><Detail label="Contract ID" value={selected.contractId ?? "No match"} /><Detail label="Deal number" value={selected.dealNumber ?? "—"} /><Detail label="Trading partner" value={selected.partner} /><Detail label="Due date" value={selected.dueDate ?? "—"} /><Detail label="Invoice" value={selected.invoice} /><Detail label="Expected RINs" value={selected.expectedRins === null ? "—" : numberFmt.format(selected.expectedRins)} /></dl></section>
            <section><h3 className="mb-3 font-display text-sm font-bold">Incoming RIN buy</h3><dl className="grid grid-cols-2 gap-4 rounded-md border border-hair bg-panel p-4"><Detail label="Pending buy" value={selected.id} /><Detail label="RIN quantity" value={numberFmt.format(selected.rins)} /><Detail label="Fuel / year" value={`${selected.fuel} · ${selected.year}`} /><Detail label="Assignment" value={selected.assignment === "assigned" ? "Assigned" : "Separated"} /><Detail label="QAP service" value={selected.qap} /><Detail label="PTD number" value={selected.ptd} /><Detail label="Bill of lading" value={selected.bol} /><Detail label="Received" value={selected.received} /></dl></section>
            <div className="border-t border-hair pt-4"><Button variant="outline" onClick={() => setSelected(null)}>Back to pending buys</Button></div>
          </div>
        </>}
      </SheetContent>
    </Sheet>
  </div>;
}
