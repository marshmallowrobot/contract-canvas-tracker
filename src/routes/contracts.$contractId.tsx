import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowUp, Ban, ChevronLeft, ChevronRight, Split } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  buyTxStatusMeta,
  contractStatusMeta,
  getContract,
  numberFmt,
  type AssignmentType,
  type BuyTransactionStatus,
  type RinCode,
} from "@/lib/contracts-data";

export const Route = createFileRoute("/contracts/$contractId")({
  loader: ({ params }) => {
    const contract = getContract(params.contractId);
    if (!contract) throw notFound();
    return { contract };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Contract unavailable" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.contract.contractId} — Contract Detail`;
    const description = `Buy transactions and outstanding RIN balance for contract ${loaderData.contract.contractId}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ContractDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 font-mono text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 font-mono text-sm">
      Contract not found. <Link to="/">Back to balances</Link>
    </div>
  ),
});

const FIELD_PREVIEW_COUNT = 5;

function Field({ label, values }: { label: string; values: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? values : values.slice(0, FIELD_PREVIEW_COUNT);
  const hiddenCount = values.length - FIELD_PREVIEW_COUNT;
  return (
    <div>
      <div className="text-[10px] font-bold uppercase text-subtle">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink">
        {visible.join(", ") || "—"}
        {hiddenCount > 0 && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="ml-1.5 text-xs font-semibold text-primary hover:underline"
          >
            +{hiddenCount} more
          </button>
        )}
        {expanded && hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="ml-1.5 text-xs font-semibold text-subtle hover:underline"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
}

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
    <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[10px] font-bold uppercase ${assigned ? "border-assigned-border bg-assigned text-assigned-foreground" : "border-hair bg-panel text-subtle"}`}>
      {assigned ? "Assigned" : "Separated"}
      {assigned ? <ArrowUp className="size-3" strokeWidth={2.2} /> : <Split className="size-3" strokeWidth={2.2} />}
    </span>
  );
}

function TxStatusText({ status }: { status: BuyTransactionStatus }) {
  const meta = buyTxStatusMeta[status];
  return (
    <span className={status === "failed" ? "text-xs font-semibold text-rose" : "text-xs text-subtle"}>
      {meta.label}
    </span>
  );
}

type RemovalAction = "terminate" | "cancel";

const removalMeta: Record<
  RemovalAction,
  { title: string; description: string; confirmLabel: string; tone: string }
> = {
  terminate: {
    title: "Terminate contract",
    description:
      "Terminating zeroes out the remaining RIN balance and closes this contract. The counterparty will no longer be able to draw against it.",
    confirmLabel: "Terminate contract",
    tone: "bg-rose text-white hover:bg-rose/90",
  },
  cancel: {
    title: "Cancel contract",
    description:
      "Cancelling removes a contract that was created in error and has never had any buy transactions applied. The starting balance is discarded.",
    confirmLabel: "Cancel contract",
    tone: "bg-ink text-white hover:bg-ink/90",
  },
};

