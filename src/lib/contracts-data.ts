export type DueStatus = "overdue" | "soon" | "ontime" | "settled";

/**
 * Lifecycle status of a contract, independent of its due timing.
 *  - open       : still being drawn against
 *  - settled    : outstanding balance naturally reached 0
 *  - terminated : closed out by the user — either created by mistake,
 *                  or the remaining balance was written down because no
 *                  further transactions are expected
 */
export type ContractStatus = "open" | "settled" | "terminated";
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
  reference: string;
  description: string;
  rinCode: RinCode;
  vintageYear: number;
  assignmentType: AssignmentType;
  txStatus: BuyTransactionStatus;
  rinApplied: number;
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
  transactions: BuyTransaction[];
};

export const contracts: Contract[] = [
  {
    contractId: "CT-4821",
    dealNumber: "D-2204",
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
        reference: "TX-90318",
        description: "22,600 gal renewable diesel receipt",
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
        reference: "TX-90362",
        description: "15,200 gal biodiesel receipt",
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
        reference: "TX-90407",
        description: "RIN separation credit",
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
        reference: "TX-90451",
        description: "19,800 gal ethanol receipt",
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
        reference: "TX-90503",
        description: "9,400 gal cellulosic diesel receipt",
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
        reference: "TX-90548",
        description: "12,700 gal renewable diesel receipt",
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
        reference: "TX-90610",
        description: "RIN separation credit",
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
        reference: "TX-90658",
        description: "4,800 gal biodiesel receipt",
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
        reference: "TX-90701",
        description: "30,400 gal ULSD receipt",
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
        reference: "TX-90770",
        description: "RIN separation credit",
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
        reference: "TX-90812",
        description: "13,500 gal biodiesel receipt",
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
        reference: "TX-90841",
        description: "18,200 gal biodiesel receipt",
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
    dealNumber: "D-2188",
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
        reference: "TX-91002",
        description: "42,000 gal ethanol receipt",
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
        reference: "TX-91088",
        description: "RIN separation credit",
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
        reference: "TX-91140",
        description: "14,800 gal ethanol receipt",
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
    dealNumber: "D-2170",
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
        reference: "TX-90655",
        description: "51,200 gal ethanol receipt",
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
        reference: "TX-91121",
        description: "RIN separation credit",
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
    dealNumber: "D-2151",
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
        reference: "TX-90910",
        description: "62,000 gal ULSD receipt",
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
        reference: "TX-91130",
        description: "RIN separation credit",
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
    dealNumber: "D-2139",
    counterparty: "Cascade Renewables",
    dueDate: "Feb 04",
    dueNote: "written down",
    status: "settled",
    contractStatus: "terminated",
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
        reference: "TX-90410",
        description: "22,400 gal cellulosic receipt",
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
        reference: "TX-90798",
        description: "RIN separation credit",
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
        reference: "TX-91200",
        description: "Remaining balance write-down at termination",
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
    dealNumber: "D-2124",
    counterparty: "Highpoint Aviation Fuels",
    dueDate: "Apr 03",
    dueNote: "49d",
    status: "ontime",
    contractStatus: "open",
    ptd: ["PTD 6010", "PTD 6011", "PTD 6012"],
    billOfLading: ["BOL 71160", "BOL 71162"],
    invoices: ["INV 2310", "INV 2311", "INV 2315", "INV 2319"],
    outstandingBalance: 402600,
    contractValue: 690000,
    outstandingRins: 31200,
    transactions: [
      {
        id: "t1",
        date: "Jan 15",
        reference: "TX-90980",
        description: "88,000 gal SAF blend receipt",
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
        reference: "TX-91136",
        description: "RIN separation credit",
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
    dealNumber: "D-2110",
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
        reference: "TX-91040",
        description: "48,000 gal HFO receipt",
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
        reference: "TX-91148",
        description: "RIN separation credit",
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
    dealNumber: "D-2098",
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
        reference: "TX-90520",
        description: "36,000 gal advanced receipt",
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
        reference: "TX-91095",
        description: "Final settlement",
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
    contractId: "CT-4730",
    dealNumber: "D-2076",
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
