import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { contracts } from "./contracts-data";
import { pendingBuys, suggestSettlementGroups, type SettlementGroup } from "./reconciliation-data";

/** Runs on the server when a buy's review panel opens. */
export const getSettlementSuggestions = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ buyId: z.string() }).parse(data))
  .handler(async ({ data }): Promise<SettlementGroup[]> => {
    const buy = pendingBuys.find((b) => b.id === data.buyId);
    if (!buy) return [];
    const open = contracts
      .filter((c) => c.contractStatus === "open")
      .map((c) => ({ contractId: c.contractId, dealNumber: c.dealNumber, counterparty: c.counterparty, outstandingRins: c.outstandingRins }));
    return suggestSettlementGroups(buy, pendingBuys, open);
  });
