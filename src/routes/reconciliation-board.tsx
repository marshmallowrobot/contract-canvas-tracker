import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Check, CircleHelp, Info, ShieldCheck, Undo2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { numberFmt, type RinCode } from "@/lib/contracts-data";
import { pendingBuys, type PendingBuy } from "@/lib/reconciliation-data";
import { candidatesFor, confidenceMeta, type Assessment, type Verdict } from "@/lib/reconciliation-evidence";

export const Route = createFileRoute("/reconciliation-board")({
  head: () => ({ meta: [
    { title: "Reconciliation — Approval Board" },
    { name: "description", content: "Scan every buy's evidence in one aligned grid and bulk-approve the matches that agree." },
  ] }),
  component: ApprovalBoard,
});

const fuelClass: Record<RinCode, string> = {
  D3: "bg-rin-d3 text-rin-on-color", D4: "bg-rin-d4 text-rin-on-color",
  D5: "bg-rin-d5 text-rin-on-color", D6: "bg-rin-d6 text-rin-on-color", D7: "bg-rin-d7 text-rin-on-color",
};

const verdictMeta: Record<Verdict, { icon: typeof Check; label: string; text: string; cell: string }> = {
  match: { icon: Check, label: "Matches", text: "text-moss", cell: "bg-moss-soft" },
  near: { icon: AlertTriangle, label: "Close", text: "text-amber", cell: "bg-amber-soft" },
  differs: { icon: X, label: "Differs", text: "text-rose", cell: "bg-rose-soft" },
  missing: { icon: CircleHelp, label: "Not recorded", text: "text-subtle", cell: "bg-table-head" },
};

/** Fixed column order — every row renders all nine, so a column can be scanned top to bottom. */
const COLUMNS = [
  { key: "partner", short: "Ptnr" },
  { key: "ptd", short: "PTD" },
  { key: "invoice", short: "Inv" },
  { key: "bol", short: "BOL" },
  { key: "quantity", short: "Qty" },
  { key: "fuel", short: "Fuel" },
  { key: "year", short: "Yr" },
  { key: "assignment", short: "Asg" },
  { key: "price", short: "Price" },
] as const;

const COLUMN_COUNT = 4 + COLUMNS.length + 2;

function expirationLabel(days: number) {
  if (days <= 0) return "5 hours";
  return days === 1 ? "1 day" : `${days} days`;
}

function expiryClass(days: number) {
  return days <= 1 ? "text-rose" : days <= 5 ? "text-amber" : "text-subtle";
}

type Row = {
  buy: PendingBuy;
  candidates: Assessment[];
  best?: Assessment | undefined;
  /** More than one contract explains this buy nearly as well — never safe to bulk-approve. */
  ambiguous: boolean;
  ready: boolean;
  blocker: string | null;
};

/**
 * Identifiers have to be exact before a buy can clear without someone reading it.
 * Quantity is deliberately excluded: a partial draw against a larger contract is
 * normal and shouldn't push an otherwise clean match into manual review.
 */
const EXACT_REQUIRED = new Set(["partner", "ptd", "invoice", "bol", "fuel", "year", "assignment"]);

function buildRow(buy: PendingBuy): Row {
  const candidates = candidatesFor(buy);
  const best = candidates[0];
  const runnerUp = candidates[1];
  const ambiguous = !!best && !!runnerUp && runnerUp.score >= best.score - 10;
  const base = { buy, candidates, best, ambiguous };

  if (!best) return { ...base, ambiguous: false, ready: false, blocker: "No contract in the book links to this buy." };
  if (ambiguous) return { ...base, ready: false, blocker: `${candidates.length} contracts fit this buy — pick one.` };

  const differs = best.signals.find((signal) => signal.verdict === "differs");
  if (differs) return { ...base, ready: false, blocker: `${differs.label} differs.` };

  const inexact = best.signals.find((signal) => signal.verdict === "near" && EXACT_REQUIRED.has(signal.key));
  if (inexact) return { ...base, ready: false, blocker: `${inexact.label} is close but not exact.` };

  if (best.confidence !== "strong") return { ...base, ready: false, blocker: "Too few fields are recorded on the contract to be sure." };

  return { ...base, ready: true, blocker: null };
}

/** On a clean row this is the only caveat worth printing — a draw that leaves a balance behind. */
function partialDrawNote(assessment?: Assessment) {
  const quantity = assessment?.signals.find((signal) => signal.key === "quantity");
  return quantity?.verdict === "near" ? quantity.note ?? null : null;
}

