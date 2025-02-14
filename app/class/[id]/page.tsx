import { Metadata } from "next";
import ClassPage from "./ClassPage";
import { redirect } from "next/navigation";
import getSession from "@/lib/getSession";
import { getClass } from "./actions";
import { Suspense } from "react";


export const metadata: Metadata = {
  title: "Class",
};

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
const { id } =  params;

 const session = await getSession();
 const user = session?.user;

 if (!user) {
  redirect(`/api/auth/signin?callbackUrl=/`);
 }

 const classData = await getClass(id);

 if (!classData) {
   redirect("/not-found");
 }


  return (
  <Suspense fallback={<div className="text-gray-600 text-lg text-center mt-16">Loading class data...</div>}>
    <ClassPage user={user} classData={classData} />
  </Suspense>
  );
}