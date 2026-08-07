"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock3,
  Crown,
  History,
  MoreHorizontal,
  Search,
  Shield,
  ShieldCheck,
  UserRound,
  Users,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getUserFacingError } from "@/lib/user-facing-error";
import {
  banClassMember,
  removeClassMemberTimeout,
  timeoutClassMember,
  unbanClassMember,
  updateClassMemberRole,
} from "./actions";

type MemberRole = "owner" | "moderator" | "member";
type View = "members" | "banned" | "audit";
type ActionKind =
  | "promote"
  | "demote"
  | "timeout"
  | "remove-timeout"
  | "ban"
  | "unban";

interface Person {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Member {
  id: number;
  role: MemberRole;
  createdAt: string;
  timeoutUntil: string | null;
  timeoutReason: string | null;
  user: Person;
}

interface BannedMember {
  id: number;
  reason: string | null;
  createdAt: string;
  user: Person;
  bannedBy: { name: string | null; email: string };
}

interface AuditEntry {
  id: number;
  action: string;
  reason: string | null;
  expiresAt: string | null;
  createdAt: string;
  actor: { name: string | null; email: string; image: string | null };
  target: { name: string | null; email: string; image: string | null } | null;
}

interface MemberManagementProps {
  classData: {
    id: number;
    className: string;
    subject: string;
    ownerId: string;
  };
  viewer: { id: string; role: "owner" | "moderator" };
  members: Member[];
  bans: BannedMember[];
  auditLogs: AuditEntry[];
}

interface PendingAction {
  kind: ActionKind;
  person: Person;
}

const timeoutOptions = [
  { label: "10 minutes", value: 10 },
  { label: "1 hour", value: 60 },
  { label: "24 hours", value: 1440 },
  { label: "7 days", value: 10080 },
] as const;

const auditCopy: Record<string, { label: string; icon: typeof History }> = {
  MEMBER_JOINED: { label: "joined the class", icon: UserRound },
  MEMBER_PROMOTED: { label: "was promoted to moderator", icon: ShieldCheck },
  MEMBER_DEMOTED: { label: "was changed back to member", icon: Shield },
  MEMBER_TIMED_OUT: { label: "was timed out", icon: Clock3 },
  MEMBER_TIMEOUT_REMOVED: { label: "had their timeout removed", icon: CheckCircle2 },
  MEMBER_BANNED: { label: "was banned", icon: Ban },
  MEMBER_UNBANNED: { label: "was unbanned", icon: CheckCircle2 },
  CLASS_DETAILS_UPDATED: { label: "Class details were updated", icon: History },
  CLASS_PERMISSIONS_UPDATED: { label: "Class permissions were updated", icon: ShieldCheck },
  CLASS_INVITE_CODE_REGENERATED: { label: "The class code was regenerated", icon: Shield },
  CLASS_OWNERSHIP_TRANSFERRED: { label: "became the class owner", icon: Crown },
  CLASS_VISIBILITY_UPDATED: { label: "Class visibility was updated", icon: ShieldCheck },
};

export default function MemberManagement({
  classData,
  viewer,
  members,
  bans,
  auditLogs,
}: MemberManagementProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<View>("members");
  const [query, setQuery] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [reason, setReason] = useState("");
  const [timeoutMinutes, setTimeoutMinutes] = useState<10 | 60 | 1440 | 10080>(60);
  const [isPending, startTransition] = useTransition();

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return members;
    return members.filter(({ user }) =>
      `${user.name ?? ""} ${user.email}`.toLowerCase().includes(normalizedQuery),
    );
  }, [members, query]);

  const filteredBans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return bans;
    return bans.filter(({ user }) =>
      `${user.name ?? ""} ${user.email}`.toLowerCase().includes(normalizedQuery),
    );
  }, [bans, query]);

  const moderatorCount = members.filter((member) => member.role === "moderator").length;
  const timedOutCount = members.filter(
    (member) => member.timeoutUntil && new Date(member.timeoutUntil) > new Date(),
  ).length;

  function openAction(kind: ActionKind, person: Person) {
    setReason("");
    setTimeoutMinutes(60);
    setPendingAction({ kind, person });
  }

  function runAction() {
    if (!pendingAction) return;

    startTransition(async () => {
      try {
        let result: { success: boolean; message: string };
        const targetUserId = pendingAction.person.id;

        switch (pendingAction.kind) {
          case "promote":
            result = await updateClassMemberRole(classData.id, targetUserId, "moderator");
            break;
          case "demote":
            result = await updateClassMemberRole(classData.id, targetUserId, "member");
            break;
          case "timeout":
            result = await timeoutClassMember(
              classData.id,
              targetUserId,
              timeoutMinutes,
              reason,
            );
            break;
          case "remove-timeout":
            result = await removeClassMemberTimeout(classData.id, targetUserId);
            break;
          case "ban":
            result = await banClassMember(classData.id, targetUserId, reason);
            break;
          case "unban":
            result = await unbanClassMember(classData.id, targetUserId);
            break;
        }

        toast({ description: result.message });
        setPendingAction(null);
        router.refresh();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Moderation action failed",
          description: getUserFacingError(
            error,
            "The moderation action failed. Please try again.",
          ),
        });
      }
    });
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-7xl space-y-5 p-2 md:p-4">
      <header className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back to class">
            <Link href={`/class/${classData.id}`}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {classData.subject}
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Manage members</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {classData.className} · Roles, restrictions, bans, and moderation history
            </p>
          </div>
        </div>
        <RoleBadge role={viewer.role} />
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Members" value={members.length} icon={Users} />
        <SummaryCard label="Moderators" value={moderatorCount} icon={ShieldCheck} />
        <SummaryCard label="Timed out" value={timedOutCount} icon={Clock3} />
        <SummaryCard label="Banned" value={bans.length} icon={Ban} />
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-3 md:flex-row md:items-center md:justify-between md:p-4">
          <div className="flex gap-1 overflow-x-auto" aria-label="Member management views">
            <ViewButton active={view === "members"} onClick={() => setView("members")}>
              <Users className="size-4" /> Members
            </ViewButton>
            <ViewButton active={view === "banned"} onClick={() => setView("banned")}>
              <Ban className="size-4" /> Banned
            </ViewButton>
            <ViewButton active={view === "audit"} onClick={() => setView("audit")}>
              <History className="size-4" /> Audit log
            </ViewButton>
          </div>

          {view !== "audit" ? (
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={view === "members" ? "Search members" : "Search banned users"}
                className="border-input pl-9"
                aria-label="Search people"
              />
            </div>
          ) : null}
        </div>

        {view === "members" ? (
          <MemberList
            members={filteredMembers}
            viewer={viewer}
            onAction={openAction}
          />
        ) : null}
        {view === "banned" ? (
          <BannedList bans={filteredBans} onAction={openAction} />
        ) : null}
        {view === "audit" ? <AuditLog entries={auditLogs} /> : null}
      </section>

      <ModerationDialog
        action={pendingAction}
        reason={reason}
        setReason={setReason}
        timeoutMinutes={timeoutMinutes}
        setTimeoutMinutes={setTimeoutMinutes}
        isPending={isPending}
        onClose={() => setPendingAction(null)}
        onConfirm={runAction}
      />
    </div>
  );
}

