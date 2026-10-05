import { contracts, type AssignmentType, type RinCode } from "./contracts-data";
import { pendingBuys, type PendingBuy } from "./reconciliation-data";

/**
 * Evidence model for the alternate reconciliation UIs.
 *
 * The production screen only tells the user *that* a buy matched a contract.
 * These UIs need to show *why*, field by field, so the match can be trusted or
 * overturned. Everything here is prototype data — nothing posts to a contract
 * or the ledger.
 */

export type MatchContract = {
  contractId: string;
  dealNumber: string;
  counterparty: string;
  dueDate: string | null;
  /** RIN quantity the contract was written for. */
  contractRins: number;
  appliedRins: number;
  outstandingRins: number;
  fuel: RinCode | null;
  year: number | null;
  assignment: AssignmentType | null;
  price: string | null;
  ptd: string[];
  bol: string[];
  invoices: string[];
  importedOn?: string;
  source?: string;
  activity: { date: string; ptd: string; rins: number }[];
};

/** Buy contracts referenced by pending buys, with the paperwork needed to justify a match. */
const detailedContracts: MatchContract[] = [
  {
    contractId: "CT-4902", dealNumber: "EVERG26TP0018", counterparty: "Evergreen Refinery", dueDate: "Oct 12, 2026",
    contractRins: 31200, appliedRins: 15600, outstandingRins: 15600,
    fuel: "D6", year: 2026, assignment: "assigned", price: "$2.020/gal",
    ptd: ["PTD 1557980", "PTD 1558012"], bol: ["BOL-871150", "BOL-871204"], invoices: ["INV-70390", "INV-70421"],
    importedOn: "Sep 14, 2026", source: "Broker confirmation file",
    activity: [{ date: "Sep 18, 2026", ptd: "PTD 1557980", rins: 15600 }],
  },
  {
    contractId: "CT-4904", dealNumber: "EVERG26TP0020", counterparty: "Harbor Line Energy", dueDate: "Oct 16, 2026",
    contractRins: 50000, appliedRins: 25000, outstandingRins: 25000,
    fuel: "D4", year: 2026, assignment: "separated", price: "$2.150/RIN",
    ptd: ["PTD 1557994", "PTD 1558015"], bol: ["BOL-871177", "BOL-871218"], invoices: ["INV-70402", "INV-70425"],
    importedOn: "Sep 15, 2026", source: "Broker confirmation file",
    activity: [{ date: "Sep 21, 2026", ptd: "PTD 1557994", rins: 25000 }],
  },
  {
    contractId: "CT-4910", dealNumber: "EVERG26TP0024", counterparty: "Vantage Fuel Trading", dueDate: "Oct 19, 2026",
    contractRins: 15600, appliedRins: 10400, outstandingRins: 5200,
    fuel: "D5", year: 2026, assignment: "assigned", price: "$2.040/gal",
    ptd: ["PTD 1557951", "PTD 1558004", "PTD 1558021"], bol: ["BOL-871232"], invoices: ["INV-70431"],
    importedOn: "Sep 16, 2026", source: "Broker confirmation file",
    activity: [
      { date: "Sep 20, 2026", ptd: "PTD 1557951", rins: 5200 },
      { date: "Sep 24, 2026", ptd: "PTD 1558004", rins: 5200 },
    ],
  },
  {
    contractId: "CT-4911", dealNumber: "EVERG26TP0025", counterparty: "Northstar Biofuels", dueDate: "Oct 21, 2026",
    contractRins: 36000, appliedRins: 18000, outstandingRins: 18000,
    fuel: "D3", year: 2025, assignment: "separated", price: "$2.310/RIN",
    ptd: ["PTD 1557930", "PTD 1558026"], bol: ["BOL-871239"], invoices: ["INV-70435"],
    importedOn: "Sep 16, 2026", source: "Broker confirmation file",
    activity: [{ date: "Sep 22, 2026", ptd: "PTD 1557930", rins: 18000 }],
  },
  {
    contractId: "CT-4913", dealNumber: "EVERG26TP0027", counterparty: "Meridian Fuels", dueDate: "Oct 24, 2026",
    contractRins: 44800, appliedRins: 22400, outstandingRins: 22400,
    fuel: "D4", year: 2026, assignment: "assigned", price: "$2.150/RIN",
    ptd: ["PTD 1557968", "PTD 1558040"], bol: ["BOL-871266"], invoices: ["INV-70448"],
    importedOn: "Sep 17, 2026", source: "Broker confirmation file",
    activity: [{ date: "Sep 23, 2026", ptd: "PTD 1557968", rins: 22400 }],
  },
  {
    contractId: "CT-4915", dealNumber: "EVERG26TP0029", counterparty: "Cedar Peak Energy", dueDate: "Oct 28, 2026",
    contractRins: 15500, appliedRins: 6200, outstandingRins: 9300,
    fuel: "D7", year: 2026, assignment: "assigned", price: "$5.560/gal",
    ptd: ["PTD 1557911", "PTD 1558047"], bol: ["BOL-871278"], invoices: ["INV-70453"],
    importedOn: "Sep 18, 2026", source: "Broker confirmation file",
    activity: [{ date: "Sep 24, 2026", ptd: "PTD 1557911", rins: 6200 }],
  },
  {
    contractId: "CT-4917", dealNumber: "EVERG26TP0031", counterparty: "Evergreen Refinery", dueDate: "Nov 2, 2026",
    contractRins: 12800, appliedRins: 6400, outstandingRins: 6400,
    fuel: "D6", year: 2026, assignment: "assigned", price: "$2.020/gal",
    ptd: ["PTD 1558058"], bol: ["BOL-871292"], invoices: ["INV-70466"],
    importedOn: "Sep 19, 2026", source: "Broker confirmation file",
    activity: [{ date: "Sep 25, 2026", ptd: "PTD 1558058", rins: 6400 }],
  },
  {
    contractId: "CT-4918", dealNumber: "EVERG26TP0032", counterparty: "Evergreen Refinery", dueDate: "Nov 14, 2026",
    contractRins: 9800, appliedRins: 0, outstandingRins: 9800,
    fuel: "D6", year: 2026, assignment: "assigned", price: "$2.020/gal",
    // Same PTD as CT-4917 — the reason this buy is ambiguous — but no BOL or invoice on file.
    ptd: ["PTD 1558058"], bol: [], invoices: [],
    importedOn: "Sep 26, 2026", source: "Manual entry — desk ticket",
    activity: [],
  },
  {
    contractId: "CT-4750", dealNumber: "GULFSTAR26TP0026", counterparty: "Gulfstar Bunkering", dueDate: null,
    contractRins: 29400, appliedRins: 22050, outstandingRins: 7350,
    fuel: "D4", year: 2026, assignment: "assigned", price: "$2.150/RIN",
    ptd: ["PTD 1557840", "PTD 1557899", "PTD 1558065"], bol: ["BOL-871301"], invoices: ["INV-70471"],
    importedOn: "Aug 28, 2026", source: "Broker confirmation file",
    activity: [
      { date: "Sep 08, 2026", ptd: "PTD 1557840", rins: 14700 },
      { date: "Sep 19, 2026", ptd: "PTD 1557899", rins: 7350 },
    ],
  },
  {
    contractId: "CT-4799", dealNumber: "NORTH26TP0011", counterparty: "Northline Terminals", dueDate: "Oct 30, 2026",
    contractRins: 43200, appliedRins: 21600, outstandingRins: 21600,
    fuel: "D6", year: 2026, assignment: "assigned", price: "$2.020/gal",
    ptd: ["PTD 1557905", "PTD 1558071"], bol: ["BOL-871308"], invoices: ["INV-70474"],
    importedOn: "Sep 02, 2026", source: "Broker confirmation file",
    activity: [{ date: "Sep 12, 2026", ptd: "PTD 1557905", rins: 21600 }],
  },
];

