"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { User } from "next-auth";
import { Class } from "@/types/class-type";

interface ClassPagepProps {
  user: User;
  classData: Class;
}

export default function ClassPage({user, classData} : ClassPagepProps) {

  const session = useSession();
  const status = session.status;

  if (status !== "loading" && !user) {
    redirect("/");
  }

  const _class = classData;
  const isOwner = user?.id === _class?.ownerId;

  if (status !== "loading" && !user) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* Class Banner */}
      <div className="relative h-40 bg-black text-white rounded-xl shadow-lg flex flex-col justify-center px-6">
        <h1 className="text-3xl font-bold">{classData.className}</h1>
        <p className="text-lg opacity-90">{classData.subject}</p>
        {isOwner && <span className="absolute bottom-2 right-4 text-sm opacity-75">Class Code: {classData.classCode}</span>}
      </div>

      {/* Class Content Section */}
      <div className="shadow-md rounded-lg mt-6 p-6 border-black">
        <h2 className="text-xl font-semibold">Class Details</h2>
        <p className="text-gray-700 mt-2">{classData.description || "No description provided."}</p>
        <p className="text-sm text-gray-500 mt-2">Created on: {new Date(classData.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Assignments & Announcements Placeholder */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Announcements & Assignments</h2>
        <div className="mt-2 p-4 bg-gray-100 text-gray-500 rounded-lg text-center">
          No announcements or assignments yet.
        </div>
      </div>
    </div>
  );
}