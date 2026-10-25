"use client";

import { useEffect, useState } from "react";
import { getSkills } from "@/lib/api";
import { SKILLS } from "@/lib/maidFormOptions";

// Active skills from the admin panel; the built-in list covers a failed request.
export function useSkillOptions(): string[] {
  const [skills, setSkills] = useState<string[]>(SKILLS);

  useEffect(() => {
    let cancelled = false;
    getSkills()
      .then((res) => {
        const names = (res.data?.skills || []).map((s) => s.name);
        if (!cancelled && names.length) setSkills(names);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return skills;
}
