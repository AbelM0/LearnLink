"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserButton from "./UserButton";
import { signIn, useSession } from "next-auth/react";
import AvatarSkeleton from "./ui/AvatarSkeleton";
import { SidebarTrigger } from "./ui/sidebar";
import { CreateJoinDropdown } from "./CreateJoinDropdown";
import ThemeSwitch from "./ThemeSwitch";


export default function NavBar() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <div className="z-50 bg-background/40 sticky backdrop-blur-md top-0 px-6 border-b border-border w-full">
      <nav className="mx-auto flex justify-between h-14 w-full items-center gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <Link href="/" className="font-bold">
            Learnlink
          </Link>
        </div>
        
        {session.status === "loading" ? (
          <AvatarSkeleton />
        ) : user ? (
          <div className="flex gap-5">
          <CreateJoinDropdown />
          <div className="flex items-center justify-center border-background hover:bg-accent rounded-full h-[40px] w-[40px]">
           <ThemeSwitch /> 
          </div>
          <UserButton user={user} />
          </div>
        ) : (
          <SignInButton />
        )}
      </nav>
    </div>
  );
}

function SignInButton() {
  return (
    <Button className="border-black" onClick={() => signIn()} variant={"outline"}>
      Sign in
    </Button>
  );
}
