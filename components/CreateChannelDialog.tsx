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
import { createChannel } from "@/app/actions";
import { getClassChannels } from "@/app/class/[id]/actions";
import { Class } from "@/types/class-type";
import { useChannelStore } from "@/Stores/useChannelStore";


interface ChannelDialogProps {
  classData: Class;
}

type CreateChannelValues = z.infer<typeof createChannelSchema>;

export function CreateChannelDialog({classData}: ChannelDialogProps) {
  const { openDialogs, closeDialog } = useDialogStore();
  const { toast } = useToast();
  const { setChannels } = useChannelStore();
  const { id } = classData;



  const form = useForm<CreateChannelValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      classId: id,
    },
  });

  async function onSubmit(values: CreateChannelValues) {
    try {
      console.log("Form submitted with:", values);
      await createChannel(values);
      toast({ description: "Channel created successfully!" });
      closeDialog("CreateChannelDialog");
      form.reset();
      const Channels = await getClassChannels(id);
      setChannels(Channels);
    } catch (error) {
      toast({
        variant: "destructive",
        description: `Failed to create channel.`,
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
            console.error("❌ Validation failed:", errors);
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