/** One evidence cell. The hover title carries both values so nothing needs opening. */
function EvidenceCell({ assessment, columnKey }: { assessment?: Assessment; columnKey: string }) {
  if (!assessment) return <td className="border-l border-hair bg-table-head/40 px-0 py-2 text-center text-subtle">·</td>;
  const signal = assessment.signals.find((entry) => entry.key === columnKey)!;
  const meta = verdictMeta[signal.verdict];
  const Icon = meta.icon;
  return (
    <td className={`border-l border-hair px-0 py-2 ${meta.cell}`}>
      <span
        className="flex items-center justify-center"
        title={`${signal.label} — ${meta.label}\nBuy: ${signal.buyValue}\nContract: ${signal.contractValue}${signal.note ? `\n${signal.note}` : ""}`}
      >
        <Icon className={`size-3.5 ${meta.text}`} strokeWidth={3} />
        <span className="sr-only">{signal.label}: {meta.label}. Buy {signal.buyValue}, contract {signal.contractValue}.</span>
      </span>
    </td>
  );
}

function ScorePill({ assessment }: { assessment?: Assessment }) {
  if (!assessment) return <span className="text-[10px] font-bold uppercase text-subtle">None</span>;
  const meta = confidenceMeta[assessment.confidence];
  return (
    <span className="flex items-center justify-end gap-2">
      <span className="h-1.5 w-10 overflow-hidden rounded-full bg-table-head">
        <span className={`block h-full rounded-full ${meta.bar}`} style={{ width: `${assessment.score}%` }} />
      </span>
      <span className="w-6 text-right text-xs font-bold tabular-nums text-ink">{assessment.score}</span>
    </span>
  );
}

function BuyCell({ buy }: { buy: PendingBuy }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className={`inline-flex min-w-7 items-center justify-center rounded px-1 py-0.5 text-[10px] font-bold ${fuelClass[buy.fuel]}`}>{buy.fuel}</span>
        <span className="text-xs font-bold text-ink">{buy.partner}</span>
      </div>
      <div className="mt-0.5 text-[11px] text-subtle">
        <span className="font-semibold tabular-nums text-ink">{numberFmt.format(buy.rins)} RINs</span> · {buy.ptd} · {buy.invoice}
      </div>
    </>
  );
}

function ContractCell({ row }: { row: Row }) {
  if (!row.best) return <span className="text-[11px] italic text-subtle">No candidate contract</span>;
  const { contract } = row.best;
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-primary">{contract.contractId}</span>
        <span className="text-[11px] text-subtle">{contract.dealNumber}</span>
        {row.best.quantity.settles && (
          <span className="rounded bg-settle-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-settle">Settles</span>
        )}
      </div>
      <div className="mt-0.5 text-[11px] text-subtle">
        {contract.counterparty} · <span className="tabular-nums">{numberFmt.format(contract.outstandingRins)}</span> outstanding
      </div>
    </>
  );
}

function SectionHeader({ title, description, count, tone, action }: { title: string; description: string; count: number; tone: string; action?: React.ReactNode }) {
  return (
    <tr className="border-y border-hair bg-table-head">
      <td colSpan={COLUMN_COUNT} className="px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className={`font-display text-sm font-bold ${tone}`}>{title}</span>
            <span className="text-xs font-bold tabular-nums text-ink">{count}</span>
            <span className="text-[11px] text-subtle">{description}</span>
          </div>
          {action}
        </div>
      </td>
    </tr>
  );
}

