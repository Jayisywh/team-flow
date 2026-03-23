"use client";

import { channelSchema, transformChannelName } from "@/app/schemas/channel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { query } from "@/lib/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { isDefinedError } from "@orpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type FormData = z.infer<typeof channelSchema>;

export default function CreateNewChannel() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const form = useForm<FormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: "",
    },
  });
  const createChannel = useMutation(
    query.channel.create.mutationOptions({
      onSuccess: (newChannel) => {
        toast.success(`Channel ${newChannel.name} is created successfully`);
        queryClient.invalidateQueries({
          queryKey: query.channel.list.queryKey(),
        });
        form.reset();
        setOpen(false);
        router.push(`/workspace/${workspaceId}/channel/${newChannel.id}`);
      },
      onError: (error) => {
        if (isDefinedError(error)) {
          toast.error(error.message);
        }
        toast.error(`Failed to create channel, please try again`);
      },
    }),
  );
  const onSubmit = (values: FormData) => {
    createChannel.mutate(values);
    console.log(values);
    setOpen(false);
    form.reset();
  };
  const watchedName = form.watch("name");
  const previewName = watchedName ? transformChannelName(watchedName) : "";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Channel</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Crate a new channel</DialogTitle>
          <DialogDescription>
            create a new channel to get started!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <Label>Channel name</Label>
            <Input placeholder="General Chat" {...form.register("name")} />
            {watchedName && (
              <p className="text-sm text-muted-foreground mt-1">
                Will be created as {previewName}
              </p>
            )}
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createChannel.isPending}>
              {createChannel.isPending ? "Creating..." : "Create a new channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
