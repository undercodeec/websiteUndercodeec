"use client";

import { useEffect } from "react";
import { listenForAdminHumanActivity } from "./adminHumanActivity.mjs";

export function useAdminHumanActivity(enabled, send) {
  useEffect(() => {
    if (!enabled) return;
    return listenForAdminHumanActivity(document, send);
  }, [enabled, send]);
}
