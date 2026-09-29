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
  candidateContracts?: CandidateContract[];
  partner: string;
  received: string;
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
};

/** Pending imports are separate prototype records; none are posted to contracts or the ledger. */
export const pendingBuys: PendingBuy[] = [
  { id: "PB-80214", contractId: "CT-4902", dealNumber: "EVERG26TP0018", contractOutstandingRins: 15600, partner: "Evergreen Refinery", received: "Sep 29, 2026", dueDate: "Oct 12, 2026", invoice: "INV-70421", expectedRins: 7800, rins: 7800, fuel: "D6", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558012", bol: "BOL-871204", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80215", contractId: "CT-4904", dealNumber: "EVERG26TP0020", contractOutstandingRins: 25000, partner: "Harbor Line Energy", received: "Sep 29, 2026", dueDate: "Oct 16, 2026", invoice: "INV-70425", expectedRins: 12500, rins: 12500, fuel: "D4", year: 2026, assignment: "separated", qap: "Q-RIN", ptd: "PTD 1558015", bol: "BOL-871218", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80216", contractId: "CT-4910", dealNumber: "EVERG26TP0024", contractOutstandingRins: 5200, partner: "Vantage Fuel Trading", received: "Sep 28, 2026", dueDate: "Oct 19, 2026", invoice: "INV-70431", expectedRins: 5200, rins: 4700, fuel: "D5", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558021", bol: "BOL-871232", match: "needs-review", reason: "Incoming buy is 500 RINs below the imported contract quantity." },
  { id: "PB-80217", contractId: "CT-4911", dealNumber: "EVERG26TP0025", contractOutstandingRins: 18000, partner: "Northstar Biofuels", received: "Sep 28, 2026", dueDate: "Oct 21, 2026", invoice: "INV-70435", expectedRins: 9000, rins: 9000, fuel: "D3", year: 2025, assignment: "separated", qap: "Q-RIN", ptd: "PTD 1558026", bol: "BOL-871239", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80218", contractId: null, dealNumber: null, partner: "Summit Renewable Supply", received: "Sep 27, 2026", dueDate: null, invoice: "INV-70442", expectedRins: null, rins: 3600, fuel: "D6", year: 2026, assignment: "separated", qap: "Unverified", ptd: "PTD 1558033", bol: "BOL-871251", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80219", contractId: "CT-4913", dealNumber: "EVERG26TP0027", contractOutstandingRins: 22400, partner: "Meridian Fuels", received: "Sep 27, 2026", dueDate: "Oct 24, 2026", invoice: "INV-70448", expectedRins: 15000, rins: 15000, fuel: "D4", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558040", bol: "BOL-871266", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80220", contractId: "CT-4915", dealNumber: "EVERG26TP0029", contractOutstandingRins: 9300, partner: "Cedar Peak Energy", received: "Sep 26, 2026", dueDate: "Oct 28, 2026", invoice: "INV-70453", expectedRins: 6200, rins: 6200, fuel: "D7", year: 2026, assignment: "assigned", qap: "Unverified", ptd: "PTD 1558047", bol: "BOL-871278", match: "matched", reason: "Contract, trading partner, and RIN quantity align." },
  { id: "PB-80221", contractId: null, dealNumber: null, partner: "Bluewater Trading", received: "Sep 26, 2026", dueDate: null, invoice: "INV-70459", expectedRins: null, rins: 2850, fuel: "D6", year: 2025, assignment: "separated", qap: "Unverified", ptd: "PTD 1558052", bol: "BOL-871285", match: "unmatched", reason: "No imported buy contract matches this incoming buy." },
  { id: "PB-80222", contractId: null, dealNumber: null, partner: "Evergreen Refinery", received: "Sep 29, 2026", dueDate: null, invoice: "INV-70466", expectedRins: null, rins: 6400, fuel: "D6", year: 2026, assignment: "assigned", qap: "Q-RIN", ptd: "PTD 1558058", bol: "BOL-871292", match: "needs-review", reason: "This buy's PTD number appears on 2 imported buy contracts. Choose which contract the buy applies to.",
    candidateContracts: [
      { contractId: "CT-4917", dealNumber: "EVERG26TP0031", partner: "Evergreen Refinery", dueDate: "Nov 2, 2026", outstandingRins: 6400, matchedOn: "PTD 1558058" },
      { contractId: "CT-4918", dealNumber: "EVERG26TP0032", partner: "Evergreen Refinery", dueDate: "Nov 14, 2026", outstandingRins: 9800, matchedOn: "PTD 1558058" },
    ] },
];
