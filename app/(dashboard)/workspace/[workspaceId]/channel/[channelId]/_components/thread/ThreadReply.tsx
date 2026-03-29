import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { Message } from "@/lib/generated/prisma/client";
import Image from "next/image";
import { ReactionBar } from "../reaction/ReactionBar";
import { MessageListItem } from "@/lib/types";

interface ThreadReplyProps {
  message: MessageListItem;
  selectedThreadId: string;
}

export function ThreadReply({ message, selectedThreadId }: ThreadReplyProps) {
  return (
    <div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
      <Image
        src={message.authorAvatar}
        alt="author avatar"
        width={32}
        height={32}
        className="size-8 rounded-full shrink-0 mt-1"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              month: "short",
              day: "numeric",
            }).format(message.createdAt)}
          </span>
        </div>
        <SafeContent
          content={JSON.parse(message.content)}
          className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
        />
        {message.imageUrl && (
          <div className="mt-2">
            <Image
              src={message.imageUrl}
              alt="message attachment"
              width={512}
              height={512}
              className="rounded-md max-h-80 w-auto object-contain"
            />
          </div>
        )}
        <ReactionBar
          context={{ type: "thread", threadId: selectedThreadId }}
          messageId={message.id}
          reactions={message.reactions}
        />
      </div>
    </div>
  );
}
