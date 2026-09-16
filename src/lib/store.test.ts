import { beforeEach, describe, expect, it, vi } from "vitest";
import { addExpense, addIncome, addMember, addPerson, removeMember, updateExpense, updateIncome, updateMember } from "./store";
import type { AppData } from "../types";

const emptyData: AppData = {
  tour: { id: "tour", name: "Test tour", origin: "A", destination: "B", startDate: "2026-09-17", endDate: "2026-09-18", description: "" },
  people: [],
  members: [],
  incomes: [],
  expenses: [],
};

beforeEach(() => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage, dispatchEvent: vi.fn() });
});

describe("local persistence flows", () => {
  it("adds and edits a member while preserving identity", () => {
    const withPerson = addPerson(emptyData, { name: "Ali" });
    const person = withPerson.people[0];
    const withMember = addMember(withPerson, { personId: person.id, expectedContribution: 7000 });
    const member = withMember.members[0];
    const updated = updateMember(withMember, member.id, { expectedContribution: 7500 }, "Ali Khan");
    expect(updated.members[0].expectedContribution).toBe(7500);
    expect(updated.people[0].name).toBe("Ali Khan");
    expect(updated.members[0].id).toBe(member.id);
  });

  it("updates income and expense amounts", () => {
    const withPerson = addPerson(emptyData, { name: "Ali" });
    const withMember = addMember(withPerson, { personId: withPerson.people[0].id, expectedContribution: 7000 });
    const withIncome = addIncome(withMember, { memberId: withMember.members[0].id, amount: 5000, paymentMethod: "Cash", receivedByPersonId: withPerson.people[0].id, date: "2026-09-17", time: "09:00" });
    const withExpense = addExpense(withIncome, { category: "Fuel", amount: 1000, description: "Fuel", paidByPersonId: withPerson.people[0].id, paymentMethod: "Cash", location: "Timergara", date: "2026-09-17", time: "10:00" });
    expect(updateIncome(withExpense, withIncome.incomes[0].id, { amount: 5500 }).incomes[0].amount).toBe(5500);
    expect(updateExpense(withExpense, withExpense.expenses[0].id, { amount: 1200 }).expenses[0].amount).toBe(1200);
  });

  it("blocks member deletion while financial records reference that person", () => {
    const withPerson = addPerson(emptyData, { name: "Ali" });
    const withMember = addMember(withPerson, { personId: withPerson.people[0].id, expectedContribution: 7000 });
    const withIncome = addIncome(withMember, { memberId: withMember.members[0].id, amount: 5000, paymentMethod: "Cash", receivedByPersonId: withPerson.people[0].id, date: "2026-09-17", time: "09:00" });
    expect(removeMember(withIncome, withMember.members[0].id).members).toHaveLength(1);
    expect(removeMember(withMember, withMember.members[0].id).members).toHaveLength(0);
  });
});
