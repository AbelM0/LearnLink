"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  Copy,
  Globe2,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  MessageSquare,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  Video,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { getUserFacingError } from "@/lib/user-facing-error";
import {
  classDetailsSchema,
  type ClassDetailsValues,
  type ClassPermissionsValues,
} from "@/lib/validation";
import {
  deleteClass,
  regenerateClassCode,
  transferClassOwnership,
  updateClassDetails,
  updateClassPermissions,
} from "./actions";

interface ClassSettingsData extends ClassDetailsValues, ClassPermissionsValues {
  id: number;
  classCode: string;
  createdAt: string;
}

interface TransferMember {
  id: string;
  name: string | null;
  email: string;
  role: "moderator" | "member";
}

interface ClassSettingsProps {
  classData: ClassSettingsData;
  members: TransferMember[];
}

const navigation = [
  { href: "#general", label: "General", icon: Settings },
  { href: "#access", label: "Access and permissions", icon: ShieldCheck },
  { href: "#ownership", label: "Ownership", icon: UserRoundCog },
  { href: "#danger", label: "Danger zone", icon: Trash2 },
];

export default function ClassSettings({ classData, members }: ClassSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<ClassPermissionsValues>({
    visibility: classData.visibility,
    isInviteEnabled: classData.isInviteEnabled,
    allowMemberMessages: classData.allowMemberMessages,
    allowMemberLiveParticipation: classData.allowMemberLiveParticipation,
  });
  const [classCode, setClassCode] = useState(classData.classCode);
  const [savedClassName, setSavedClassName] = useState(classData.className);
  const [isCopied, setIsCopied] = useState(false);
  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [transferUserId, setTransferUserId] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<ClassDetailsValues>({
    resolver: zodResolver(classDetailsSchema),
    defaultValues: {
      className: classData.className,
      subject: classData.subject,
      description: classData.description,
      imageUrl: classData.imageUrl,
    },
  });

  async function onSaveDetails(values: ClassDetailsValues) {
    try {
      const result = await updateClassDetails(classData.id, values);
      setSavedClassName(result.className);
      form.reset(values);
      toast({ description: result.message });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Settings not saved",
        description: getUserFacingError(
          error,
          "We could not update the class details. Please try again.",
        ),
      });
    }
  }

  function savePermissions() {
    startTransition(async () => {
      try {
        const result = await updateClassPermissions(classData.id, permissions);
        toast({ description: result.message });
        router.refresh();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Permissions not saved",
          description: getUserFacingError(
            error,
            "We could not update the class permissions. Please try again.",
          ),
        });
      }
    });
  }

  function rotateClassCode() {
    startTransition(async () => {
      try {
        const result = await regenerateClassCode(classData.id);
        setClassCode(result.classCode);
        setIsRotateOpen(false);
        toast({ description: result.message });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Code not regenerated",
          description: getUserFacingError(error),
        });
      }
    });
  }

  function transferOwnership() {
    if (!transferUserId) return;
    startTransition(async () => {
      try {
        const result = await transferClassOwnership(classData.id, transferUserId);
        toast({ description: result.message });
        setIsTransferOpen(false);
        router.push(`/class/${classData.id}`);
        router.refresh();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Ownership not transferred",
          description: getUserFacingError(error),
        });
      }
    });
  }

  function permanentlyDeleteClass() {
    startTransition(async () => {
      try {
        const result = await deleteClass(classData.id, deleteConfirmation);
        toast({ description: result.message });
        setIsDeleteOpen(false);
        router.push("/");
        router.refresh();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Class not deleted",
          description: getUserFacingError(error),
        });
      }
    });
  }

  async function copyClassCode() {
    await navigator.clipboard.writeText(classCode);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-7xl p-2 md:p-4">
      <header className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back to class">
            <Link href={`/class/${classData.id}`}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Owner controls
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Class settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage {savedClassName}, its access rules, and ownership.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 shadow-sm lg:sticky lg:top-20 lg:h-fit lg:flex-col">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Button key={href} variant="ghost" className="justify-start gap-2" asChild>
              <a href={href}>
                <Icon className="size-4" />
                {label}
              </a>
            </Button>
          ))}
        </nav>

        <main className="min-w-0 space-y-5">
          <SettingsSection
            id="general"
            icon={Settings}
            title="General information"
            description="Update the details students see throughout LearnLink."
          >
            <form onSubmit={form.handleSubmit(onSaveDetails)} className="space-y-5">
              <div className="space-y-2">
                <Label>Class banner</Label>
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <FileUpload
                    endpoint="classImage"
                    value={form.watch("imageUrl")}
                    onChange={(url) =>
                      form.setValue("imageUrl", url, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
                <FieldError message={form.formState.errors.imageUrl?.message} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="settings-class-name">Class name</Label>
                  <Input id="settings-class-name" {...form.register("className")} />
                  <FieldError message={form.formState.errors.className?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-subject">Subject</Label>
                  <Input id="settings-subject" {...form.register("subject")} />
                  <FieldError message={form.formState.errors.subject?.message} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="settings-description">Description</Label>
                  <span className="text-xs text-muted-foreground">
                    {form.watch("description").length}/1000
                  </span>
                </div>
                <Textarea
                  id="settings-description"
                  {...form.register("description")}
                  className="min-h-32"
                  maxLength={1000}
                />
                <FieldError message={form.formState.errors.description?.message} />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full gap-2 sm:w-auto"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty}
                >
                  {form.formState.isSubmitting ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save changes
                </Button>
              </div>
            </form>
          </SettingsSection>

          <SettingsSection
            id="access"
            icon={ShieldCheck}
            title="Access and permissions"
            description="Control how people join and what ordinary members can do. Owners and moderators keep management access."
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Class visibility</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <VisibilityOption
                    icon={KeyRound}
                    title="Invite only"
                    description="Hidden from Discover. People join using the class code when invitations are enabled."
                    selected={permissions.visibility === "INVITE_ONLY"}
                    onSelect={() =>
                      setPermissions((current) => ({
                        ...current,
                        visibility: "INVITE_ONLY",
                      }))
                    }
                  />
                  <VisibilityOption
                    icon={Globe2}
                    title="Public"
                    description="Listed in Discover. Any signed-in user can join without the class code."
                    selected={permissions.visibility === "PUBLIC"}
                    onSelect={() =>
                      setPermissions((current) => ({
                        ...current,
                        visibility: "PUBLIC",
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class-code">Class code</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="class-code"
                    readOnly
                    value={classCode}
                    className="font-mono tracking-wider"
                  />
                  <Button type="button" variant="outline" onClick={() => void copyClassCode()}>
                    {isCopied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                    {isCopied ? "Copied" : "Copy"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsRotateOpen(true)}>
                    <RefreshCw className="mr-2 size-4" /> Regenerate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Regenerating immediately invalidates the old code.
                </p>
              </div>

              <div className="divide-y divide-border rounded-lg border border-border">
                <SettingToggle
                  icon={KeyRound}
                  label="Allow invitations"
                  description="People can join this class using its class code."
                  checked={permissions.isInviteEnabled}
                  onChange={(checked) =>
                    setPermissions((current) => ({ ...current, isInviteEnabled: checked }))
                  }
                />
                <SettingToggle
                  icon={MessageSquare}
                  label="Allow member messages"
                  description="Ordinary members can send messages and attachments in class channels."
                  checked={permissions.allowMemberMessages}
                  onChange={(checked) =>
                    setPermissions((current) => ({ ...current, allowMemberMessages: checked }))
                  }
                />
                <SettingToggle
                  icon={Video}
                  label="Allow member live participation"
                  description="Ordinary members can enter active live classes."
                  checked={permissions.allowMemberLiveParticipation}
                  onChange={(checked) =>
                    setPermissions((current) => ({
                      ...current,
                      allowMemberLiveParticipation: checked,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={savePermissions} disabled={isPending} className="w-full gap-2 sm:w-auto">
                  {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
                  Save permissions
                </Button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id="ownership"
            icon={UserRoundCog}
            title="Transfer ownership"
            description="Assign full control of this class to another current member."
          >
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Choose a new owner</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You will become a moderator and lose access to owner-only settings.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTransferOpen(true)}
                disabled={!members.length}
              >
                Transfer ownership
              </Button>
            </div>
            {!members.length ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Add another member before transferring ownership.
              </p>
            ) : null}
          </SettingsSection>

          <SettingsSection
            id="danger"
            icon={Trash2}
            title="Danger zone"
            description="Actions here are permanent and cannot be undone."
            destructive
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Delete this class</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Permanently remove channels, messages, live-session history, bans, and audit logs.
                </p>
              </div>
              <Button type="button" variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="mr-2 size-4" /> Delete class
              </Button>
            </div>
          </SettingsSection>
        </main>
      </div>

      <ConfirmDialog
        open={isRotateOpen}
        onOpenChange={setIsRotateOpen}
        title="Regenerate class code?"
        description="Anyone with the current code will no longer be able to use it. Existing members are not affected."
        confirmLabel="Regenerate code"
        isPending={isPending}
        onConfirm={rotateClassCode}
      />

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="w-[92%] max-w-[440px] border-border bg-card">
          <DialogHeader>
            <DialogTitle>Transfer class ownership</DialogTitle>
            <DialogDescription>
              The selected member will receive all owner permissions immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-owner">New owner</Label>
            <select
              id="new-owner"
              value={transferUserId}
              onChange={(event) => setTransferUserId(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a class member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email} · {member.role}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsTransferOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={transferOwnership} disabled={isPending || !transferUserId}>
              {isPending ? "Transferring..." : "Transfer ownership"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="w-[92%] max-w-[440px] border-destructive/40 bg-card">
          <DialogHeader>
            <DialogTitle>Delete {savedClassName}?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Enter the class name exactly to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">
              Enter <span className="font-semibold text-foreground">{savedClassName}</span>
            </Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={permanentlyDeleteClass}
              disabled={isPending || deleteConfirmation.trim() !== savedClassName}
            >
              {isPending ? "Deleting..." : "Permanently delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  destructive = false,
  children,
}: {
  id: string;
  icon: typeof Settings;
  title: string;
  description: string;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 rounded-xl border bg-card shadow-sm ${
        destructive ? "border-destructive/40" : "border-border"
      }`}
    >
      <div className="flex gap-3 border-b border-border p-4 md:p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
          <Icon className={`size-4 ${destructive ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

function SettingToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Settings;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? "border-primary bg-primary" : "border-input bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none mt-0.5 block size-5 rounded-full bg-background shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function VisibilityOption({
  icon: Icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: typeof Settings;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-28 items-start gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:bg-accent"
      }`}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  );
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92%] max-w-[420px] border-border bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null;
}
