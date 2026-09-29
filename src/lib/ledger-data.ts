import type { AssignmentType, RinCode } from "./contracts-data";

/**
 * Business event that created a ledger row.
 * Mirrors the Ledger Item Types enum in the backing store.
 */
export type LedgerItemType =
  | "starting_balance"
  | "reconciled_buy"
  | "unreconciled_buy"
  | "contract_cancellation"
  | "contract_termination"
  | "automated_correction";

export type QapServiceType = "q_rin" | "unverified";

export type LedgerItem = {
  ledgerItemId: string;
  /** ISO date (YYYY-MM-DD) of the event. */
  timestamp: string;
  clientId: string;
  /** Internal buy contract id. null = unassigned buy. */
  buyContractId: string | null;
  /** The client's external system id for the contract. */
  sourceSystemContractId: string | null;
  ledgerItemType: LedgerItemType;
  /** Signed RIN quantity (+ increases the balance, - decreases it). */
  quantity: number;
  transactionId: string | null;
  /** Only Automated Corrections are system-generated. Every other entry is
   * initiated by a user; only the user's name is displayed. */
  createdBy: string;
  fuelCode: RinCode | null;
  fuelYear: number | null;
  assignmentType: AssignmentType | null;
  qapServiceType: QapServiceType | null;
  notes: string | null;
};

export const ledgerItemTypeMeta: Record<
  LedgerItemType,
  { label: string; chip: string; dot: string }
> = {
  starting_balance: { label: "Starting Balance", chip: "bg-table-head text-ink", dot: "bg-ink" },
  reconciled_buy: { label: "Reconciled Buy", chip: "bg-moss-soft text-moss", dot: "bg-moss" },
  unreconciled_buy: { label: "Unreconciled Buy", chip: "bg-ice-soft text-ice", dot: "bg-ice" },
  contract_cancellation: { label: "Contract Cancellation", chip: "bg-amber-soft text-amber", dot: "bg-amber" },
  contract_termination: { label: "Contract Termination", chip: "bg-rose-soft text-rose", dot: "bg-rose" },
  automated_correction: { label: "Automated Correction", chip: "bg-selected text-primary", dot: "bg-primary" },
};

export const qapServiceTypeLabel: Record<QapServiceType, string> = {
  q_rin: "Q-RIN",
  unverified: "Unverified",
};

export const CLIENT_ID = "CL-1042";
export const EPA_ID = "48217";
export const CLIENT_NAME = "Evergreen Fuels Group";


/** Sample ledger rows, oldest first.
 *
 * Fuel fields (fuelCode, fuelYear, assignmentType, qapServiceType) are only
 * populated for reconciled buys, unreconciled buys, and automated corrections
 * — and when present, all four are set together. Starting balances,
 * cancellations, and terminations carry no fuel info.
 *
 * Unreconciled buys have both buyContractId and sourceSystemContractId null.
 *
 * Notes are system-generated; this prototype has no notes set.
 */
