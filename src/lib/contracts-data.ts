export type DueStatus = "overdue" | "soon" | "ontime" | "settled";

/**
 * Lifecycle status of a contract, independent of its due timing.
 *  - open       : still being drawn against
 *  - settled    : outstanding balance naturally reached 0
 *  - terminated : closed out by the user — remaining balance written down
 *                  because no further transactions are expected
 *  - cancelled  : removed by the user — created in error, no transactions
 *                  were ever applied
 */
export type ContractStatus = "open" | "settled" | "terminated" | "cancelled";
export type RinCode = "D3" | "D4" | "D5" | "D6" | "D7";
export type AssignmentType = "assigned" | "separated";

/**
 * Status of an individual buy transaction. The full application has a
 * richer set, but for this prototype a transaction is either Completed
 * (it applied to the contract balance) or Failed (it did not settle).
 */
export type BuyTransactionStatus = "completed" | "failed";

export type BuyTransaction = {
  id: string;
  date: string;
  transactionId: string;
  ptdNumber: string;
  rinCode: RinCode;
  vintageYear: number;
  assignmentType: AssignmentType;
  /** QAP verification status for this buy. */
  qapServiceType: "q_rin" | "unverified";
  txStatus: BuyTransactionStatus;
  /** RINs applied to this contract (capped at the outstanding balance). */
  rinApplied: number;
  /** Over-fulfilling buys only: RINs beyond the outstanding balance, added to the Unassigned pool. */
  rinOverflow?: number;
  amountApplied: number;
  rinBalanceAfter: number;
  balanceAfter: number;
};

export type Contract = {
  contractId: string;
  dealNumber: string;
  counterparty: string;
  dueDate: string | null;
  dueNote: string;
  status: DueStatus;
  contractStatus: ContractStatus;
  terminationNote?: string;
  ptd: string[];
  billOfLading: string[];
  invoices: string[];
  outstandingBalance: number;
  contractValue: number;
  outstandingRins: number;
  /** Cancelled contracts only: RINs the contract was opened with before it was cancelled. */
  cancelledRins?: number;
  /** Terminated contracts only: remaining RINs written down at termination. */
  writtenDownRins?: number;
  transactions: BuyTransaction[];
};

