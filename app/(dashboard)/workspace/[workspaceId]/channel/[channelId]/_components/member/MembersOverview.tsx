import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { query } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { Search, User } from "lucide-react";
import { useState } from "react";
import { MemberItem } from "./MemberItem";
import { organization_user } from "@kinde/management-api-js";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function MembersOverview() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery<organization_user[]>(
    query.workspace.member.list.queryOptions(),
  );
  if (error) {
    return toast.error(error.message);
  }
  const members = data ?? [];
  const searchQuery = search.trim().toLowerCase();
  const filterMembers = searchQuery
    ? members.filter((member) => {
        const name = member.full_name?.toLowerCase();
        const email = member.email?.toLowerCase();
        return name?.includes(searchQuery) || email?.includes(searchQuery);
      })
    : members;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <User />
          <span>Members</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-75">
        <div className="p-0">
          {/* Header */}
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Workspace members</h3>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative ">
              <Search className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="pl-9 h-8"
              />
            </div>
          </div>

          {/* Members */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : filterMembers.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No members found
              </p>
            ) : (
              filterMembers.map((member) => (
                <MemberItem member={member} key={member.id} />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
