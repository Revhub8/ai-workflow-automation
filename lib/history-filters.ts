import type { SavedRecord } from "@/types/extraction";

export type HistoryFilters = {
  search: string;
  shift: "" | "A" | "B" | "C";
  machine: string;
};

export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  search: "",
  shift: "",
  machine: "",
};

export function filterHistoryRecords(
  records: SavedRecord[],
  filters: HistoryFilters,
): SavedRecord[] {
  const search = filters.search.trim().toLowerCase();
  const machine = filters.machine.trim().toLowerCase();

  return records
    .filter((record) => {
      if (search) {
        const employee = record.employeeNumber.toLowerCase();
        const workOrder = record.workOrderNumber.toLowerCase();
        if (!employee.includes(search) && !workOrder.includes(search)) {
          return false;
        }
      }

      if (filters.shift) {
        if (record.shift.trim().toUpperCase() !== filters.shift) {
          return false;
        }
      }

      if (machine) {
        if (!record.machineNumber.toLowerCase().includes(machine)) {
          return false;
        }
      }

      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
}

export function getUniqueMachines(records: SavedRecord[]): string[] {
  const set = new Set<string>();
  for (const record of records) {
    const machine = record.machineNumber.trim();
    if (machine) set.add(machine);
  }
  return [...set].sort();
}
