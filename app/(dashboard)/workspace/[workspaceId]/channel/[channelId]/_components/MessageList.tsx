"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageItem } from "./message/MessageItem";
import { useParams } from "next/navigation";
import { query } from "@/lib/orpc";
import { useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function MessageList() {
  const { channelId } = useParams<{ channelId: string }>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const didInitialScrollRef = useRef(false);

  const infiniteOptions = query.message.list.infiniteOptions({
    input: (pageParam: string | undefined) => ({
      channelId,
      cursor: pageParam,
      limit: 3,
    }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: [...data.pages]
        .map((p) => ({
          ...p,
          items: [...p.items].reverse(),
        }))
        .reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useInfiniteQuery({
      ...infiniteOptions,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    });

  const loadOlderMessages = () => {
    const el = scrollRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const prevScrollHeight = el.scrollHeight;
    const prevScrollTop = el.scrollTop;

    fetchNextPage().then(() => {
      const newScrollHeight = el.scrollHeight;
      el.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
    });
  };

  //Keep scroll position when loading older messages
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    if (el.scrollTop <= 50) {
      loadOlderMessages();
    }
  };

  // When content doesn't overflow, wheel-up at the top expresses "load older".
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    const el = scrollRef.current;
    if (!el) return;

    const atTop = el.scrollTop <= 0;
    const noOverflow = el.scrollHeight <= el.clientHeight;
    const scrollingUp = event.deltaY < 0;

    if (scrollingUp && atTop && noOverflow) {
      event.preventDefault();
      loadOlderMessages();
    }
  };

  // Scroll to bottom only on the initial load.
  // Keeping this on every data update breaks reverse infinite scrolling.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || didInitialScrollRef.current) return;

    el.scrollTop = el.scrollHeight;
    didInitialScrollRef.current = true;
  }, [data]);

  const items = useMemo(() => {
    return data?.pages.flatMap((p) => p.items) ?? [];
  }, [data]);

  return (
    <div className="h-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="flex-1 h-full overflow-y-auto px-4"
      >
        {!isFetchingNextPage && hasNextPage && (
          <div className="sticky top-0 z-10 py-2 flex justify-center bg-background/80 backdrop-blur-sm">
            <Button size="sm" variant="outline" onClick={loadOlderMessages}>
              Load older messages
            </Button>
          </div>
        )}
        {isFetchingNextPage && (
          <div className="py-2 text-center text-xs text-muted-foreground">
            Loading older messages...
          </div>
        )}
        {items.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {!isFetchingNextPage && isFetching ? (
          <>
            <div className="py-2 text-center text-sm text-muted-foreground">
              Loading messages...
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
