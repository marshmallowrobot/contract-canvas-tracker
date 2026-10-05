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
/**
 * Why the engine selected the matched contract: which of the buy's fields
 * were found somewhere in the contract's fields. `true` = found, `false` =
 * not found, `"fuzzy"` = near-match (partner name). Keyed by buy id; buys
 * without a key have no contract signals (unmatched).
 */
export type SignalKey = "partner" | "ptd" | "bol" | "invoice" | "document";
export type MatchSignals = Partial<Record<SignalKey, boolean | "fuzzy">>;

export const SIGNAL_FIELDS: { key: SignalKey; label: string }[] = [
  { key: "partner", label: "Partner" },
  { key: "ptd", label: "PTD" },
  { key: "bol", label: "BOL" },
  { key: "invoice", label: "Invoice" },
  { key: "document", label: "Documents" },
];

export const matchSignals: Record<string, MatchSignals> = {
  "PB-80214": { partner: true, ptd: true, bol: true, invoice: true, document: false },
  "PB-80215": { partner: true, ptd: true, bol: true, invoice: true, document: true },
  "PB-80216": { partner: true, ptd: true, bol: true, invoice: false, document: false },
  "PB-80217": { partner: true, ptd: true, bol: false, invoice: true, document: false },
  "PB-80219": { partner: true, ptd: true, bol: true, invoice: true, document: true },
  "PB-80220": { partner: true, ptd: true, bol: false, invoice: true, document: false },
  "PB-80222": { partner: true, ptd: true, bol: false, invoice: false, document: false },
  "PB-80223": { partner: true, ptd: true, bol: true, invoice: false, document: false },
  "PB-80224": { partner: "fuzzy", ptd: true, bol: false, invoice: false, document: false },
  "PB-80225": { partner: "fuzzy", ptd: true, bol: false, invoice: false, document: false },
  "PB-80232": { partner: true, ptd: false, bol: false, invoice: false, document: false },
};

