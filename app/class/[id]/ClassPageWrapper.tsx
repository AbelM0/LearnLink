
import { getClass, getClassMembers } from "./actions";
import ClassPage from "./ClassPage";
import { User } from "next-auth";

interface Props {
  id: string;
  user: User;
}

export default async function ClassPageWrapper({ id, user }: Props) {
  const classData = await getClass(id);
  const classMembers = await getClassMembers(id);

  if (!classData) {
    return <div>Class not found</div>;
  }

  return (
    <ClassPage
      user={user}
      classData={classData}
      classMembers={classMembers}
    />
  );
}
