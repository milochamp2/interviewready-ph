"use client";

import { useState, useEffect, useCallback } from "react";
import type { EntitlementInfo } from "@/types";

export function useEntitlement(sessionId: string) {
  const [entitlement, setEntitlement] = useState<EntitlementInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntitlement = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/entitlement/status?session_id=${sessionId}`
      );
      const data = await res.json();
      if (data.success) {
        setEntitlement(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch entitlement:", err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchEntitlement();

    // Poll every 5 seconds while loading/locked (for payment verification)
    const interval = setInterval(() => {
      fetchEntitlement();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchEntitlement]);

  return { entitlement, loading, refetch: fetchEntitlement };
}
