import { jsPDF } from "jspdf";
import type { AppData } from "../types";
import { formatRs } from "./utils";

type PdfMode = "complete" | "members" | "income" | "expenses";

function writeLine(doc: jsPDF, text: string, y: number, size = 10, color: [number, number, number] = [35, 48, 68]) {
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(text, 42, y);
}

export function downloadReportPdf(data: AppData, mode: PdfMode = "complete") {
  const people = Object.fromEntries(data.people.map((person) => [person.id, person.name]));
  const members = Object.fromEntries(data.members.map((member) => [member.id, member]));
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 54;

  const header = (title: string) => {
    doc.setFillColor(14, 23, 38);
    doc.rect(0, 0, 595, 112, "F");
    doc.setFillColor(24, 76, 78);
    doc.triangle(300, 112, 420, 28, 540, 112, "F");
    doc.setFillColor(31, 104, 91);
    doc.triangle(390, 112, 480, 50, 595, 112, "F");
    doc.setFillColor(31, 196, 155);
    doc.circle(45, 42, 14, "F");
    writeLine(doc, "KUMRAT TOUR FINANCE", 38, 10, [144, 229, 204]);
    writeLine(doc, title, 72, 24, [255, 255, 255]);
    writeLine(doc, `${data.tour.name} · ${data.tour.origin} → ${data.tour.destination}`, 94, 10, [177, 199, 215]);
    y = 145;
  };
  const section = (title: string) => {
    if (y > pageHeight - 70) { doc.addPage(); y = 48; }
    doc.setFillColor(229, 250, 243);
    doc.roundedRect(36, y - 15, 523, 25, 5, 5, "F");
    writeLine(doc, title, y + 2, 11, [20, 130, 101]);
    y += 28;
  };
  const row = (left: string, right: string) => {
    if (y > pageHeight - 48) { doc.addPage(); y = 48; }
    writeLine(doc, left, y, 10);
    doc.text(right, 553, y, { align: "right" });
    doc.setDrawColor(230, 235, 240);
    doc.line(42, y + 8, 553, y + 8);
    y += 23;
  };
  const footer = () => {
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(218, 231, 227);
      doc.line(42, pageHeight - 34, pageWidth - 42, pageHeight - 34);
      writeLine(doc, "Kumrat Tour Finance · Confidential financial report", pageHeight - 19, 8, [111, 133, 143]);
      doc.text(`Page ${page} of ${pageCount}`, pageWidth - 42, pageHeight - 19, { align: "right" });
    }
  };

  if (mode === "complete") {
    header("Financial Summary");
    const income = data.incomes.reduce((sum, item) => sum + item.amount, 0);
    const expenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    section("Tour position");
    row("Total collected", formatRs(income));
    row("Total expenses", formatRs(expenses));
    row("Remaining balance", formatRs(income - expenses));
  } else {
    header(mode === "members" ? "Member Contribution Report" : mode === "income" ? "Income Report" : "Expense Report");
  }

  if (mode === "complete" || mode === "members") {
    section("Members");
    data.members.forEach((member) => {
      const paid = data.incomes.filter((item) => item.memberId === member.id).reduce((sum, item) => sum + item.amount, 0);
      row(`${people[member.personId]} · Expected ${formatRs(member.expectedContribution)}`, `Paid ${formatRs(paid)}`);
    });
  }
  if (mode === "complete" || mode === "income") {
    section("Income transactions");
    data.incomes.forEach((income) => row(`${people[members[income.memberId]?.personId] ?? "Member"} · ${income.date} ${income.time}`, `${formatRs(income.amount)} · ${income.paymentMethod}`));
  }
  if (mode === "complete") {
    section("Expense categories");
    const categories = [...new Set(data.expenses.map((expense) => expense.category))];
    categories.forEach((category) => row(category, formatRs(data.expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0))));
    section("Payment methods");
    const methods = [...new Set([...data.incomes.map((item) => item.paymentMethod), ...data.expenses.map((item) => item.paymentMethod)])];
    methods.forEach((method) => row(method, `In ${formatRs(data.incomes.filter((item) => item.paymentMethod === method).reduce((sum, item) => sum + item.amount, 0))} · Out ${formatRs(data.expenses.filter((item) => item.paymentMethod === method).reduce((sum, item) => sum + item.amount, 0))}`));
  }
  if (mode === "complete" || mode === "expenses") {
    section("Expense transactions");
    data.expenses.forEach((expense) => row(`${expense.category} · ${expense.description} · ${expense.location}`, `${formatRs(expense.amount)} · ${people[expense.paidByPersonId] ?? "Unknown"}`));
  }
  if (mode === "complete") {
    section("Accountability by person");
    data.people.forEach((person) => {
      const received = data.incomes.filter((item) => item.receivedByPersonId === person.id).reduce((sum, item) => sum + item.amount, 0);
      const paid = data.expenses.filter((item) => item.paidByPersonId === person.id).reduce((sum, item) => sum + item.amount, 0);
      if (received || paid) row(person.name, `Received ${formatRs(received)} · Paid ${formatRs(paid)}`);
    });
  }
  footer();
  doc.save(`kumrat-${mode}-report.pdf`);
}
