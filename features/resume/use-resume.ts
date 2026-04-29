"use client";

import { useAppState } from "@/components/providers/app-state-provider";

export function useResume() {
  const { state, updateResumeProfile } = useAppState();

  return {
    resumeProfile: state.resumeProfile,
    updateResumeProfile
  };
}
