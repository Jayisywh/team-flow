"use client";

import { useParams } from "next/navigation";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessageInputForm } from "./_components/message/MessageInputForm";
import { MessageList } from "./_components/MessageList";

const ChannelRoutePage = () => {
  const { channelId } = useParams<{ channelId: string }>();
  return (
    <div className="flex h-screen w-full">
      {/* Main channel area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Fixed header */}
        <ChannelHeader />
        <div className="flex-1 min-h-0">
          <MessageList />
        </div>
        <div className="border-t bg-background p-4">
          {/* Fixed input */}
          <MessageInputForm channelId={channelId} />
        </div>
      </div>
    </div>
  );
};

export default ChannelRoutePage;
