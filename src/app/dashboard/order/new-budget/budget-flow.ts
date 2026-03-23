export const BUDGET_FLOW_STEPS = {
  customer: 1,
  cart: 2,
  payment: 3,
  summary: 4,
} as const;

const LEGACY_STEP_MAP: Record<number, number> = {
  5: BUDGET_FLOW_STEPS.summary,
};

export function normalizeBudgetStep(step?: number) {
  if (!step || Number.isNaN(step)) {
    return BUDGET_FLOW_STEPS.customer;
  }

  if (step in LEGACY_STEP_MAP) {
    return LEGACY_STEP_MAP[step];
  }

  if (step < BUDGET_FLOW_STEPS.customer || step > BUDGET_FLOW_STEPS.summary) {
    return BUDGET_FLOW_STEPS.customer;
  }

  return step;
}
