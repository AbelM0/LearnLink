import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureClassAccess } from "@/lib/class-access";
import { getActiveLiveSessionByClassId } from "@/lib/live-session";
import LiveRoom from "@/components/live/LiveRoom";

interface LivePageProps {
  params: Promise<{ id: string }>;
}

export default async function LivePage({ params }: LivePageProps) {
  const { id } = await params;
  const classId = Number(id);
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/class/${id}/live`);
  }

  await ensureClassAccess(classId, user.id);

  const liveSession = await getActiveLiveSessionByClassId(classId);

  if (!liveSession) {
    redirect(`/class/${id}`);
  }

  return (
    <LiveRoom
      classId={classId}
      className={liveSession.class.className}
      liveSessionId={liveSession.id}
      isHost={liveSession.hostId === user.id}
      userName={user.name ?? user.email ?? "LearnLink User"}
    />
  );
}
