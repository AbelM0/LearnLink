import { Metadata } from "next";
import { redirect } from "next/navigation";
import getSession from "@/lib/getSession";
import ClassPageWrapper from "./ClassPageWrapper";
import { getClass, getClassMembers } from "./actions";

export const metadata: Metadata = {
  title: "Class",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect(`/api/auth/signin?callbackUrl=/`);
  }

  const [classData, classMembers] = await Promise.all([
    getClass(id),
    getClassMembers(id),
  ]);

  if (!classData) {
    // Or handle it in the wrapper, but handling here is fine too.
    // Assuming wrapper handles detailed "Not Found" UI or we redirect.
    // For now, passing null is fine as wrapper handles it.
  }

  return (
    <ClassPageWrapper
      user={user}
      id={id}
      initialClassData={classData}
      initialClassMembers={classMembers}
    />
  );
}
