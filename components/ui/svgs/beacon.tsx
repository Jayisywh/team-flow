import React from "react";

export const Beacon = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
};
