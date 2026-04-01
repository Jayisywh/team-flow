"use client";

import { cn } from "@/lib/utils";

export function Response({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-full my-2",
        role === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2 max-w-[70%]",
          role === "user"
            ? "bg-primary text-white"
            : "bg-muted text-foreground",
        )}
      >
        {children}
      </div>
    </div>
  );
}
