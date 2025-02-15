"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { createClassSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClass, getUserClasses } from "@/app/actions";
import { useClassStore } from "@/Stores/useClassStore";
import { redirect } from "next/navigation";


type CreateClassValues = z.infer<typeof createClassSchema>;

export function CreateClassDialog() {
  const { openDialogs, closeDialog } = useDialogStore();
  const { toast } = useToast();
  const { setClasses } = useClassStore();
  // const session = useSession();
  // const user = session.data?.user;

  // if (!user) {
  //   redirect("/api/auth/signin");
  //  }

  const form = useForm<CreateClassValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      className: "",
      subject: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateClassValues) {
    try {
      await createClass(values); 
      toast({ description: "Class created successfully!" });
      closeDialog("CreateClassDialog");
      form.reset();
      const classes = await getUserClasses();
      setClasses(classes);
      redirect("/");
    } catch (error) {
      toast({
        variant: "destructive",
        description: `Failed to create class. ${error}`,
      });
    }
  }

  return (
    <Dialog open={openDialogs["CreateClassDialog"] || false} onOpenChange={() => closeDialog("CreateClassDialog")}>
      <DialogContent className="sm:max-w-[400px] bg-card/85 backdrop-blur-md border-border top-[30%] sm:top-[50%]">
        <DialogHeader>
          <DialogTitle>Create a Class</DialogTitle>
          <DialogDescription>{"Click create when you're done."}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Class Name Input */}
          <div className="items-center gap-4">
            <Label htmlFor="className" className="text-right">Class name</Label>
            <Input {...form.register("className")} className="col-span-3 border-border" />
          </div>

          {/* Subject Input */}
          <div className="items-center gap-4">
            <Label htmlFor="subject" className="text-right">Subject</Label>
            <Input {...form.register("subject")} className="col-span-3 border-border" />
          </div>

          {/* Description Input */}
          <div className="items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea {...form.register("description")} placeholder="Type your description here." className="col-span-3 border-border max-h-40" />
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