export const contracts: Contract[] = [
  {
    contractId: "CT-4821",
    dealNumber: "EVERG26TP0002",
    counterparty: "Evergreen Refinery",
    dueDate: "Feb 09",
    dueNote: "14d late",
    status: "overdue",
    contractStatus: "open",
    ptd: ["PTD 0912", "PTD 1140", "PTD 1188", "PTD 1204"],
    billOfLading: ["BOL 71130", "BOL 71131", "BOL 71166"],
    invoices: ["INV 2290", "INV 2291"],
    outstandingBalance: 86400,
    contractValue: 214000,
    outstandingRins: 12400,
    transactions: [
      {
        id: "t-7",
        date: "Oct 03",
        transactionId: "23890318",
        ptdNumber: "PTD 0912",
        rinCode: "D4",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 4800,
        amountApplied: 0,
        rinBalanceAfter: 46200,
        balanceAfter: 0,
      },
      {
        id: "t-6",
        date: "Oct 14",
        transactionId: "23890362",
        ptdNumber: "PTD 1140",
        rinCode: "D5",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 3200,
        amountApplied: 0,
        rinBalanceAfter: 43000,
        balanceAfter: 0,
      },
      {
        id: "t-5",
        date: "Oct 28",
        transactionId: "23890407",
        ptdNumber: "PTD 1188",
        rinCode: "D6",
        vintageYear: 2025,
        assignmentType: "separated",
        txStatus: "completed",
        rinApplied: 2900,
        amountApplied: 0,
        rinBalanceAfter: 40100,
        balanceAfter: 0,
      },
      {
        id: "t-4",
        date: "Nov 06",
        transactionId: "23890451",
        ptdNumber: "PTD 1204",
        rinCode: "D6",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 4200,
        amountApplied: 0,
        rinBalanceAfter: 35900,
        balanceAfter: 0,
      },
      {
        id: "t-3",
        date: "Nov 15",
        transactionId: "23890503",
        ptdNumber: "PTD 0912",
        rinCode: "D3",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "failed",
        rinApplied: 0,
        amountApplied: 0,
        rinBalanceAfter: 35900,
        balanceAfter: 0,
      },
      {
        id: "t-2",
        date: "Nov 22",
        transactionId: "23890548",
        ptdNumber: "PTD 1140",
        rinCode: "D4",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 2700,
        amountApplied: 0,
        rinBalanceAfter: 33200,
        balanceAfter: 0,
      },
      {
        id: "t-1",
        date: "Dec 02",
        transactionId: "23890610",
        ptdNumber: "PTD 1188",
        rinCode: "D7",
        vintageYear: 2025,
        assignmentType: "separated",
        txStatus: "completed",
        rinApplied: 1200,
        amountApplied: 0,
        rinBalanceAfter: 32000,
        balanceAfter: 0,
      },
      {
        id: "t0",
        date: "Dec 09",
        transactionId: "23890658",
        ptdNumber: "PTD 1204",
        rinCode: "D5",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 1000,
        amountApplied: 0,
        rinBalanceAfter: 31000,
        balanceAfter: 0,
      },
      {
        id: "t1",
        date: "Dec 18",
        transactionId: "23890701",
        ptdNumber: "PTD 0912",
        rinCode: "D4",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 6200,
        amountApplied: 62350,
        rinBalanceAfter: 24800,
        balanceAfter: 151650,
      },
      {
        id: "t2",
        date: "Jan 12",
        transactionId: "23890770",
        ptdNumber: "PTD 1140",
        rinCode: "D6",
        vintageYear: 2026,
        assignmentType: "separated",
        txStatus: "failed",
        rinApplied: 5200,
        amountApplied: 24000,
        rinBalanceAfter: 19600,
        balanceAfter: 127650,
      },
      {
        id: "t3",
        date: "Jan 29",
        transactionId: "23890812",
        ptdNumber: "PTD 1188",
        rinCode: "D5",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 3100,
        amountApplied: 22150,
        rinBalanceAfter: 16500,
        balanceAfter: 105500,
      },
      {
        id: "t4",
        date: "Feb 14",
        transactionId: "23890841",
        ptdNumber: "PTD 1204",
        rinCode: "D3",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 4100,
        amountApplied: 19100,
        rinBalanceAfter: 12400,
        balanceAfter: 86400,
      },
    ],
  },
  {
    contractId: "CT-4807",
    dealNumber: "PETCO26TP0007",
    counterparty: "PetroCore Logistics",
    dueDate: "Feb 22",
    dueNote: "9d",
    status: "soon",
    contractStatus: "open",
    ptd: ["PTD 0733", "PTD 0891"],
    billOfLading: ["BOL 71201"],
    invoices: ["INV 2331", "INV 2332", "INV 2338"],
    outstandingBalance: 142900,
    contractValue: 320000,
    outstandingRins: 18250,
    transactions: [
      {
        id: "t1",
        date: "Jan 04",
        transactionId: "23891002",
        ptdNumber: "PTD 0733",
        rinCode: "D7",
        vintageYear: 2026,
        assignmentType: "separated",
        txStatus: "completed",
        rinApplied: 9800,
        amountApplied: 98600,
        rinBalanceAfter: 28050,
        balanceAfter: 221400,
      },
      {
        id: "t2",
        date: "Jan 26",
        transactionId: "23891088",
        ptdNumber: "PTD 0891",
        rinCode: "D5",
        vintageYear: 2026,
        assignmentType: "assigned",
        txStatus: "failed",
        rinApplied: 5400,
        amountApplied: 44500,
        rinBalanceAfter: 22650,
        balanceAfter: 176900,
      },
      {
        id: "t3",
        date: "Feb 11",
        transactionId: "23891140",
        ptdNumber: "PTD 0733",
        rinCode: "D4",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 4400,
        amountApplied: 34000,
        rinBalanceAfter: 18250,
        balanceAfter: 142900,
      },
    ],
  },
  {
    contractId: "CT-4799",
    dealNumber: "NORTH26TP0011",
    counterparty: "Northline Terminals",
    dueDate: "Mar 02",
    dueNote: "17d",
    status: "soon",
    contractStatus: "open",
    ptd: ["PTD 0450", "PTD 0455", "PTD 0461", "PTD 0470", "PTD 0488"],
    billOfLading: ["BOL 71220", "BOL 71244"],
    invoices: ["INV 2340"],
    outstandingBalance: 198400,
    contractValue: 410000,
    outstandingRins: 21600,
    transactions: [
      {
        id: "t1",
        date: "Dec 29",
        transactionId: "23890655",
        ptdNumber: "PTD 0450",
        rinCode: "D6",
        vintageYear: 2026,
        assignmentType: "separated",
        txStatus: "failed",
        rinApplied: 11200,
        amountApplied: 128600,
        rinBalanceAfter: 33400,
        balanceAfter: 281400,
      },
      {
        id: "t2",
        date: "Feb 02",
        transactionId: "23891121",
        ptdNumber: "PTD 0455",
        rinCode: "D5",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 11800,
        amountApplied: 83000,
        rinBalanceAfter: 21600,
        balanceAfter: 198400,
      },
    ],
  },
  {
    contractId: "CT-4788",
    dealNumber: "BLUEHBOR26TP0014",
    counterparty: "BlueHarbor Refining",
    dueDate: null,
    dueNote: "No due date",
    status: "ontime",
    contractStatus: "open",
    ptd: ["PTD 0311"],
    billOfLading: ["BOL 71188", "BOL 71190", "BOL 71195"],
    invoices: ["INV 2322", "INV 2326"],
    outstandingBalance: 271500,
    contractValue: 520000,
    outstandingRins: 9400,
    transactions: [
      {
        id: "t1",
        date: "Jan 08",
        transactionId: "23890910",
        ptdNumber: "PTD 0311",
        rinCode: "D3",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 8600,
        amountApplied: 166500,
        rinBalanceAfter: 18000,
        balanceAfter: 353500,
      },
      {
        id: "t2",
        date: "Feb 06",
        transactionId: "23891130",
        ptdNumber: "PTD 0311",
        rinCode: "D7",
        vintageYear: 2026,
        assignmentType: "separated",
        txStatus: "completed",
        rinApplied: 8600,
        amountApplied: 82000,
        rinBalanceAfter: 9400,
        balanceAfter: 271500,
      },
    ],
  },
  {
    contractId: "CT-4776",
    dealNumber: "CASCAD26TP0018",
    counterparty: "Cascade Renewables",
    dueDate: "Feb 04",
    dueNote: "written down",
    status: "settled",
    contractStatus: "terminated",
    writtenDownRins: 26800,
    terminationNote:
      "Counterparty ceased deliveries; remaining 26,800 RINs written down at close-out.",
    ptd: ["PTD 0208", "PTD 0219"],
    billOfLading: ["BOL 71090"],
    invoices: ["INV 2281", "INV 2284", "INV 2288"],
    outstandingBalance: 0,
    contractValue: 265000,
    outstandingRins: 0,
    transactions: [
      {
        id: "t1",
        date: "Dec 02",
        transactionId: "23890410",
        ptdNumber: "PTD 0208",
        rinCode: "D5",
        vintageYear: 2026,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 6100,
        amountApplied: 44900,
        rinBalanceAfter: 32900,
        balanceAfter: 220100,
      },
      {
        id: "t2",
        date: "Jan 18",
        transactionId: "23890798",
        ptdNumber: "PTD 0219",
        rinCode: "D4",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 6100,
        amountApplied: 22000,
        rinBalanceAfter: 26800,
        balanceAfter: 198100,
      },
      {
        id: "t3",
        date: "Feb 19",
        transactionId: "23891200",
        ptdNumber: "PTD 0208",
        rinCode: "D6",
        vintageYear: 2026,
        assignmentType: "separated",
        txStatus: "completed",
        rinApplied: 26800,
        amountApplied: 198100,
        rinBalanceAfter: 0,
        balanceAfter: 0,
      },
    ],
  },
  {
    contractId: "CT-4762",
    dealNumber: "HIGHPT26TP0022",
    counterparty: "Highpoint Aviation Fuels",
    dueDate: "Apr 03",
    dueNote: "49d",
    status: "ontime",
    contractStatus: "open",
    ptd: [
      "PTD 6010",
      "PTD 6011",
      "PTD 6012",
      "PTD 6014",
      "PTD 6018",
      "PTD 6021",
      "PTD 6027",
      "PTD 6033",
    ],
    billOfLading: ["BOL 71160", "BOL 71162"],
    invoices: [
      "INV 2310",
      "INV 2311",
      "INV 2315",
      "INV 2319",
      "INV 2320",
      "INV 2321",
      "INV 2324",
      "INV 2326",
      "INV 2327",
      "INV 2330",
      "INV 2333",
      "INV 2335",
      "INV 2337",
      "INV 2341",
      "INV 2344",
      "INV 2346",
    ],
    outstandingBalance: 402600,
    contractValue: 690000,
    outstandingRins: 31200,
    transactions: [
      {
        id: "t1",
        date: "Jan 15",
        transactionId: "23890980",
        ptdNumber: "PTD 6010",
        rinCode: "D5",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 14800,
        amountApplied: 201400,
        rinBalanceAfter: 46000,
        balanceAfter: 488600,
      },
      {
        id: "t2",
        date: "Feb 09",
        transactionId: "23891136",
        ptdNumber: "PTD 6011",
        rinCode: "D3",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 14800,
        amountApplied: 86000,
        rinBalanceAfter: 31200,
        balanceAfter: 402600,
      },
    ],
  },
  {
    contractId: "CT-4750",
    dealNumber: "GULFSTAR26TP0026",
    counterparty: "Gulfstar Bunkering",
    dueDate: "Apr 18",
    dueNote: "64d",
    status: "ontime",
    contractStatus: "open",
    ptd: ["PTD 6201", "PTD 6208", "PTD 6214"],
    billOfLading: ["BOL 71255", "BOL 71259"],
    invoices: ["INV 2355", "INV 2358", "INV 2360"],
    outstandingBalance: 318900,
    contractValue: 540000,
    outstandingRins: 7350,
    transactions: [
      {
        id: "t1",
        date: "Jan 22",
        transactionId: "23891040",
        ptdNumber: "PTD 6201",
        rinCode: "D7",
        vintageYear: 2026,
        assignmentType: "separated",
        txStatus: "failed",
        rinApplied: 4200,
        amountApplied: 148000,
        rinBalanceAfter: 11550,
        balanceAfter: 392000,
      },
      {
        id: "t2",
        date: "Feb 12",
        transactionId: "23891148",
        ptdNumber: "PTD 6208",
        rinCode: "D5",
        vintageYear: 2026,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 4200,
        amountApplied: 73100,
        rinBalanceAfter: 7350,
        balanceAfter: 318900,
      },
    ],
  },
  {
    contractId: "CT-4744",
    dealNumber: "MERIDN26TP0031",
    counterparty: "Meridian Fuels",
    dueDate: "Jan 30",
    dueNote: "settled",
    status: "settled",
    contractStatus: "settled",
    ptd: ["PTD 5810"],
    billOfLading: ["BOL 71290"],
    invoices: ["INV 2361"],
    outstandingBalance: 0,
    contractValue: 180000,
    outstandingRins: 0,
    transactions: [
      {
        id: "t1",
        date: "Dec 11",
        transactionId: "23890520",
        ptdNumber: "PTD 5810",
        rinCode: "D4",
        vintageYear: 2025,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 5600,
        amountApplied: 120000,
        rinBalanceAfter: 5600,
        balanceAfter: 60000,
      },
      {
        id: "t2",
        date: "Jan 27",
        transactionId: "23891095",
        ptdNumber: "PTD 5810",
        rinCode: "D6",
        vintageYear: 2026,
        assignmentType: "separated",
        txStatus: "completed",
        rinApplied: 5600,
        amountApplied: 60000,
        rinBalanceAfter: 0,
        balanceAfter: 0,
      },
    ],
  },
  {
    contractId: "CT-4736",
    dealNumber: "HARBRL26TP0017",
    counterparty: "Harbor Line Energy",
    dueDate: "Feb 26",
    dueNote: "settled",
    status: "settled",
    contractStatus: "settled",
    ptd: ["PTD 5920", "PTD 5944"],
    billOfLading: ["BOL 71301"],
    invoices: ["INV 2365"],
    outstandingBalance: 0,
    contractValue: 150000,
    outstandingRins: 0,
    transactions: [
      {
        id: "t1",
        date: "Jan 14",
        transactionId: "23890967",
        ptdNumber: "PTD 5920",
        rinCode: "D5",
        vintageYear: 2026,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 4500,
        amountApplied: 90000,
        rinBalanceAfter: 3000,
        balanceAfter: 60000,
      },
      {
        id: "t2",
        date: "Feb 11",
        transactionId: "23891162",
        ptdNumber: "PTD 5944",
        rinCode: "D5",
        vintageYear: 2026,
        assignmentType: "assigned",
        txStatus: "completed",
        rinApplied: 3000,
        rinOverflow: 1200,
        amountApplied: 60000,
        rinBalanceAfter: 0,
        balanceAfter: 0,
      },
    ],
  },
  {
    contractId: "CT-4730",
    dealNumber: "NGATE26TP0035",
    counterparty: "Northgate Biofuels",
    dueDate: "May 09",
    dueNote: "85d",
    status: "ontime",
    contractStatus: "open",
    ptd: ["PTD 6301"],
    billOfLading: ["BOL 71310"],
    invoices: ["INV 2370"],
    outstandingBalance: 96000,
    contractValue: 96000,
    outstandingRins: 4800,
    transactions: [],
  },
  {
    contractId: "CT-4718",
    dealNumber: "VANTA26TP0039",
    counterparty: "Vantage Fuel Trading",
    dueDate: "Mar 27",
    dueNote: "52d",
    status: "ontime",
    contractStatus: "cancelled",
    cancelledRins: 6000,
    terminationNote:
      "Contract created in error; canceled before any buy transactions were applied.",
    ptd: ["PTD 6410"],
    billOfLading: ["BOL 71402"],
    invoices: ["INV 2381"],
    outstandingBalance: 0,
    contractValue: 120000,
    outstandingRins: 0,
    transactions: [],
  },
];

