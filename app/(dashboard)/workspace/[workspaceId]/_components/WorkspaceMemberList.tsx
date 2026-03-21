"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatar } from "@/lib/get-avatar";
import { query } from "@/lib/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";

export function WorkspaceMemberList() {
  const {
    data: { members },
  } = useSuspenseQuery(query.channel.list.queryOptions());
  return (
    <div className="space-y-0.5 py-1">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer transition-colors duration-200"
        >
          <div className="relative w-10 h-10">
            <Avatar>
              <Image
                src={getAvatar(member.picture ?? null, member.email!)}
                alt="member image"
                fill
                className="object-cover"
              />
              <AvatarFallback>
                {member.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{member.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {member.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
