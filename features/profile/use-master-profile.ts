"use client";

import { useCallback, useEffect, useState } from "react";
import { MasterProfile, EMPTY_PROFILE } from "./types";

const KEY = "jobtracker:master_profile";

function load(): MasterProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : EMPTY_PROFILE;
  } catch {
    return EMPTY_PROFILE;
  }
}

export function useMasterProfile() {
  const [profile, setProfile] = useState<MasterProfile>(EMPTY_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(load());
    setLoaded(true);
  }, []);

  const save = useCallback((next: MasterProfile) => {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setProfile(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  }, []);

  return { profile, save, loaded };
}