/** Open contracts from the main dataset, with the sparse fields the feed doesn't carry. */
const importedOpenContracts: MatchContract[] = contracts
  .filter((contract) => contract.contractStatus === "open")
  .filter((contract) => !detailedContracts.some((detail) => detail.contractId === contract.contractId))
  .map((contract) => {
    const applied = contract.transactions.filter((tx) => tx.txStatus === "completed").reduce((sum, tx) => sum + tx.rinApplied, 0);
    return {
      contractId: contract.contractId,
      dealNumber: contract.dealNumber,
      counterparty: contract.counterparty,
      dueDate: contract.dueDate,
      contractRins: applied + contract.outstandingRins,
      appliedRins: applied,
      outstandingRins: contract.outstandingRins,
      fuel: null,
      year: null,
      assignment: null,
      price: null,
      ptd: contract.ptd,
      bol: contract.billOfLading,
      invoices: contract.invoices,
      activity: contract.transactions
        .filter((tx) => tx.txStatus === "completed")
        .slice(-2)
        .map((tx) => ({ date: tx.date, ptd: tx.ptdNumber, rins: tx.rinApplied })),
    } satisfies MatchContract;
  });

export const matchContracts: MatchContract[] = [...detailedContracts, ...importedOpenContracts];

export const contractById = (id: string) => matchContracts.find((contract) => contract.contractId === id);

const numberFormat = (value: number) => new Intl.NumberFormat("en-US").format(value);

