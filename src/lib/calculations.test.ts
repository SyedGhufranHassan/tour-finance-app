import { describe, expect, it } from "vitest";
import { memberPaid, memberStatus, paymentTotals, sumAmounts } from "./calculations";

const member = { id: "m1", personId: "p1", expectedContribution: 7000 };
const incomes = [
  { id: "i1", memberId: "m1", amount: 5000, paymentMethod: "Cash" as const, receivedByPersonId: "p2", date: "2026-09-17", time: "09:00" },
];
const expenses = [
  { id: "e1", category: "Fuel" as const, amount: 1200, description: "Fuel", paidByPersonId: "p2", paymentMethod: "Cash" as const, location: "Timergara", date: "2026-09-17", time: "10:00" },
];

describe("financial calculations", () => {
  it("sums records without rounding away rupees", () => expect(sumAmounts([{ amount: 5000 }, { amount: 1200 }])).toBe(6200));
  it("calculates member balance status", () => {
    expect(memberPaid(member.id, incomes)).toBe(5000);
    expect(memberStatus(member, incomes)).toBe("Partial");
  });
  it("separates cash income and expenses", () => {
    expect(paymentTotals("Cash", incomes, expenses)).toEqual({ income: 5000, expenses: 1200 });
  });
});
