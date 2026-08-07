import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DiscoverClasses from "./DiscoverClasses";

export const metadata: Metadata = {
  title: "Discover classes",
};

export default async function DiscoverPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const classes = await prisma.class.findMany({
    where: {
      visibility: "PUBLIC",
      ...(userId ? { bans: { none: { userId } } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      className: true,
      subject: true,
      description: true,
      imageUrl: true,
      updatedAt: true,
      _count: { select: { ClassUser: true } },
      ClassUser: {
        where: { userId: userId ?? "" },
        select: { id: true },
        take: 1,
      },
    },
  });

  return (
    <DiscoverClasses
      isAuthenticated={!!userId}
      classes={classes.map((classData) => ({
        id: classData.id,
        className: classData.className,
        subject: classData.subject,
        description: classData.description,
        imageUrl: classData.imageUrl,
        memberCount: classData._count.ClassUser,
        updatedAt: classData.updatedAt.toISOString(),
        isMember: classData.ClassUser.length > 0,
      }))}
    />
  );
}