function MemberList({
  members,
  viewer,
  onAction,
}: {
  members: Member[];
  viewer: { id: string; role: "owner" | "moderator" };
  onAction: (kind: ActionKind, person: Person) => void;
}) {
  if (!members.length) {
    return <EmptyState icon={Users} title="No members found" description="Try a different search." />;
  }

  return (
    <ul className="divide-y divide-border">
      {members.map((member) => {
        const timeoutActive =
          !!member.timeoutUntil && new Date(member.timeoutUntil) > new Date();
        const canManage =
          member.user.id !== viewer.id &&
          member.role !== "owner" &&
          (viewer.role === "owner" || member.role === "member");

        return (
          <li key={member.id} className="flex items-center gap-3 p-3 hover:bg-accent/40 md:p-4">
            <Avatar person={member.user} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold">
                  {member.user.name || member.user.email}
                </p>
                <RoleBadge role={member.role} />
                {timeoutActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    <Clock3 className="size-3" /> Timed out
                  </span>
                ) : null}
              </div>
              <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Joined {formatDate(member.createdAt)}
                {timeoutActive && member.timeoutUntil
                  ? ` · Timeout ends ${formatDate(member.timeoutUntil)}`
                  : ""}
              </p>
            </div>

            {canManage ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Manage ${member.user.name || member.user.email}`}>
                    <MoreHorizontal className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {viewer.role === "owner" && member.role === "member" ? (
                    <DropdownMenuItem onSelect={() => onAction("promote", member.user)}>
                      <ShieldCheck className="mr-2 size-4" /> Promote to moderator
                    </DropdownMenuItem>
                  ) : null}
                  {viewer.role === "owner" && member.role === "moderator" ? (
                    <DropdownMenuItem onSelect={() => onAction("demote", member.user)}>
                      <UserRound className="mr-2 size-4" /> Change to member
                    </DropdownMenuItem>
                  ) : null}
                  {timeoutActive ? (
                    <DropdownMenuItem onSelect={() => onAction("remove-timeout", member.user)}>
                      <CheckCircle2 className="mr-2 size-4" /> Remove timeout
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={() => onAction("timeout", member.user)}>
                      <Clock3 className="mr-2 size-4" /> Timeout member
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => onAction("ban", member.user)}
                  >
                    <Ban className="mr-2 size-4" /> Ban from class
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function BannedList({
  bans,
  onAction,
}: {
  bans: BannedMember[];
  onAction: (kind: ActionKind, person: Person) => void;
}) {
  if (!bans.length) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No banned users"
        description="People banned from this class will appear here."
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {bans.map((ban) => (
        <li key={ban.id} className="flex items-center gap-3 p-3 md:p-4">
          <Avatar person={ban.user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{ban.user.name || ban.user.email}</p>
            <p className="truncate text-xs text-muted-foreground">{ban.user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Banned {formatDate(ban.createdAt)} by {ban.bannedBy.name || ban.bannedBy.email}
              {ban.reason ? ` · ${ban.reason}` : ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onAction("unban", ban.user)}>
            Unban
          </Button>
        </li>
      ))}
    </ul>
  );
}

function AuditLog({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={History}
        title="No moderation activity yet"
        description="Role changes, timeouts, bans, and new joins will be recorded here."
      />
    );
  }

  return (
    <ol className="divide-y divide-border">
      {entries.map((entry) => {
        const copy = auditCopy[entry.action] ?? { label: entry.action, icon: History };
        const Icon = copy.icon;
        const isClassLevelAction =
          entry.action === "CLASS_DETAILS_UPDATED" ||
          entry.action === "CLASS_PERMISSIONS_UPDATED" ||
          entry.action === "CLASS_INVITE_CODE_REGENERATED" ||
          entry.action === "CLASS_VISIBILITY_UPDATED";
        return (
          <li key={entry.id} className="flex gap-3 p-3 md:p-4">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                {isClassLevelAction ? (
                  <span className="font-semibold">{copy.label}</span>
                ) : (
                  <>
                    <span className="font-semibold">{entry.target?.name || entry.target?.email || "A former user"}</span>{" "}
                    {copy.label}
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                By {entry.actor.name || entry.actor.email} · {formatDate(entry.createdAt)}
                {entry.expiresAt ? ` · Until ${formatDate(entry.expiresAt)}` : ""}
              </p>
              {entry.reason ? (
                <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {entry.reason}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ModerationDialog({
  action,
  reason,
  setReason,
  timeoutMinutes,
  setTimeoutMinutes,
  isPending,
  onClose,
  onConfirm,
}: {
  action: PendingAction | null;
  reason: string;
  setReason: (value: string) => void;
  timeoutMinutes: 10 | 60 | 1440 | 10080;
  setTimeoutMinutes: (value: 10 | 60 | 1440 | 10080) => void;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const title = action ? getActionTitle(action.kind) : "Manage member";
  const requiresReason = action?.kind === "timeout" || action?.kind === "ban";

  return (
    <Dialog open={!!action} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92%] max-w-[440px] border-border bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {action ? getActionDescription(action) : "Choose a moderation action."}
          </DialogDescription>
        </DialogHeader>

        {action?.kind === "timeout" ? (
          <div className="space-y-2">
            <Label>Timeout duration</Label>
            <div className="grid grid-cols-2 gap-2">
              {timeoutOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={timeoutMinutes === option.value ? "default" : "outline"}
                  onClick={() => setTimeoutMinutes(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {requiresReason ? (
          <div className="space-y-2">
            <Label htmlFor="moderation-reason">Reason (optional)</Label>
            <Textarea
              id="moderation-reason"
              value={reason}
              maxLength={500}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Add context for the audit log"
              className="min-h-24 border-input"
            />
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={action?.kind === "ban" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Saving..." : title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function ViewButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <Button type="button" variant={active ? "secondary" : "ghost"} size="sm" onClick={onClick}>
      {children}
    </Button>
  );
}

function RoleBadge({ role }: { role: MemberRole }) {
  const Icon = role === "owner" ? Crown : role === "moderator" ? ShieldCheck : UserRound;
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
      <Icon className="size-3" /> {role}
    </span>
  );
}

function Avatar({ person }: { person: Pick<Person, "name" | "email" | "image"> }) {
  const label = person.name || person.email;
  return person.image ? (
    <Image src={person.image} alt={label} width={40} height={40} className="size-10 rounded-full object-cover" />
  ) : (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold">
      {label.charAt(0).toUpperCase()}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Users; title: string; description: string }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-border bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function getActionTitle(kind: ActionKind) {
  return {
    promote: "Promote member",
    demote: "Change to member",
    timeout: "Timeout member",
    "remove-timeout": "Remove timeout",
    ban: "Ban member",
    unban: "Unban member",
  }[kind];
}

function getActionDescription(action: PendingAction) {
  const name = action.person.name || action.person.email;
  return {
    promote: `${name} will be able to manage ordinary class members and view the audit log.`,
    demote: `${name} will lose moderator permissions.`,
    timeout: `${name} will be unable to send messages or join live classes during the timeout.`,
    "remove-timeout": `${name} will immediately regain normal class participation.`,
    ban: `${name} will be removed and prevented from rejoining this class.`,
    unban: `${name} will be allowed to join the class again with its class code.`,
  }[action.kind];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}
