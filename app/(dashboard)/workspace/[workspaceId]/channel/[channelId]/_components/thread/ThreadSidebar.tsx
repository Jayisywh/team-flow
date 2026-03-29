"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, XIcon } from "lucide-react";
import Image from "next/image";
import { ThreadReply } from "./ThreadReply";
import { ThreadReplyForm } from "./ThreadReplyForm";
import { useThread } from "@/providers/ThreadProvider";
import { useQuery } from "@tanstack/react-query";
import { query } from "@/lib/orpc";
import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { ThreadSidebarSkeleton } from "./ThreadSidebarSkeleton";
import { useEffect, useRef, useState } from "react";

interface ThreadSidebarProps {
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadSidebar({ user }: ThreadSidebarProps) {
  const { selectedThreadId, closeThread } = useThread();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCountRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const { data, isLoading } = useQuery(
    query.message.thread.list.queryOptions({
      input: {
        messageId: selectedThreadId!,
      },
      enabled: Boolean(selectedThreadId),
    }),
  );
  const replyCount = data?.replyMessages.length;
  const isNearBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= 80;
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setIsAtBottom(isNearBottom(el));
  };
  useEffect(() => {
    if (!replyCount) return;
    const previousreplyCount = lastMessageCountRef.current;
    const el = scrollRef.current;
    if (previousreplyCount > 0 && replyCount > previousreplyCount) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      });
    }
    lastMessageCountRef.current = replyCount;
  }, [replyCount]);
  if (isLoading) {
    return <ThreadSidebarSkeleton />;
  }
  return (
    <div className="w-120 border-l flex flex-col h-full">
      {/* Header */}
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          <span>Thread</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={closeThread}>
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>
      {/* Main content */}
      {data && (
        <div
          className="flex-1 overflow-y-auto"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div className="p-4 border-b bg-muted/20">
            <div className="flex space-x-3">
              <Image
                src={data.parent.authorAvatar}
                alt="author image"
                width={32}
                height={32}
                className="size-8 rounded-full shrink-0"
              />
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {data.parent.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                      month: "short",
                      day: "numeric",
                    }).format(data.parent.createdAt)}
                  </span>
                </div>
                <SafeContent
                  content={JSON.parse(data.parent.content)}
                  className="text-sm wrap-break-word prose dark:prose-invert max-w-none"
                />
              </div>
            </div>
          </div>
          <div className="p-2">
            <p className="text-xs text-muted-foreground mb-3 px-2">
              {replyCount === 0
                ? "No replies"
                : replyCount === 1
                  ? "1 reply"
                  : `${replyCount} relpies`}
            </p>
            <div className="space-y-1">
              {data.replyMessages.map((reply) => (
                <ThreadReply
                  key={reply.id}
                  message={reply}
                  selectedThreadId={selectedThreadId!}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      )}
      {/* Thread replies form */}
      <div className="border-t p-4">
        <ThreadReplyForm threadId={selectedThreadId!} user={user} />
      </div>
    </div>
  );
}
