"use client";

import { query } from "@/lib/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function WorkspaceHeader() {
  const {
    data: { currentWorkspace },
  } = useSuspenseQuery(query.channel.list.queryOptions());
  return <h2 className="text-xl font-semibold">{currentWorkspace.orgName}</h2>;
}
