import type { ExtractionFieldKey, ExtractionFormValues } from "@/types/extraction";

const VALID_SHIFTS = ["A", "B", "C"] as const;

export function validateExtractionForm(
  values: ExtractionFormValues,
): Partial<Record<ExtractionFieldKey, string>> {
  const errors: Partial<Record<ExtractionFieldKey, string>> = {};

  if (!values.date.trim()) {
    errors.date = "Date is required";
  }

  if (!values.shift.trim()) {
    errors.shift = "Shift is required";
  } else {
    const shift = values.shift.trim().toUpperCase();
    if (!(VALID_SHIFTS as readonly string[]).includes(shift)) {
      errors.shift = "Shift must be A, B, or C";
    }
  }

  if (!values.employeeNumber.trim()) {
    errors.employeeNumber = "Employee number is required";
  }

  const quantity = values.quantityProduced.trim();
  if (
    quantity &&
    (Number.isNaN(Number(quantity)) || !/^\d+(\.\d+)?$/.test(quantity))
  ) {
    errors.quantityProduced = "Quantity must be a valid number";
  }

  const machine = values.machineNumber.trim();
  if (machine && !machine.startsWith("M-")) {
    errors.machineNumber = 'Machine number must start with "M-"';
  }

  const workOrder = values.workOrderNumber.trim();
  if (workOrder && !workOrder.startsWith("WO-")) {
    errors.workOrderNumber = 'Work order number must start with "WO-"';
  }

  return errors;
}

export function hasValidationErrors(
  errors: Partial<Record<ExtractionFieldKey, string>>,
): boolean {
  return Object.keys(errors).length > 0;
}
