"use client";

import { useEffect, useState } from "react";
import FallbackHomepage from "@/components/FallbackHomepage";
import { getUserClasses } from "./actions";
import { useClassStore } from "@/Stores/useClassStore";
import { useSession } from "next-auth/react";
import { Class } from "@/types/class-type";
import { ClassCard } from "@/components/ClassCard";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const { classes, setClasses } = useClassStore();

  const session = useSession();
  const status = session.status;

  useEffect(() => {
    async function fetchClasses() {
      try {
        const data: Class[] = await getUserClasses();
        setClasses(data);
        setDataFetched(true);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchClasses();
    } else if  ( status ==="unauthenticated"){
      setLoading(false);
    }
  
  }, [status, setClasses]);
  

  return (
    <div className="flex justify-center px-6 mx-auto mt-16 w-full">
      {loading  ? (
        <p className="text-foreground/40 text-lg">Loading...</p>
      ) : dataFetched  && classes.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
      xl:grid-cols-4 gap-x-1 xl:gap-x-6 gap-y-8 w-full max-w-7xl mx-auto place-items-center">
        {classes.map((cls, index) => (
          <ClassCard clsData={cls} key={index} />
        ))}
      </div>

      ) : dataFetched ? ( 
        <FallbackHomepage />
      ) : <p className="text-gray-600 text-lg">Sign in to continue.</p>}
    </div>
  );
}
