"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SweetSuccessAlert from "@/components/ui/SweetSuccessAlert";

function SummerSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <SweetSuccessAlert
      sessionId={sessionId}
      title="Summer Program Registration Successful!"
      subtitle="Your registration and payment have been successfully confirmed. Welcome to The Wolverines Summer Program!"
      programName="Wolverines Summer Program"
      homeUrl="/"
      programUrl="/summer-program"
    />
  );
}

export default function SummerProgramSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#DE2027] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SummerSuccessContent />
    </Suspense>
  );
}
