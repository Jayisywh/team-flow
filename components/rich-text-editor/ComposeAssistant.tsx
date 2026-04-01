import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/server";
import { client } from "@/lib/orpc";
import { Response } from "../response";
import { Skeleton } from "../ui/skeleton";

interface ComposeAssistantProps {
  content: string;
  onAccept?: (markdown: string) => void;
}

export function ComposeAssistant({ content, onAccept }: ComposeAssistantProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    stop,
    clearError,
  } = useChat({
    id: `compose-assistant`,
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await client.ai.compose.generate(
            { content: contentRef.current },
            { signal: options.abortSignal },
          ),
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
  });
  const handleOpenChange = (nextOpen: boolean) => {
    console.log(nextOpen);
    setOpen(nextOpen);
    if (nextOpen) {
      const hasAssistantMessage = messages.some((m) => m.role === "assistant");
      if (status !== "ready" || hasAssistantMessage) {
        return;
      }
      sendMessage({ text: "Rewrite" });
    } else {
      stop();
      clearError();
      setMessages([]);
    }
  };
  const lastAssistant = messages.findLast((m) => m.role === "assistant");
  const composedText =
    lastAssistant?.parts
      .filter((part) => part.type === "text")
      .map((p) => p.text)
      .join("\n\n") ?? "";
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="relative overflow-hidden rounded-full bg-linear-to-t from-violet-600 to-fuchsia-600 text-white text-shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            <span className="text-xs font-medium">Compose</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex items-center justify-center rounded-full bg-linear-to-r from-violet-600 to-fuchsia-600 py-1.5 px-4 gap-1.5">
              <Sparkles className="size3.5 text-white" />
              <span className="text-sm font-medium">Compose assistant</span>
            </span>
          </div>
          {status === "streaming" && (
            <Button
              onClick={() => {
                stop();
              }}
              type="button"
              size="sm"
              variant="outline"
            >
              Stop
            </Button>
          )}
        </div>
        {/* Main content */}
        <div className="px-4 py-3 max-h-80 overflow-y-auto">
          {error ? (
            <div>
              <p className="text-red-500">{error.message}</p>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  clearError();
                  setMessages([]);
                  sendMessage({
                    text: "Summarize thread",
                  });
                }}
              >
                Try again
              </Button>
            </div>
          ) : composedText ? (
            <Response role="assistant">{composedText}</Response>
          ) : status === "submitted" || status === "streaming" ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Click compose to generate
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t px-3 py-2 bg-muted/30">
          <Button
            type="submit"
            size="sm"
            variant="outline"
            onClick={() => {
              stop();
              clearError();
              setMessages([]);
              setOpen(false);
            }}
          >
            Decline
          </Button>
          <Button
            type="submit"
            size="sm"
            onClick={() => {
              if (!composedText) return;
              onAccept?.(composedText);
              stop();
              clearError();
              setMessages([]);
              setOpen(false);
            }}
            disabled={!composedText}
          >
            Accept
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
