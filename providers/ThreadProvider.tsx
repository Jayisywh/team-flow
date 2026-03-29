"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface ThreadContextType {
  selectedThreadId: string | null;
  openThread: (messageId: string) => void;
  closeThread: () => void;
  toggleThread: (messageId: string) => void;
  isOpen: boolean;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const openThread = (messageId: string) => {
    setSelectedThreadId(messageId);
    setIsOpen(true);
  };

  const closeThread = () => {
    setSelectedThreadId(null);
    setIsOpen(false);
  };
  const toggleThread = (messageId: string) => {
    if (selectedThreadId === messageId && isOpen) {
      closeThread();
    } else {
      openThread(messageId);
    }
  };
  const value: ThreadContextType = {
    selectedThreadId,
    openThread,
    closeThread,
    toggleThread,
    isOpen,
  };
  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

export function useThread() {
  const context = useContext(ThreadContext);
  if (context === undefined)
    throw new Error("useThread must be use within a ThreadProvider");
  return context;
}
