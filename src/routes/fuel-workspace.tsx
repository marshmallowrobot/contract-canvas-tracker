import { createFileRoute } from "@tanstack/react-router";

import ReconciliationWorkspace from "@/fuel_energy_contract_reconciliation_workspace";

export const Route = createFileRoute("/fuel-workspace")({
  head: () => ({ meta: [
    { title: "EnergyTrade Match Studio — Preview" },
    { name: "description", content: "Preview of the standalone fuel/energy reconciliation workspace component." },
  ] }),
  component: ReconciliationWorkspace,
});
