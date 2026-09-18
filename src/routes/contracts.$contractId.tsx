import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUp, Split } from "lucide-react";

import {
  contractStatusMeta,
  currencyFmt,
  getContract,
  numberFmt,
  type AssignmentType,
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
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="rounded-md bg-ice-soft px-2 py-1 font-mono text-[10px] text-ice">
            {v}
          </span>
        ))}
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

function ContractDetail() {
  const { contract } = Route.useLoaderData();
  const appliedRins = contract.transactions.reduce((s, t) => s + t.rinApplied, 0);

  return (
    <div className="relative min-h-screen bg-canvas font-sans text-ink antialiased">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-ice/25 blur-[120px]" />
        <div className="absolute -right-24 top-24 h-[460px] w-[460px] rounded-full bg-amber/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-5 pb-16 pt-5">
        <Link to="/" className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          ← Contract balances
        </Link>

        <header className="glass mt-3 rounded-2xl border border-white/60 p-5 ring-1 ring-black/5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    contractStatusMeta[contract.contractStatus].chip
                  } ${
                    contract.contractStatus === "terminated"
                      ? "line-through decoration-1"
                      : ""
                  }`}
                >
                  <i
                    className={`size-1.5 rounded-full ${contractStatusMeta[contract.contractStatus].dot}`}
                  />
                  {contractStatusMeta[contract.contractStatus].label}
                </span>
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
                  {contract.counterparty}
                </div>
              </div>
              <h1 className="mt-1 font-mono text-3xl font-semibold tracking-tight">
                {contract.contractId}
              </h1>
              <div className="mt-1 font-mono text-[12px] text-subtle">
                Deal #{contract.dealNumber} · {contract.dueDate ? `due ${contract.dueDate}` : "no due date"}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="rounded-xl bg-canvas px-4 py-3 text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                  Outstanding RINs
                </div>
                <div className="font-mono text-2xl font-semibold tabular-nums text-ice">
                  {numberFmt.format(contract.outstandingRins)}
                </div>
              </div>
              <div className="rounded-xl bg-canvas px-4 py-3 text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                  Outstanding balance
                </div>
                <div className="font-mono text-2xl font-semibold tabular-nums">
                  {currencyFmt.format(contract.outstandingBalance)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 border-t border-hair pt-4 sm:grid-cols-3">
            <Field label="PTD" values={contract.ptd} />
            <Field label="Bill of lading" values={contract.billOfLading} />
            <Field label="Invoice numbers" values={contract.invoices} />
          </div>

          {contract.terminationNote && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose/30 bg-rose-soft/40 px-4 py-3">
              <i className="mt-0.5 size-1.5 shrink-0 rounded-full bg-rose" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose">
                  Termination note
                </div>
                <div className="mt-1 text-[13px] text-ink/80">
                  {contract.terminationNote}
                </div>
              </div>
            </div>
          )}
        </header>

        <section className="glass mt-4 overflow-hidden rounded-2xl border border-white/60 ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-hair px-4 py-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
              Buy transactions applied
            </div>
            <div className="font-mono text-[11px] text-subtle">
              {contract.transactions.length} txns · {numberFmt.format(appliedRins)} RIN applied
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hair font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
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
                  <td className="px-4 py-2.5 font-mono text-[12px] text-subtle">{t.date}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{t.reference}</td>
                  <td className="px-4 py-2.5 text-[13px] text-subtle">{t.description}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rinCodeClass[t.rinCode]}`}>{t.rinCode}</span>
                      <span className="text-[11px] font-semibold text-subtle">{t.vintageYear}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><AssignmentMark type={t.assignmentType} /></td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-ice">
                    {numberFmt.format(t.rinApplied)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums">
                    −{currencyFmt.format(t.amountApplied)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-subtle">
                    {numberFmt.format(t.rinBalanceAfter)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] font-semibold tabular-nums">
                    {currencyFmt.format(t.balanceAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
