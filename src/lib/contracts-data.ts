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

export type BuyTransaction = {
  id: string;
  date: string;
  reference: string;
  description: string;
  rinApplied: number;
  amountApplied: number;
  rinBalanceAfter: number;
  balanceAfter: number;
};

export type Contract = {
  contractId: string;
  dealNumber: string;
  product: string;
  counterparty: string;
  dueDate: string;
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
    product: "RIN D4 · Biodiesel",
    counterparty: "Evergreen Refinery",
    dueDate: "Feb 09",
    dueNote: "14d late",
    status: "overdue",
    ptd: ["PTD 0912", "PTD 1140", "PTD 1188", "PTD 1204"],
    billOfLading: ["BOL 71130", "BOL 71131", "BOL 71166"],
    invoices: ["INV 2290", "INV 2291"],
    outstandingBalance: 86400,
    contractValue: 214000,
    outstandingRins: 12400,
    transactions: [
      {
        id: "t1",
        date: "Dec 18",
        reference: "TX-90701",
        description: "30,400 gal ULSD receipt",
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
    product: "E85 · Ethanol",
    counterparty: "PetroCore Logistics",
    dueDate: "Feb 22",
    dueNote: "9d",
    status: "soon",
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
    product: "RIN D6 · Ethanol",
    counterparty: "Northline Terminals",
    dueDate: "Mar 02",
    dueNote: "17d",
    status: "soon",
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
    product: "Diesel #2 · ULSD",
    counterparty: "BlueHarbor Refining",
    dueDate: "Mar 14",
    dueNote: "29d",
    status: "ontime",
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
    product: "RIN D3 · Cellulosic",
    counterparty: "Cascade Renewables",
    dueDate: "Feb 04",
    dueNote: "19d late",
    status: "overdue",
    ptd: ["PTD 0208", "PTD 0219"],
    billOfLading: ["BOL 71090"],
    invoices: ["INV 2281", "INV 2284", "INV 2288"],
    outstandingBalance: 198100,
    contractValue: 265000,
    outstandingRins: 26800,
    transactions: [
      {
        id: "t1",
        date: "Dec 02",
        reference: "TX-90410",
        description: "22,400 gal cellulosic receipt",
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
        rinApplied: 6100,
        amountApplied: 22000,
        rinBalanceAfter: 26800,
        balanceAfter: 198100,
      },
    ],
  },
  {
    contractId: "CT-4762",
    dealNumber: "D-2124",
    product: "Jet A-1 · SAF blend",
    counterparty: "Highpoint Aviation Fuels",
    dueDate: "Apr 03",
    dueNote: "49d",
    status: "ontime",
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
    product: "Marine HFO",
    counterparty: "Gulfstar Bunkering",
    dueDate: "Apr 18",
    dueNote: "64d",
    status: "ontime",
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
    product: "RIN D5 · Advanced",
    counterparty: "Meridian Fuels",
    dueDate: "Jan 30",
    dueNote: "settled",
    status: "settled",
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
        rinApplied: 5600,
        amountApplied: 60000,
        rinBalanceAfter: 0,
        balanceAfter: 0,
      },
    ],
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
  openCount: contracts.filter((c) => c.status !== "settled").length,
};

export function getContract(id: string) {
  return contracts.find((c) => c.contractId === id);
}
