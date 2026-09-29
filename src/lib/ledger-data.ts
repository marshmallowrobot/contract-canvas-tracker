import { contracts, type AssignmentType, type RinCode } from "./contracts-data";

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


/**
 * Ledger rows are derived from the contract sample data so every contract and
 * buy transaction is represented consistently:
 *  - every contract opens with a Starting Balance
 *  - every buy transaction (completed or failed) posts a Reconciled Buy, since
 *    entries are created optimistically before EMTS processes the buy
 *  - every failed transaction also gets a system Automated Correction that
 *    restores the quantity
 *  - cancelled contracts get a Contract Cancellation offsetting the Starting Balance
 *  - terminated contracts get a Contract Termination offsetting the remaining balance
 *  - settled contracts need no extra entry (their balance is already 0)
 * Unreconciled Buys have no contract and are listed separately below.
 */
const USERS = ["M. Alvarez", "D. Okafor"];

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/** Prototype dates omit the year: Aug–Dec = 2025, Jan–Jul = 2026. */
function toIso(date: string): string {
  const [mon = "", day = "01"] = date.split(" ");
  const m = MONTHS[mon] ?? "01";
  const year = Number(m) >= 8 ? 2025 : 2026;
  return `${year}-${m}-${day.padStart(2, "0")}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Opening date for contracts with no transactions. */
const OPENED_WITHOUT_TX: Record<string, string> = {
  "CT-4730": "2026-02-02",
  "CT-4718": "2026-01-20",
};

type Draft = Omit<LedgerItem, "ledgerItemId" | "clientId">;

const noFuel = { fuelCode: null, fuelYear: null, assignmentType: null, qapServiceType: null } as const;

function contractEntries(): Draft[] {
  const out: Draft[] = [];
  contracts.forEach((c, ci) => {
    const user = (n: number) => USERS[(ci + n) % USERS.length]!;
    const base = { buyContractId: c.contractId, sourceSystemContractId: c.dealNumber, notes: null };
    const txs = [...c.transactions]
      .map((t) => ({ ...t, iso: toIso(t.date) }))
      .sort((a, b) => a.iso.localeCompare(b.iso));
    const completed = txs.filter((t) => t.txStatus === "completed").reduce((s, t) => s + t.rinApplied, 0);
    const starting =
      c.contractStatus === "cancelled"
        ? c.cancelledRins ?? 0
        : c.outstandingRins + completed + (c.writtenDownRins ?? 0);
    const opened = txs.length ? addDays(txs[0]!.iso, -3) : OPENED_WITHOUT_TX[c.contractId] ?? "2026-01-01";

    out.push({ ...base, ...noFuel, timestamp: opened, ledgerItemType: "starting_balance", quantity: starting, transactionId: null, createdBy: user(0) });

    txs.forEach((t, ti) => {
      const fuel = {
        fuelCode: t.rinCode,
        fuelYear: t.vintageYear,
        assignmentType: t.assignmentType,
        qapServiceType: (ti % 3 === 2 ? "unverified" : "q_rin") as QapServiceType,
      };
      out.push({ ...base, ...fuel, timestamp: t.iso, ledgerItemType: "reconciled_buy", quantity: -t.rinApplied, transactionId: t.transactionId, createdBy: user(ti + 1) });
      if (t.txStatus === "failed") {
        out.push({ ...base, ...fuel, timestamp: addDays(t.iso, 2), ledgerItemType: "automated_correction", quantity: t.rinApplied, transactionId: t.transactionId, createdBy: "System" });
      }
    });

    const last = txs.length ? txs[txs.length - 1]!.iso : opened;
    if (c.contractStatus === "cancelled") {
      out.push({ ...base, ...noFuel, timestamp: addDays(last, 5), ledgerItemType: "contract_cancellation", quantity: -starting, transactionId: null, createdBy: user(1) });
    }
    if (c.contractStatus === "terminated" && c.writtenDownRins) {
      out.push({ ...base, ...noFuel, timestamp: addDays(last, 7), ledgerItemType: "contract_termination", quantity: -c.writtenDownRins, transactionId: null, createdBy: user(1) });
    }
  });
  return out;
}

/** Loose RIN buys not tied to any contract (added to the Unassigned pool). */
const unreconciledBuys: Draft[] = [
  {
    timestamp: "2025-10-22",
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
    timestamp: "2025-12-29",
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
    notes: null,
  },
  {
    timestamp: "2026-02-14",
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
];

/** All ledger rows, oldest first, with sequential ledger item IDs. */
export const ledgerItems: LedgerItem[] = [...contractEntries(), ...unreconciledBuys]
  .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  .map((d, i) => ({ ...d, ledgerItemId: `LI-${100001 + i}`, clientId: CLIENT_ID }));

/** Formats an ISO date (YYYY-MM-DD) as e.g. "Dec 02, 2025". */
export function formatLedgerDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric", timeZone: "UTC",
  });
}
