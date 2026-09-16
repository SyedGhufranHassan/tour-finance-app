import type { AppData, Expense, Income, Member, Person } from "../types";
import { uid } from "./utils";

const key = "kumrat-tour-finance-data-v2";
const initialData: AppData = {
  tour: {
    id: "tour-kumrat-2k26",
    name: "Kumrat Tour 2K26",
    origin: "Imamia Colony",
    destination: "Kumrat Valley",
    startDate: "2026-09-17",
    endDate: "2026-09-18",
    description: "Imamia Colony → Kumrat Valley → Imamia Colony",
  },
  people: [],
  members: [],
  incomes: [],
  expenses: [],
};

export function loadData(): AppData {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as AppData : initialData;
  } catch {
    return initialData;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("finance-data-changed"));
}

export function addPerson(data: AppData, person: Omit<Person, "id">) {
  const next = { ...data, people: [...data.people, { ...person, id: uid("person") }] };
  saveData(next);
  return next;
}

export function addMember(data: AppData, member: Omit<Member, "id">) {
  const next = { ...data, members: [...data.members, { ...member, id: uid("member") }] };
  saveData(next);
  return next;
}

export function updateMember(data: AppData, memberId: string, changes: Partial<Pick<Member, "expectedContribution" | "notes">>, personName?: string) {
  const current = data.members.find((member) => member.id === memberId);
  if (!current) return data;
  const members = data.members.map((member) => member.id === memberId ? { ...member, ...changes } : member);
  const people = personName === undefined ? data.people : data.people.map((person) => person.id === current.personId ? { ...person, name: personName } : person);
  const next = { ...data, members, people };
  saveData(next);
  return next;
}

export function removeMember(data: AppData, memberId: string) {
  const member = data.members.find((item) => item.id === memberId);
  if (!member || data.incomes.some((income) => income.memberId === memberId || income.receivedByPersonId === member.personId) || data.expenses.some((expense) => expense.paidByPersonId === member.personId)) return data;
  const next = {
    ...data,
    members: data.members.filter((item) => item.id !== memberId),
    people: data.people.filter((person) => person.id !== member.personId),
  };
  saveData(next);
  return next;
}

export function addIncome(data: AppData, income: Omit<Income, "id">) {
  const next = { ...data, incomes: [...data.incomes, { ...income, id: uid("income") }] };
  saveData(next);
  return next;
}

export function updateIncome(data: AppData, incomeId: string, changes: Partial<Income>) {
  const next = { ...data, incomes: data.incomes.map((item) => item.id === incomeId ? { ...item, ...changes } : item) };
  saveData(next);
  return next;
}

export function addExpense(data: AppData, expense: Omit<Expense, "id">) {
  const next = { ...data, expenses: [...data.expenses, { ...expense, id: uid("expense") }] };
  saveData(next);
  return next;
}

export function updateExpense(data: AppData, expenseId: string, changes: Partial<Expense>) {
  const next = { ...data, expenses: data.expenses.map((item) => item.id === expenseId ? { ...item, ...changes } : item) };
  saveData(next);
  return next;
}

export function removeExpense(data: AppData, id: string) {
  const next = { ...data, expenses: data.expenses.filter((item) => item.id !== id) };
  saveData(next);
  return next;
}

export function removeIncome(data: AppData, id: string) {
  const next = { ...data, incomes: data.incomes.filter((item) => item.id !== id) };
  saveData(next);
  return next;
}
