"use client";

import { useState, useEffect } from "react";
import { CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { getQueue, processQueue, PendingSubmission } from "@/lib/sync";

export function OfflineSync() {
  const [queue, setQueue] = useState<PendingSubmission[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);

  const loadQueue = () => {
    setQueue(getQueue());
  };

  useEffect(() => {
    loadQueue();

    const handleQueued = () => loadQueue();
    const handleOnline = () => {
      // Auto sync when back online
      if (getQueue().length > 0) {
        handleSync();
      }
    };

    window.addEventListener("attendance_queued", handleQueued);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("attendance_queued", handleQueued);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncResult(null);

    const result = await processQueue();
    setSyncResult(result);
    loadQueue();
    
    setIsSyncing(false);

    // Clear success message after 3 seconds
    if (result.success > 0 && result.failed === 0) {
      setTimeout(() => setSyncResult(null), 3000);
    }
  };

  if (queue.length === 0 && !syncResult) return null;

  return (
    <div className="flex items-center gap-2">
      {syncResult && syncResult.success > 0 && syncResult.failed === 0 ? (
        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-200">
          <CheckCircle2 size={14} />
          Synced {syncResult.success} {syncResult.success === 1 ? "group" : "groups"}
        </span>
      ) : queue.length > 0 ? (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-200 transition-colors disabled:opacity-50"
          title="Click to retry syncing"
        >
          {isSyncing ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <CloudOff size={14} />
          )}
          {queue.length} pending
        </button>
      ) : null}
    </div>
  );
}