export const ledgerItems: LedgerItem[] = [
  {
    ledgerItemId: "LI-100001",
    timestamp: "2025-10-01",
    clientId: CLIENT_ID,
    buyContractId: "CT-4821",
    sourceSystemContractId: "EXT-88120",
    ledgerItemType: "starting_balance",
    createdBy: "M. Alvarez",
    quantity: 51000,
    transactionId: null,
    fuelCode: null,
    fuelYear: null,
    assignmentType: null,
    qapServiceType: null,
    notes: null,
  },
  {
    ledgerItemId: "LI-100002",
    timestamp: "2025-10-03",
    clientId: CLIENT_ID,
    buyContractId: "CT-4821",
    sourceSystemContractId: "EXT-88120",
    ledgerItemType: "reconciled_buy",
    createdBy: "D. Okafor",
    quantity: -4800,
    transactionId: "23890318",
    fuelCode: "D4",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100003",
    timestamp: "2025-10-14",
    clientId: CLIENT_ID,
    buyContractId: "CT-4821",
    sourceSystemContractId: "EXT-88120",
    ledgerItemType: "reconciled_buy",
    createdBy: "M. Alvarez",
    quantity: -3200,
    transactionId: "23890362",
    fuelCode: "D5",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100004",
    timestamp: "2025-10-22",
    clientId: CLIENT_ID,
    buyContractId: null,
    sourceSystemContractId: null,
    ledgerItemType: "unreconciled_buy",
    createdBy: "D. Okafor",
    quantity: 1800,
    transactionId: "23890390",
    fuelCode: "D6",
    fuelYear: 2025,
    assignmentType: "separated",
    qapServiceType: "unverified",
    notes: null,
  },
  {
    ledgerItemId: "LI-100005",
    timestamp: "2025-10-28",
    clientId: CLIENT_ID,
    buyContractId: "CT-4821",
    sourceSystemContractId: "EXT-88120",
    ledgerItemType: "reconciled_buy",
    createdBy: "M. Alvarez",
    quantity: -2900,
    transactionId: "23890407",
    fuelCode: "D6",
    fuelYear: 2025,
    assignmentType: "separated",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100006",
    timestamp: "2025-11-01",
    clientId: CLIENT_ID,
    buyContractId: "CT-4807",
    sourceSystemContractId: "EXT-88044",
    ledgerItemType: "starting_balance",
    createdBy: "D. Okafor",
    quantity: 37850,
    transactionId: null,
    fuelCode: null,
    fuelYear: null,
    assignmentType: null,
    qapServiceType: null,
    notes: null,
  },
  {
    ledgerItemId: "LI-100007",
    timestamp: "2025-11-06",
    clientId: CLIENT_ID,
    buyContractId: "CT-4821",
    sourceSystemContractId: "EXT-88120",
    ledgerItemType: "reconciled_buy",
    createdBy: "M. Alvarez",
    quantity: -4200,
    transactionId: "23890451",
    fuelCode: "D6",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "unverified",
    notes: null,
  },
  {
    ledgerItemId: "LI-100008",
    timestamp: "2025-11-22",
    clientId: CLIENT_ID,
    buyContractId: "CT-4821",
    sourceSystemContractId: "EXT-88120",
    ledgerItemType: "reconciled_buy",
    createdBy: "D. Okafor",
    quantity: -2700,
    transactionId: "23890548",
    fuelCode: "D4",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100009",
    timestamp: "2025-12-01",
    clientId: CLIENT_ID,
    buyContractId: "CT-4776",
    sourceSystemContractId: "EXT-87901",
    ledgerItemType: "starting_balance",
    createdBy: "M. Alvarez",
    quantity: 39000,
    transactionId: null,
    fuelCode: null,
    fuelYear: null,
    assignmentType: null,
    qapServiceType: null,
    notes: null,
  },
  {
    ledgerItemId: "LI-100010",
    timestamp: "2025-12-02",
    clientId: CLIENT_ID,
    buyContractId: "CT-4776",
    sourceSystemContractId: "EXT-87901",
    ledgerItemType: "reconciled_buy",
    createdBy: "D. Okafor",
    quantity: -6100,
    transactionId: "23890410",
    fuelCode: "D5",
    fuelYear: 2026,
    assignmentType: "assigned",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100011",
    timestamp: "2025-12-09",
    clientId: CLIENT_ID,
    buyContractId: "CT-4821",
    sourceSystemContractId: "EXT-88120",
    ledgerItemType: "reconciled_buy",
    createdBy: "M. Alvarez",
    quantity: -1000,
    transactionId: "23890658",
    fuelCode: "D5",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100012",
    timestamp: "2025-12-18",
    clientId: CLIENT_ID,
    buyContractId: "CT-4821",
    sourceSystemContractId: "EXT-88120",
    ledgerItemType: "reconciled_buy",
    createdBy: "D. Okafor",
    quantity: -6200,
    transactionId: "23890701",
    fuelCode: "D4",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "unverified",
    notes: null,
  },
  {
    ledgerItemId: "LI-100013",
    timestamp: "2025-12-29",
    clientId: CLIENT_ID,
    buyContractId: null,
    sourceSystemContractId: null,
    ledgerItemType: "unreconciled_buy",
    createdBy: "M. Alvarez",
    quantity: 3400,
    transactionId: "23890655",
    fuelCode: "D6",
    fuelYear: 2026,
    assignmentType: "separated",
    qapServiceType: "unverified",
    notes: "Loose RIN buy — not yet matched to a buy contract.",
  },
  {
    ledgerItemId: "LI-100014",
    timestamp: "2026-01-04",
    clientId: CLIENT_ID,
    buyContractId: "CT-4807",
    sourceSystemContractId: "EXT-88044",
    ledgerItemType: "reconciled_buy",
    createdBy: "D. Okafor",
    quantity: -9800,
    transactionId: "23891002",
    fuelCode: "D7",
    fuelYear: 2026,
    assignmentType: "separated",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100015",
    timestamp: "2026-01-12",
    clientId: CLIENT_ID,
    buyContractId: "CT-4744",
    sourceSystemContractId: "EXT-87755",
    ledgerItemType: "starting_balance",
    createdBy: "M. Alvarez",
    quantity: 11200,
    transactionId: null,
    fuelCode: null,
    fuelYear: null,
    assignmentType: null,
    qapServiceType: null,
    notes: null,
  },
  {
    ledgerItemId: "LI-100016",
    timestamp: "2026-01-18",
    clientId: CLIENT_ID,
    buyContractId: "CT-4776",
    sourceSystemContractId: "EXT-87901",
    ledgerItemType: "reconciled_buy",
    createdBy: "D. Okafor",
    quantity: -6100,
    transactionId: "23890798",
    fuelCode: "D4",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100017",
    timestamp: "2026-01-23",
    clientId: CLIENT_ID,
    buyContractId: "CT-4762",
    sourceSystemContractId: "EXT-88201",
    ledgerItemType: "contract_cancellation",
    createdBy: "M. Alvarez",
    quantity: -8400,
    transactionId: null,
    fuelCode: null,
    fuelYear: null,
    assignmentType: null,
    qapServiceType: null,
    notes: "Contract created in error — balance zeroed out.",
  },
  {
    ledgerItemId: "LI-100018",
    timestamp: "2026-01-27",
    clientId: CLIENT_ID,
    buyContractId: "CT-4744",
    sourceSystemContractId: "EXT-87755",
    ledgerItemType: "reconciled_buy",
    createdBy: "D. Okafor",
    quantity: -5600,
    transactionId: "23891095",
    fuelCode: "D6",
    fuelYear: 2026,
    assignmentType: "separated",
    qapServiceType: "unverified",
    notes: null,
  },
  {
    ledgerItemId: "LI-100019",
    timestamp: "2026-02-02",
    clientId: CLIENT_ID,
    buyContractId: "CT-4799",
    sourceSystemContractId: "EXT-88155",
    ledgerItemType: "reconciled_buy",
    createdBy: "M. Alvarez",
    quantity: -11800,
    transactionId: "23891121",
    fuelCode: "D5",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100020",
    timestamp: "2026-02-06",
    clientId: CLIENT_ID,
    buyContractId: "CT-4788",
    sourceSystemContractId: "EXT-88099",
    ledgerItemType: "reconciled_buy",
    createdBy: "D. Okafor",
    quantity: -8600,
    transactionId: "23891130",
    fuelCode: "D7",
    fuelYear: 2026,
    assignmentType: "separated",
    qapServiceType: "unverified",
    notes: null,
  },
  {
    ledgerItemId: "LI-100021",
    timestamp: "2026-02-11",
    clientId: CLIENT_ID,
    buyContractId: "CT-4807",
    sourceSystemContractId: "EXT-88044",
    ledgerItemType: "reconciled_buy",
    createdBy: "M. Alvarez",
    quantity: -4400,
    transactionId: "23891140",
    fuelCode: "D4",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "q_rin",
    notes: null,
  },
  {
    ledgerItemId: "LI-100024",
    timestamp: "2026-02-13",
    clientId: CLIENT_ID,
    buyContractId: "CT-4807",
    sourceSystemContractId: "EXT-88044",
    ledgerItemType: "automated_correction",
    quantity: 4400,
    transactionId: null,
    fuelCode: "D4",
    fuelYear: 2025,
    assignmentType: "assigned",
    qapServiceType: "q_rin",
    createdBy: "System · Auto-correction",
    notes: "Restores quantity from rejected 91140 buy (EMTS rejected).",
  },
  {
    ledgerItemId: "LI-100022",
    timestamp: "2026-02-14",
    clientId: CLIENT_ID,
    buyContractId: null,
    sourceSystemContractId: null,
    ledgerItemType: "unreconciled_buy",
    createdBy: "M. Alvarez",
    quantity: 2250,
    transactionId: "23891175",
    fuelCode: "D3",
    fuelYear: 2026,
    assignmentType: "assigned",
    qapServiceType: "unverified",
    notes: null,
  },
  {
    ledgerItemId: "LI-100023",
    timestamp: "2026-02-19",
    clientId: CLIENT_ID,
    buyContractId: "CT-4776",
    sourceSystemContractId: "EXT-87901",
    ledgerItemType: "contract_termination",
    quantity: -26800,
    transactionId: null,
    fuelCode: null,
    fuelYear: null,
    assignmentType: null,
    qapServiceType: null,
    createdBy: "D. Okafor",
    notes: "Contract written off — counterparty breach.",
  },
];

export const ledgerDateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatLedgerDate(timestamp: string) {
  return ledgerDateFmt.format(new Date(`${timestamp}T00:00:00Z`));
}