export const pendingBuys: PendingBuy[] = [
  { id: "PB-80214", contractId: "CT-4902", dealNumber: "EVERG26TP0018", contractOutstandingRins: 15600, partner: "Evergreen Refinery", received: "Sep 29, 2026", expiresInDays: 0, dueDate: "Oct 12, 2026", invoice: "INV-70421", expectedRins: 7800, rins: 7800, gallons: 7800, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "B1772029D14605981C", bol: "041063/104142103", match: "matched", reason: "Contract and trading partner align." },
  { id: "PB-80215", contractId: "CT-4904", dealNumber: "EVERG26TP0020", contractOutstandingRins: 25000, partner: "Harbor Line Energy", received: "Sep 29, 2026", expiresInDays: 2, dueDate: "Oct 16, 2026", invoice: "INV-70425", expectedRins: 12500, rins: 12500, gallons: 8333, price: "$2.150/RIN", fuel: "D4", year: 2026, assignment: "separated", qap: "Q-RIN", ptd: "PTD 1558015", bol: "BOL-871218", match: "matched", reason: "Contract and trading partner align." },
  { id: "PB-80216", contractId: "CT-4910", dealNumber: "EVERG26TP0024", contractOutstandingRins: 5200, partner: "Vantage Fuel Trading", received: "Sep 28, 2026", expiresInDays: 3, dueDate: "Oct 19, 2026", invoice: "INV-70431", expectedRins: 5200, rins: 4700, gallons: 4700, price: "$2.040/gal", fuel: "D5", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558021", bol: "BOL-871232", match: "matched", reason: "Contract and trading partner align." },
  { id: "PB-80217", contractId: "CT-4911", dealNumber: "EVERG26TP0025", contractOutstandingRins: 18000, partner: "Northstar Biofuels", received: "Sep 28, 2026", expiresInDays: 7, dueDate: "Oct 21, 2026", invoice: "INV-70435", expectedRins: 18000, rins: 18000, gallons: 18000, price: "$2.310/RIN", fuel: "D3", year: 2025, assignment: "separated", qap: "Q-RIN", ptd: "PTD 1558026", bol: "BOL-871239", match: "matched", reason: "Contract and trading partner align; buy quantity exactly matches the contract balance." },
  { id: "PB-80218", contractId: null, dealNumber: null, partner: "Summit Renewable Supply", received: "Sep 27, 2026", expiresInDays: 9, dueDate: null, invoice: "INV-70442", expectedRins: null, rins: 3600, gallons: 3600, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "separated", qap: "Unverified", ptd: "PTD 1558033", bol: "BOL-871251", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80219", contractId: "CT-4913", dealNumber: "EVERG26TP0027", contractOutstandingRins: 22400, partner: "Meridian Fuels", received: "Sep 27, 2026", expiresInDays: 11, dueDate: "Oct 24, 2026", invoice: "INV-70448", expectedRins: 22400, rins: 22400, gallons: 14933, price: "$2.150/RIN", fuel: "D4", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558040", bol: "BOL-871266", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80220", contractId: "CT-4915", dealNumber: "EVERG26TP0029", contractOutstandingRins: 9300, partner: "Cedar Peak Energy", received: "Sep 26, 2026", expiresInDays: 13, dueDate: "Oct 28, 2026", invoice: "INV-70453", expectedRins: 6200, rins: 6200, gallons: 3647, price: "$5.560/gal", fuel: "D7", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558047", bol: "BOL-871278", match: "matched", reason: "Contract and trading partner align." },
  { id: "PB-80221", contractId: null, dealNumber: null, partner: "Bluewater Trading", received: "Sep 26, 2026", expiresInDays: 14, dueDate: null, invoice: "INV-70459", expectedRins: null, rins: 2850, gallons: 2850, price: "$2.020/gal", fuel: "D6", year: 2025, assignment: "separated", qap: "Unverified", ptd: "PTD 1558052", bol: "BOL-871285", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80222", contractId: null, dealNumber: null, partner: "Evergreen Refinery", received: "Sep 29, 2026", expiresInDays: 5, dueDate: null, invoice: "INV-70466", expectedRins: null, rins: 6400, gallons: 6400, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558058", bol: "BOL-871292", match: "needs-review", reason: "This buy's PTD number appears on 2 imported buy contracts. Choose which contract the buy applies to.",
    candidateContracts: [
      { contractId: "CT-4917", dealNumber: "EVERG26TP0031", partner: "Evergreen Refinery", dueDate: "Nov 2, 2026", outstandingRins: 6400, matchedOn: "PTD 1558058" },
      { contractId: "CT-4918", dealNumber: "EVERG26TP0032", partner: "Evergreen Refinery", dueDate: "Nov 14, 2026", outstandingRins: 9800, matchedOn: "PTD 1558058" },
    ] },
  { id: "PB-80223", contractId: "CT-4750", dealNumber: "GULFSTAR26TP0026", contractOutstandingRins: 7350, partner: "Gulfstar Bunkering", received: "Sep 29, 2026", expiresInDays: 6, dueDate: null, invoice: "INV-70471", expectedRins: null, rins: 4500, gallons: 3000, price: "$2.150/RIN", fuel: "D4", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558065", bol: "BOL-871301", match: "matched", reason: "Contract and trading partner align." },
  { id: "PB-80224", contractId: "CT-4799", dealNumber: "NORTH26TP0011", contractOutstandingRins: 21600, contractPartner: "Northline Terminals", partner: "Northline Terminals, Inc", received: "Sep 29, 2026", expiresInDays: 4, dueDate: null, invoice: "INV-70474", expectedRins: null, rins: 11200, gallons: 11200, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558071", bol: "BOL-871308", match: "needs-review", fuzzy: true, reason: "Trading partner is a fuzzy match: the buy shows 'Northline Terminals, Inc' but CT-4799 lists 'Northline Terminals'." },
  { id: "PB-80225", contractId: "CT-4913", dealNumber: "EVERG26TP0027", contractOutstandingRins: 22400, contractPartner: "Meridian Fuels", partner: "Meridain Fuels", received: "Sep 28, 2026", expiresInDays: 8, dueDate: null, invoice: "INV-70478", expectedRins: null, rins: 5400, gallons: 3600, price: "$2.150/RIN", fuel: "D4", year: 2026, assignment: "separated", qap: "Q-RIN", ptd: "PTD 1558076", bol: "BOL-871314", match: "needs-review", fuzzy: true, reason: "Trading partner looks misspelled: 'Meridain Fuels' vs CT-4913's 'Meridian Fuels'." },
  { id: "PB-80226", contractId: null, dealNumber: null, partner: "Prairie Gold Ethanol", received: "Sep 25, 2026", expiresInDays: 1, dueDate: null, invoice: "INV-70481", expectedRins: null, rins: 5000, gallons: 5000, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558081", bol: "BOL-871320", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80227", contractId: null, dealNumber: null, partner: "Lakeshore Energy Partners", received: "Sep 27, 2026", expiresInDays: 6, dueDate: null, invoice: "INV-70486", expectedRins: null, rins: 4400, gallons: 4400, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558087", bol: "BOL-871327", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80228", contractId: null, dealNumber: null, partner: "Redrock Biodiesel", received: "Sep 29, 2026", expiresInDays: 10, dueDate: null, invoice: "INV-70490", expectedRins: null, rins: 3000, gallons: 3000, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558092", bol: "BOL-871333", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80229", contractId: null, dealNumber: null, partner: "Coastal Clean Fuels", received: "Sep 28, 2026", expiresInDays: 3, dueDate: null, invoice: "INV-70495", expectedRins: null, rins: 3200, gallons: 3200, price: "$2.180/RIN", fuel: "D4", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558096", bol: "BOL-871341", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80230", contractId: null, dealNumber: null, partner: "Ironwood Trading", received: "Sep 29, 2026", expiresInDays: 7, dueDate: null, invoice: "INV-70499", expectedRins: null, rins: 2900, gallons: 2900, price: "$2.180/RIN", fuel: "D4", year: 2026, assignment: "separated", qap: "Unverified", ptd: "PTD 1558101", bol: "BOL-871348", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80231", contractId: null, dealNumber: null, partner: "Sagebrush Renewables", received: "Sep 29, 2026", expiresInDays: 12, dueDate: null, invoice: "INV-70503", expectedRins: null, rins: 3300, gallons: 3300, price: "$2.180/RIN", fuel: "D4", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558106", bol: "BOL-871355", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80232", contractId: "CT-4799", dealNumber: "NORTH26TP0011", contractOutstandingRins: 21600, partner: "Northline Terminals", received: "Sep 29, 2026", expiresInDays: 9, dueDate: null, invoice: "INV-70507", expectedRins: null, rins: 10400, gallons: 10400, price: "$2.020/gal", fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558111", bol: "BOL-871362", match: "needs-review", reason: "Trading partner matches CT-4799, but the buy covers only part of its outstanding balance." },
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

export type OpenContractRef = { contractId: string; dealNumber: string; counterparty: string; outstandingRins: number };

/**
 * Settlement-group suggestions, computed server-side for ONE buy under review.
 *  - Unmatched buys: quantity-only — any other Unmatched buys, any open contract.
 *  - Needs Review buys: limited by trading partner — only open contracts for that
 *    partner (or already-matched candidates), pooled with other pending buys from
 *    the same partner (name compared loosely: case, punctuation, Inc/LLC suffixes).
 * Groups are 2–3 buys totalling exactly the outstanding balance (never over).
 * Search uses a quantity-sorted pool + binary search: pairs are O(log n) and
 * triples O(n log n) per contract. Closest suggestions first, max 3.
 */
export const MAX_SUGGESTIONS = 3;

const normalizePartner = (name: string) =>
  name.toLowerCase().replace(/[.,]/g, " ").replace(/\b(inc|llc|ltd|corp|co|company)\b/g, "").replace(/\s+/g, " ").trim();

/** Index of the largest element with rins <= max, searching sorted[from..]. -1 if none. */
function largestAtMost(sorted: PendingBuy[], max: number, from: number): number {
  let lo = from, hi = sorted.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid]!.rins <= max) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return ans;
}

export function suggestSettlementGroups(buy: PendingBuy, buys: PendingBuy[], openContracts: OpenContractRef[]): SettlementGroup[] {
  if (buy.match === "matched") return [];
  const partnerKey = normalizePartner(buy.contractPartner ?? buy.partner);
  const candidateIds = new Set([buy.contractId, ...(buy.candidateContracts ?? []).map((c) => c.contractId)].filter(Boolean));

  const contractsToTry = buy.match === "unmatched"
    ? openContracts
    : openContracts.filter((c) => candidateIds.has(c.contractId) || normalizePartner(c.counterparty) === partnerKey);

  const found: SettlementGroup[] = [];
  for (const c of contractsToTry) {
    const cKey = normalizePartner(c.counterparty);
    const pool = buys
      .filter((b) => b.id !== buy.id && (buy.match === "unmatched"
        ? b.match === "unmatched"
        : b.match !== "matched" && normalizePartner(b.contractPartner ?? b.partner) === cKey))
      .sort((a, b) => a.rins - b.rins);
    const hi = c.outstandingRins - buy.rins;
    const lo = hi; // exact-quantity settlement only
    if (hi <= 0) continue;
    const push = (members: PendingBuy[]) => {
      const total = members.reduce((s, b) => s + b.rins, 0);
      found.push({ key: `${c.contractId}|${members.map((m) => m.id).sort().join(",")}`, contractId: c.contractId, dealNumber: c.dealNumber, partner: c.counterparty, outstandingRins: c.outstandingRins, buys: members, total });
    };
    // Pair: best single buy <= hi.
    const p = largestAtMost(pool, hi, 0);
    if (p >= 0 && pool[p]!.rins >= lo) push([buy, pool[p]!]);
    // Triples: for each a, best partner after it.
    for (let i = 0; i < pool.length; i++) {
      const a = pool[i]!;
      if (a.rins >= hi) break;
      const j = largestAtMost(pool, hi - a.rins, i + 1);
      if (j >= 0 && a.rins + pool[j]!.rins >= lo) push([buy, a, pool[j]!]);
    }
  }
  const seen = new Set<string>();
  return found
    .filter((g) => (seen.has(g.key) ? false : (seen.add(g.key), true)))
    .sort((x, y) => (x.outstandingRins - x.total) / x.outstandingRins - (y.outstandingRins - y.total) / y.outstandingRins || x.buys.length - y.buys.length)
    .slice(0, MAX_SUGGESTIONS);
}
