import { Metadata } from "next";
import { redirect } from "next/navigation";
import getSession from "@/lib/getSession";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import ClassPageWrapper from "./ClassPageWrapper";


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

  return (
    <Suspense
      fallback={
        <div className="flex justify-center px-6 mx-auto mt-16 w-full">
          <Spinner />
        </div>
      }
    >
      <ClassPageWrapper user={user} id={id} />
    </Suspense>
  );
}
