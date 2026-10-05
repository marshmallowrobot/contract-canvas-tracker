import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Columns3, LayoutGrid, Layers } from "lucide-react";

export const Route = createFileRoute("/reconciliation-concepts")({
  head: () => ({ meta: [
    { title: "Reconciliation — Alternate UI Concepts" },
    { name: "description", content: "Two alternate reconciliation UIs built around showing why a match was made." },
  ] }),
  component: Concepts,
});

const concepts = [
  {
    to: "/reconciliation-evidence" as const,
    icon: Layers,
    name: "Evidence Workbench",
    tagline: "Split view · one buy at a time",
    problem: "The user can't tell why a match was made.",
    points: [
      "Queue on the left, full evidence on the right — no sheet, no lost context.",
      "Nine-field comparison grid: the buy's value, the contract's value, and a verdict per field.",
      "A confidence score built from weighted signals, with the reasoning written out in plain English.",
      "Contract dossier: deal terms, due date, import source, PTD/BOL/invoice chips with the buy's paperwork highlighted, and what has already been applied.",
      "Balance bar showing exactly what approving would do, including overflow to the Unassigned pool.",
    ],
  },
  {
    to: "/reconciliation-matrix" as const,
    icon: Columns3,
    name: "Match Comparison",
    tagline: "Table · compare candidates side by side",
    problem: "The user can't confirm the suggested contract is the right one.",
    points: [
      "Every row carries a confidence meter and labelled chips — Partner, PTD, Invoice, BOL, Quantity, Fuel — coloured by verdict.",
      "Expand a row to get a matrix: fields down the side, candidate contracts across the top.",
      "Each candidate is labelled with how it got there: shared paperwork, same partner, or just a balance that happens to fit.",
      "An 'after approval' row per candidate predicts settlement or remaining balance before you commit.",
      "Pick a column to choose that contract; approval stays inline with the row.",
    ],
  },
  {
    to: "/reconciliation-board" as const,
    icon: LayoutGrid,
    name: "Approval Board",
    tagline: "Aligned grid · bulk approve",
    problem: "Reading the evidence takes a click per buy, and agreeing matches can't be cleared in bulk.",
    points: [
      "All nine evidence fields render as fixed columns on every row — scan a column down the page to find the one field that disagrees.",
      "Nothing expands. Hovering a cell shows the buy value and the contract value being compared.",
      "Rows are banded into Evidence agrees, Needs a judgement call, and No contract found.",
      "Checkboxes exist only where one contract fits and every identifier matches exactly; everything else shows a dash explaining why.",
      "Sticky action bar totals the selected buys and RINs, with one-click undo after approving.",
    ],
  },
];

function Concepts() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/reconciliation" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-subtle hover:text-primary">
          <ArrowLeft className="size-4" /> Current reconciliation screen
        </Link>
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold">Reconciliation — alternate UIs</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-subtle">
            All three concepts answer the same feedback: matches don't look trustworthy because the screen shows the
            conclusion without the contract data behind it. Each one surfaces the underlying fields — partner,
            PTD, invoice, bill of lading, quantity, fuel, vintage, assignment, price — and scores the match from
            them instead of stating a status. The current screen is untouched.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {concepts.map((concept) => (
            <Link
              key={concept.to}
              to={concept.to}
              className="group flex flex-col rounded-md border border-hair bg-panel p-6 shadow-sm transition-colors hover:border-primary"
            >
              <concept.icon className="size-6 text-primary" />
              <h2 className="mt-4 font-display text-xl font-bold">{concept.name}</h2>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-subtle">{concept.tagline}</p>
              <p className="mt-3 rounded bg-table-head px-3 py-2 text-xs font-semibold text-ink">Solves: {concept.problem}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {concept.points.map((point) => (
                  <li key={point} className="flex gap-2 text-xs leading-relaxed text-subtle">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                Open concept <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