function ApprovalBoard() {
  const rows = useMemo(() => pendingBuys.map(buildRow), []);
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [lastBatch, setLastBatch] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const live = rows.filter((row) => !approved.has(row.buy.id));
  const ready = live.filter((row) => row.ready);
  const judgement = live.filter((row) => !row.ready && row.best);
  const orphans = live.filter((row) => !row.best);

  const selectable = new Set(ready.map((row) => row.buy.id));
  const selected = [...checked].filter((id) => selectable.has(id));
  const selectedRins = ready.filter((row) => checked.has(row.buy.id)).reduce((sum, row) => sum + row.buy.rins, 0);
  const allReadyChecked = ready.length > 0 && ready.every((row) => checked.has(row.buy.id));

  const toggle = (id: string) => setChecked((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const toggleAllReady = () => setChecked((prev) => {
    const next = new Set(prev);
    if (allReadyChecked) ready.forEach((row) => next.delete(row.buy.id));
    else ready.forEach((row) => next.add(row.buy.id));
    return next;
  });

  /** Prototype only — moves rows off the board, posts nothing to a contract or the ledger. */
  const approve = (ids: string[]) => {
    if (ids.length === 0) return;
    setApproved((prev) => new Set([...prev, ...ids]));
    setLastBatch(ids);
    setChecked(new Set());
  };

  const undo = () => {
    setApproved((prev) => {
      const next = new Set(prev);
      lastBatch.forEach((id) => next.delete(id));
      return next;
    });
    setLastBatch([]);
  };

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className={`mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 ${selected.length > 0 ? "pb-28" : ""}`}>
        <Link to="/reconciliation-concepts" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-subtle hover:text-primary">
          <ArrowLeft className="size-4" /> Reconciliation concepts
        </Link>

        <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Approval Board</h1>
            <p className="mt-1 max-w-2xl text-sm text-subtle">
              Every buy shows its full evidence in the same nine columns. Scan a column to spot the one field that disagrees — no row needs opening.
            </p>
          </div>
          <Button
            size="sm"
            disabled={ready.length === 0}
            onClick={() => approve(ready.map((row) => row.buy.id))}
          >
            <ShieldCheck className="size-4" /> Approve all {ready.length} agreeing
          </Button>
        </header>

        {lastBatch.length > 0 && (
          <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-hair bg-moss-soft px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-ink">
              <Check className="size-4 text-moss" strokeWidth={3} />
              {lastBatch.length} {lastBatch.length === 1 ? "buy" : "buys"} approved in this prototype — nothing was posted to a contract or the ledger.
            </span>
            <Button variant="outline" size="sm" onClick={undo}><Undo2 className="size-3.5" /> Undo</Button>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-hair bg-panel px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-subtle">
            <Info className="size-3.5" /> Legend
          </span>
          {(Object.keys(verdictMeta) as Verdict[]).map((verdict) => {
            const meta = verdictMeta[verdict];
            const Icon = meta.icon;
            return (
              <span key={verdict} className="flex items-center gap-1.5 text-[11px] text-subtle">
                <span className={`inline-flex size-5 items-center justify-center rounded ${meta.cell}`}>
                  <Icon className={`size-3 ${meta.text}`} strokeWidth={3} />
                </span>
                {meta.label}
              </span>
            );
          })}
          <span className="text-[11px] text-subtle">Hover any cell for the two values being compared.</span>
        </div>

        <section className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-table-head text-[10px] font-bold uppercase tracking-wide text-subtle">
                  <th rowSpan={2} className="w-10 border-b border-hair px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label="Select every agreeing buy"
                      checked={allReadyChecked}
                      onChange={toggleAllReady}
                      disabled={ready.length === 0}
                      className="size-4 accent-primary disabled:opacity-40"
                    />
                  </th>
                  <th rowSpan={2} className="w-[22%] border-b border-hair px-4 py-2">Incoming buy</th>
                  <th rowSpan={2} className="w-[22%] border-b border-l border-hair px-4 py-2">Best-matching contract</th>
                  <th colSpan={COLUMNS.length} className="border-b border-l border-hair px-2 py-1.5 text-center">Evidence</th>
                  <th rowSpan={2} className="w-[18%] border-b border-l border-hair px-4 py-2">What to check</th>
                  <th rowSpan={2} className="w-28 border-b border-l border-hair px-4 py-2 text-right">Confidence</th>
                </tr>
                <tr className="bg-table-head text-[9px] font-bold uppercase tracking-wide text-subtle">
                  {COLUMNS.map((column, index) => (
                    <th key={column.key} className={`w-9 border-b border-hair px-0 py-1.5 text-center ${index === 0 ? "border-l" : ""}`}>
                      {column.short}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <SectionHeader
                  title="Evidence agrees"
                  count={ready.length}
                  tone="text-moss"
                  description="One contract fits, every identifier matches exactly, and no field disagrees."
                  action={ready.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={toggleAllReady} className="h-7 text-[11px] text-primary hover:text-primary">
                      {allReadyChecked ? "Clear selection" : "Select all"}
                    </Button>
                  )}
                />
                {ready.map((row) => (
                  <tr key={row.buy.id} className={`border-b border-hair align-middle ${checked.has(row.buy.id) ? "bg-selected" : "hover:bg-table-head/60"}`}>
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.buy.id} from ${row.buy.partner}`}
                        checked={checked.has(row.buy.id)}
                        onChange={() => toggle(row.buy.id)}
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="px-4 py-2.5"><BuyCell buy={row.buy} /></td>
                    <td className="border-l border-hair px-4 py-2.5"><ContractCell row={row} /></td>
                    {COLUMNS.map((column) => <EvidenceCell key={column.key} assessment={row.best} columnKey={column.key} />)}
                    <td className="border-l border-hair px-4 py-2.5">
                      {partialDrawNote(row.best) && <span className="block text-[11px] font-semibold text-amber">{partialDrawNote(row.best)}</span>}
                      <span className={`text-[11px] font-semibold ${expiryClass(row.buy.expiresInDays)}`}>Expires in {expirationLabel(row.buy.expiresInDays)}</span>
                    </td>
                    <td className="border-l border-hair px-4 py-2.5 text-right"><ScorePill assessment={row.best} /></td>
                  </tr>
                ))}
                {ready.length === 0 && (
                  <tr className="border-b border-hair">
                    <td colSpan={COLUMN_COUNT} className="px-4 py-6 text-center text-xs text-subtle">Nothing is clear enough to approve without a decision.</td>
                  </tr>
                )}

                <SectionHeader
                  title="Needs a judgement call"
                  count={judgement.length}
                  tone="text-amber"
                  description="A field disagrees, or more than one contract fits. These can't be bulk-approved."
                />
                {judgement.map((row) => (
                  <tr key={row.buy.id} className="border-b border-hair align-middle hover:bg-table-head/60">
                    <td className="px-3 py-2.5">
                      <span title="Only buys where every field agrees can be bulk-approved." className="flex justify-center text-subtle">—</span>
                    </td>
                    <td className="px-4 py-2.5"><BuyCell buy={row.buy} /></td>
                    <td className="border-l border-hair px-4 py-2.5"><ContractCell row={row} /></td>
                    {COLUMNS.map((column) => <EvidenceCell key={column.key} assessment={row.best} columnKey={column.key} />)}
                    <td className="border-l border-hair px-4 py-2.5">
                      <span className="text-[11px] font-semibold text-amber">{row.blocker}</span>
                      <span className={`mt-0.5 block text-[11px] ${expiryClass(row.buy.expiresInDays)}`}>Expires in {expirationLabel(row.buy.expiresInDays)}</span>
                    </td>
                    <td className="border-l border-hair px-4 py-2.5 text-right"><ScorePill assessment={row.best} /></td>
                  </tr>
                ))}

                {orphans.length > 0 && (
                  <>
                    <SectionHeader
                      title="No contract found"
                      count={orphans.length}
                      tone="text-subtle"
                      description="Nothing in the contract book shares a partner or paperwork with these buys."
                    />
                    {orphans.map((row) => (
                      <tr key={row.buy.id} className="border-b border-hair align-middle hover:bg-table-head/60">
                        <td className="px-3 py-2.5"><span className="flex justify-center text-subtle">—</span></td>
                        <td className="px-4 py-2.5"><BuyCell buy={row.buy} /></td>
                        <td className="border-l border-hair px-4 py-2.5"><ContractCell row={row} /></td>
                        {COLUMNS.map((column) => <EvidenceCell key={column.key} assessment={undefined} columnKey={column.key} />)}
                        <td className="border-l border-hair px-4 py-2.5">
                          <span className="text-[11px] font-semibold text-subtle">{row.blocker}</span>
                          <span className={`mt-0.5 block text-[11px] ${expiryClass(row.buy.expiresInDays)}`}>Expires in {expirationLabel(row.buy.expiresInDays)}</span>
                        </td>
                        <td className="border-l border-hair px-4 py-2.5 text-right"><ScorePill assessment={undefined} /></td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-hair px-4 py-2.5 text-[11px] text-subtle">
            <span>{live.length} of {rows.length} pending buys on the board</span>
            <span>{approved.size} approved this session</span>
          </div>
        </section>
      </main>

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hair bg-panel shadow-lg">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-bold text-ink">
                {selected.length} {selected.length === 1 ? "buy" : "buys"} selected · <span className="tabular-nums">{numberFmt.format(selectedRins)}</span> RINs
              </p>
              <p className="mt-0.5 text-[11px] text-subtle">Every identifier on these buys matches its contract exactly.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setChecked(new Set())}>Clear</Button>
              <Button size="sm" onClick={() => approve(selected)}>
                <ShieldCheck className="size-4" /> Approve {selected.length} {selected.length === 1 ? "buy" : "buys"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
