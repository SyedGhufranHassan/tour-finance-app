import type { Expense, Income, Member, PaymentMethod } from "../types";

export function sumAmounts(items: Array<{ amount: number }>) {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function memberPaid(memberId: string, incomes: Income[]) {
  return sumAmounts(incomes.filter((income) => income.memberId === memberId));
}

export function memberStatus(member: Member, incomes: Income[]) {
  const paid = memberPaid(member.id, incomes);
  if (paid === 0) return "Pending";
  if (paid < member.expectedContribution) return "Partial";
  return "Paid";
}

export function paymentTotals(method: PaymentMethod, incomes: Income[], expenses: Expense[]) {
  return {
    income: sumAmounts(incomes.filter((item) => item.paymentMethod === method)),
    expenses: sumAmounts(expenses.filter((item) => item.paymentMethod === method)),
  };
}
