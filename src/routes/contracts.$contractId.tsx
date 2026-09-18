import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUp, Split } from "lucide-react";

import { Button } from "@/components/ui/button";

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

function Field({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase text-subtle">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink">{values.join(", ") || "—"}</div>
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

function ContractDetail() {
  const { contract } = Route.useLoaderData();
  const appliedRins = contract.transactions.reduce((s, t) => s + t.rinApplied, 0);

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3 text-subtle">
          <Link to="/"><ArrowLeft />Contract balances</Link>
        </Button>

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
                Deal #{contract.dealNumber} · {contract.dueDate ? `due ${contract.dueDate}` : "no due date"}
              </div>
            </div>
            <div className="min-w-[220px] rounded-md border border-hair bg-table-head px-5 py-4 text-right">
              <div className="text-xs font-semibold text-subtle">Outstanding RINs</div>
              <div className="mt-1 font-display text-2xl font-bold tabular-nums text-primary">
                {numberFmt.format(contract.outstandingRins)}
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
          <table className="min-w-[1080px] w-full text-left">
            <thead>
              <tr className="border-b border-hair bg-table-head text-[10px] font-bold uppercase text-subtle">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Reference</th>
                <th className="px-4 py-2 font-medium">Detail</th>
                <th className="px-4 py-2 font-medium">RIN / year</th>
                <th className="px-4 py-2 font-medium">Assignment</th>
                <th className="px-4 py-2 text-right font-medium">RINs</th>
                <th className="px-4 py-2 text-right font-medium">Applied</th>
                <th className="px-4 py-2 text-right font-medium">RIN balance</th>
                <th className="px-4 py-2 text-right font-medium">Balance after</th>
              </tr>
            </thead>
            <tbody>
              {contract.transactions.map((t) => (
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
                  <td className="px-4 py-2.5 text-right text-xs font-bold tabular-nums text-primary">
                    {numberFmt.format(t.rinApplied)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs tabular-nums">
                    −{currencyFmt.format(t.amountApplied)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs tabular-nums text-subtle">
                    {numberFmt.format(t.rinBalanceAfter)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold tabular-nums">
                    {currencyFmt.format(t.balanceAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      </main>
    </div>
  );
}
