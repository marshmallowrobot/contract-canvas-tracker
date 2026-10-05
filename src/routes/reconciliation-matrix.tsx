import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Check, ChevronDown, CircleHelp, X } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { numberFmt, type RinCode } from "@/lib/contracts-data";
import { pendingBuys, type PendingBuy } from "@/lib/reconciliation-data";
import {
  candidatesFor,
  confidenceMeta,
  originLabel,
  type Assessment,
  type Verdict,
} from "@/lib/reconciliation-evidence";

export const Route = createFileRoute("/reconciliation-matrix")({
  head: () => ({ meta: [
    { title: "Reconciliation — Match Comparison" },
    { name: "description", content: "Rank candidate contracts side by side before approving a pending buy." },
  ] }),
  component: MatrixReconciliation,
});

const fuelClass: Record<RinCode, string> = {
  D3: "bg-rin-d3 text-rin-on-color", D4: "bg-rin-d4 text-rin-on-color",
  D5: "bg-rin-d5 text-rin-on-color", D6: "bg-rin-d6 text-rin-on-color", D7: "bg-rin-d7 text-rin-on-color",
};

const verdictMeta: Record<Verdict, { icon: typeof Check; text: string; cell: string; chip: string }> = {
  match: { icon: Check, text: "text-moss", cell: "bg-moss-soft/50", chip: "bg-moss-soft text-moss" },
  near: { icon: AlertTriangle, text: "text-amber", cell: "bg-amber-soft/50", chip: "bg-amber-soft text-amber" },
  differs: { icon: X, text: "text-rose", cell: "bg-rose-soft/50", chip: "bg-rose-soft text-rose" },
  missing: { icon: CircleHelp, text: "text-subtle", cell: "", chip: "bg-table-head text-subtle" },
};

const CHIP_LABELS: Record<string, string> = { partner: "Partner", ptd: "PTD", invoice: "Invoice", bol: "BOL", quantity: "Quantity", fuel: "Fuel" };

function expirationLabel(days: number) {
  if (days <= 0) return "5 hours";
  return days === 1 ? "1 day" : `${days} days`;
}

