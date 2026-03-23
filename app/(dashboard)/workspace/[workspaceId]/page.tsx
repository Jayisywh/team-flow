import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { serverClient } from "@/lib/orpc.server";
import { Cloud } from "lucide-react";
import { redirect } from "next/navigation";
import CreateNewChannel from "./_components/CreateNewChannel";

interface ChannelListProps {
  params: Promise<{ workspaceId: string }>;
}

const ChannelListPage = async ({ params }: ChannelListProps) => {
  const { workspaceId } = await params;
  const { channels } = await serverClient.channel.list();
  if (channels.length > 0) {
    return redirect(`/workspace/${workspaceId}/channel/${channels[0].id}`);
  }
  return (
    <div className="p-16 flex flex-1">
      <Empty className="border border-dashed from-muted/50 to-background h-full bg-linear-to-b from-30%">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Cloud />
          </EmptyMedia>
          <EmptyTitle>No channel yet</EmptyTitle>
          <EmptyDescription>
            Create your first channel to get started
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="max-w-xs mx-auto">
          <CreateNewChannel />
        </EmptyContent>
      </Empty>
    </div>
  );
};

export default ChannelListPage;
