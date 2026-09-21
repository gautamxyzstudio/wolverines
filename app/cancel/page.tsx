import React from "react";
import PaymentCancelCard from "@/components/ui/PaymentCancelCard";

export default function GlobalCancelPage() {
  return (
    <PaymentCancelCard
      programName="Wolverines Registration"
      retryUrl="/summer-program"
    />
  );
}
