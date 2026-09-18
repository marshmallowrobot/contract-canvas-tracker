# Contract list and transaction metadata update

## Build
- Remove contract-level RIN, assignment, and fuel details from the contract list.
- Add RIN code, vintage year, and assignment type to every buy transaction, including the side preview and full history table.
- Add compact filters for lifecycle status, counterparty, and contract ID.
- Make Contract, Counterparty, and Due Date headers sortable, with clear ascending and descending indicators.
- Preserve the selected contract when possible; automatically select the first visible contract when filters hide the current selection.
- Show an empty state when no contracts match.

## Technical details
- Extend the sample transaction model with `rinCode`, `vintageYear`, and `assignmentType`; contract-level fields will no longer drive list presentation.
- Keep filtering and sorting as local prototype state, with null due dates consistently sorted after dated contracts.
- Reuse the existing RIN color and assignment treatments only inside transaction views.
- Verify filtering, all sortable headers, selection behavior, and both transaction views in the browser.
