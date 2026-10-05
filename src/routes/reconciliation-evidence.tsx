import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CircleHelp, FileText, Minus, Split, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { numberFmt, type RinCode } from "@/lib/contracts-data";
import { pendingBuys, type PendingBuy } from "@/lib/reconciliation-data";
import {
  assess,
  candidatesFor,
  confidenceMeta,
  contractById,
  matchContracts,
  originLabel,
  type Assessment,
  type Signal,
  type Verdict,
} from "@/lib/reconciliation-evidence";

export const Route = createFileRoute("/reconciliation-evidence")({
  head: () => ({ meta: [
    { title: "Reconciliation — Evidence Workbench" },
    { name: "description", content: "Field-by-field proof behind every suggested buy-to-contract match." },
  ] }),
  component: EvidenceWorkbench,
});

const fuelClass: Record<RinCode, string> = {
  D3: "bg-rin-d3 text-rin-on-color", D4: "bg-rin-d4 text-rin-on-color",
  D5: "bg-rin-d5 text-rin-on-color", D6: "bg-rin-d6 text-rin-on-color", D7: "bg-rin-d7 text-rin-on-color",
};

const verdictMeta: Record<Verdict, { icon: typeof Check; label: string; text: string; dot: string; row: string }> = {
  match: { icon: Check, label: "Matches", text: "text-moss", dot: "bg-moss", row: "bg-moss-soft/40" },
  near: { icon: AlertTriangle, label: "Close", text: "text-amber", dot: "bg-amber", row: "bg-amber-soft/40" },
  differs: { icon: X, label: "Differs", text: "text-rose", dot: "bg-rose", row: "bg-rose-soft/40" },
  missing: { icon: CircleHelp, label: "No data", text: "text-subtle", dot: "bg-hair", row: "" },
};

function expirationLabel(days: number) {
  if (days <= 0) return "5 hours";
  return days === 1 ? "1 day" : `${days} days`;
}

/** Nine dots, one per signal, coloured by verdict — the at-a-glance trust cue. */
function SignalPips({ signals, size = "sm" }: { signals: Signal[]; size?: "sm" | "md" }) {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden="true">
      {signals.map((signal) => (
        <span key={signal.key} className={`rounded-full ${size === "md" ? "size-2" : "size-1.5"} ${verdictMeta[signal.verdict].dot}`} />
      ))}
    </span>
  );
}

function ConfidenceBar({ assessment }: { assessment: Assessment }) {
  const meta = confidenceMeta[assessment.confidence];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`text-xs font-bold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
        <span className="font-display text-sm font-bold tabular-nums text-ink">{assessment.score}<span className="text-subtle">/100</span></span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-table-head">
        <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${assessment.score}%` }} />
      </div>
    </div>
  );
}

function BuyRow({ buy, assessment, active, onSelect }: { buy: PendingBuy; assessment?: Assessment; active: boolean; onSelect: () => void }) {
  const meta = assessment ? confidenceMeta[assessment.confidence] : null;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={`w-full border-b border-hair px-4 py-3 text-left transition-colors last:border-0 ${active ? "bg-selected" : "hover:bg-table-head"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-ink">{buy.partner}</span>
        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${buy.expiresInDays <= 1 ? "text-rose" : buy.expiresInDays <= 5 ? "text-amber" : "text-subtle"}`}>
          {expirationLabel(buy.expiresInDays)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`inline-flex min-w-7 items-center justify-center rounded px-1 py-0.5 text-[10px] font-bold ${fuelClass[buy.fuel]}`}>{buy.fuel}</span>
        <span className="text-xs font-semibold tabular-nums text-ink">{numberFmt.format(buy.rins)} RINs</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {assessment && meta ? (
          <span className={`text-[11px] font-semibold ${meta.text}`}>{assessment.contract.contractId} · {meta.label}</span>
        ) : (
          <span className="text-[11px] font-semibold text-subtle">No candidate contract</span>
        )}
        {assessment && <SignalPips signals={assessment.signals} />}
      </div>
    </button>
  );
}