/** The match reasons, spelled out as chips so the row explains itself. */
function WhyChips({ assessment }: { assessment: Assessment }) {
  return (
    <div className="flex flex-wrap gap-1">
      {assessment.signals
        .filter((signal) => CHIP_LABELS[signal.key])
        .map((signal) => {
          const meta = verdictMeta[signal.verdict];
          const Icon = meta.icon;
          return (
            <span key={signal.key} title={signal.note ?? `${signal.label}: ${signal.contractValue}`} className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${meta.chip}`}>
              <Icon className="size-2.5" strokeWidth={3} /> {CHIP_LABELS[signal.key]}
            </span>
          );
        })}
    </div>
  );
}

function ScoreMeter({ assessment }: { assessment: Assessment }) {
  const meta = confidenceMeta[assessment.confidence];
  return (
    <div className="w-28">
      <div className="flex items-baseline justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.text}`}>{meta.label.replace(" evidence", "")}</span>
        <span className="text-[11px] font-bold tabular-nums text-ink">{assessment.score}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-table-head">
        <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${assessment.score}%` }} />
      </div>
    </div>
  );
}

/** Candidate contracts as columns, buy fields as rows — the comparison the client is missing. */
function ComparisonMatrix({ buy, candidates, chosen, onChoose }: { buy: PendingBuy; candidates: Assessment[]; chosen: string | null; onChoose: (id: string) => void }) {
  const fields = candidates[0]!.signals.map((signal) => ({ key: signal.key, label: signal.label, buyValue: signal.buyValue }));
  return (
    <div className="overflow-x-auto rounded-md border border-hair bg-panel">
      <table className="w-full min-w-[760px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-hair bg-table-head align-bottom">
            <th className="w-40 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-subtle">Field</th>
            <th className="w-44 border-l border-hair px-4 py-3">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-subtle">Incoming buy</span>
              <span className="mt-0.5 block text-xs font-bold text-ink">{buy.id}</span>
            </th>
            {candidates.map((candidate) => {
              const meta = confidenceMeta[candidate.confidence];
              const isChosen = chosen === candidate.contract.contractId;
              return (
                <th key={candidate.contract.contractId} className={`min-w-[220px] border-l border-hair px-4 py-3 ${isChosen ? "bg-selected" : ""}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-ink">{candidate.contract.contractId}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${meta.chip}`}>{candidate.score}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-normal text-subtle">{candidate.contract.counterparty}</p>
                  <p className="text-[11px] font-normal text-subtle">{candidate.contract.dealNumber} · {candidate.contract.dueDate ?? "no due date"}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-subtle">{originLabel[candidate.origin]}</p>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isChosen}
                    onClick={() => onChoose(candidate.contract.contractId)}
                    className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded border px-2 py-1 text-[11px] font-bold transition-colors ${isChosen ? "border-primary bg-primary text-primary-foreground" : "border-hair bg-panel text-primary hover:border-primary"}`}
                  >
                    {isChosen && <Check className="size-3" strokeWidth={3} />} {isChosen ? "Selected" : "Use this contract"}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.key} className="border-b border-hair last:border-0 align-top">
              <td className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-subtle">{field.label}</td>
              <td className="border-l border-hair px-4 py-2.5 font-semibold tabular-nums text-ink">{field.buyValue}</td>
              {candidates.map((candidate) => {
                const signal = candidate.signals.find((entry) => entry.key === field.key)!;
                const meta = verdictMeta[signal.verdict];
                const Icon = meta.icon;
                return (
                  <td key={candidate.contract.contractId} className={`border-l border-hair px-4 py-2.5 ${meta.cell}`}>
                    <span className="flex items-start gap-1.5">
                      <Icon className={`mt-0.5 size-3 shrink-0 ${meta.text}`} strokeWidth={3} />
                      <span>
                        <span className={signal.verdict === "missing" ? "italic text-subtle" : "font-semibold tabular-nums text-ink"}>{signal.contractValue}</span>
                        {signal.note && <span className="mt-0.5 block text-[10px] font-normal not-italic leading-relaxed text-subtle">{signal.note}</span>}
                      </span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="bg-table-head">
            <td className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-subtle">After approval</td>
            <td className="border-l border-hair px-4 py-2.5 text-subtle">—</td>
            {candidates.map((candidate) => (
              <td key={candidate.contract.contractId} className="border-l border-hair px-4 py-2.5">
                {candidate.quantity.settles ? (
                  <span className="font-bold text-settle">Contract settles{candidate.quantity.overflow > 0 ? ` · ${numberFmt.format(candidate.quantity.overflow)} RINs overflow` : ""}</span>
                ) : (
                  <span className="text-ink">{numberFmt.format(candidate.quantity.remaining)} RINs still outstanding</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function MatrixReconciliation() {
  const rows = useMemo(() => pendingBuys.map((buy) => ({ buy, candidates: candidatesFor(buy) })), []);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [band, setBand] = useState<"all" | "strong" | "review" | "none">("all");

  const counts = {
    all: rows.length,
    strong: rows.filter((row) => row.candidates[0]?.confidence === "strong").length,
    review: rows.filter((row) => row.candidates[0] && row.candidates[0].confidence !== "strong").length,
    none: rows.filter((row) => row.candidates.length === 0).length,
  };

  const visible = rows.filter(({ candidates }) => {
    if (band === "all") return true;
    if (band === "strong") return candidates[0]?.confidence === "strong";
    if (band === "none") return candidates.length === 0;
    return candidates.length > 0 && candidates[0]!.confidence !== "strong";
  });

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
        <Link to="/reconciliation-concepts" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-subtle hover:text-primary">
          <ArrowLeft className="size-4" /> Reconciliation concepts
        </Link>
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Match Comparison</h1>
            <p className="mt-1 text-sm text-subtle">Each row carries its own proof. Expand any buy to rank every candidate contract side by side.</p>
          </div>
          <Button size="sm" variant="outline" className="bg-panel text-primary hover:text-primary">Export</Button>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ["all", "All pending buys", counts.all, "Everything waiting on a reconciliation decision.", "text-ink"],
            ["strong", "Evidence agrees", counts.strong, "Every compared field matches — safe to approve in bulk.", "text-moss"],
            ["review", "Needs a judgement call", counts.review, "At least one field disagrees or is missing from the contract.", "text-amber"],
            ["none", "No candidate contract", counts.none, "Nothing in the contract book links to these buys.", "text-subtle"],
          ] as const).map(([key, title, count, description, tone]) => (
            <button
              key={title}
              type="button"
              onClick={() => setBand(key)}
              aria-pressed={band === key}
              className={`rounded-md border p-4 text-left shadow-sm transition-colors ${band === key ? "border-primary bg-selected" : "border-hair bg-panel hover:border-primary/50"}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-bold text-ink">{title}</span>
                <span className={`font-display text-xl font-bold tabular-nums ${tone}`}>{count}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-subtle">{description}</p>
            </button>
          ))}
        </div>

        <section className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase tracking-wide text-subtle">
                  <th className="w-36 px-4 py-2.5">Evidence</th>
                  <th className="px-4 py-2.5">Incoming buy</th>
                  <th className="px-4 py-2.5">Best candidate contract</th>
                  <th className="px-4 py-2.5">Why it matched</th>
                  <th className="px-4 py-2.5 text-right">Expires</th>
                  <th className="w-36 px-4 py-2.5"><span className="sr-only">Compare</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ buy, candidates }) => {
                  const best = candidates[0];
                  const isOpen = expandedId === buy.id;
                  const pick = chosen[buy.id] ?? best?.contract.contractId ?? null;
                  return (
                    <Fragment key={buy.id}>
                      <tr className={`border-b border-hair align-top ${isOpen ? "bg-selected" : "hover:bg-table-head"}`}>
                        <td className="px-4 py-3">{best ? <ScoreMeter assessment={best} /> : <span className="text-[11px] font-bold uppercase text-subtle">No candidate</span>}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-ink">{buy.partner}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex min-w-7 items-center justify-center rounded px-1 py-0.5 text-[10px] font-bold ${fuelClass[buy.fuel]}`}>{buy.fuel}</span>
                            <span className="text-xs font-semibold tabular-nums">{numberFmt.format(buy.rins)} RINs</span>
                            <span className="text-[11px] text-subtle">{buy.price}</span>
                          </div>
                          <div className="mt-1 text-[11px] text-subtle">{buy.ptd} · {buy.invoice}</div>
                        </td>
                        <td className="px-4 py-3">
                          {best ? (
                            <>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-bold text-primary">{best.contract.contractId}</span>
                                <span className="text-[11px] text-subtle">{best.contract.dealNumber}</span>
                              </div>
                              <div className="mt-1 text-xs text-ink">{best.contract.counterparty}</div>
                              <div className="mt-1 text-[11px] text-subtle">
                                {numberFmt.format(best.contract.outstandingRins)} of {numberFmt.format(best.contract.contractRins)} RINs outstanding · {best.contract.dueDate ?? "no due date"}
                              </div>
                              {candidates.length > 1 && <div className="mt-1 text-[11px] font-semibold text-amber">{candidates.length - 1} other candidate{candidates.length > 2 ? "s" : ""}</div>}
                            </>
                          ) : (
                            <span className="text-xs italic text-subtle">Nothing in the contract book matches this buy.</span>
                          )}
                        </td>
                        <td className="max-w-[320px] px-4 py-3">
                          {best ? (
                            <>
                              <WhyChips assessment={best} />
                              <p className="mt-1.5 text-[11px] leading-relaxed text-subtle">{best.headline}</p>
                            </>
                          ) : (
                            <span className="text-[11px] text-subtle">{buy.reason}</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-right text-xs font-semibold ${buy.expiresInDays <= 1 ? "text-rose" : buy.expiresInDays <= 5 ? "text-amber" : "text-ink"}`}>{expirationLabel(buy.expiresInDays)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant={isOpen ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setExpandedId(isOpen ? null : buy.id)}
                            aria-expanded={isOpen}
                            className="text-xs"
                          >
                            {isOpen ? "Hide" : "Compare"} <ChevronDown className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </Button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-hair bg-table-head/60">
                          <td colSpan={6} className="px-4 py-5">
                            {candidates.length > 0 ? (
                              <ComparisonMatrix
                                buy={buy}
                                candidates={candidates}
                                chosen={pick}
                                onChoose={(id) => setChosen((prev) => ({ ...prev, [buy.id]: id }))}
                              />
                            ) : (
                              <p className="rounded-md border border-hair bg-panel px-4 py-6 text-center text-xs text-subtle">
                                No contract shares a partner, PTD, invoice or bill of lading with this buy. Approve it as unreconciled, or import the missing contract first.
                              </p>
                            )}
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-[11px] text-subtle">Selections are not saved until you approve. Nothing posts to the contract or ledger before then.</p>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm">Approve as Unreconciled</Button>
                                <Button size="sm" disabled={!pick}>{pick ? `Approve for ${pick}` : "Approve"}</Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-hair px-4 py-3 text-xs text-subtle">Showing {visible.length} of {rows.length} pending buys</div>
        </section>
      </main>
    </div>
  );
}
