import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatar } from "@/lib/get-avatar";
import { organization_user } from "@kinde/management-api-js";
import Image from "next/image";

interface MemberItemProps {
  member: organization_user;
}

export function MemberItem({ member }: MemberItemProps) {
  const displayName = member.full_name ?? member.email ?? "User";
  const displayEmail = member.email ?? "";
  return (
    <div className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors">
      <div className="flex items-center space-x-3">
        <div>
          <Avatar>
            <Image
              src={getAvatar(member.picture ?? null, displayEmail)}
              alt="member avatar"
              fill
              className="object-cover"
            />
            <AvatarFallback>
              {displayName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-md truncate">{displayName}</p>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
              Admin
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {member.email}
          </p>
        </div>
      </div>
    </div>
  );
}
