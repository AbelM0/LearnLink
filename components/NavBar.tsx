import Link from "next/link";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import UserButton from "./UserButton";

export default async function NavBar(){

  const session = await auth();
  const user = session?.user;

  return (
    <div className="sticky top-0 bg-background px-3 shadow-sm border-b-2">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3">
        <Link href="/" className="font-bold">
          Learnlink
        </Link>
        { user ? <UserButton user={user} /> : <SignInButton />}
      </nav>
    </div>
  );
}

function SignInButton() {
  return <form action={async () => {
    "use server";
    await signIn();
  }}>
    <Button type="submit" variant={"outline"}>Sign in</Button>
  </form>
}
