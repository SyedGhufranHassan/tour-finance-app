import type { AppData, Expense, Income, Member, Person } from "../types";
import { uid } from "./utils";

const key = "kumrat-tour-finance-data";
const initialPeople: Person[] = [
  { id: "p-ali", name: "Ali" },
  { id: "p-ahmed", name: "Ahmed" },
  { id: "p-hassan", name: "Hassan" },
  { id: "p-usman", name: "Usman" },
];
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
  people: initialPeople,
  members: [
    { id: "m-ahmed", personId: "p-ahmed", expectedContribution: 7000 },
    { id: "m-hassan", personId: "p-hassan", expectedContribution: 7000 },
    { id: "m-usman", personId: "p-usman", expectedContribution: 5000 },
  ],
  incomes: [
    { id: "i-ahmed", memberId: "m-ahmed", amount: 5000, paymentMethod: "Cash", receivedByPersonId: "p-ali", date: "2026-09-17", time: "09:15", notes: "Initial contribution" },
    { id: "i-hassan", memberId: "m-hassan", amount: 7000, paymentMethod: "Easypaisa", receivedByPersonId: "p-ali", date: "2026-09-17", time: "09:20", notes: "Full contribution" },
  ],
  expenses: [
    { id: "e-vehicle", category: "Vehicle", amount: 25000, description: "Hiace rental for tour", paidByPersonId: "p-ali", paymentMethod: "Cash", location: "Imamia Colony", date: "2026-09-17", time: "07:00", notes: "" },
    { id: "e-fuel", category: "Fuel", amount: 6000, description: "Vehicle fuel", paidByPersonId: "p-hassan", paymentMethod: "Cash", location: "Timergara", date: "2026-09-17", time: "17:30", notes: "" },
    { id: "e-food", category: "Food", amount: 4500, description: "Dinner for tour members", paidByPersonId: "p-usman", paymentMethod: "Cash", location: "Kumrat", date: "2026-09-17", time: "21:30", notes: "" },
  ],
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

export function addIncome(data: AppData, income: Omit<Income, "id">) {
  const next = { ...data, incomes: [...data.incomes, { ...income, id: uid("income") }] };
  saveData(next);
  return next;
}

export function addExpense(data: AppData, expense: Omit<Expense, "id">) {
  const next = { ...data, expenses: [...data.expenses, { ...expense, id: uid("expense") }] };
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
