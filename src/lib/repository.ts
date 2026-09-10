import type { AppData } from "../types";
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

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
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
