"use client";

import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

interface SafeHtmlContentProps {
  html: string;
  className?: string;
}

export function SafeHtmlContent({ html, className }: SafeHtmlContentProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

  useEffect(() => {
    // Sanitize only runs on the client where DOM/window is available
    if (typeof window !== "undefined") {
      setSanitizedHtml(DOMPurify.sanitize(html));
    }
  }, [html]);

  if (!sanitizedHtml) {
    return <div className="animate-pulse h-10 w-full bg-muted rounded-md" />;
  }

  return (
    <div
      className={`prose dark:prose-invert max-w-none ${className || ""}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized immediately before via DOMPurify
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
