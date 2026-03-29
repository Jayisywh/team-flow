"use client";

import { useParams } from "next/navigation";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessageInputForm } from "./_components/message/MessageInputForm";
import { MessageList } from "./_components/MessageList";
import { useQuery } from "@tanstack/react-query";
import { query } from "@/lib/orpc";
import { toast } from "sonner";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadSidebar } from "./_components/thread/ThreadSidebar";
import { ThreadProvider, useThread } from "@/providers/ThreadProvider";

const ChannelRoutePage = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { isOpen } = useThread();
  const { data, error, isLoading } = useQuery(
    query.channel.get.queryOptions({
      input: {
        channelId: channelId,
      },
    }),
  );
  if (error) {
    toast.error("An unexpected error occured");
  }
  return (
    <div className="flex h-screen w-full">
      {/* Main channel area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Fixed header */}
        {isLoading ? (
          <div className="flex items-center justify-between h-14 px-4 border-b">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="size-8" />
            </div>
          </div>
        ) : (
          <ChannelHeader channelName={data?.channelName ?? ""} />
        )}

        <div className="flex-1 min-h-0">
          <MessageList />
        </div>
        <div className="border-t bg-background p-4">
          {/* Fixed input */}
          <MessageInputForm
            channelId={channelId}
            user={data?.currentUser as KindeUser<Record<string, unknown>>}
          />
        </div>
      </div>
      {isOpen && (
        <ThreadSidebar
          user={data?.currentUser as KindeUser<Record<string, unknown>>}
        />
      )}
    </div>
  );
};

const ChannelPage = () => {
  return (
    <ThreadProvider>
      <ChannelRoutePage />
    </ThreadProvider>
  );
};

export default ChannelPage;
