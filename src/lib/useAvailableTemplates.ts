"use client";

import { useEffect, useState } from "react";
import { TEMPLATES, type TemplateInfo } from "@/lib/templates";

/** Until the server answers, trust the registry (it knows `enabled: false`, only the server knows DISABLED_TEMPLATES). */
const REGISTRY_ENABLED: TemplateInfo[] = TEMPLATES.filter((template) => template.enabled !== false);

let cached: TemplateInfo[] | null = null;
let inflight: Promise<TemplateInfo[]> | null = null;

function loadTemplates(): Promise<TemplateInfo[]> {
  if (cached) return Promise.resolve(cached);
  inflight ??= fetch("/api/templates")
    .then((res) => res.json())
    .then((data: { templates?: TemplateInfo[] }) => {
      cached = Array.isArray(data.templates) ? data.templates : REGISTRY_ENABLED;
      return cached;
    })
    .catch(() => REGISTRY_ENABLED)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** The templates that can be picked right now, plus a check for a stored id. */
export function useAvailableTemplates() {
  const [templates, setTemplates] = useState<TemplateInfo[]>(cached ?? REGISTRY_ENABLED);
  useEffect(() => {
    let cancelled = false;
    void loadTemplates().then((list) => {
      if (!cancelled) setTemplates(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return {
    templates,
    isAvailable: (id: string | null | undefined) => Boolean(id) && templates.some((template) => template.id === id),
  };
}