function EvidenceTable({ assessment, contractId }: { assessment: Assessment; contractId: string }) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase tracking-wide text-subtle">
          <th className="px-4 py-2">Field</th>
          <th className="px-4 py-2">Incoming buy</th>
          <th className="px-4 py-2">{contractId}</th>
          <th className="w-28 px-4 py-2 text-right">Verdict</th>
        </tr>
      </thead>
      <tbody>
        {assessment.signals.map((signal) => {
          const meta = verdictMeta[signal.verdict];
          const Icon = meta.icon;
          return (
            <tr key={signal.key} className={`border-b border-hair last:border-0 align-top ${meta.row}`}>
              <td className="px-4 py-2.5 text-xs font-semibold text-subtle">{signal.label}</td>
              <td className="px-4 py-2.5 text-xs font-semibold tabular-nums text-ink">{signal.buyValue}</td>
              <td className="px-4 py-2.5 text-xs tabular-nums">
                <span className={signal.verdict === "missing" ? "italic text-subtle" : "font-semibold text-ink"}>{signal.contractValue}</span>
                {signal.note && <p className="mt-0.5 text-[11px] font-normal not-italic leading-relaxed text-subtle">{signal.note}</p>}
              </td>
              <td className="px-4 py-2.5 text-right">
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${meta.text}`}>
                  <Icon className="size-3.5" strokeWidth={3} /> {meta.label}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PaperworkChips({ label, values, highlight }: { label: string; values: string[]; highlight: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">{label}</dt>
      <dd className="mt-1 flex flex-wrap gap-1">
        {values.length === 0 && <span className="text-[11px] italic text-subtle">None recorded</span>}
        {values.map((value) => (
          <span key={value} className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${value === highlight ? "bg-moss-soft text-moss ring-1 ring-moss" : "bg-table-head text-subtle"}`}>
            {value}
          </span>
        ))}
      </dd>
    </div>
  );
}

