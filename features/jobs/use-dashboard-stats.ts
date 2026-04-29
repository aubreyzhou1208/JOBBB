"use client";

import { useEffect, useState } from "react";

export interface DashboardStats {
  totalJobs: number;
  byEmploymentType: { type: string; count: number }[];
  byCompany: { company: string; count: number }[];
  lastSync: { startedAt: string; finishedAt: string; message: string; status: string } | null;
  recentJobs: {
    id: string;
    companyName: string;
    title: string;
    location: string;
    employmentType: string;
    deadlineAt: string;
    applyUrl: string;
    roleTags: string[];
    programTags: string[];
  }[];
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
