import { supabase } from "./supabase";

export type PendingSubmission = {
  id: string; // Unique ID for the queue item
  schoolId: string;
  schoolName: string;
  timestamp: number;
  updates: any[]; // The student updates payload
  lotNumber?: number | null; // The assigned lot number (optional)
};

const QUEUE_KEY = "losa_pending_attendance";

export function getQueue(): PendingSubmission[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveToQueue(schoolId: string, schoolName: string, updates: any[], lotNumber?: number | null) {
  if (typeof window === "undefined") return;
  const queue = getQueue();
  // Generate a short unique ID
  const id = Math.random().toString(36).substring(2, 9);
  
  queue.push({
    id,
    schoolId,
    schoolName,
    timestamp: Date.now(),
    updates,
    lotNumber
  });
  
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearFromQueue(id: string) {
  if (typeof window === "undefined") return;
  const queue = getQueue();
  const updated = queue.filter(item => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
}

export async function processQueue(): Promise<{ success: number; failed: number }> {
  const queue = getQueue();
  if (queue.length === 0) return { success: 0, failed: 0 };

  let successCount = 0;
  let failCount = 0;

  for (const item of queue) {
    try {
      const { error } = await supabase.from("students").upsert(item.updates);
      if (error) throw error;
      
      if (item.lotNumber) {
        const { error: schoolError } = await supabase.from("schools").update({ lot_number: item.lotNumber }).eq("id", item.schoolId);
        if (schoolError) throw schoolError;
      }
      
      // If successful, remove from queue
      clearFromQueue(item.id);
      successCount++;
    } catch (err) {
      console.error(`Failed to sync queue item ${item.id}:`, err);
      failCount++;
    }
  }

  return { success: successCount, failed: failCount };
}