function BalanceImpact({ assessment }: { assessment: Assessment }) {
  const { contract, quantity } = assessment;
  const scale = Math.max(contract.contractRins, contract.appliedRins + quantity.buyRins);
  const pct = (value: number) => `${(value / scale) * 100}%`;
  return (
    <div className="rounded-md border border-hair bg-panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-display text-sm font-bold">If you approve this match</h4>
        <span className="text-[11px] font-semibold text-subtle">Contract written for {numberFmt.format(contract.contractRins)} RINs</span>
      </div>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-table-head">
        <div className="h-full bg-ice" style={{ width: pct(contract.appliedRins) }} title="Already applied" />
        <div className="h-full bg-primary" style={{ width: pct(Math.min(quantity.buyRins, contract.outstandingRins)) }} title="This buy" />
        {quantity.overflow > 0 && <div className="h-full bg-settle" style={{ width: pct(quantity.overflow) }} title="Overflow to Unassigned" />}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[11px]">
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-ice" /> Applied {numberFmt.format(contract.appliedRins)}</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-primary" /> This buy {numberFmt.format(Math.min(quantity.buyRins, contract.outstandingRins))}</span>
        {quantity.overflow > 0 && <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-settle" /> Overflow {numberFmt.format(quantity.overflow)}</span>}
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-table-head ring-1 ring-hair" /> Still outstanding {numberFmt.format(quantity.remaining)}</span>
      </div>
      {quantity.settles && (
        <p className="mt-3 rounded bg-settle-soft px-3 py-2 text-xs leading-relaxed text-ink">
          <span className="font-bold text-settle">Contract settles.</span>{" "}
          {quantity.overflow > 0
            ? `${numberFmt.format(quantity.overflow)} RINs beyond the balance move to the Unassigned pool.`
            : "The outstanding balance reaches zero."}
        </p>
      )}
    </div>
  );
}

function Dossier({ assessment, buy }: { assessment: Assessment; buy: PendingBuy }) {
  const contract = assessment.contract;
  return (
    <div className="rounded-md border border-hair bg-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hair px-4 py-3">
        <h4 className="font-display text-sm font-bold">{contract.contractId} contract record</h4>
        <span className="text-[11px] font-semibold text-primary">{contract.dealNumber}</span>
      </div>
      <dl className="grid grid-cols-2 gap-4 px-4 py-4 sm:grid-cols-3">
        <div><dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">Contract partner</dt><dd className="mt-1 text-xs font-semibold text-ink">{contract.counterparty}</dd></div>
        <div><dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">Due date</dt><dd className="mt-1 text-xs font-semibold text-ink">{contract.dueDate ?? "No due date"}</dd></div>
        <div><dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">Terms</dt><dd className="mt-1 text-xs font-semibold text-ink">{[contract.fuel, contract.year, contract.price].filter(Boolean).join(" · ") || "Not recorded"}</dd></div>
        <div><dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">Imported</dt><dd className="mt-1 text-xs font-semibold text-ink">{contract.importedOn ?? "—"}</dd></div>
        <div className="col-span-2"><dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">Source</dt><dd className="mt-1 text-xs font-semibold text-ink">{contract.source ?? "Contract feed"}</dd></div>
      </dl>
      <dl className="grid gap-3 border-t border-hair px-4 py-4 sm:grid-cols-3">
        <PaperworkChips label="PTDs on contract" values={contract.ptd} highlight={buy.ptd} />
        <PaperworkChips label="Bills of lading" values={contract.bol} highlight={buy.bol} />
        <PaperworkChips label="Invoices" values={contract.invoices} highlight={buy.invoice} />
      </dl>
      <div className="border-t border-hair px-4 py-4">
        <dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">Already applied to this contract</dt>
        {contract.activity.length === 0 ? (
          <p className="mt-2 text-xs italic text-subtle">Nothing has been applied yet — this would be the first buy on the contract.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {contract.activity.map((entry) => (
              <li key={entry.ptd} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-subtle">{entry.date} · <span className="font-semibold text-ink">{entry.ptd}</span></span>
                <span className="font-semibold tabular-nums text-ink">{numberFmt.format(entry.rins)} RINs</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EvidenceWorkbench() {
  const [activeId, setActiveId] = useState(pendingBuys[0]!.id);
  const [filter, setFilter] = useState<"all" | "strong" | "partial" | "weak" | "none">("all");
  const [overrideContractId, setOverrideContractId] = useState<string | null>(null);
  const [comparedId, setComparedId] = useState<string | null>(null);

  const rows = useMemo(() => pendingBuys.map((buy) => ({ buy, candidates: candidatesFor(buy) })), []);
  const visible = rows.filter(({ candidates }) => {
    if (filter === "all") return true;
    if (filter === "none") return candidates.length === 0;
    return candidates[0]?.confidence === filter;
  });

  const active = rows.find(({ buy }) => buy.id === activeId)!;
  const buy = active.buy;

  const selectBuy = (id: string) => { setActiveId(id); setOverrideContractId(null); setComparedId(null); };

  const candidates = useMemo(() => {
    if (!overrideContractId) return active.candidates;
    const contract = contractById(overrideContractId);
    if (!contract || active.candidates.some((candidate) => candidate.contract.contractId === overrideContractId)) return active.candidates;
    return [...active.candidates, assess(buy, contract, "manual")];
  }, [active, overrideContractId, buy]);

  const compared = candidates.find((candidate) => candidate.contract.contractId === comparedId) ?? candidates[0];
  const counts = {
    strong: rows.filter((row) => row.candidates[0]?.confidence === "strong").length,
    partial: rows.filter((row) => row.candidates[0]?.confidence === "partial").length,
    weak: rows.filter((row) => row.candidates[0]?.confidence === "weak").length,
    none: rows.filter((row) => row.candidates.length === 0).length,
  };

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
        <Link to="/reconciliation-concepts" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-subtle hover:text-primary">
          <ArrowLeft className="size-4" /> Reconciliation concepts
        </Link>
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold">Evidence Workbench</h1>
          <p className="mt-1 text-sm text-subtle">Every suggested match, shown as the fields it was built from. Evergreen Fuels Group (48217)</p>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {([["all", `All ${rows.length}`], ["strong", `Strong ${counts.strong}`], ["partial", `Partial ${counts.partial}`], ["weak", `Weak ${counts.weak}`], ["none", `No candidate ${counts.none}`]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${filter === key ? "border-primary bg-selected text-primary" : "border-hair bg-panel text-subtle hover:border-primary/50"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <section className="overflow-hidden rounded-md border border-hair bg-panel shadow-sm" aria-label="Pending buys">
            <div className="border-b border-hair bg-table-head px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-subtle">
              Pending buys · {visible.length}
            </div>
            <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
              {visible.map(({ buy: row, candidates: rowCandidates }) => (
                <BuyRow key={row.id} buy={row} assessment={rowCandidates[0]} active={row.id === activeId} onSelect={() => selectBuy(row.id)} />
              ))}
              {visible.length === 0 && <p className="px-4 py-10 text-center text-xs text-subtle">No buys in this band.</p>}
            </div>
          </section>

          <section className="space-y-5" aria-label="Match evidence">
            <div className="rounded-md border border-hair bg-panel p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold">{buy.partner}</h2>
                  <p className="mt-1 text-xs text-subtle">{buy.id} · {buy.ptd} · {buy.invoice} · Received {buy.received}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex min-w-8 items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold ${fuelClass[buy.fuel]}`}>{buy.fuel}</span>
                  <span className="rounded-full border border-hair px-2 py-0.5 text-[10px] font-bold">{buy.year}</span>
                  <span className={`inline-flex size-5 items-center justify-center rounded-sm border ${buy.assignment === "assigned" ? "border-assigned-border bg-assigned text-assigned-foreground" : "border-hair text-ink"}`} title={buy.assignment === "assigned" ? "Assigned" : "Separated"}>
                    {buy.assignment === "assigned" ? <ArrowRight className="size-3" /> : <Split className="size-3" />}
                  </span>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-hair pt-4 sm:grid-cols-4">
                <div><dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">RINs / Gallons</dt><dd className="mt-1 text-sm font-bold tabular-nums">{numberFmt.format(buy.rins)} <span className="text-xs font-normal text-subtle">/ {numberFmt.format(buy.gallons)} gal</span></dd></div>
                <div><dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">Price</dt><dd className="mt-1 text-sm font-bold">{buy.price}</dd></div>
                <div><dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">Bill of lading</dt><dd className="mt-1 text-sm font-bold">{buy.bol}</dd></div>
                <div><dt className="text-[10px] font-bold uppercase tracking-wide text-subtle">Expires in</dt><dd className={`mt-1 text-sm font-bold ${buy.expiresInDays <= 1 ? "text-rose" : buy.expiresInDays <= 5 ? "text-amber" : "text-ink"}`}>{expirationLabel(buy.expiresInDays)}</dd></div>
              </dl>
            </div>

            <div className="rounded-md border border-hair bg-panel shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair px-5 py-3">
                <h3 className="font-display text-sm font-bold">Compare against</h3>
                <Select value={overrideContractId ?? ""} onValueChange={(value) => { setOverrideContractId(value); setComparedId(value); }}>
                  <SelectTrigger aria-label="Compare against any open contract" className="h-8 w-[260px] bg-panel text-xs"><SelectValue placeholder="Any other open contract…" /></SelectTrigger>
                  <SelectContent>
                    {matchContracts.map((contract) => (
                      <SelectItem key={contract.contractId} value={contract.contractId}>{contract.contractId} · {contract.counterparty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {candidates.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-subtle">No contract links to this buy. Pick one above to see how it compares, or approve the buy as unreconciled.</p>
              ) : (
                <>
                  <div className="flex gap-3 overflow-x-auto border-b border-hair px-5 py-4">
                    {candidates.map((candidate) => {
                      const meta = confidenceMeta[candidate.confidence];
                      const isCompared = candidate.contract.contractId === compared?.contract.contractId;
                      return (
                        <button
                          key={candidate.contract.contractId}
                          type="button"
                          onClick={() => setComparedId(candidate.contract.contractId)}
                          aria-pressed={isCompared}
                          className={`min-w-[220px] shrink-0 rounded-md border p-3 text-left transition-colors ${isCompared ? "border-primary bg-selected" : "border-hair bg-panel hover:border-primary/50"}`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-sm font-bold text-ink">{candidate.contract.contractId}</span>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${meta.chip}`}>{candidate.score}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-subtle">{candidate.contract.counterparty}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-subtle">{originLabel[candidate.origin]}</p>
                          <div className="mt-2"><SignalPips signals={candidate.signals} size="md" /></div>
                        </button>
                      );
                    })}
                  </div>

                  {compared && (
                    <div className="space-y-5 px-5 py-5">
                      <div className="rounded-md border border-hair bg-table-head p-4">
                        <ConfidenceBar assessment={compared} />
                        <p className="mt-2.5 text-xs leading-relaxed text-ink">{compared.headline}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-subtle">
                          <span className="flex items-center gap-1"><Check className="size-3 text-moss" strokeWidth={3} />{compared.counts.match} match</span>
                          <span className="flex items-center gap-1"><AlertTriangle className="size-3 text-amber" />{compared.counts.near} close</span>
                          <span className="flex items-center gap-1"><X className="size-3 text-rose" strokeWidth={3} />{compared.counts.differs} differ</span>
                          <span className="flex items-center gap-1"><Minus className="size-3" />{compared.counts.missing} not recorded</span>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-md border border-hair">
                        <EvidenceTable assessment={compared} contractId={compared.contract.contractId} />
                      </div>

                      <BalanceImpact assessment={compared} />
                      <Dossier assessment={compared} buy={buy} />
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair bg-table-head px-5 py-4">
                <span className="flex items-center gap-2 text-xs text-subtle"><FileText className="size-4" /> Nothing posts until you approve.</span>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Approve as Unreconciled</Button>
                  <Button size="sm" disabled={!compared}>{compared ? `Approve for ${compared.contract.contractId}` : "Approve"}</Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
