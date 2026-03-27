import { RefObject, useEffect, useRef } from "react";

type UseAutoScrollArgs = {
  containerRef: RefObject<HTMLDivElement | null>;
  /**
   * Optional sentinel at the end of the list.
   * (Not strictly required; useful for layout settling.)
   */
  bottomRef?: RefObject<HTMLDivElement | null>;
  lastMessageId: string | null;
  lastMessageAuthorId?: string | null;
  currentUserId?: string | null;
  /**
   * Updated by the caller in `onScroll`.
   * When false, we don't auto-jump (Discord behavior).
   */
  isNearBottomRef: RefObject<boolean> & { current: boolean };
  /**
   * The caller sets this after the initial "scroll to bottom".
   * We use it to avoid interfering with initial positioning.
   */
  didInitialScrollRef: RefObject<boolean> & { current: boolean };
  nearBottomThresholdPx?: number;
};

const waitForImagesInContainer = async (
  container: HTMLDivElement,
  timeoutMs = 3000,
) => {
  const images = Array.from(container.querySelectorAll("img"));
  const pending = images.filter((img) => !img.complete);
  if (pending.length === 0) return;

  await Promise.race([
    Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
      ),
    ),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
};

export function useAutoScroll({
  containerRef,
  bottomRef,
  lastMessageId,
  lastMessageAuthorId,
  currentUserId,
  isNearBottomRef,
  didInitialScrollRef,
}: UseAutoScrollArgs) {
  const prevLastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const latestId = lastMessageId ?? null;
    if (!container || !latestId) return;

    // Initial load: we always want to end at the latest message.
    if (!didInitialScrollRef.current) {
      void (async () => {
        await waitForImagesInContainer(container);
        bottomRef?.current?.getBoundingClientRect();
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "auto",
        });
        prevLastMessageIdRef.current = latestId;
        didInitialScrollRef.current = true;
      })();
      return;
    }

    if (prevLastMessageIdRef.current === latestId) return;

    // Discord behavior: only scroll when user is already near bottom.
    if (!isNearBottomRef.current) {
      prevLastMessageIdRef.current = latestId;
      return;
    }

    const shouldSmooth = !!currentUserId && lastMessageAuthorId === currentUserId;

    void (async () => {
      await waitForImagesInContainer(container);

      // Sentinel helps ensure layout is settled in case of async image sizing.
      bottomRef?.current?.getBoundingClientRect();

      container.scrollTo({
        top: container.scrollHeight,
        behavior: shouldSmooth ? "smooth" : "auto",
      });
    })();

    prevLastMessageIdRef.current = latestId;
  }, [
    lastMessageId,
    lastMessageAuthorId,
    currentUserId,
    containerRef,
    bottomRef,
    isNearBottomRef,
    didInitialScrollRef,
  ]);
}

