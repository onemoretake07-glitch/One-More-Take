import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { SITE_DEFAULTS } from "./siteDefaults";

// Make saved data match the shape of the defaults.
// Wrong types or missing fields fall back to the default, so the
// website never breaks because of a bad or half-saved value.
export function normalizeContent(defaultValue, savedValue) {
  if (Array.isArray(defaultValue)) {
    if (!Array.isArray(savedValue)) return defaultValue;
    const template = defaultValue[0];
    if (template === undefined) return savedValue;
    return savedValue
      .map((item) => normalizeContent(template, item))
      .filter((item) => item !== undefined);
  }

  if (defaultValue && typeof defaultValue === "object") {
    const source = savedValue && typeof savedValue === "object" ? savedValue : {};
    const result = {};
    Object.keys(defaultValue).forEach((key) => {
      result[key] = normalizeContent(defaultValue[key], source[key]);
    });
    return result;
  }

  if (typeof defaultValue === "number") {
    const number = Number(savedValue);
    return savedValue === "" || savedValue === null || !Number.isFinite(number)
      ? defaultValue
      : number;
  }

  if (typeof defaultValue === "boolean") {
    return typeof savedValue === "boolean" ? savedValue : defaultValue;
  }

  return typeof savedValue === "string" ? savedValue : defaultValue;
}

// Live content for one website section (updates instantly when admin saves)
export function useSiteContent(sectionKey) {
  const defaults = SITE_DEFAULTS[sectionKey];
  const [content, setContent] = useState(defaults);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "siteContent", sectionKey),
      (snapshot) => {
        const saved = snapshot.exists() ? snapshot.data()?.content : null;
        setContent(saved ? normalizeContent(defaults, saved) : defaults);
      },
      (error) => {
        console.error(`Could not load "${sectionKey}" content:`, error);
        setContent(defaults);
      }
    );

    return unsubscribe;
  }, [sectionKey, defaults]);

  return content;
}

// Only allow safe link types (no "javascript:" etc.)
export function safeLink(value, fallback = "#") {
  const link = typeof value === "string" ? value.trim() : "";
  if (/^https:\/\//i.test(link)) return link;
  if (/^(mailto:|tel:)/i.test(link)) return link;
  if (/^#[\w-]*$/.test(link)) return link;
  if (/^\/[\w\-/]*$/.test(link)) return link;
  return fallback;
}

// Phone / WhatsApp number -> digits only (e.g. "+91 73311 32227" -> "917331132227")
export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}
