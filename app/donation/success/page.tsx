"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SweetSuccessAlert from "@/components/ui/SweetSuccessAlert";

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <SweetSuccessAlert
      sessionId={sessionId}
      title="Thank You for Your Generous Donation!"
      subtitle="Your contribution directly empowers junior athletes and community development at The Wolverines Field Hockey Club."
      programName="Wolverines Community Donation"
      homeUrl="/"
      programUrl="/donation"
    />
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#DE2027] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DonationSuccessContent />
    </Suspense>
  );
}