export type Verdict = "match" | "near" | "differs" | "missing";

export type Signal = {
  key: string;
  label: string;
  buyValue: string;
  contractValue: string;
  verdict: Verdict;
  note?: string;
  weight: number;
};

export type Confidence = "strong" | "partial" | "weak";

export type Assessment = {
  contract: MatchContract;
  signals: Signal[];
  score: number;
  confidence: Confidence;
  counts: Record<Verdict, number>;
  headline: string;
  /** How this contract entered the candidate list. */
  origin: "system" | "partner" | "paperwork" | "quantity" | "manual";
  quantity: { buyRins: number; outstanding: number; remaining: number; overflow: number; settles: boolean };
};

const normalizePartner = (name: string) =>
  name.toLowerCase().replace(/[.,]/g, " ").replace(/\b(inc|llc|ltd|corp|co|company)\b/g, "").replace(/\s+/g, " ").trim();

function editDistance(a: string, b: string) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = temp;
    }
  }
  return prev[b.length]!;
}

function listSignal(key: string, label: string, weight: number, buyValue: string, list: string[]): Signal {
  if (list.length === 0) return { key, label, weight, buyValue, contractValue: "Not on contract", verdict: "missing", note: "The contract record carries no value to compare." };
  const matched: Signal = { key, label, weight, buyValue, contractValue: buyValue, verdict: "match" };
  return list.length > 1 ? { ...matched, note: `1 of ${list.length} on the contract` } : matched;
  return { key, label, weight, buyValue, contractValue: list.slice(0, 2).join(", ") + (list.length > 2 ? ` +${list.length - 2}` : ""), verdict: "differs", note: "This value does not appear on the contract." };
}

function valueSignal(key: string, label: string, weight: number, buyValue: string, contractValue: string | null): Signal {
  if (contractValue == null) return { key, label, weight, buyValue, contractValue: "Not on contract", verdict: "missing" };
  return { key, label, weight, buyValue, contractValue, verdict: buyValue === contractValue ? "match" : "differs" };
}

function partnerSignal(buy: PendingBuy, contract: MatchContract): Signal {
  const base = { key: "partner", label: "Trading partner", weight: 3, buyValue: buy.partner, contractValue: contract.counterparty };
  if (buy.partner === contract.counterparty) return { ...base, verdict: "match" };
  const a = normalizePartner(buy.partner);
  const b = normalizePartner(contract.counterparty);
  if (a === b) return { ...base, verdict: "near", note: "Same name apart from legal suffix or punctuation." };
  if (editDistance(a, b) <= 2) return { ...base, verdict: "near", note: "Likely a spelling variation — confirm before approving." };
  return { ...base, verdict: "differs", note: "Different trading partner." };
}

function quantitySignal(buy: PendingBuy, contract: MatchContract): Signal {
  const base = {
    key: "quantity", label: "RIN quantity", weight: 3,
    buyValue: `${numberFormat(buy.rins)} RINs`,
    contractValue: `${numberFormat(contract.outstandingRins)} outstanding`,
  };
  if (buy.expectedRins != null && buy.expectedRins !== buy.rins) {
    const gap = buy.expectedRins - buy.rins;
    return { ...base, verdict: "differs", note: `Contract expected ${numberFormat(buy.expectedRins)} RINs — the buy is ${numberFormat(Math.abs(gap))} ${gap > 0 ? "short" : "over"}.` };
  }
  if (buy.rins > contract.outstandingRins) return { ...base, verdict: "differs", note: `Exceeds the outstanding balance by ${numberFormat(buy.rins - contract.outstandingRins)} RINs.` };
  if (buy.rins >= contract.outstandingRins * 0.99) return { ...base, verdict: "match", note: "Covers the full outstanding balance — the contract would settle." };
  return { ...base, verdict: "near", note: `Partial draw — leaves ${numberFormat(contract.outstandingRins - buy.rins)} RINs outstanding.` };
}

const VERDICT_FACTOR: Record<Verdict, number> = { match: 1, near: 0.55, differs: 0, missing: 0 };

