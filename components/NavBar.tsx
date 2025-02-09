"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserButton from "./UserButton";
import { signIn, useSession } from "next-auth/react";
import AvatarSkeleton from "./ui/AvatarSkeleton";

export default function NavBar() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <div className="sticky top-0 bg-background/40 backdrop-blur-md px-6 shadow-sm border-b-2">
      <nav className="mx-auto flex justify-between h-14 w-full max-w-7xl items-center gap-3">
        <Link href="/" className="font-bold">
          Learnlink
        </Link>
        {session.status === "loading" ? (
          <AvatarSkeleton />
        ) : user ? (
          <UserButton user={user} />
        ) : (
          <SignInButton />
        )}
      </nav>
    </div>
  );
}

function SignInButton() {
  return (
    <Button onClick={() => signIn()} variant={"outline"}>
      Sign in
    </Button>
  );
}
