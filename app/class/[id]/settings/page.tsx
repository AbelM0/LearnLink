import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureClassOwner } from "@/lib/class-access";
import { prisma } from "@/lib/prisma";
import ClassSettings from "./ClassSettings";

interface ClassSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassSettingsPage({ params }: ClassSettingsPageProps) {
  const { id } = await params;
  const classId = Number(id);

  if (!Number.isInteger(classId) || classId < 1) redirect("/");

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/class/${id}/settings`);
  }

  try {
    await ensureClassOwner(classId, session.user.id);
  } catch {
    redirect(`/class/${classId}`);
  }

  const [classData, members] = await Promise.all([
    prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        className: true,
        subject: true,
        description: true,
        imageUrl: true,
        classCode: true,
        visibility: true,
        isInviteEnabled: true,
        allowMemberMessages: true,
        allowMemberLiveParticipation: true,
        createdAt: true,
      },
    }),
    prisma.classUser.findMany({
      where: { classId, userId: { not: session.user.id } },
      orderBy: { createdAt: "asc" },
      select: {
        user: { select: { id: true, name: true, email: true } },
        role: true,
      },
    }),
  ]);

  if (!classData) redirect("/");

  return (
    <ClassSettings
      classData={{
        ...classData,
        createdAt: classData.createdAt.toISOString(),
      }}
      members={members.map((member) => ({
        ...member.user,
        role: member.role as "moderator" | "member",
      }))}
    />
  );
}
