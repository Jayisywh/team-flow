import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { EmojiReaction } from "./EmojiReaction";
import { query } from "@/lib/orpc";
import { toast } from "sonner";
import { GroupedReactionSchemaType } from "@/app/schemas/message";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { MessageListItem } from "@/lib/types";

type ThreadContext = {
  type: "thread";
  threadId: string;
};

type ListContext = {
  type: "list";
  channelId: string;
};

interface ReactionBarProps {
  messageId: string;
  reactions: GroupedReactionSchemaType[];
  context?: ThreadContext | ListContext;
}

type MessagePage = {
  items: MessageListItem[];
  nextCursor?: string;
};

type InfiniteReplies = InfiniteData<MessagePage>;

export function ReactionBar({
  messageId,
  reactions,
  context,
}: ReactionBarProps) {
  const { channelId } = useParams<{ channelId: string }>();
  const queryClient = useQueryClient();
  const toggleMutation = useMutation(
    query.message.reaction.toggle.mutationOptions({
      onMutate: async (vars: { messageId: string; emoji: string }) => {
        const bump = (reaction: GroupedReactionSchemaType[]) => {
          const found = reaction.find((r) => r.emoji === vars.emoji);
          if (found) {
            const desc = found.count - 1;
            return desc <= 0
              ? reaction.filter((r) => r.emoji !== found.emoji)
              : reaction.map((r) =>
                  r.emoji === found.emoji
                    ? { ...r, count: desc, reactedByMe: false }
                    : r,
                );
          }
          return [
            ...reaction,
            { emoji: vars.emoji, count: 1, reactedByMe: true },
          ];
        };
        const isThread = context && context.type === "thread";
        if (isThread) {
          const listOptions = query.message.thread.list.queryOptions({
            input: {
              messageId: context.threadId,
            },
          });
          await queryClient.cancelQueries({ queryKey: listOptions.queryKey });
          const previousThread = queryClient.getQueryData(listOptions.queryKey);
          queryClient.setQueryData(listOptions.queryKey, (old) => {
            if (!old) return old;
            if (vars.messageId === context.threadId) {
              return {
                ...old,
                parent: {
                  ...old.parent,
                  reactions: bump(old.parent.reactions),
                },
              };
            }
            return {
              ...old,
              replyMessages: old.replyMessages.map((message) =>
                message.id === vars.messageId
                  ? { ...message, reactions: bump(message.reactions) }
                  : message,
              ),
            };
          });
          return {
            previousThread,
            threadQueryKey: listOptions.queryKey,
          };
        }
        const listKey = ["message.list", channelId];
        await queryClient.cancelQueries({ queryKey: listKey });
        const previous = queryClient.getQueryData(listKey);
        queryClient.setQueryData<InfiniteReplies>(listKey, (old) => {
          if (!old) return old;
          const pages = old.pages.map((page) => ({
            ...page,
            items: page.items.map((m) => {
              if (m.id !== messageId) return m;
              const current = m.reactions;
              return {
                ...m,
                reactions: bump(current),
              };
            }),
          }));
          return {
            ...old,
            pages,
          };
        });
        return {
          previous,
          listKey,
        };
      },
      onSuccess: () => {
        toast.success("Emoji added successfully");
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.threadQueryKey && ctx.previousThread) {
          queryClient.setQueryData(ctx.threadQueryKey, ctx.previousThread);
        }
        if (ctx?.previous && ctx.listKey) {
          queryClient.setQueryData(ctx.listKey, ctx.previous);
        }
        toast.error("error.message");
      },
    }),
  );
  const handleToggle = (emoji: string) => {
    toggleMutation.mutate({ emoji, messageId });
    console.log(emoji);
  };
  return (
    <div className="mt-1 flex items-center gap-1">
      {reactions.map((r) => (
        <Button
          key={r.emoji}
          type="button"
          variant="secondary"
          size="sm"
          className={cn(
            "h-6 px-2 text-xs",
            r.reactedByMe && "bg-primary/10 border-primary border",
          )}
          onClick={() => handleToggle(r.emoji)}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </Button>
      ))}
      <EmojiReaction onSelect={handleToggle} />
    </div>
  );
}