export function assess(buy: PendingBuy, contract: MatchContract, origin: Assessment["origin"] = "system"): Assessment {
  const signals: Signal[] = [
    partnerSignal(buy, contract),
    listSignal("ptd", "PTD number", 3, buy.ptd, contract.ptd),
    listSignal("invoice", "Invoice number", 2, buy.invoice, contract.invoices),
    listSignal("bol", "Bill of lading", 2, buy.bol, contract.bol),
    quantitySignal(buy, contract),
    valueSignal("fuel", "Fuel code", 2, buy.fuel, contract.fuel),
    valueSignal("year", "Vintage year", 1, String(buy.year), contract.year == null ? null : String(contract.year)),
    valueSignal("assignment", "Assignment", 1, buy.assignment === "assigned" ? "Assigned" : "Separated", contract.assignment == null ? null : contract.assignment === "assigned" ? "Assigned" : "Separated"),
    valueSignal("price", "Price", 1, buy.price, contract.price),
  ];

  const counts: Record<Verdict, number> = { match: 0, near: 0, differs: 0, missing: 0 };
  signals.forEach((signal) => { counts[signal.verdict] += 1; });

  const comparable = signals.filter((signal) => signal.verdict !== "missing");
  const totalWeight = comparable.reduce((sum, signal) => sum + signal.weight, 0);
  const earned = comparable.reduce((sum, signal) => sum + signal.weight * VERDICT_FACTOR[signal.verdict], 0);
  const score = totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100);

  const confidence: Confidence = score >= 85 && counts.differs === 0 ? "strong" : score >= 60 ? "partial" : "weak";

  const matched = signals.filter((signal) => signal.verdict === "match").map((signal) => signal.label.toLowerCase());
  const problems = signals.filter((signal) => signal.verdict === "differs" || signal.verdict === "near");
  const headline = [
    matched.length ? `${listPhrase(matched.slice(0, 3))} match${matched.length === 1 ? "es" : ""}` : "No field matches this contract",
    problems.length ? `${listPhrase(problems.map((signal) => signal.label.toLowerCase()))} ${problems.length === 1 ? "needs" : "need"} a look` : null,
    counts.missing ? `${counts.missing} field${counts.missing === 1 ? "" : "s"} not recorded on the contract` : null,
  ].filter(Boolean).join(" · ");

  const overflow = Math.max(0, buy.rins - contract.outstandingRins);
  return {
    contract, signals, score, confidence, counts, headline, origin,
    quantity: {
      buyRins: buy.rins,
      outstanding: contract.outstandingRins,
      remaining: Math.max(0, contract.outstandingRins - buy.rins),
      overflow,
      settles: buy.rins >= contract.outstandingRins * 0.99,
    },
  };
}

function listPhrase(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * Every contract worth comparing a buy against, best first. System matches come
 * first, then contracts that share paperwork or a partner name, then — only when
 * nothing else turns up — contracts whose balance happens to fit.
 */
export function candidatesFor(buy: PendingBuy): Assessment[] {
  const seen = new Set<string>();
  const results: Assessment[] = [];
  const add = (id: string | null | undefined, origin: Assessment["origin"]) => {
    if (!id || seen.has(id)) return;
    const contract = contractById(id);
    if (!contract) return;
    seen.add(id);
    results.push(assess(buy, contract, origin));
  };

  (buy.candidateContracts ?? []).forEach((candidate) => add(candidate.contractId, "system"));
  add(buy.contractId, "system");

  const partnerKey = normalizePartner(buy.contractPartner ?? buy.partner);
  matchContracts.forEach((contract) => {
    if (contract.ptd.includes(buy.ptd) || contract.invoices.includes(buy.invoice) || contract.bol.includes(buy.bol)) add(contract.contractId, "paperwork");
  });
  matchContracts.forEach((contract) => {
    if (normalizePartner(contract.counterparty) === partnerKey || editDistance(normalizePartner(contract.counterparty), partnerKey) <= 2) add(contract.contractId, "partner");
  });

  if (results.length === 0) {
    [...matchContracts]
      .filter((contract) => contract.fuel == null || contract.fuel === buy.fuel)
      .sort((a, b) => Math.abs(a.outstandingRins - buy.rins) - Math.abs(b.outstandingRins - buy.rins))
      .slice(0, 3)
      .forEach((contract) => add(contract.contractId, "quantity"));
  }

  return results.sort((a, b) => b.score - a.score);
}

export const originLabel: Record<Assessment["origin"], string> = {
  system: "Suggested by the import",
  paperwork: "Shares paperwork with this buy",
  partner: "Same trading partner",
  quantity: "Balance fits — no other link",
  manual: "You picked this contract",
};

export const confidenceMeta: Record<Confidence, { label: string; text: string; chip: string; bar: string }> = {
  strong: { label: "Strong evidence", text: "text-moss", chip: "bg-moss-soft text-moss", bar: "bg-moss" },
  partial: { label: "Partial evidence", text: "text-amber", chip: "bg-amber-soft text-amber", bar: "bg-amber" },
  weak: { label: "Weak evidence", text: "text-rose", chip: "bg-rose-soft text-rose", bar: "bg-rose" },
};

/** Best available assessment per buy, used for list-level sorting and counts. */
export const bestMatches = new Map<string, Assessment | undefined>(
  pendingBuys.map((buy) => [buy.id, candidatesFor(buy)[0]]),
);
