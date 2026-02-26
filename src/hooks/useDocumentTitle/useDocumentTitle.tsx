"use client";

import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const originalTitle = document.title;
    
    if (title) {
      document.title = `Hayo | ${title}`;
    } else {
      document.title = "Hayo - Travel Concierge";
    }

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
