"use client";

import ClassPage from "./ClassPage";
import { User } from "next-auth";
import { Class, ClassMember } from "@/types/class-type";
import {
  useGetClass,
  useGetClassMembers,
} from "@/hooks/queries/use-class-query";

interface Props {
  id: string;
  user: User;
  initialClassData: Class | null;
  initialClassMembers: ClassMember[];
}

export default function ClassPageWrapper({
  id,
  user,
  initialClassData,
  initialClassMembers,
}: Props) {
  const { data: classData } = useGetClass(id, initialClassData);
  const { data: classMembers = [] } = useGetClassMembers(
    id,
    initialClassMembers
  );

  if (!classData) {
    return <div>Class not found</div>;
  }

  return (
    <ClassPage user={user} classData={classData} classMembers={classMembers} />
  );
}
