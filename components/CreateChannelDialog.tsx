"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialogStore } from "@/Stores/useDialogStore";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createChannelSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Class } from "@/types/class-type";
import { useCreateChannel } from "@/hooks/queries/use-channel-query";
import { getUserFacingError } from "@/lib/user-facing-error";

interface ChannelDialogProps {
  classData: Class;
}

type CreateChannelValues = z.infer<typeof createChannelSchema>;

export function CreateChannelDialog({ classData }: ChannelDialogProps) {
  const { openDialogs, closeDialog } = useDialogStore();
  const { toast } = useToast();
  const { id } = classData;

  const { mutateAsync: createChannel } = useCreateChannel(id);

  const form = useForm<CreateChannelValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      classId: id,
    },
  });

  async function onSubmit(values: CreateChannelValues) {
    try {
      await createChannel(values);
      toast({ description: "Channel created successfully!" });
      closeDialog("CreateChannelDialog");
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Channel not created",
        description: getUserFacingError(
          error,
          "We could not create the channel. Please try again.",
        ),
      });
    }
  }

  return (
    <Dialog
      open={openDialogs["CreateChannelDialog"] || false}
      onOpenChange={() => closeDialog("CreateChannelDialog")}
    >
      <DialogContent className="sm:max-w-[400px] bg-card/85 backdrop-blur-md border-border top-[30%] sm:top-[50%] w-[90%]">
        <DialogHeader>
          <DialogTitle>Create a Channel</DialogTitle>
          <DialogDescription>
            {"Click create when you're done."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            const message = errors.name?.message;
            toast({
              variant: "destructive",
              title: "Check the channel name",
              description:
                typeof message === "string"
                  ? message
                  : "Enter a valid channel name.",
            });
          })}
          className="grid gap-4 py-4"
        >
          {/* Channel Name Input */}
          <div className="items-center gap-4">
            <Label htmlFor="channelName" className="text-right">
              Channel name
            </Label>
            <Input
              {...form.register("name")}
              className="col-span-3 border-border"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
