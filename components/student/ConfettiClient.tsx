"use client";

import dynamic from "next/dynamic";

const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});

export default function ConfettiClient() {
  return <Confetti />;
}
