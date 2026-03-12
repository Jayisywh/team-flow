"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Form } from "@base-ui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function CreateWorkspace() {
  const [open, setOpen] = useState(false);
  const form = useForm();
  function onSubmit() {
    console.log("data");
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger>
          <DialogTrigger>
            <Button
              variant="outline"
              size="icon"
              className="size-12 rounded-xl border-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:border-muted-foreground hover:text-foreground hover:rounded-lg transition-all duration-100"
            >
              <Plus className="size-5" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Create Workspace</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a workspace to get started
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form></form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