function RemovalDialog({
  action,
  open,
  onOpenChange,
}: {
  action: RemovalAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [note, setNote] = useState("");
  const meta = removalMeta[action];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-hair bg-panel p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            {action === "terminate" ? (
              <AlertTriangle className="size-5 text-rose" />
            ) : (
              <Ban className="size-5 text-ink" />
            )}
            {meta.title}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-subtle">
            {meta.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <label htmlFor="removal-note" className="text-[10px] font-bold uppercase text-subtle">
            Notes
          </label>
          <Textarea
            id="removal-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note explaining why this contract is being removed…"
            className="min-h-[96px] resize-none border-hair bg-canvas text-[13px] text-ink placeholder:text-subtle/60 focus-visible:ring-primary/40"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-hair text-subtle hover:bg-table-head"
            onClick={() => onOpenChange(false)}
          >
            Dismiss
          </Button>
          <Button
            size="sm"
            className={meta.tone}
            onClick={() => {
              onOpenChange(false);
              setNote("");
            }}
          >
            {meta.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const TRANSACTIONS_PER_PAGE = 50;

function ContractDetail() {
  const { contract } = Route.useLoaderData();
  const [page, setPage] = useState(1);
  const [dialogAction, setDialogAction] = useState<RemovalAction | null>(null);
  const canCancel = contract.transactions.length === 0;
  const isRemovable = contract.contractStatus === "open";
  const appliedRins = contract.transactions.reduce((s, t) => s + t.rinApplied, 0);
  const startingRins = contract.outstandingRins + appliedRins;
  const overdue = contract.status === "overdue";
  const dueSoon = contract.status === "soon";
  const dueTint = overdue ? "text-rose" : dueSoon ? "text-amber" : "";
  const pageCount = Math.max(1, Math.ceil(contract.transactions.length / TRANSACTIONS_PER_PAGE));
  const pageStart = (page - 1) * TRANSACTIONS_PER_PAGE;
  const sortedTransactions = [...contract.transactions].sort((a, b) => Date.parse(`${b.date}, 2026`) - Date.parse(`${a.date}, 2026`));
  const visibleTransactions = sortedTransactions.slice(pageStart, pageStart + TRANSACTIONS_PER_PAGE);
  const rangeStart = contract.transactions.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + TRANSACTIONS_PER_PAGE, contract.transactions.length);

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="-ml-3 text-subtle">
            <Link to="/"><ArrowLeft />Buy Contract Balances</Link>
          </Button>
          {isRemovable && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-rose/40 text-rose hover:bg-rose-soft/60 hover:text-rose"
                onClick={() => setDialogAction("terminate")}
              >
                <AlertTriangle className="size-4" />
                Terminate
              </Button>
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-hair text-subtle hover:bg-table-head"
                  onClick={() => setDialogAction("cancel")}
                >
                  <Ban className="size-4" />
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>

        <header className="rounded-md border border-hair bg-panel shadow-sm">
          <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    contractStatusMeta[contract.contractStatus].chip
                  }`}
                >
                  <i
                    className={`size-1.5 rounded-full ${contractStatusMeta[contract.contractStatus].dot}`}
                  />
                  {contractStatusMeta[contract.contractStatus].label}
                </span>
                <div className="text-sm text-subtle">
                  {contract.counterparty}
                </div>
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold">
                {contract.contractId}
              </h1>
              <div className="mt-1 text-sm text-subtle">
                Deal #{contract.dealNumber} ·{" "}
                {contract.dueDate ? (
                  overdue || dueSoon ? (
                    <span className={`font-semibold ${dueTint}`}>
                      due {contract.dueDate} · {contract.dueNote}
                    </span>
                  ) : (
                    `due ${contract.dueDate}`
                  )
                ) : (
                  "no due date"
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="min-w-[140px] rounded-md border border-hair bg-table-head px-5 py-4 text-right">
                <div className="text-xs font-semibold text-subtle">Starting RINs</div>
                <div className="mt-1 font-display text-2xl font-bold tabular-nums text-ink">
                  {numberFmt.format(startingRins)}
                </div>
              </div>
              <div
                className={`min-w-[160px] rounded-md border px-5 py-4 text-right ${
                  overdue ? "border-rose/40 bg-rose-soft/40" : dueSoon ? "border-amber/40 bg-amber-soft/40" : "border-hair bg-table-head"
                }`}
              >
                <div className={`text-xs font-semibold ${dueTint || "text-subtle"}`}>
                  Outstanding RINs
                </div>
                <div className={`mt-1 font-display text-2xl font-bold tabular-nums ${overdue ? "text-rose" : dueSoon ? "text-amber" : "text-primary"}`}>
                  {numberFmt.format(contract.outstandingRins)}
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="grid gap-4 border-t border-hair bg-table-head px-5 py-4 sm:grid-cols-3">
            <Field label="PTD" values={contract.ptd} />
            <Field label="Bill of lading" values={contract.billOfLading} />
            <Field label="Invoice numbers" values={contract.invoices} />
          </div>

          {contract.terminationNote && (
            <div className="flex items-start gap-3 border-t border-rose/30 bg-rose-soft/40 px-5 py-4">
              <i className="mt-0.5 size-1.5 shrink-0 rounded-full bg-rose" />
              <div>
                <div className="text-[10px] font-bold uppercase text-rose">
                  Termination note
                </div>
                <div className="mt-1 text-[13px] text-ink/80">
                  {contract.terminationNote}
                </div>
              </div>
            </div>
          )}
        </header>

        <section className="mt-5 overflow-hidden rounded-md border border-hair bg-panel shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hair px-5 py-4">
            <h2 className="font-display text-base font-bold">Buy Transactions</h2>
            <div className="text-xs text-subtle">
              {contract.transactions.length} txns · {numberFmt.format(appliedRins)} RIN applied
            </div>
          </div>

          <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left">
            <thead>
              <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase text-subtle">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Reference</th>
                <th className="px-4 py-2 font-medium">Detail</th>
                <th className="px-4 py-2 font-medium">RIN / year</th>
                <th className="px-4 py-2 font-medium">Assignment</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">RINs</th>
                <th className="px-4 py-2 text-right font-medium">RIN balance</th>
              </tr>
            </thead>
            <tbody>
              {visibleTransactions.map((t) => (
                <tr key={t.id} className="border-b border-hair last:border-0">
                  <td className="px-4 py-3 text-xs text-subtle">{t.date}</td>
                  <td className="px-4 py-3 text-xs font-semibold">{t.reference}</td>
                  <td className="px-4 py-2.5 text-[13px] text-subtle">{t.description}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rinCodeClass[t.rinCode]}`}>{t.rinCode}</span>
                      <span className="text-[11px] font-semibold text-subtle">{t.vintageYear}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><AssignmentMark type={t.assignmentType} /></td>
                  <td className="px-4 py-2.5"><TxStatusText status={t.txStatus} /></td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold tabular-nums text-primary">
                    {numberFmt.format(t.rinApplied)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs tabular-nums text-subtle">
                    {numberFmt.format(t.rinBalanceAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair px-4 py-3">
            <div className="text-xs text-subtle">
              {rangeStart}–{rangeEnd} of {contract.transactions.length} transactions
            </div>
            <div className="flex items-center gap-1" aria-label="Transaction pages">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                aria-label="Previous transaction page"
                title="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-20 px-2 text-center text-xs font-semibold text-ink">
                Page {page} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={page === pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                aria-label="Next transaction page"
                title="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        <RemovalDialog
          action={dialogAction ?? "terminate"}
          open={dialogAction !== null}
          onOpenChange={(o) => !o && setDialogAction(null)}
        />
      </main>
    </div>
  );
}
