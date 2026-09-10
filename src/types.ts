export type PaymentMethod = "Cash" | "Bank Transfer" | "Easypaisa" | "JazzCash" | "Other Online";
export type ExpenseCategory = "Vehicle" | "Fuel" | "Accommodation" | "Food" | "Toll / Tax" | "Other";

export type Person = { id: string; name: string; phone?: string };
export type Member = {
  id: string;
  personId: string;
  expectedContribution: number;
  notes?: string;
};
export type Income = {
  id: string;
  memberId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receivedByPersonId: string;
  date: string;
  time: string;
  notes?: string;
};
export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  paidByPersonId: string;
  paymentMethod: PaymentMethod;
  location: string;
  date: string;
  time: string;
  notes?: string;
  receiptUrl?: string;
};
export type Tour = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
};
export type AppData = {
  tour: Tour;
  people: Person[];
  members: Member[];
  incomes: Income[];
  expenses: Expense[];
};
