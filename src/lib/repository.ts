import type { AppData, Member, Person } from "../types";
import { supabase } from "./supabase";

/**
 * Production integration boundary. UI code can depend on this module rather
 * than knowing whether data comes from Supabase or the local development
 * fallback. The SQL migration supplies the matching normalized tables/RLS.
 */
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function loadRemoteData(fallback: AppData): Promise<AppData> {
  if (!supabase) return fallback;
  const user = await getCurrentUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  let { data: tour, error: tourError } = await supabase.from("tours").select("*").eq("owner_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (tourError) throw tourError;
  if (!tour) {
    const result = await supabase.from("tours").insert({ owner_id: user.id, name: fallback.tour.name, description: fallback.tour.description, origin: fallback.tour.origin, destination: fallback.tour.destination, start_date: fallback.tour.startDate, end_date: fallback.tour.endDate }).select("*").single();
    if (result.error) throw result.error;
    tour = result.data;
  }

  const [peopleResult, membersResult, incomesResult, expensesResult] = await Promise.all([
    supabase.from("people").select("*").eq("tour_id", tour.id).order("created_at"),
    supabase.from("tour_members").select("*").eq("tour_id", tour.id).order("created_at"),
    supabase.from("income_transactions").select("*").eq("tour_id", tour.id).order("transaction_date", { ascending: false }),
    supabase.from("expense_transactions").select("*").eq("tour_id", tour.id).order("expense_date", { ascending: false }),
  ]);
  const failed = [peopleResult, membersResult, incomesResult, expensesResult].find((result) => result.error);
  if (failed?.error) throw failed.error;

  const members = (membersResult.data ?? []).map((member) => ({ id: member.id, personId: member.person_id ?? member.id, expectedContribution: Number(member.expected_contribution), notes: member.notes ?? undefined }));
  const people = (peopleResult.data ?? []).map((person) => ({ id: person.id, name: person.name, phone: person.phone ?? undefined }));
  return {
    tour: { id: tour.id, name: tour.name, origin: tour.origin, destination: tour.destination, startDate: tour.start_date, endDate: tour.end_date, description: tour.description ?? "" },
    people,
    members,
    incomes: (incomesResult.data ?? []).map((income) => ({ id: income.id, memberId: income.member_id, amount: Number(income.amount), paymentMethod: income.payment_method, receivedByPersonId: income.received_by_person_id, date: income.transaction_date, time: String(income.transaction_time).slice(0, 5), notes: income.notes ?? undefined })),
    expenses: (expensesResult.data ?? []).map((expense) => ({ id: expense.id, category: expense.category, amount: Number(expense.amount), description: expense.description, paidByPersonId: expense.paid_by_person_id, paymentMethod: expense.payment_method, location: expense.location, date: expense.expense_date, time: String(expense.expense_time).slice(0, 5), notes: expense.notes ?? undefined, receiptUrl: expense.receipt_url ?? undefined })),
  };
}

export async function createRemoteMember(tourId: string, name: string, expectedContribution: number): Promise<void> {
  if (!supabase) return;
  const personResult = await supabase.from("people").insert({ tour_id: tourId, name }).select("id").single();
  if (personResult.error) throw personResult.error;
  const memberResult = await supabase.from("tour_members").insert({ tour_id: tourId, name, person_id: personResult.data.id, expected_contribution: expectedContribution });
  if (memberResult.error) {
    await supabase.from("people").delete().eq("id", personResult.data.id);
    throw memberResult.error;
  }
}

export async function updateRemoteMember(member: Member, person: Person | undefined, name: string, expectedContribution: number): Promise<void> {
  if (!supabase) return;
  const memberResult = await supabase.from("tour_members").update({ name, expected_contribution: expectedContribution }).eq("id", member.id);
  if (memberResult.error) throw memberResult.error;
  if (person) {
    const personResult = await supabase.from("people").update({ name }).eq("id", person.id);
    if (personResult.error) throw personResult.error;
  }
}

export async function deleteRemoteMember(memberId: string, personId: string): Promise<void> {
  if (!supabase) return;
  const result = await supabase.from("tour_members").delete().eq("id", memberId);
  if (result.error) throw result.error;
  const personResult = await supabase.from("people").delete().eq("id", personId);
  if (personResult.error) throw personResult.error;
}

export async function signOut() {
  if (supabase) {
    // Local scope clears the browser session even when the Supabase API is
    // temporarily unreachable. A logout action must never depend on network.
    await supabase.auth.signOut({ scope: "local" });
  }
}

export async function uploadReceipt(file: File, userId: string, tourId: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${userId}/${tourId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("receipts").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function saveTourSnapshot(_data: AppData) {
  if (!supabase) return;
  // This function is deliberately kept as the adapter seam: normalized writes
  // should be performed per entity so foreign keys and audit triggers remain
  // enforceable. It is not invoked by the local fallback.
}
