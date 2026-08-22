import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService, type AddExpensePayload } from '@/services/budgetService';

export const BUDGET_KEYS = {
  detail: (tripId: number | string) => ['trip-budget', String(tripId)] as const,
  expenses: (tripId: number | string) => ['trip-expenses', String(tripId)] as const,
};

export function useTripBudget(tripId: number | string | undefined) {
  return useQuery({
    queryKey: BUDGET_KEYS.detail(tripId!),
    queryFn: () => budgetService.getTripBudget(tripId!),
    enabled: !!tripId,
  });
}

export function useExpenses(tripId: number | string | undefined) {
  return useQuery({
    queryKey: BUDGET_KEYS.expenses(tripId!),
    queryFn: () => budgetService.getExpenses(tripId!),
    enabled: !!tripId,
  });
}

export function useAddExpense(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddExpensePayload) => budgetService.addExpense(tripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.detail(tripId) });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.expenses(tripId) });
    },
  });
}

export function useDeleteExpense(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: number | string) => budgetService.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.detail(tripId) });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.expenses(tripId) });
    },
  });
}
