"use client";

import { AuthGate } from "@/components/Auth";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { cleanupStaleItineraryData } from "@/store/itinerary/itinerary.store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import styles from "./WorkZone.module.scss";

export const WorkZone = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isCheckoutPage = pathname?.includes("/checkout");

  // Run cleanup on mount to remove stale localStorage data
  useEffect(() => {
    if (typeof window !== "undefined") {
      cleanupStaleItineraryData();
    }
  }, []);

  return (
    <AuthGate requireAuth={true}>
      <main
        className={`${styles["work-zone__container"]} ${
          isCheckoutPage ? styles["work-zone__container--checkout"] : ""
        }`}>
        {!isCheckoutPage && <Sidebar />}
        <div
          className={`${styles["work-zone__content"]} ${
            isCheckoutPage ? styles["work-zone__content--checkout"] : ""
          }`}>
          {children}
        </div>
      </main>
    </AuthGate>
  );
};
