import { ApplicationStatus } from "@/lib/types";

export const applicationStatusStyles: Record<ApplicationStatus, string> = {
  SAVED: "bg-slate-100 text-slate-600 border-slate-200",
  APPLIED: "bg-primary-soft text-primary border-primary/20",
  OA: "bg-mint-soft text-mint-hover border-mint/20",
  INTERVIEW: "bg-violet-100 text-violet-700 border-violet-200",
  OFFER: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-coral-soft text-coral-hover border-coral/20",
  GHOSTED: "bg-zinc-100 text-zinc-500 border-zinc-200"
};
