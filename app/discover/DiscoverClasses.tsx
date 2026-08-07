"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Globe2,
  LoaderCircle,
  Search,
  Telescope,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getUserFacingError } from "@/lib/user-facing-error";
import { joinPublicClass } from "./actions";

interface PublicClass {
  id: number;
  className: string;
  subject: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  updatedAt: string;
  isMember: boolean;
}

export default function DiscoverClasses({
  classes,
  isAuthenticated,
}: {
  classes: PublicClass[];
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [joiningClassId, setJoiningClassId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredClasses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return classes;

    return classes.filter((classData) =>
      `${classData.className} ${classData.subject} ${classData.description}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [classes, query]);

  function joinClass(classId: number) {
    setJoiningClassId(classId);
    startTransition(async () => {
      try {
        const result = await joinPublicClass(classId);
        toast({ description: result.message });
        router.push(`/class/${result.classId}`);
        router.refresh();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Could not join class",
          description: getUserFacingError(
            error,
            "We could not join this class. Please try again.",
          ),
        });
      } finally {
        setJoiningClassId(null);
      }
    });
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-7xl space-y-5 p-2 md:p-4">
      <header className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex size-11 items-center justify-center rounded-full border border-border bg-muted">
              <Telescope className="size-5 text-muted-foreground" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Learn together
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Discover classes</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Browse public learning spaces and join the ones that match your interests.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search classes or subjects"
              className="pl-9"
              aria-label="Search public classes"
            />
          </div>
        </div>
      </header>

      {filteredClasses.length ? (
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-label="Public classes"
        >
          {filteredClasses.map((classData) => (
            <article
              key={classData.id}
              className="flex min-h-[340px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative h-36 w-full overflow-hidden bg-muted">
                <Image
                  src={classData.imageUrl}
                  alt={`${classData.className} class banner`}
                  fill
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-border bg-card/90 px-2.5 py-1 text-xs font-medium backdrop-blur-md">
                  <Globe2 className="size-3" /> Public
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="size-3" /> {classData.subject}
                </p>
                <h2 className="mt-2 line-clamp-1 text-lg font-semibold">
                  {classData.className}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {classData.description}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3" /> {classData.memberCount} member
                    {classData.memberCount === 1 ? "" : "s"}
                  </span>
                </div>

                {classData.isMember ? (
                  <Button asChild className="mt-4 w-full gap-2">
                    <Link href={`/class/${classData.id}`}>
                      Open class <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : isAuthenticated ? (
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    onClick={() => joinClass(classData.id)}
                    disabled={isPending}
                  >
                    {joiningClassId === classData.id ? (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    ) : null}
                    Join class
                  </Button>
                ) : (
                  <Button asChild className="mt-4 w-full">
                    <Link href="/api/auth/signin?callbackUrl=/discover">Sign in to join</Link>
                  </Button>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full border border-border bg-muted">
            <Telescope className="size-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">
            {query ? "No matching classes" : "No public classes yet"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {query
              ? "Try another class name, subject, or keyword."
              : "Public classes will appear here when their owners make them discoverable."}
          </p>
        </section>
      )}
    </div>
  );
}
