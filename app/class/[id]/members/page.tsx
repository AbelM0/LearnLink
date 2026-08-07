import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureClassManager } from "@/lib/class-access";
import { prisma } from "@/lib/prisma";
import MemberManagement from "./MemberManagement";

interface MemberManagementPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberManagementPage({
  params,
}: MemberManagementPageProps) {
  const { id } = await params;
  const classId = Number(id);

  if (!Number.isInteger(classId) || classId < 1) {
    redirect("/");
  }

  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/class/${id}/members`);
  }

  let manager;

  try {
    manager = await ensureClassManager(classId, user.id);
  } catch {
    redirect(`/class/${classId}`);
  }

  const [classData, members, bans, auditLogs] = await Promise.all([
    prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, className: true, subject: true, ownerId: true },
    }),
    prisma.classUser.findMany({
      where: { classId },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        role: true,
        createdAt: true,
        timeoutUntil: true,
        timeoutReason: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    }),
    prisma.classBan.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reason: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        bannedBy: { select: { name: true, email: true } },
      },
    }),
    prisma.classAuditLog.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        action: true,
        reason: true,
        expiresAt: true,
        createdAt: true,
        actor: { select: { name: true, email: true, image: true } },
        target: { select: { name: true, email: true, image: true } },
      },
    }),
  ]);

  if (!classData) {
    redirect("/");
  }

  return (
    <MemberManagement
      classData={classData}
      viewer={{
        id: user.id,
        role:
          classData.ownerId === user.id
            ? "owner"
            : (manager.role as "moderator"),
      }}
      members={members.map((member) => ({
        ...member,
        role: member.role as "owner" | "moderator" | "member",
        createdAt: member.createdAt.toISOString(),
        timeoutUntil: member.timeoutUntil?.toISOString() ?? null,
      }))}
      bans={bans.map((ban) => ({
        ...ban,
        createdAt: ban.createdAt.toISOString(),
      }))}
      auditLogs={auditLogs.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        expiresAt: entry.expiresAt?.toISOString() ?? null,
      }))}
    />
  );
}
