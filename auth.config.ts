import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Notice this is a plain object, not a NextAuth instance.
// This allows it to be used in both Edge and Node.js environments.
export default {
  providers: [Google, GitHub],
} satisfies NextAuthConfig;
