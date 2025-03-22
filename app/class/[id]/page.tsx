import { Metadata } from "next";
import ClassPage from "./ClassPage";
import { redirect } from "next/navigation";
import getSession from "@/lib/getSession";
import { getClass, getClassMembers } from "./actions";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";


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

  const classData = await getClass(id);
  const classMembers = await getClassMembers(id);

  if (!classData) {
    redirect("/not-found");
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ClassPage user={user} classData={classData} classMembers={classMembers} />
    </Suspense>
  );
}