export const numberFmt = new Intl.NumberFormat("en-US");

export const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const summary = {
  totalRins: contracts.reduce((s, c) => s + c.outstandingRins, 0),
  overdueRins: contracts
    .filter((c) => c.status === "overdue")
    .reduce((s, c) => s + c.outstandingRins, 0),
  overdueCount: contracts.filter((c) => c.status === "overdue").length,
  dueSoonRins: contracts
    .filter((c) => c.status === "soon")
    .reduce((s, c) => s + c.outstandingRins, 0),
  dueSoonCount: contracts.filter((c) => c.status === "soon").length,
  appliedRins: contracts.reduce(
    (s, c) => s + c.transactions.reduce((t, x) => t + x.rinApplied, 0),
    0,
  ),
  appliedTxns: contracts.reduce((s, c) => s + c.transactions.length, 0),
  openCount: contracts.filter((c) => c.contractStatus === "open").length,
  settledCount: contracts.filter((c) => c.contractStatus === "settled").length,
  terminatedCount: contracts.filter((c) => c.contractStatus === "terminated").length,
};

/**
 * Display config for each contract lifecycle status: dot color, chip
 * classes, and a human label. Used by both the list rows and the detail view.
 */
export const contractStatusMeta: Record<
  ContractStatus,
  { label: string; dot: string; chip: string }
> = {
  open: {
    label: "Open",
    dot: "bg-ice",
    chip: "bg-ice-soft text-ice",
  },
  settled: {
    label: "Settled",
    dot: "bg-moss",
    chip: "bg-moss-soft text-moss",
  },
  terminated: {
    label: "Terminated",
    dot: "bg-rose",
    chip: "bg-rose-soft text-rose",
  },
  cancelled: {
    label: "Canceled",
    dot: "bg-subtle",
    chip: "bg-table-head text-subtle",
  },
};

/**
 * Display config for each buy transaction status: dot color, chip classes,
 * and a human label. Used by both the side preview and the full history table.
 */
export const buyTxStatusMeta: Record<
  BuyTransactionStatus,
  { label: string; dot: string; chip: string }
> = {
  completed: {
    label: "Completed",
    dot: "bg-moss",
    chip: "bg-moss-soft text-moss",
  },
  failed: {
    label: "Failed",
    dot: "bg-rose",
    chip: "bg-rose-soft text-rose",
  },
};

export function getContract(id: string) {
  return contracts.find((c) => c.contractId === id);
}
