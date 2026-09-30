import type { AssignmentType, RinCode } from "./contracts-data";

export type CandidateContract = {
  contractId: string;
  dealNumber: string;
  partner: string;
  dueDate: string | null;
  outstandingRins: number;
  matchedOn: string;
};

export type PendingBuy = {
  id: string;
  contractId: string | null;
  dealNumber: string | null;
  contractOutstandingRins?: number;
  /** The matched contract's correct trading-partner name, when it differs from the buy's. */
  contractPartner?: string;
  candidateContracts?: CandidateContract[];
  partner: string;
  received: string;
  /** Days from today until the buy expires (0 = within hours). */
  expiresInDays: number;
  dueDate: string | null;
  invoice: string;
  expectedRins: number | null;
  rins: number;
  gallons: number;
  price: string;
  fuel: RinCode;
  year: number;
  assignment: AssignmentType;
  qap: "Q-RIN" | "Unverified";
  ptd: string;
  bol: string;
  match: "matched" | "needs-review" | "unmatched";
  reason: string;
  /** Partner name is a near-match (missing suffix, transposed letters) rather than exact. */
  fuzzy?: boolean;
};

/** Pending imports are separate prototype records; none are posted to contracts or the ledger. */
export const pendingBuys: PendingBuy[] = [
  { id: "PB-80214", contractId: "CT-4902", dealNumber: "EVERG26TP0018", contractOutstandingRins: 15600, partner: "Evergreen Refinery", received: "Sep 29, 2026", expiresInDays: 0, dueDate: "Oct 12, 2026", invoice: "INV-70421", expectedRins: 7800, rins: 7800, gallons: 7800, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558012", bol: "BOL-871204", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80215", contractId: "CT-4904", dealNumber: "EVERG26TP0020", contractOutstandingRins: 25000, partner: "Harbor Line Energy", received: "Sep 29, 2026", expiresInDays: 2, dueDate: "Oct 16, 2026", invoice: "INV-70425", expectedRins: 12500, rins: 12500, gallons: 8333, price: "$2.150/RIN", fuel: "D4", year: 2026, assignment: "separated", qap: "Q-RIN", ptd: "PTD 1558015", bol: "BOL-871218", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80216", contractId: "CT-4910", dealNumber: "EVERG26TP0024", contractOutstandingRins: 5200, partner: "Vantage Fuel Trading", received: "Sep 28, 2026", expiresInDays: 3, dueDate: "Oct 19, 2026", invoice: "INV-70431", expectedRins: 5200, rins: 4700, gallons: 4700, price: "$2.040/gal", fuel: "D5", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558021", bol: "BOL-871232", match: "needs-review", reason: "Incoming buy is 500 RINs below the imported contract quantity." },
  { id: "PB-80217", contractId: "CT-4911", dealNumber: "EVERG26TP0025", contractOutstandingRins: 18000, partner: "Northstar Biofuels", received: "Sep 28, 2026", expiresInDays: 7, dueDate: "Oct 21, 2026", invoice: "INV-70435", expectedRins: 17900, rins: 17900, gallons: 17900, price: "$2.310/RIN", fuel: "D3", year: 2025, assignment: "separated", qap: "Q-RIN", ptd: "PTD 1558026", bol: "BOL-871239", match: "matched", reason: "Contract and trading partner align; buy quantity is within tolerance of the contract balance." },
  { id: "PB-80218", contractId: null, dealNumber: null, partner: "Summit Renewable Supply", received: "Sep 27, 2026", expiresInDays: 9, dueDate: null, invoice: "INV-70442", expectedRins: null, rins: 3600, gallons: 3600, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "separated", qap: "Unverified", ptd: "PTD 1558033", bol: "BOL-871251", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80219", contractId: "CT-4913", dealNumber: "EVERG26TP0027", contractOutstandingRins: 22400, partner: "Meridian Fuels", received: "Sep 27, 2026", expiresInDays: 11, dueDate: "Oct 24, 2026", invoice: "INV-70448", expectedRins: 15000, rins: 15000, gallons: 10000, price: "$2.150/RIN", fuel: "D4", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558040", bol: "BOL-871266", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80220", contractId: "CT-4915", dealNumber: "EVERG26TP0029", contractOutstandingRins: 9300, partner: "Cedar Peak Energy", received: "Sep 26, 2026", expiresInDays: 13, dueDate: "Oct 28, 2026", invoice: "INV-70453", expectedRins: 6200, rins: 6200, gallons: 3647, price: "$5.560/gal", fuel: "D7", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558047", bol: "BOL-871278", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80221", contractId: null, dealNumber: null, partner: "Bluewater Trading", received: "Sep 26, 2026", expiresInDays: 14, dueDate: null, invoice: "INV-70459", expectedRins: null, rins: 2850, gallons: 2850, price: "$2.020/gal", fuel: "D6", year: 2025, assignment: "separated", qap: "Unverified", ptd: "PTD 1558052", bol: "BOL-871285", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80222", contractId: null, dealNumber: null, partner: "Evergreen Refinery", received: "Sep 29, 2026", expiresInDays: 5, dueDate: null, invoice: "INV-70466", expectedRins: null, rins: 6400, gallons: 6400, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558058", bol: "BOL-871292", match: "needs-review", reason: "This buy's PTD number appears on 2 imported buy contracts. Choose which contract the buy applies to.",
    candidateContracts: [
      { contractId: "CT-4917", dealNumber: "EVERG26TP0031", partner: "Evergreen Refinery", dueDate: "Nov 2, 2026", outstandingRins: 6400, matchedOn: "PTD 1558058" },
      { contractId: "CT-4918", dealNumber: "EVERG26TP0032", partner: "Evergreen Refinery", dueDate: "Nov 14, 2026", outstandingRins: 9800, matchedOn: "PTD 1558058" },
    ] },
  { id: "PB-80223", contractId: "CT-4750", dealNumber: "GULFSTAR26TP0026", contractOutstandingRins: 7350, partner: "Gulfstar Bunkering", received: "Sep 29, 2026", expiresInDays: 6, dueDate: null, invoice: "INV-70471", expectedRins: null, rins: 9000, gallons: 4500, price: "$2.150/RIN", fuel: "D4", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558065", bol: "BOL-871301", match: "needs-review", reason: "Buy quantity exceeds CT-4750's outstanding balance by 1,650 RINs." },
  { id: "PB-80224", contractId: "CT-4799", dealNumber: "NORTH26TP0011", contractOutstandingRins: 21600, contractPartner: "Northline Terminals", partner: "Northline Terminals, Inc", received: "Sep 29, 2026", expiresInDays: 4, dueDate: null, invoice: "INV-70474", expectedRins: null, rins: 11200, gallons: 11200, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558071", bol: "BOL-871308", match: "needs-review", fuzzy: true, reason: "Trading partner is a fuzzy match: the buy shows 'Northline Terminals, Inc' but CT-4799 lists 'Northline Terminals'." },
  { id: "PB-80225", contractId: "CT-4913", dealNumber: "EVERG26TP0027", contractOutstandingRins: 22400, contractPartner: "Meridian Fuels", partner: "Meridain Fuels", received: "Sep 28, 2026", expiresInDays: 8, dueDate: null, invoice: "INV-70478", expectedRins: null, rins: 5400, gallons: 5400, price: "$2.150/RIN", fuel: "D4", year: 2026, assignment: "separated", qap: "Q-RIN", ptd: "PTD 1558076", bol: "BOL-871314", match: "needs-review", fuzzy: true, reason: "Trading partner looks misspelled: 'Meridain Fuels' vs CT-4913's 'Meridian Fuels'." },
  { id: "PB-80226", contractId: null, dealNumber: null, partner: "Evergreen Refinery", received: "Sep 25, 2026", expiresInDays: 1, dueDate: null, invoice: "INV-70481", expectedRins: null, rins: 5000, gallons: 5000, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558081", bol: "BOL-871320", match: "needs-review", reason: "Partial buy for Evergreen Refinery; no single contract matches this quantity." },
  { id: "PB-80227", contractId: null, dealNumber: null, partner: "Evergreen Refinery", received: "Sep 27, 2026", expiresInDays: 6, dueDate: null, invoice: "INV-70486", expectedRins: null, rins: 4400, gallons: 4400, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558087", bol: "BOL-871327", match: "needs-review", reason: "Partial buy for Evergreen Refinery; no single contract matches this quantity." },
  { id: "PB-80228", contractId: null, dealNumber: null, partner: "Evergreen Refinery", received: "Sep 29, 2026", expiresInDays: 10, dueDate: null, invoice: "INV-70490", expectedRins: null, rins: 3000, gallons: 3000, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558092", bol: "BOL-871333", match: "needs-review", reason: "Partial buy for Evergreen Refinery; no single contract matches this quantity." },
];

export type SettlementGroup = {
  key: string;
  contractId: string;
  dealNumber: string;
  partner: string;
  outstandingRins: number;
  buys: PendingBuy[];
  total: number;
};

/**
 * Cheap single-pass detection (no permutation search): bucket loose buys by
 * trading partner + fuel + year, then compare each bucket's total against open
 * contracts for that partner. A bucket that lands within 1% of (and not over)
 * a contract's outstanding balance becomes a settlement group. Max 5 buys.
 */
export function findSettlementGroups(
  buys: PendingBuy[],
  openContracts: { contractId: string; dealNumber: string; counterparty: string; outstandingRins: number }[],
): SettlementGroup[] {
  const buckets = new Map<string, PendingBuy[]>();
  for (const buy of buys) {
    if (buy.match === "matched" || buy.contractId || buy.candidateContracts?.length) continue;
    const key = `${buy.partner}|${buy.fuel}|${buy.year}`;
    buckets.set(key, [...(buckets.get(key) ?? []), buy]);
  }
  const groups: SettlementGroup[] = [];
  for (const [key, bucket] of buckets) {
    if (bucket.length < 2 || bucket.length > 5) continue;
    const total = bucket.reduce((sum, b) => sum + b.rins, 0);
    const contract = openContracts.find((c) => c.counterparty === bucket[0]!.partner && total >= c.outstandingRins * 0.99 && total <= c.outstandingRins);
    if (contract) groups.push({ key, contractId: contract.contractId, dealNumber: contract.dealNumber, partner: bucket[0]!.partner, outstandingRins: contract.outstandingRins, buys: bucket, total });
  }
  return groups;
}
