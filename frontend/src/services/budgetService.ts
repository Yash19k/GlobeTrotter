import apiClient from './api';
import type { TripBudget, Expense } from '@/types';

export interface AddExpensePayload {
  category: string;
  amount: number | string;
  description?: string;
  expense_date: string;
}

export const budgetService = {
  /**
   * Fetch comprehensive financial calculations for a trip.
   */
  async getTripBudget(tripId: number | string): Promise<TripBudget> {
    const response = await apiClient.get<TripBudget>(`/trips/${tripId}/budget/`);
    return response.data;
  },

  /**
   * Fetch explicit expenses for a trip.
   */
  async getExpenses(tripId: number | string): Promise<Expense[]> {
    const response = await apiClient.get<Expense[]>(`/trips/${tripId}/expenses/`);
    return response.data;
  },

  /**
   * Add an explicit expense to a trip.
   */
  async addExpense(tripId: number | string, payload: AddExpensePayload): Promise<Expense> {
    const response = await apiClient.post<Expense>(`/trips/${tripId}/expenses/`, payload);
    return response.data;
  },

  /**
   * Delete an explicit expense.
   */
  async deleteExpense(expenseId: number | string): Promise<void> {
    await apiClient.delete(`/expenses/${expenseId}/`);
  },
};
