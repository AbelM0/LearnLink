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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { joinClass, getUserClasses } from "@/app/actions";
import { useClassStore } from "@/Stores/useClassStore";

const joinClassSchema = z.object({
  classCode: z.string().trim().min(1, "Class code is required"),
});

export function JoinClassDialog() {
  const { openDialogs, closeDialog } = useDialogStore();
  const { toast } = useToast();
  const { setClasses } = useClassStore();

  const form = useForm({
    resolver: zodResolver(joinClassSchema),
    defaultValues: { classCode: "" },
  });

  async function onSubmit(data: { classCode: string }) {
    try {
      await joinClass(data.classCode);
      toast({ description: "Successfully joined class!" });
      closeDialog("JoinClassDialog");
      form.reset();
      const classes = await getUserClasses();
      setClasses(classes);
    } catch (error) {
      toast({
        variant: "destructive",
        description: `Failed to join class.`,
      });
      console.error("Class joining error:", error);
    }
  }

  return (
    <Dialog
      open={openDialogs["JoinClassDialog"] || false}
      onOpenChange={() => closeDialog("JoinClassDialog")}
    >
      <DialogContent className="sm:max-w-[400px] bg-card/85 backdrop-blur-md border-border top-[30%] sm:top-[50%] w-[90%]">
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
          <DialogDescription>Enter the class code to join.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="items-center gap-4">
            <Label htmlFor="classCode" className="text-right">
              Class Code
            </Label>
            <Input
              id="classCode"
              placeholder="Enter class code"
              {...form.register("classCode")}
              className="col-span-3 border-border"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Join Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
