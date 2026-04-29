"use client";

import { useMemo, useState } from "react";

import { useAppState } from "@/components/providers/app-state-provider";
import { Application, ApplicationStatus } from "@/lib/types";
import { downloadCsv } from "@/lib/utils";

export function useApplications() {
  const { state, addApplication, updateApplication, deleteApplication } = useAppState();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL");

  const filteredApplications = useMemo(() => {
    return state.applications.filter((application) => {
      const matchesSearch = [application.companyName, application.roleTitle]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = status === "ALL" || application.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, state.applications, status]);

  const exportApplicationsCsv = () => {
    downloadCsv(
      "applications.csv",
      filteredApplications.map((application) => ({
        company: application.companyName,
        role: application.roleTitle,
        appliedAt: application.appliedAt,
        status: application.status,
        trackingUrl: application.trackingUrl,
        notes: application.notes
      }))
    );
  };

  return {
    applications: state.applications,
    filteredApplications,
    search,
    setSearch,
    status,
    setStatus,
    addApplication,
    updateApplication,
    deleteApplication,
    exportApplicationsCsv
  };
}

export function getApplicationInitialValues(application?: Application): Omit<Application, "id"> {
  return (
    application ?? {
      jobPostingId: "",
      companyId: "",
      companyName: "",
      roleTitle: "",
      appliedAt: new Date().toISOString().slice(0, 10),
      status: "SAVED",
      trackingUrl: "",
      notes: ""
    }
  );
}
