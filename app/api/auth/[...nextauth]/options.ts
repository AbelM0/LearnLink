import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { fetchUserByUsername } from '@/app/lib/data';
import bcrypt from "bcrypt";

export const options: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username:",
          type: 'text',
          placeholder: "username",
        },
        password: {
          label: "Password:",
          type: 'password',
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        // Fetch user by username
        const user = await fetchUserByUsername(credentials.username);

        if (!user) {
          console.error("User not found");
          return null;
        }

        // Verify the password (assuming you store hashed passwords)
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.error("Invalid password");
          return null;
        }

        // Return user object (omit sensitive fields)
        return {
          id: user.id,
          username: user.username,
          email: user.email,
        };
      },
    }),
  ],
  }
